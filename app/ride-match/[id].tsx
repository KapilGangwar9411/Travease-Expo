import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { 
  MapPin, 
  Clock, 
  Users, 
  Car, 
  Phone,
  MessageCircle,
  Share2,
  Heart,
  Music,
  Book,
  Film,
  Shield,
  ChevronLeft,
  Star,
  Calendar,
  Navigation
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useRideStore } from '@/store/ride-store';
import { RideMatch, User } from '@/types';
import { formatDateTime, formatTime } from '@/utils/date-utils';
import { formatDistance } from '@/utils/location-utils';
import { mockUsers } from '@/mocks/users';
import { interests } from '@/mocks/interests';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';
import StyledText from '@/components/StyledText';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 180 : 160;

export default function RideMatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { rideMatches, isLoading } = useRideStore();
  
  const [rideMatch, setRideMatch] = useState<RideMatch | null>(null);
  const [matchedUsers, setMatchedUsers] = useState<User[]>([]);
  const [driver, setDriver] = useState<User | null>(null);
  const [commonInterests, setCommonInterests] = useState<string[]>([]);
  
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
      // Find the ride match
      const match = rideMatches.find(match => match.id === id);
      if (match) {
        setRideMatch(match);
        
        // Find matched users
        const riders = match.riders.map(riderId => 
          mockUsers.find(user => user.id === riderId)
        ).filter(Boolean) as User[];
        
        setMatchedUsers(riders);
        
        // Find driver
        if (match.driverId) {
          const driverUser = mockUsers.find(user => user.id === match.driverId);
          if (driverUser) {
            setDriver(driverUser);
          }
        }
        
        // Find common interests
        if (riders.length > 0) {
          let common = [...riders[0].interests];
          
          for (let i = 1; i < riders.length; i++) {
            common = common.filter(interest => 
              riders[i].interests.includes(interest)
            );
          }
          
          if (driver) {
            common = common.filter(interest => 
              driver.interests.includes(interest)
            );
          }
          
          setCommonInterests(common);
        }
      }
    }
  }, [id, rideMatches]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFC107';
      case 'confirmed':
        return '#4CAF50';
      case 'completed':
        return '#3F51B5';
      case 'cancelled':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };
  
  const handleShareRide = () => {
    Alert.alert(
      'Share Ride',
      'Share this ride with your friends',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Share',
          onPress: () => {
            // In a real app, we would use the Share API
            console.log('Sharing ride...');
          },
        },
      ]
    );
  };
  
  const handleContactDriver = () => {
    Alert.alert(
      'Contact Driver',
      'How would you like to contact the driver?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call',
          onPress: () => {
            // In a real app, we would use the Linking API to make a call
            console.log('Calling driver...');
          },
        },
        {
          text: 'Message',
          onPress: () => {
            // In a real app, we would navigate to a chat screen
            console.log('Messaging driver...');
          },
        },
      ]
    );
  };
  
  if (!rideMatch) {
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
          colors={['#3F51B5', '#5C6BC0']}
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
                <Users size={22} color="white" />
                <StyledText weight="semiBold" style={styles.headerCompactTitle}>
                  Ride Match
                </StyledText>
              </View>
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={handleShareRide}
              >
                <Share2 size={20} color="white" />
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
              
              <StyledText weight="bold" style={styles.headerTitle}>Ride Match</StyledText>
              <View style={styles.statusBadgeHeader}>
                <StyledText weight="medium" style={styles.headerSubtitle}>
                  {formatDistance(5.7)} • {formatTime(rideMatch.departureTime)}
                </StyledText>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(rideMatch.status) }
                ]}>
                  <StyledText weight="medium" style={styles.statusText}>
                    {rideMatch.status.charAt(0).toUpperCase() + rideMatch.status.slice(1)}
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
        {/* Map Preview */}
        <Card variant="elevated" style={styles.mapCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69c07a' }}
            style={styles.mapImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.mapGradient}
          />
          <View style={styles.mapOverlay}>
            <View style={styles.mapOverlayItem}>
              <MapPin size={16} color="white" />
              <StyledText weight="medium" style={styles.mapOverlayText}>
                {formatDistance(5.7)}
              </StyledText>
            </View>
            <View style={styles.mapOverlayItem}>
              <Clock size={16} color="white" />
              <StyledText weight="medium" style={styles.mapOverlayText}>
                {formatTime(rideMatch.departureTime)}
              </StyledText>
            </View>
          </View>
        </Card>
        
        {/* Journey Details Card */}
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
                <StyledText weight="semiBold" style={styles.locationName}>{rideMatch.commonPickup.name}</StyledText>
                <StyledText weight="regular" style={styles.locationAddress}>{rideMatch.commonPickup.address}</StyledText>
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
                <StyledText weight="semiBold" style={styles.locationName}>{rideMatch.destination.name}</StyledText>
                <StyledText weight="regular" style={styles.locationAddress}>{rideMatch.destination.address}</StyledText>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                <Calendar size={16} color="#4CAF50" />
              </View>
              <View>
                <StyledText weight="medium" style={styles.detailLabel}>Date</StyledText>
                <StyledText weight="semiBold" style={styles.detailText}>
                  {formatDateTime(rideMatch.departureTime).split(' at ')[0]}
                </StyledText>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(63, 81, 181, 0.1)' }]}>
                <Clock size={16} color="#3F51B5" />
              </View>
              <View>
                <StyledText weight="medium" style={styles.detailLabel}>Time</StyledText>
                <StyledText weight="semiBold" style={styles.detailText}>
                  {formatTime(rideMatch.departureTime)}
                </StyledText>
              </View>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <StyledText weight="medium" style={styles.priceLabel}>Price per person</StyledText>
            <StyledText weight="bold" style={styles.priceValue}>₹{rideMatch.price}</StyledText>
          </View>
        </Card>
        
        {/* Driver Card */}
        {driver && (
          <Card variant="elevated" style={styles.driverCard}>
            <View style={styles.cardHeader}>
              <StyledText weight="semiBold" style={styles.cardTitle}>Your Driver</StyledText>
              <Shield size={18} color="#4CAF50" />
            </View>
            
            <View style={styles.driverInfo}>
              <Avatar 
                source={driver.photoURL} 
                name={driver.name} 
                size="large" 
              />
              <View style={styles.driverDetails}>
                <StyledText weight="semiBold" style={styles.driverName}>{driver.name}</StyledText>
                <View style={styles.ratingContainer}>
                  <StyledText weight="medium" style={styles.ratingText}>4.8</StyledText>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <StyledText key={star} weight="regular" style={styles.star}>★</StyledText>
                    ))}
                  </View>
                </View>
                <StyledText weight="regular" style={styles.totalRides}>{driver.totalRides} rides</StyledText>
              </View>
            </View>
            
            {driver.vehicleInfo && (
              <View style={styles.vehicleInfo}>
                <View style={styles.vehicleDetail}>
                  <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(66, 133, 244, 0.1)' }]}>
                    <Car size={16} color="#4285F4" />
                  </View>
                  <StyledText weight="medium" style={styles.vehicleText}>
                    {driver.vehicleInfo.model} • {driver.vehicleInfo.color}
                  </StyledText>
                </View>
                <View style={styles.vehicleDetail}>
                  <View style={styles.licensePlateContainer}>
                    <StyledText weight="semiBold" style={styles.licensePlate}>
                      {driver.vehicleInfo.licensePlate}
                    </StyledText>
                  </View>
                </View>
              </View>
            )}
            
            <View style={styles.contactButtons}>
              <Button
                title="Call Driver"
                onPress={() => handleContactDriver()}
                variant="primary"
                icon={<Phone size={18} color="white" />}
                style={[styles.contactButton, { marginRight: 8 }]}
              />
              <Button
                title="Message"
                onPress={() => console.log('Message driver')}
                variant="outline"
                icon={<MessageCircle size={18} color={colors.primary} />}
                style={styles.contactButton}
              />
            </View>
          </Card>
        )}
        
        {/* Co-Passengers Card */}
        <Card variant="elevated" style={styles.passengersCard}>
          <StyledText weight="semiBold" style={styles.cardTitle}>Co-Passengers</StyledText>
          
          {matchedUsers.filter(u => u.id !== user?.id).map(passenger => (
            <View key={passenger.id} style={styles.passengerItem}>
              <Avatar 
                source={passenger.photoURL} 
                name={passenger.name} 
                size="medium" 
              />
              <View style={styles.passengerInfo}>
                <StyledText weight="semiBold" style={styles.passengerName}>{passenger.name}</StyledText>
                <View style={styles.passengerRatingContainer}>
                  <StyledText weight="medium" style={styles.passengerRating}>4.7</StyledText>
                  <Star size={14} color="#FFC107" style={{ marginLeft: 4 }} />
                </View>
                <StyledText weight="regular" style={styles.passengerRides}>{passenger.totalRides} rides</StyledText>
              </View>
            </View>
          ))}

          {matchedUsers.filter(u => u.id !== user?.id).length === 0 && (
            <View style={styles.emptyPassengers}>
              <StyledText weight="medium" style={styles.emptyText}>No other passengers yet</StyledText>
            </View>
          )}
        </Card>
        
        {/* Common Interests Card */}
        {commonInterests.length > 0 && (
          <Card variant="elevated" style={styles.interestsCard}>
            <StyledText weight="semiBold" style={styles.cardTitle}>Common Interests</StyledText>
            
            <View style={styles.interestsList}>
              {commonInterests.map(interestId => {
                const interest = interests.find(i => i.id === interestId);
                if (!interest) return null;
                
                return (
                  <View key={interest.id} style={styles.interestItem}>
                    {getInterestIcon(interest.icon)}
                    <StyledText weight="medium" style={styles.interestName}>{interest.name}</StyledText>
                  </View>
                );
              })}
            </View>
          </Card>
        )}
        
        <View style={styles.bottomSpace} />
      </Animated.ScrollView>
    </View>
  );
}

