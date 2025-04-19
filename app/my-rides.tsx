import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  Car, 
  Search, 
  Calendar, 
  Filter
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useRideStore } from '@/store/ride-store';
import { mockUsers } from '@/mocks/users';
import RideCard from '@/components/RideCard';
import EmptyState from '@/components/EmptyState';

export default function MyRidesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getUserRides } = useRideStore();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [rides, setRides] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      loadRides();
    }
  }, [user, activeTab]);
  
  const loadRides = () => {
    if (!user) return;
    
    const userRides = getUserRides(user.id);
    
    let filteredRides: any[] = [];
    
    if (activeTab === 'upcoming') {
      // Get upcoming rides (pending, matched, confirmed, active)
      const upcomingRequests = userRides.requests.filter(
        req => ['pending', 'matched'].includes(req.status)
      ).map(req => ({ ...req, type: 'request' }));
      
      const upcomingOffered = userRides.offered.filter(
        ride => ['pending', 'active'].includes(ride.status)
      ).map(ride => ({ ...ride, type: 'offered' }));
      
      const upcomingMatches = userRides.matches.filter(
        match => ['confirmed', 'pending'].includes(match.status)
      ).map(match => ({ ...match, type: 'match' }));
      
      filteredRides = [...upcomingRequests, ...upcomingOffered, ...upcomingMatches];
    } else if (activeTab === 'completed') {
      // Get completed rides
      const completedRequests = userRides.requests.filter(
        req => req.status === 'completed'
      ).map(req => ({ ...req, type: 'request' }));
      
      const completedOffered = userRides.offered.filter(
        ride => ride.status === 'completed'
      ).map(ride => ({ ...ride, type: 'offered' }));
      
      const completedMatches = userRides.matches.filter(
        match => match.status === 'completed'
      ).map(match => ({ ...match, type: 'match' }));
      
      filteredRides = [...completedRequests, ...completedOffered, ...completedMatches];
    } else if (activeTab === 'cancelled') {
      // Get cancelled rides
      const cancelledRequests = userRides.requests.filter(
        req => req.status === 'cancelled'
      ).map(req => ({ ...req, type: 'request' }));
      
      const cancelledOffered = userRides.offered.filter(
        ride => ride.status === 'cancelled'
      ).map(ride => ({ ...ride, type: 'offered' }));
      
      const cancelledMatches = userRides.matches.filter(
        match => match.status === 'cancelled'
      ).map(match => ({ ...match, type: 'match' }));
      
      filteredRides = [...cancelledRequests, ...cancelledOffered, ...cancelledMatches];
    }
    
    // Sort by time
    filteredRides.sort((a, b) => {
      const timeA = a.type === 'request' ? a.preferredTime : 
                   a.type === 'offered' ? a.departureTime : a.departureTime;
      const timeB = b.type === 'request' ? b.preferredTime : 
                   b.type === 'offered' ? b.departureTime : b.departureTime;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
    
    setRides(filteredRides);
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadRides();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const handleRidePress = (ride: any) => {
    if (ride.type === 'request') {
      router.push(`/ride-request/${ride.id}`);
    } else if (ride.type === 'offered') {
      router.push(`/offered-ride/${ride.id}`);
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
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ title: 'My Rides' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Please Login</Text>
          <Button
            title="Login"
            onPress={() => router.push('/login')}
            variant="primary"
            style={styles.loginButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ title: 'My Rides' }} />
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && styles.activeTab
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'upcoming' && styles.activeTabText
          ]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'completed' && styles.activeTab
          ]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'completed' && styles.activeTabText
          ]}>
            Completed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'cancelled' && styles.activeTab
          ]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'cancelled' && styles.activeTabText
          ]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>
      
      {rides.length > 0 ? (
        <FlatList
          data={rides}
          renderItem={({ item }) => (
            <RideCard
              ride={item}
              type={item.type}
              onPress={() => handleRidePress(item)}
              user={getUserForRide(item)}
            />
          )}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <EmptyState
          title={`No ${activeTab} rides`}
          description={
            activeTab === 'upcoming'
              ? 'You have no upcoming rides. Find a pool or offer a ride!'
              : activeTab === 'completed'
              ? 'You have not completed any rides yet.'
              : 'You have not cancelled any rides.'
          }
          icon={<Calendar size={48} color={colors.textLight} />}
          actionLabel={activeTab === 'upcoming' ? 'Find a Ride' : undefined}
          onAction={activeTab === 'upcoming' ? () => router.push('/find-pool') : undefined}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  loginButton: {
    width: 200,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
});

// Add missing Button component
function Button(props: any) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        ...props.style,
      }}
      onPress={props.onPress}
    >
      <Text style={{ color: 'white', fontWeight: '600' }}>{props.title}</Text>
    </TouchableOpacity>
  );
}