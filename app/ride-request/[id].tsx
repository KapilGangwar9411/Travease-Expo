import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { 
  MapPin, 
  Clock, 
  User, 
  Car, 
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Calendar,
  Navigation
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuthStore } from '@/store/auth-store';
import { useRideStore } from '@/store/ride-store';
import { OfferedRide, RideRequest } from '@/types';
import { formatDateTime, formatTime } from '@/utils/date-utils';
import { formatDistance } from '@/utils/location-utils';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';
import StyledText from '@/components/StyledText';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 180 : 160;

export default function RideRequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    rideRequests, 
    findMatches, 
    createRideMatch, 
    cancelRideRequest, 
    isLoading 
  } = useRideStore();
  
  const [rideRequest, setRideRequest] = useState<RideRequest | null>(null);
  const [matchedRides, setMatchedRides] = useState<OfferedRide[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [HEADER_HEIGHT, 80],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerContentOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  useEffect(() => {
    if (id) {
      const request = rideRequests.find(req => req.id === id);
      if (request) {
        setRideRequest(request);
      }
    }
  }, [id, rideRequests]);
  
  const handleFindMatches = async () => {
    if (!rideRequest) return;
    
    setIsSearching(true);
    
    try {
      const matches = await findMatches(rideRequest.id);
      setMatchedRides(matches);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectRide = async (offeredRide: OfferedRide) => {
    if (!rideRequest) return;
    
    try {
      await createRideMatch(rideRequest.id, offeredRide.id);
      Alert.alert(
        'Success',
        'You have been matched with a driver!',
        [
          {
            text: 'View Match',
            onPress: () => router.replace(`/ride-match/match${Date.now()}`),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };
  
  const handleCancelRequest = async () => {
    if (!rideRequest) return;
    
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this ride request?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await cancelRideRequest(rideRequest.id);
              router.back();
            } catch (error) {
              console.error('Error cancelling request:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  if (!rideRequest) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header, 
          { height: headerHeight }
        ]}
      >
        <LinearGradient
          colors={['#3F51B5', '#303F9F']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Compact Header Content (visible on scroll) */}
        <Animated.View 
          style={[
            styles.headerCompactContent,
            { opacity: headerTitleOpacity }
          ]}
        >
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.headerCompactInner}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Car size={22} color="white" />
                <StyledText weight="semiBold" style={styles.headerCompactTitle}>
                  Ride Request
                </StyledText>
              </View>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelRequest}
                disabled={isLoading || rideRequest.status !== 'pending'}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
        
        {/* Expanded Header Content */}
        <Animated.View 
          style={[
            styles.headerExpandedContent,
            { opacity: headerContentOpacity }
          ]}
        >
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.headerExpandedInner}>
              <TouchableOpacity 
                style={styles.expandedBackButton}
                onPress={() => router.back()}
              >
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
              
              <StyledText weight="bold" style={styles.headerTitle}>Ride Request</StyledText>
              <View style={styles.statusBadgeHeader}>
                <StyledText weight="medium" style={styles.headerSubtitle}>
                  {rideRequest.pickup.name} to {rideRequest.destination.name}
                </StyledText>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(rideRequest.status) }
                ]}>
                  <StyledText weight="medium" style={styles.statusText}>
                    {rideRequest.status.charAt(0).toUpperCase() + rideRequest.status.slice(1)}
                  </StyledText>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
      
      <Animated.ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Journey Card */}
        <Card variant="elevated" style={styles.journeyCard}>
          <StyledText weight="semiBold" style={styles.cardTitle}>Journey Details</StyledText>
          
          <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <View style={styles.locationIconContainer}>
                <View style={styles.locationIcon}>
                  <Navigation size={14} color="white" />
                </View>
                <View style={styles.locationLine} />
              </View>
              <View style={styles.locationTextContainer}>
                <StyledText weight="medium" style={styles.locationLabel}>Pickup</StyledText>
                <StyledText weight="semiBold" style={styles.locationName}>{rideRequest.pickup.name}</StyledText>
                <StyledText weight="regular" style={styles.locationAddress}>{rideRequest.pickup.address}</StyledText>
              </View>
            </View>
            
            <View style={styles.locationRow}>
              <View style={styles.locationIconContainer}>
                <View style={[styles.locationIcon, styles.destinationIcon]}>
                  <MapPin size={14} color="white" />
                </View>
              </View>
              <View style={styles.locationTextContainer}>
                <StyledText weight="medium" style={styles.locationLabel}>Destination</StyledText>
                <StyledText weight="semiBold" style={styles.locationName}>{rideRequest.destination.name}</StyledText>
                <StyledText weight="regular" style={styles.locationAddress}>{rideRequest.destination.address}</StyledText>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Clock size={18} color={colors.primary} />
              </View>
              <View>
                <StyledText weight="medium" style={styles.detailLabel}>Preferred Time</StyledText>
                <StyledText weight="semiBold" style={styles.detailText}>
                  {formatTime(rideRequest.preferredTime)}
                </StyledText>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Calendar size={18} color="#E91E63" />
              </View>
              <View>
                <StyledText weight="medium" style={styles.detailLabel}>Created On</StyledText>
                <StyledText weight="semiBold" style={styles.detailText}>
                  {formatDateTime(rideRequest.createdAt).split(' at ')[0]}
                </StyledText>
              </View>
            </View>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <MapPin size={18} color="#4CAF50" />
              </View>
              <View>
                <StyledText weight="medium" style={styles.detailLabel}>Distance</StyledText>
                <StyledText weight="semiBold" style={styles.detailText}>
                  {formatDistance(
                    calculateDistance(
                      rideRequest.pickup.lat,
                      rideRequest.pickup.lng,
                      rideRequest.destination.lat,
                      rideRequest.destination.lng
                    )
                  )}
                </StyledText>
              </View>
            </View>
          </View>
        </Card>
        
        {rideRequest.status === 'pending' && (
          <Button
            title={isSearching ? 'Searching...' : 'Find Matches'}
            onPress={handleFindMatches}
            variant="primary"
            loading={isSearching}
            fullWidth
            style={styles.findMatchesButton}
          />
        )}
        
        {matchedRides.length > 0 && (
          <>
            <StyledText weight="semiBold" style={styles.sectionTitle}>Available Rides</StyledText>
            {matchedRides.map(ride => (
              <Card key={ride.id} variant="elevated" style={styles.matchCard}>
                <View style={styles.matchHeader}>
                  <Avatar 
                    source="https://i.ibb.co/60D5wj4/kapil.jpg"
                    name="Kapil Gangwar"
                    size="medium"
                  />
                  <View style={styles.matchDriverInfo}>
                    <StyledText weight="semiBold" style={styles.matchDriverName}>Kapil Gangwar</StyledText>
                    <View style={styles.matchDriverRating}>
                      <StyledText weight="medium" style={styles.matchDriverRatingText}>4.8</StyledText>
                      <View style={styles.matchDriverRatingStars}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <StyledText 
                            key={star} 
                            weight="regular"
                            style={[
                              styles.matchDriverRatingStar,
                              star > 4 && styles.inactiveRatingStar
                            ]}
                          >★</StyledText>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={styles.detailsContainer}>
                  <View style={styles.matchDetailItem}>
                    <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(66, 133, 244, 0.1)' }]}>
                      <Car size={16} color="#4285F4" />
                    </View>
                    <StyledText weight="medium" style={styles.matchDetailText}>
                      {ride.vehicleInfo.model} • {ride.vehicleInfo.color}
                    </StyledText>
                  </View>
                  
                  <View style={styles.matchDetailItem}>
                    <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(233, 30, 99, 0.1)' }]}>
                      <Clock size={16} color="#E91E63" />
                    </View>
                    <StyledText weight="medium" style={styles.matchDetailText}>
                      {formatTime(ride.departureTime)}
                    </StyledText>
                  </View>
                  
                  <View style={styles.matchDetailItem}>
                    <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                      <User size={16} color="#4CAF50" />
                    </View>
                    <StyledText weight="medium" style={styles.matchDetailText}>
                      {ride.availableSeats} seats available
                    </StyledText>
                  </View>
                </View>
                
                <View style={styles.matchPrice}>
                  <StyledText weight="medium" style={styles.matchPriceLabel}>Ride Fare</StyledText>
                  <StyledText weight="bold" style={styles.matchPriceValue}>₹{ride.price}</StyledText>
                </View>
                
                <Button
                  title="Select Ride"
                  onPress={() => handleSelectRide(ride)}
                  variant="primary"
                  size="medium"
                  fullWidth
                  style={styles.selectRideButton}
                />
              </Card>
            ))}
          </>
        )}
        
        {matchedRides.length === 0 && isSearching === false && rideRequest.status === 'pending' && (
          <View style={styles.emptyStateContainer}>
            <AlertCircle size={64} color="#BDBDBD" />
            <StyledText weight="semiBold" style={styles.emptyStateTitle}>No matches found</StyledText>
            <StyledText weight="regular" style={styles.emptyStateDescription}>
              Try again later or adjust your ride preferences
            </StyledText>
          </View>
        )}
        
        {rideRequest.status === 'matched' && (
          <View style={styles.matchedContainer}>
            <View style={styles.matchedIconContainer}>
              <CheckCircle size={48} color="white" />
            </View>
            <StyledText weight="semiBold" style={styles.matchedTitle}>Ride Matched!</StyledText>
            <StyledText weight="regular" style={styles.matchedDescription}>
              Your ride request has been matched with a driver.
            </StyledText>
            <Button
              title="View Match Details"
              onPress={() => router.push('/ride-match/match1')}
              variant="primary"
              style={styles.viewMatchButton}
            />
          </View>
        )}
        
        <View style={styles.bottomSpace} />
      </Animated.ScrollView>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#FFC107';
    case 'matched':
      return '#4CAF50';
    case 'completed':
      return '#3F51B5';
    case 'cancelled':
      return '#F44336';
    default:
      return colors.textSecondary;
  }
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerExpandedContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  headerExpandedInner: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    alignItems: 'center',
    position: 'relative',
  },
  headerCompactContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  headerCompactInner: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCompactTitle: {
    color: 'white',
    fontSize: 20,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 32,
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginRight: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  expandedBackButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 10,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
    paddingTop: HEADER_HEIGHT - 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  statusBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  journeyCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  locationIconContainer: {
    width: 24,
    alignItems: 'center',
  },
  locationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationIcon: {
    backgroundColor: '#E53935',
  },
  locationLine: {
    width: 2,
    height: 32,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
    marginLeft: 11,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  locationName: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginBottom: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  findMatchesButton: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  matchCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchDriverInfo: {
    marginLeft: 12,
  },
  matchDriverName: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  matchDriverRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchDriverRatingText: {
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  matchDriverRatingStars: {
    flexDirection: 'row',
  },
  matchDriverRatingStar: {
    color: '#FFC107',
    fontSize: 14,
  },
  inactiveRatingStar: {
    color: '#E0E0E0',
  },
  matchDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchDetailText: {
    fontSize: 14,
    color: colors.text,
  },
  matchPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  matchPriceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  matchPriceValue: {
    fontSize: 20,
    color: '#4CAF50',
  },
  selectRideButton: {
    marginTop: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  matchedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  matchedIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchedTitle: {
    fontSize: 20,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  matchedDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  viewMatchButton: {
    width: 200,
  },
  bottomSpace: {
    height: 40,
  }
});