const getInterestIcon = (iconName: string) => {
  const iconProps = { size: 16, color: '#3F51B5' };
  
  switch (iconName) {
    case 'music':
      return <Music {...iconProps} />;
    case 'book-open':
      return <Book {...iconProps} />;
    case 'film':
      return <Film {...iconProps} />;
    default:
      return <Heart {...iconProps} />;
  }
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
  shareButton: {
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
  mapCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 16,
  },
  mapImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  mapGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  mapOverlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapOverlayText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 6,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 20,
    color: '#4CAF50',
  },
  driverCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  driverInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  driverDetails: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    color: '#FFC107',
    fontSize: 14,
  },
  totalRides: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  vehicleInfo: {
    marginBottom: 16,
    marginTop: 8,
  },
  vehicleDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleText: {
    fontSize: 14,
    color: colors.text,
  },
  licensePlateContainer: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  licensePlate: {
    fontSize: 14,
    color: colors.text,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
  },
  passengersCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  passengerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  passengerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  passengerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  passengerRating: {
    fontSize: 14,
    color: colors.text,
  },
  passengerRides: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyPassengers: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  interestsCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  interestName: {
    marginLeft: 6,
    fontSize: 14,
    color: '#3F51B5',
  },
  bottomSpace: {
    height: 40,
  }
});