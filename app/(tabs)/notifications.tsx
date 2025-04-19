import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  Bell, 
  Car, 
  User, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  Trash2
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuthStore } from '@/store/auth-store';
import { getRelativeTime } from '@/utils/date-utils';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StyledText from '@/components/StyledText';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 180 : 160;

// Mock notifications with Delhi locations
const mockNotifications = [
  {
    id: '1',
    title: 'New ride match!',
    message: 'You have been matched with a driver for your ride to India Gate.',
    type: 'ride_match',
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    data: {
      rideId: 'match1',
      type: 'match'
    }
  },
  {
    id: '2',
    title: 'Ride completed',
    message: 'Your ride with Neha has been completed. Rate your experience!',
    type: 'ride_update',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    data: {
      rideId: 'match1',
      type: 'match'
    }
  },
  {
    id: '3',
    title: 'Points earned!',
    message: 'You earned 500 points for completing your ride to Connaught Place.',
    type: 'payment',
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: '4',
    title: 'Welcome to RideShare',
    message: 'Thank you for joining RideShare! Start by finding a pool or offering a ride.',
    type: 'system',
    read: true,
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
  }
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [notifications, setNotifications] = useState(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);
  
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
  
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const handleNotificationPress = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'ride_match' || notification.type === 'ride_update') {
      if (notification.data?.type === 'match') {
        // Use string navigation for compatibility
        router.push('/ride-match/' + notification.data.rideId as any);
      } else if (notification.data?.type === 'request') {
        router.push('/ride-request/' + notification.data.rideId as any);
      } else if (notification.data?.type === 'offered') {
        router.push('/offered-ride/' + notification.data.rideId as any);
      }
    } else if (notification.type === 'payment') {
      router.push('/wallet');
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ride_match':
        return <Car size={24} color="#4285F4" />;
      case 'ride_update':
        return <CheckCircle size={24} color="#4CAF50" />;
      case 'payment':
        return <AlertCircle size={24} color="#FFC107" />;
      case 'system':
        return <Bell size={24} color="#9E9E9E" />;
      default:
        return <MessageCircle size={24} color="#9E9E9E" />;
    }
  };
  
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ride_match':
        return '#E3F2FD';
      case 'ride_update':
        return '#E8F5E9';
      case 'payment':
        return '#FFF8E1';
      case 'system':
        return '#F5F5F5';
      default:
        return '#EEEEEE';
    }
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const renderNotification = ({ item, index }: { item: any, index: number }) => {
    // Define the card style based on read status
    const cardStyle = item.read 
      ? styles.notificationCard 
      : { ...styles.notificationCard, ...styles.unreadNotification };
      
    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
        style={styles.notificationTouchable}
      >
        <Card 
          variant={item.read ? 'default' : 'elevated'} 
          style={cardStyle}
        >
          <View style={[
            styles.notificationIcon,
            { backgroundColor: getNotificationColor(item.type) }
          ]}>
            {getNotificationIcon(item.type)}
          </View>
          <View style={styles.notificationContent}>
            <StyledText 
              weight={item.read ? "medium" : "semiBold"} 
              style={styles.notificationTitle}
            >
              {item.title}
            </StyledText>
            <StyledText 
              weight="regular" 
              style={styles.notificationMessage}
            >
              {item.message}
            </StyledText>
            <StyledText 
              weight="regular" 
              style={styles.notificationTime}
            >
              {getRelativeTime(item.createdAt)}
            </StyledText>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Bell size={80} color="#BDBDBD" />
      <StyledText weight="semiBold" style={styles.emptyStateTitle}>
        No notifications yet
      </StyledText>
      <StyledText weight="regular" style={styles.emptyStateDescription}>
        You'll see notifications about your rides, matches, and more here.
      </StyledText>
    </View>
  );
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: false
      }} />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header, 
          { height: headerHeight }
        ]}
      >
        <LinearGradient
          colors={['#5E60CE', '#4A55A2']}
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
              <View style={styles.placeholderWidth} />
              <View style={styles.headerTitleContainer}>
                <Bell size={24} color="white" />
                <StyledText weight="semiBold" style={styles.headerCompactTitle}>
                  Notifications
                </StyledText>
              </View>
              {notifications.length > 0 ? (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={clearAllNotifications}
                >
                  <Trash2 size={20} color="white" />
                </TouchableOpacity>
              ) : (
                <View style={styles.placeholderWidth} />
              )}
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
              <StyledText weight="bold" style={styles.headerTitle}>Notifications</StyledText>
              <StyledText weight="medium" style={styles.headerSubtitle}>
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` 
                  : 'Stay updated on your rides and activity'}
              </StyledText>
              
              {notifications.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearAllButton}
                  onPress={clearAllNotifications}
                >
                  <StyledText weight="medium" style={styles.clearAllText}>
                    Clear All
                  </StyledText>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
      
      <Animated.FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#5E60CE']}
            tintColor="#5E60CE"
          />
        }
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholderWidth: {
    width: 40,
  },
  clearAllButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  clearAllText: {
    color: 'white',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: HEADER_HEIGHT + 20,
    paddingBottom: 20,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTouchable: {
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: '#5E60CE',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textLight,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  }
});