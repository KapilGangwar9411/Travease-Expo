import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  Animated,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Heart,
  Car,
  Wallet,
  Share2,
  Shield,
  HelpCircle,
  Star,
  MapPin,
  Bell,
  MessageSquare
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuthStore } from '@/store/auth-store';
import Card from '@/components/Card';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import InterestSelector from '@/components/InterestSelector';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  
  const [isDriver, setIsDriver] = useState(user?.userType === 'driver');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests || []
  );
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp'
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp'
  });
  
  const toggleUserType = () => {
    const newType = isDriver ? 'rider' : 'driver';
    setIsDriver(!isDriver);
    
    if (user) {
      updateUser({
        userType: newType
      });
    }
  };
  
  const toggleInterest = (id: string) => {
    let newInterests: string[];
    
    if (selectedInterests.includes(id)) {
      newInterests = selectedInterests.filter(i => i !== id);
    } else {
      newInterests = [...selectedInterests, id];
    }
    
    setSelectedInterests(newInterests);
    
    if (user) {
      updateUser({
        interests: newInterests
      });
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            router.replace('/');
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ 
          title: 'Profile',
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false
        }} />
        <View style={styles.centerContainer}>
          <View style={styles.profilePlaceholder}>
            <User size={64} color={colors.textLight} />
          </View>
          <Text style={styles.loginTitle}>Please Login</Text>
          <Text style={styles.loginSubtitle}>
            Login to access your profile and manage your account
          </Text>
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar
        backgroundColor="#4CAF50"
        barStyle="light-content"
        translucent={true}
      />
      <Stack.Screen options={{ 
        title: '',
        headerTransparent: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' }
      }} />
      
      <Animated.ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Animated Profile Header */}
        <Animated.View 
          style={[
            styles.profileHeaderContainer,
            { 
              transform: [{ scale: headerScale }],
              opacity: headerOpacity 
            }
          ]}
        >
          <View style={styles.profileCoverBackground}>
          </View>
          
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Avatar 
                source={user.photoURL} 
                name={user.name} 
                size="large" 
                style={styles.avatar}
              />
              
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
              >
                <User size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user.totalRides}</Text>
                <Text style={styles.statLabel}>Rides</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user.points}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user.interests?.length || 0}</Text>
                <Text style={styles.statLabel}>Interests</Text>
              </View>
            </View>
          </View>
        </Animated.View>
        
        {/* Account Section */}
        <Card variant="default" style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionHeaderBadge}>
              <User size={12} color={colors.primary} />
            </View>
          </View>
          
          <MenuItem 
            icon={<User size={20} color={colors.primary} />}
            title="Edit Profile"
            onPress={() => {
              Alert.alert('Coming Soon', 'Edit Profile feature will be available soon!');
            }}
          />
          
          <MenuItem 
            icon={<Wallet size={20} color={colors.primary} />}
            title="Wallet & Payments"
            subtitle={`Balance: ₹${user.points || 0}`}
            onPress={() => {
              Alert.alert('Coming Soon', 'Wallet & Payments feature will be available soon!');
            }}
          />
          
          <MenuItem 
            icon={<Car size={20} color={colors.primary} />}
            title="My Rides"
            subtitle={`${user.totalRides || 0} total rides`}
            onPress={() => {
              router.push('/my-rides');
            }}
          />
          
          <MenuItem 
            icon={<Share2 size={20} color="#5E60CE" />}
            title="Referrals"
            subtitle={`Code: ${user.referralCode || 'None'}`}
            onPress={() => {
              Alert.alert('Coming Soon', 'Referrals feature will be available soon!');
            }}
            isLast
          />
        </Card>
        
        {/* Preferences Section */}
        <Card variant="default" style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.sectionHeaderBadge}>
              <Settings size={12} color={colors.primary} />
            </View>
          </View>
          
          <View style={styles.driverModeSection}>
            <View style={styles.driverModeTextContainer}>
              <View style={styles.driverModeIconContainer}>
                <Car size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.driverModeTitle}>Driver Mode</Text>
                <Text style={styles.driverModeDescription}>
                  {isDriver 
                    ? 'You can offer rides to passengers' 
                    : 'Switch to driver mode to offer rides'}
                </Text>
              </View>
            </View>
            
            <Switch
              value={isDriver}
              onValueChange={toggleUserType}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isDriver ? colors.primary : "#FFFFFF"}
              style={styles.driverModeSwitch}
              ios_backgroundColor={colors.borderLight}
            />
          </View>
          
          <Text style={styles.interestsTitle}>Your Interests</Text>
          <Text style={styles.interestsDescription}>
            We'll match you with people who share similar interests
          </Text>
          
          <InterestSelector
            selectedInterests={selectedInterests}
            onSelectInterest={toggleInterest}
          />
        </Card>
        
        {/* Support Section */}
        <Card variant="default" style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.sectionHeaderBadge}>
              <HelpCircle size={12} color={colors.primary} />
            </View>
          </View>
          
          <MenuItem 
            icon={<HelpCircle size={20} color="#6A7BFF" />}
            title="Help & Support"
            onPress={() => {
              Alert.alert('Coming Soon', 'Help & Support feature will be available soon!');
            }}
          />
          
          <MenuItem 
            icon={<Shield size={20} color="#4CAF50" />}
            title="Privacy Policy"
            onPress={() => {
              Alert.alert('Coming Soon', 'Privacy Policy feature will be available soon!');
            }}
          />
          
          <MenuItem 
            icon={<Shield size={20} color="#FF9800" />}
            title="Terms of Service"
            onPress={() => {
              Alert.alert('Coming Soon', 'Terms of Service feature will be available soon!');
            }}
            isLast
          />
        </Card>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// Extracted MenuItem component for better reusability
function MenuItem({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  isLast = false 
}: { 
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity 
      style={[
        styles.menuItem,
        isLast && styles.menuItemLast
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemIconContainer}>
        {icon}
      </View>
      
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
        )}
      </View>
      
      <View style={styles.menuItemArrow}>
        <ChevronRight size={18} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginImage: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    fontFamily: fonts.bold,
  },
  loginSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: fonts.regular,
    lineHeight: 22,
  },
  loginButton: {
    width: width * 0.7,
    height: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  profileHeaderContainer: {
    position: 'relative',
    width: '100%',
    height: 320,
    alignItems: 'center',
    paddingTop: 0,
    marginTop: 0,
  },
  profileCoverBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 230,
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  profileHeader: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 50,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    borderWidth: 4,
    borderColor: 'white',
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    fontFamily: fonts.bold,
  },
  profileEmail: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    fontFamily: fonts.regular,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    position: 'relative',
    top: 15,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    fontFamily: fonts.bold,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: fonts.bold,
  },
  sectionHeaderBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
    fontFamily: fonts.medium,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
  menuItemArrow: {
    marginLeft: 8,
  },
  driverModeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  driverModeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverModeIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  driverModeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: fonts.semiBold,
  },
  driverModeDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    width: 170,
    fontFamily: fonts.regular,
  },
  driverModeSwitch: {
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : [],
  },
  interestsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginTop: 6,
    marginBottom: 6,
    fontFamily: fonts.semiBold,
  },
  interestsDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    fontFamily: fonts.regular,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
    fontFamily: fonts.semiBold,
  },
  versionText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 12,
    marginTop: 12,
    marginBottom: 24,
    fontFamily: fonts.regular,
  }
});