import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  Calendar, 
  Clock, 
  Search,
  ChevronRight,
  MapPin,
  X,
  User,
  Star,
  Navigation,
  Flag
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuthStore } from '@/store/auth-store';
import { useRideStore } from '@/store/ride-store';
import { Location } from '@/types';
import { formatTime } from '@/utils/date-utils';
import Card from '@/components/Card';
import LocationInput from '@/components/LocationInput';
import InterestSelector from '@/components/InterestSelector';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 180 : 160;

interface InterestListProps {
  selectedInterests: string[];
  onSelectInterest: (id: string) => void;
}

// Define the Interest interface inline
interface InterestItem {
  id: string;
  name: string;
  icon: string;
}

const InterestList: React.FC<InterestListProps> = ({ selectedInterests, onSelectInterest }) => {
  const { interests } = require('@/mocks/interests');
  
  return (
    <View style={styles.interestGridHorizontal}>
      {interests.map((interest: InterestItem) => {
        const isSelected = selectedInterests.includes(interest.id);
        
        return (
          <TouchableOpacity
            key={interest.id}
            style={[
              styles.interestChipCompact,
              isSelected && styles.selectedChipCompact,
            ]}
            onPress={() => onSelectInterest(interest.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.interestTextCompact,
                isSelected && styles.selectedTextCompact,
              ]}
            >
              {interest.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function FindPoolScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createRideRequest, isLoading } = useRideStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const [pickup, setPickup] = useState<Location | undefined>();
  const [destination, setDestination] = useState<Location | undefined>();
  const [preferredTime, setPreferredTime] = useState<Date>(new Date(Date.now() + 3600000)); // 1 hour from now
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeInput, setActiveInput] = useState<'pickup' | 'destination' | null>(null);
  const [errors, setErrors] = useState<{
    pickup?: string;
    destination?: string;
  }>({});
  
  // Animation values
  const formAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate form entry
    Animated.timing(formAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Header animations
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
  
  const handleTimeChange = (hours: number) => {
    const newTime = new Date();
    newTime.setHours(newTime.getHours() + hours);
    setPreferredTime(newTime);
  };
  
  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };
  
  const validateForm = () => {
    const newErrors: {
      pickup?: string;
      destination?: string;
    } = {};
    
    if (!pickup) {
      newErrors.pickup = 'Please select a pickup location';
    }
    
    if (!destination) {
      newErrors.destination = 'Please select a destination';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm() || !user) return;
    
    try {
      const request = await createRideRequest(
        user.id,
        pickup!,
        destination!,
        preferredTime.toISOString(),
        selectedInterests
      );
      
      router.push(`/ride-request/${request.id}`);
    } catch (error) {
      console.error('Error creating ride request:', error);
    }
  };

  // UI helpers
  const renderTimeOption = (label: string, hours: number) => {
    const isSelected = Math.abs(
      (preferredTime.getTime() - Date.now()) / 3600000 - hours
    ) < 0.1;
    
    return (
      <TouchableOpacity
        style={[styles.timeOption, isSelected && styles.selectedTimeOption]}
        onPress={() => handleTimeChange(hours)}
        activeOpacity={0.7}
      >
        <Text style={[styles.timeOptionText, isSelected && styles.selectedTimeOptionText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
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
          colors={['#4CAF50', '#2E7D32']}
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
          <SafeAreaView edges={['top']}>
            <View style={styles.headerCompactInner}>
              <Text style={styles.headerCompactTitle}>Find Pool</Text>
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
          <SafeAreaView edges={['top']}>
            <View style={styles.headerExpandedInner}>
              <Text style={styles.headerTitle}>Find Your Ride</Text>
              <Text style={styles.headerSubtitle}>Share your journey. Save money. Make friends.</Text>
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
        <Animated.View style={[
          styles.formContainer,
          {
            opacity: formAnimation,
            transform: [{ 
              translateY: formAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}>
          <Card variant="elevated" style={styles.formCard}>
            {/* Route Selection */}
            <View style={styles.routeSection}>
              <Text style={styles.sectionTitleLarge}>Journey Details</Text>
              
              <View style={styles.routeContainer}>
                <View style={styles.routeLine}>
                  <View style={styles.routePointStart}>
                    <Navigation size={12} color="white" />
                  </View>
                  <View style={styles.routeLineConnector} />
                  <View style={styles.routePointEnd}>
                    <Flag size={12} color="white" />
                  </View>
                </View>
                
                <View style={styles.routeInputs}>
                  <TouchableOpacity
                    style={[
                      styles.locationInputContainer,
                      activeInput === 'pickup' && styles.activeLocationInput,
                      errors.pickup && styles.errorInput
                    ]}
                    onPress={() => setActiveInput('pickup')}
                  >
                    <Text style={[
                      styles.locationLabel,
                      pickup && styles.locationLabelSmall
                    ]}>
                      Pickup Location
                    </Text>
                    {pickup && (
                      <Text style={styles.locationText}>{pickup.name}</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.locationInputContainer,
                      activeInput === 'destination' && styles.activeLocationInput,
                      errors.destination && styles.errorInput
                    ]}
                    onPress={() => setActiveInput('destination')}
                  >
                    <Text style={[
                      styles.locationLabel,
                      destination && styles.locationLabelSmall
                    ]}>
                      Destination
                    </Text>
                    {destination && (
                      <Text style={styles.locationText}>{destination.name}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Show the actual LocationInput when active */}
              {activeInput === 'pickup' && (
                <View style={styles.activeInputOverlay}>
                  <LocationInput
                    label="Pickup Location"
                    placeholder="Enter your pickup location"
                    value={pickup}
                    onSelect={(location) => {
                      setPickup(location);
                      setActiveInput('destination');
                    }}
                    error={errors.pickup}
                  />
                  <TouchableOpacity 
                    style={styles.closeOverlayButton}
                    onPress={() => setActiveInput(null)}
                  >
                    <X size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              )}
              
              {activeInput === 'destination' && (
                <View style={styles.activeInputOverlay}>
                  <LocationInput
                    label="Destination"
                    placeholder="Enter your destination"
                    value={destination}
                    onSelect={(location) => {
                      setDestination(location);
                      setActiveInput(null);
                    }}
                    error={errors.destination}
                  />
                  <TouchableOpacity
                    style={styles.closeOverlayButton}
                    onPress={() => setActiveInput(null)}
                  >
                    <X size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            {/* Time Selection */}
            <View style={styles.timeSection}>
              <View style={styles.sectionHeader}>
                <Clock size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>When do you want to leave?</Text>
              </View>
              
              <View style={styles.timeOptions}>
                {renderTimeOption("30 min", 0.5)}
                {renderTimeOption("1 hour", 1)}
                {renderTimeOption("2 hours", 2)}
                {renderTimeOption("Custom", -1)}
              </View>
              
              <View style={styles.selectedTimeContainer}>
                <Text style={styles.selectedTimeLabel}>Your ride will be at</Text>
                <Text style={styles.selectedTimeText}>
                  {formatTime(preferredTime.toISOString())}
                </Text>
              </View>
            </View>
            
            {/* Interest Selection */}
            <View style={styles.interestsSection}>
              <TouchableOpacity 
                style={styles.interestCollapsible}
                onPress={() => {
                  // You can implement a collapsible behavior here if needed
                }}
              >
                <View style={styles.sectionHeaderCompact}>
                  <User size={16} color={colors.primary} />
                  <Text style={styles.sectionTitleCompact}>Match with similar interests</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.interestsScrollContainer}
              >
                <InterestList
                  selectedInterests={selectedInterests}
                  onSelectInterest={toggleInterest}
                />
              </ScrollView>
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity
              style={styles.findPoolButton}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={styles.findPoolButtonText}>Find Pool</Text>
                  <View style={styles.findPoolButtonIcon}>
                    <Search size={18} color="white" />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </Card>
        </Animated.View>
        
        {/* How it works section */}
        <Animated.View style={[
          styles.infoSectionContainer,
          {
            opacity: formAnimation,
            transform: [{ 
              translateY: formAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [80, 0]
              })
            }]
          }
        ]}>
          <Card variant="elevated" style={styles.infoSection}>
            <Text style={styles.infoTitle}>How it works</Text>
            
            <View style={styles.infoStep}>
              <View style={styles.infoStepIconContainer}>
                <View style={styles.infoStepIcon}>
                  <MapPin size={20} color="white" />
                </View>
              </View>
              <View style={styles.infoStepContent}>
                <Text style={styles.infoStepTitle}>Set your route</Text>
                <Text style={styles.infoStepDescription}>
                  Enter your pickup location and destination to find the perfect match
                </Text>
              </View>
            </View>
            
            <View style={styles.infoStepConnector} />
            
            <View style={styles.infoStep}>
              <View style={styles.infoStepIconContainer}>
                <View style={[styles.infoStepIcon, styles.infoStepIconSecond]}>
                  <Clock size={20} color="white" />
                </View>
              </View>
              <View style={styles.infoStepContent}>
                <Text style={styles.infoStepTitle}>Choose your time</Text>
                <Text style={styles.infoStepDescription}>
                  Set when you'd like to leave, we'll find rides near your preferred time
                </Text>
              </View>
            </View>
            
            <View style={styles.infoStepConnector} />
            
            <View style={styles.infoStep}>
              <View style={styles.infoStepIconContainer}>
                <View style={[styles.infoStepIcon, styles.infoStepIconThird]}>
                  <Star size={20} color="white" />
                </View>
              </View>
              <View style={styles.infoStepContent}>
                <Text style={styles.infoStepTitle}>Enjoy your journey</Text>
                <Text style={styles.infoStepDescription}>
                  Connect with your ride, share the journey, and save money while you're at it
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>
        
        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  headerCompactTitle: {
    color: 'white',
    fontSize: 22,
    fontFamily: fonts.semiBold,
  },
  headerTitle: {
    fontSize: 35,
    fontFamily: fonts.bold,
    color: 'white',
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingTop: HEADER_HEIGHT - 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  formContainer: {
    marginBottom: 20,
  },
  formCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  routeSection: {
    marginBottom: 24,
    position: 'relative',
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginLeft: 10,
  },
  routeContainer: {
    flexDirection: 'row',
    position: 'relative',
  },
  routeLine: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 4,
    paddingVertical: 8,
    justifyContent: 'space-between',
    height: 120,
  },
  routePointStart: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeLineConnector: {
    width: 2,
    backgroundColor: '#CCCCCC',
    flex: 1,
    marginVertical: 4,
    alignSelf: 'center',
  },
  routePointEnd: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  routeInputs: {
    flex: 1,
  },
  locationInputContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  activeLocationInput: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  errorInput: {
    borderColor: '#FF5252',
  },
  locationLabel: {
    fontSize: 16,
    color: '#757575',
    fontFamily: fonts.medium,
  },
  locationLabelSmall: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.medium,
  },
  activeInputOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  closeOverlayButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSection: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 24,
  },
  timeOptions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  selectedTimeOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: colors.primary,
  },
  timeOptionText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: fonts.medium,
  },
  selectedTimeOptionText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  selectedTimeContainer: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedTimeLabel: {
    fontSize: 14,
    color: '#757575',
    fontFamily: fonts.regular,
    marginBottom: 8,
  },
  selectedTimeText: {
    fontSize: 22,
    color: colors.text,
    fontFamily: fonts.bold,
  },
  interestsSection: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  interestCollapsible: {
    paddingVertical: 8,
  },
  sectionHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleCompact: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.text,
    flex: 1,
    marginLeft: 10,
  },
  interestsScrollContainer: {
    paddingBottom: 8,
  },
  interestGridHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  interestChipCompact: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  selectedChipCompact: {
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
  },
  interestTextCompact: {
    fontSize: 13,
    color: '#757575',
    fontFamily: fonts.medium,
  },
  selectedTextCompact: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  findPoolButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  findPoolButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginRight: 12,
  },
  findPoolButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSectionContainer: {
    marginBottom: 16,
  },
  infoSection: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 20,
  },
  infoStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoStepIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  infoStepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoStepIconSecond: {
    backgroundColor: '#3F51B5',
  },
  infoStepIconThird: {
    backgroundColor: '#FF9800',
  },
  infoStepConnector: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginLeft: 19,
    marginBottom: 16,
  },
  infoStepContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoStepTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 6,
  },
  infoStepDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  sectionTitleLarge: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 16,
    paddingLeft: 12,
  },
});