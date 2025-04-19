import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  ImageBackground,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { 
  MapPin, 
  Search,
  Users, 
  Car, 
  Calendar,
  Clock,
  ChevronRight,
  CircleDollarSign
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuthStore } from '@/store/auth-store';
import { useRideStore } from '@/store/ride-store';
import { mockUsers } from '@/mocks/users';
import Avatar from '@/components/Avatar';
import RideCard from '@/components/RideCard';
import EmptyState from '@/components/EmptyState';
import WelcomeScreen from '@/app/welcome';
import StyledText from '@/components/StyledText';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isAuthenticated } = useAuthStore();
  const { rideRequests, offeredRides, rideMatches, getUserRides } = useRideStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeRides, setActiveRides] = useState<any[]>([]);
  const scrollY = new Animated.Value(0);
  
  useEffect(() => {
    if (user) {
      loadUserRides();
    }
  }, [user, rideRequests, offeredRides, rideMatches]);
  
  // Check if we're coming directly from login (not from welcome screen)
  // This prevents showing welcome screen after login
  const isDirectNavigationFromLogin = segments.length > 0 && segments[0] === '(tabs)';
  
  // Only show welcome screen for first launch, not after login
  if (!isAuthenticated && !isDirectNavigationFromLogin) {
    return <WelcomeScreen />;
  }
  
  const loadUserRides = () => {
    if (!user) return;
    
    const userRides = getUserRides(user.id);
    
    // Get active rides (pending, matched, confirmed, active)
    const activeRequests = userRides.requests.filter(
      req => ['pending', 'matched'].includes(req.status)
    );
    
    const activeOffered = userRides.offered.filter(
      ride => ['pending', 'active'].includes(ride.status)
    );
    
    const activeMatches = userRides.matches.filter(
      match => ['confirmed', 'pending'].includes(match.status)
    );
    
    // Combine and sort by time
    const combined = [
      ...activeRequests.map(req => ({ ...req, type: 'request' })),
      ...activeOffered.map(ride => ({ ...ride, type: 'offered' })),
      ...activeMatches.map(match => ({ ...match, type: 'match' })),
    ].sort((a, b) => {
      // Get the appropriate time property based on ride type
      const getTimeProperty = (ride: any) => {
        if (ride.type === 'request') {
          return ride.preferredTime;
        } else if (ride.type === 'offered' || ride.type === 'match') {
          return ride.departureTime;
        }
        return ''; // Fallback
      };
      
      const timeA = getTimeProperty(a);
      const timeB = getTimeProperty(b);
      
      return new Date(timeA).getTime() - new Date(timeB).getTime();
    });
    
    setActiveRides(combined);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    loadUserRides();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const handleRidePress = (ride: any) => {
    if (ride.type === 'request') {
      router.push(`/ride-request/${ride.id}`);
    } else if (ride.type === 'offered') {
      router.push('/my-rides');
    } else {
      router.push(`/ride-match/${ride.id}`);
    }
  };
  
  const getUserForRide = (ride: any) => {
    if (ride.type === 'request') {
      return undefined; // Own request
    } else if (ride.type === 'offered') {
      return undefined; // Own offered ride
    } else {
      // For matches, show the driver
      const driver = mockUsers.find(u => u.id === ride.driverId);
      if (driver && driver.id !== user?.id) {
        return {
          name: driver.name,
          photoURL: driver.photoURL,
        };
      }
      return undefined;
    }
  };
  
  // Calculate header opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Stack.Screen 
        options={{ 
          headerShown: false
        }} 
      />
      
      {/* Animated Header Background */}
      <Animated.View style={[
        styles.headerBackground,
        { opacity: headerOpacity }
      ]} />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.name.split(' ')[0]}! 👋</Text>
            <Text style={styles.subGreeting}>Ready for your next journey?</Text>
          </View>
          
          <View style={styles.headerRightContainer}>
            <TouchableOpacity 
              style={styles.pointsContainer}
              onPress={() => router.push('/wallet')}
            >
              <View style={styles.coinsContainer}>
                <View style={[styles.coin, styles.coinOne]}>
                  <Text style={styles.coinText}>₹</Text>
                </View>
                <View style={[styles.coin, styles.coinTwo]}>
                  <Text style={styles.coinText}>₹</Text>
                </View>
                <View style={[styles.coin, styles.coinThree]}>
                  <Text style={styles.coinText}>₹</Text>
                </View>
              </View>
              <Text style={styles.pointsText}>₹{user?.points || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
            >
              <Avatar 
                source={user?.photoURL} 
                name={user?.name} 
                size="medium" 
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Action Cards */}
        <View style={styles.actionCardsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionCardsWrapper}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push("/(tabs)/find-pool")}
            >
              <View style={[styles.actionCardIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Users size={24} color="#4CAF50" />
              </View>
              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>Find Pool</Text>
                <Text style={styles.actionCardSubtitle}>Save costs, reduce emissions</Text>
              </View>
              <View style={styles.actionCardArrow}>
                <ChevronRight size={16} color="#4CAF50" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push("/(tabs)/offer-ride")}
            >
              <View style={[styles.actionCardIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Car size={24} color="#3D68F5" />
              </View>
              <View style={styles.actionCardContent}>
                <Text style={styles.actionCardTitle}>Offer Ride</Text>
                <Text style={styles.actionCardSubtitle}>Share your journey, earn rewards</Text>
              </View>
              <View style={styles.actionCardArrow}>
                <ChevronRight size={16} color="#3D68F5" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Upcoming Rides Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Upcoming Rides</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/my-rides')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {activeRides.length > 0 ? (
            <View style={styles.ridesContainer}>
              {activeRides.slice(0, 3).map((ride) => (
                <RideCard
                  key={`${ride.type}-${ride.id}`}
                  ride={ride}
                  type={ride.type}
                  onPress={() => handleRidePress(ride)}
                  user={getUserForRide(ride)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <EmptyState
                title="No upcoming rides"
                description="Start by finding a pool or offering a ride"
                icon={<Calendar size={48} color={colors.textLight} />}
              />
            </View>
          )}
        </View>
        
        {/* Popular Destinations Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Destinations</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularContainer}
            decelerationRate="fast"
            snapToInterval={width * 0.7 + 12}
            snapToAlignment="start"
          >
            <TouchableOpacity 
              style={styles.popularCard}
              onPress={() => router.push('/find-pool')}
            >
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1587474260584-136574528ed5' }}
                style={styles.popularImage}
                imageStyle={styles.popularImageStyle}
              >
                <View style={styles.popularContent}>
                  <Text style={styles.popularName}>India Gate</Text>
                  <View style={styles.popularDetail}>
                    <MapPin size={14} color="white" />
                    <Text style={styles.popularDistance}>5.2 km</Text>
                    <View style={styles.popularTimeBadge}>
                      <Clock size={10} color="white" />
                      <Text style={styles.popularTimeText}>18 min</Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.popularCard}
              onPress={() => router.push('/find-pool')}
            >
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1555952238-7d7c45ba143a' }}
                style={styles.popularImage}
                imageStyle={styles.popularImageStyle}
              >
                <View style={styles.popularContent}>
                  <Text style={styles.popularName}>Connaught Place</Text>
                  <View style={styles.popularDetail}>
                    <MapPin size={14} color="white" />
                    <Text style={styles.popularDistance}>3.7 km</Text>
                    <View style={styles.popularTimeBadge}>
                      <Clock size={10} color="white" />
                      <Text style={styles.popularTimeText}>15 min</Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.popularCard}
              onPress={() => router.push('/find-pool')}
            >
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1580188911874-f217bb04438d' }}
                style={styles.popularImage}
                imageStyle={styles.popularImageStyle}
              >
                <View style={styles.popularContent}>
                  <Text style={styles.popularName}>Qutub Minar</Text>
                  <View style={styles.popularDetail}>
                    <MapPin size={14} color="white" />
                    <Text style={styles.popularDistance}>8.3 km</Text>
                    <View style={styles.popularTimeBadge}>
                      <Clock size={10} color="white" />
                      <Text style={styles.popularTimeText}>25 min</Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Safety Tips Section */}
        <View style={styles.safetyTipsContainer}>
          <View style={styles.safetyTipsHeader}>
            <Text style={styles.safetyTipsTitle}>Safety Tips</Text>
          </View>
          <View style={styles.safetyTip}>
            <View style={styles.safetyTipIcon}>
              <Users size={20} color="#4CAF50" />
            </View>
            <View style={styles.safetyTipContent}>
              <Text style={styles.safetyTipText}>
                Always verify your driver's identity before getting in the car
              </Text>
            </View>
          </View>
          <View style={styles.safetyTip}>
            <View style={styles.safetyTipIcon}>
              <MapPin size={20} color="#4CAF50" />
            </View>
            <View style={styles.safetyTipContent}>
              <Text style={styles.safetyTipText}>
                Share your ride details with a trusted contact
              </Text>
            </View>
          </View>
        </View>
        
        {/* Footer - Same as Login Page */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <StyledText weight="semiBold" style={styles.taglineHeading}>Go Further Together!</StyledText>
            <View style={styles.craftedContainer}>
              <StyledText weight="regular" style={styles.craftedText}>
                Crafted with
              </StyledText>
              <View style={styles.heartContainer}>
                <Image 
                  source={require('@/assets/images/heart-shape.png')}
                  style={styles.heartImage}
                />
              </View>
              <StyledText weight="regular" style={styles.craftedText}>
                in Greater Noida, India
              </StyledText>
            </View>
          </View>
        </View>
        
        {/* Small spacing just for tab bar clearance */}
        <View style={{ height: 20 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 120 : 100,
    backgroundColor: 'white',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  safeArea: {
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingBottom: 10,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    fontFamily: fonts.bold,
  },
  subGreeting: {
    fontSize: 15,
    color: '#666',
    fontFamily: fonts.regular,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 194, 13, 0.3)',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    marginRight: 6,
    position: 'relative',
    width: 36,
  },
  coin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  coinOne: {
    backgroundColor: '#F7CF6F', // Gold tone
    zIndex: 3,
    right: 0,
    top: 0,
  },
  coinTwo: {
    backgroundColor: '#E1E1E1', // Silver tone
    zIndex: 2,
    right: 10,
    top: 4,
  },
  coinThree: {
    backgroundColor: '#BD7B36', // Bronze tone
    zIndex: 1,
    right: 20,
    top: 8,
  },
  coinText: {
    color: '#5D4037',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
  },
  pointsText: {
    color: '#8D6E63',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: fonts.bold,
    marginLeft: 2,
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'white',
  },
  scrollView: {
    flex: 1,
    zIndex: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  actionCardsContainer: {
    marginBottom: 24,
  },
  actionCardsWrapper: {
    marginTop: 12,
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  actionCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    fontFamily: fonts.semiBold,
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 13,
    color: '#666666',
    fontFamily: fonts.regular,
  },
  actionCardArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    fontFamily: fonts.bold,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
    fontFamily: fonts.semiBold,
  },
  ridesContainer: {
    gap: 12,
  },
  emptyStateContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  popularContainer: {
    paddingVertical: 10,
  },
  popularCard: {
    width: width * 0.7,
    height: 180,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
  },
  popularImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  popularImageStyle: {
    borderRadius: 16,
  },
  popularContent: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  popularName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: fonts.bold,
  },
  popularDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularDistance: {
    color: 'white',
    fontSize: 14,
    marginLeft: 6,
    marginRight: 12,
    fontFamily: fonts.medium,
  },
  popularTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularTimeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    fontFamily: fonts.medium,
  },
  safetyTipsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  safetyTipsHeader: {
    marginBottom: 16,
  },
  safetyTipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    fontFamily: fonts.bold,
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyTipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  safetyTipContent: {
    flex: 1,
  },
  safetyTipText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  footer: {
    paddingHorizontal: 24,
    marginTop: 80,
  },
  footerContent: {
    alignItems: 'flex-start',
  },
  taglineHeading: {
    fontSize: 50,
    color: '#777777',
    marginBottom: 10,
    lineHeight: 52,
    fontFamily: 'System',
    fontWeight: '600',
    letterSpacing: -1,
    opacity: 0.4,
  },
  craftedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  craftedText: {
    fontSize: 16,
    color: '#777777',
    opacity: 0.8,
  },
  heartContainer: {
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  heartImage: {
    width: 16,
    height: 16,
    tintColor: '#000000',
    opacity: 0.8,
  },
});