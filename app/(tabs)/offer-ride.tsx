import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  TextInput,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { 
  Car, 
  Clock, 
  Users,
  Calendar,
  Info,
  AlertCircle,
  Navigation,
  Flag,
  ChevronRight,
  Palette,
  FileText,
  FileCheck,
  Upload,
  X
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuthStore } from '@/store/auth-store';
import { useRideStore } from '@/store/ride-store';
import { Location, VehicleInfo as BaseVehicleInfo } from '@/types';
import { formatTime } from '@/utils/date-utils';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import LocationInput from '@/components/LocationInput';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 180 : 160;

// Extend the VehicleInfo type to include licenseUrl
interface VehicleInfo extends BaseVehicleInfo {
  licenseUrl?: string;
}

export default function OfferRideScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { offerRide, isLoading } = useRideStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const [pickup, setPickup] = useState<Location | undefined>();
  const [destination, setDestination] = useState<Location | undefined>();
  const [departureTime, setDepartureTime] = useState<Date>(new Date(Date.now() + 3600000)); // 1 hour from now
  const [vehicleInfo, setVehicleInfo] = useState<Partial<VehicleInfo>>(
    user?.vehicleInfo || {
      model: '',
      color: '',
      licensePlate: '',
      seats: 4,
      licenseUrl: undefined
    }
  );
  const [availableSeats, setAvailableSeats] = useState(3);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeInput, setActiveInput] = useState<'pickup' | 'destination' | null>(null);
  const [errors, setErrors] = useState<{
    pickup?: string;
    destination?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    licensePlate?: string;
    licenseImage?: string;
  }>({});
  const [licenseImage, setLicenseImage] = useState<string | undefined>(
    user?.vehicleInfo?.licenseUrl
  );
  
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
    setDepartureTime(newTime);
  };
  
  const updateVehicleInfo = (field: keyof VehicleInfo, value: any) => {
    setVehicleInfo({
      ...vehicleInfo,
      [field]: value
    });
  };
  
  const validateForm = () => {
    const newErrors: {
      pickup?: string;
      destination?: string;
      vehicleModel?: string;
      vehicleColor?: string;
      licensePlate?: string;
    } = {};
    
    if (!pickup) {
      newErrors.pickup = 'Please select a pickup location';
    }
    
    if (!destination) {
      newErrors.destination = 'Please select a destination';
    }
    
    if (!vehicleInfo.model) {
      newErrors.vehicleModel = 'Please enter your vehicle model';
    }
    
    if (!vehicleInfo.color) {
      newErrors.vehicleColor = 'Please enter your vehicle color';
    }
    
    if (!vehicleInfo.licensePlate) {
      newErrors.licensePlate = 'Please enter your license plate number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm() || !user) return;
    
    try {
      // Update user's vehicle info
      if (user.vehicleInfo?.model !== vehicleInfo.model ||
          user.vehicleInfo?.color !== vehicleInfo.color ||
          user.vehicleInfo?.licensePlate !== vehicleInfo.licensePlate ||
          user.vehicleInfo?.licenseUrl !== licenseImage ||
          user.vehicleInfo?.seats !== vehicleInfo.seats) {
        updateUser({
          vehicleInfo: {
            ...vehicleInfo,
            licenseUrl: licenseImage,
          } as VehicleInfo,
          userType: 'driver'
        });
      }
      
      const ride = await offerRide(
        user.id,
        pickup!,
        destination!,
        departureTime.toISOString(),
        vehicleInfo as VehicleInfo,
        availableSeats
      );
      
      router.push(`/offered-ride/${ride.id}` as any);
    } catch (error) {
      console.error('Error offering ride:', error);
    }
  };

  // Request permissions for image picker
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to upload your license!');
        }
      }
    })();
  }, []);
  
  // Handle picking an image from the gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLicenseImage(result.assets[0].uri);
        // Update vehicle info with the new license URL
        updateVehicleInfo('licenseUrl', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to select image. Please try again.');
    }
  };

  // UI helpers
  const renderTimeOption = (label: string, hours: number) => {
    const isSelected = Math.abs(
      (departureTime.getTime() - Date.now()) / 3600000 - hours
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
          <SafeAreaView edges={['top']}>
            <View style={styles.headerCompactInner}>
              <Text style={styles.headerCompactTitle}>Offer Ride</Text>
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
              <Text style={styles.headerTitle}>Share Your Ride</Text>
              <Text style={styles.headerSubtitle}>Help others & earn points while traveling</Text>
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
                </View>
              )}
            </View>
            
            {/* Time Selection */}
            <View style={styles.timeSection}>
              <View style={styles.sectionHeader}>
                <Clock size={20} color="#3F51B5" />
                <Text style={styles.sectionTitle}>When are you leaving?</Text>
              </View>
              
              <View style={styles.timeOptions}>
                {renderTimeOption("30 min", 0.5)}
                {renderTimeOption("1 hour", 1)}
                {renderTimeOption("2 hours", 2)}
                {renderTimeOption("Custom", -1)}
              </View>
              
              <View style={styles.selectedTimeContainer}>
                <Text style={styles.selectedTimeLabel}>Your ride will start at</Text>
                <Text style={styles.selectedTimeText}>
                  {formatTime(departureTime.toISOString())}
                </Text>
              </View>
            </View>

            {/* Vehicle Information */}
            <View style={styles.vehicleSection}>
              <View style={styles.sectionHeader}>
                <Car size={20} color="#3F51B5" />
                <Text style={styles.sectionTitle}>Vehicle Information</Text>
              </View>
              
              <View style={styles.vehicleCardContainer}>
                <View style={styles.vehicleCard}>
                  <View style={styles.vehicleIconContainer}>
                    <View style={styles.vehicleIcon}>
                      <Car size={24} color="#3F51B5" />
                    </View>
                  </View>
                  <View style={styles.vehicleInputGroup}>
                    <Text style={styles.vehicleInputLabel}>Vehicle Model</Text>
                    <TextInput
                      style={[
                        styles.vehicleInputField,
                        errors.vehicleModel && styles.inputError
                      ]}
                      placeholder="e.g. Honda Civic"
                      placeholderTextColor="#9E9E9E"
                      value={vehicleInfo.model}
                      onChangeText={(text) => updateVehicleInfo('model', text)}
                    />
                    {errors.vehicleModel && (
                      <Text style={styles.errorText}>{errors.vehicleModel}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.vehicleCard}>
                  <View style={styles.vehicleIconContainer}>
                    <View style={[styles.vehicleIcon, { backgroundColor: 'rgba(233, 30, 99, 0.1)' }]}>
                      <Palette size={24} color="#E91E63" />
                    </View>
                  </View>
                  <View style={styles.vehicleInputGroup}>
                    <Text style={styles.vehicleInputLabel}>Vehicle Color</Text>
                    <TextInput
                      style={[
                        styles.vehicleInputField,
                        errors.vehicleColor && styles.inputError
                      ]}
                      placeholder="e.g. Silver"
                      placeholderTextColor="#9E9E9E"
                      value={vehicleInfo.color}
                      onChangeText={(text) => updateVehicleInfo('color', text)}
                    />
                    {errors.vehicleColor && (
                      <Text style={styles.errorText}>{errors.vehicleColor}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.vehicleCard}>
                  <View style={styles.vehicleIconContainer}>
                    <View style={[styles.vehicleIcon, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                      <FileText size={24} color="#FF9800" />
                    </View>
                  </View>
                  <View style={styles.vehicleInputGroup}>
                    <Text style={styles.vehicleInputLabel}>License Plate</Text>
                    <TextInput
                      style={[
                        styles.vehicleInputField,
                        errors.licensePlate && styles.inputError
                      ]}
                      placeholder="e.g. DL01AB1234"
                      placeholderTextColor="#9E9E9E"
                      value={vehicleInfo.licensePlate}
                      onChangeText={(text) => updateVehicleInfo('licensePlate', text)}
                      autoCapitalize="characters"
                    />
                    {errors.licensePlate && (
                      <Text style={styles.errorText}>{errors.licensePlate}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.vehicleCard}>
                  <View style={styles.vehicleIconContainer}>
                    <View style={[styles.vehicleIcon, { backgroundColor: 'rgba(0, 150, 136, 0.1)' }]}>
                      <FileCheck size={24} color="#009688" />
                    </View>
                  </View>
                  <View style={styles.vehicleInputGroup}>
                    <Text style={styles.vehicleInputLabel}>Driving License</Text>
                    
                    {licenseImage ? (
                      <View style={styles.licensePreviewContainer}>
                        <Image 
                          source={{ uri: licenseImage }} 
                          style={styles.licensePreview} 
                          resizeMode="cover"
                        />
                        <TouchableOpacity 
                          style={styles.licenseRemoveButton}
                          onPress={() => setLicenseImage(undefined)}
                        >
                          <X size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.licenseUploadContainer}>
                        <TouchableOpacity 
                          style={styles.licenseUploadButton}
                          onPress={pickImage}
                        >
                          <Upload size={20} color="#009688" />
                          <Text style={styles.licenseUploadText}>Upload License</Text>
                        </TouchableOpacity>
                        <Text style={styles.licenseHelperText}>Tap to upload your driving license</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Seats Selection */}
            <View style={styles.seatsSection}>
              <View style={styles.sectionHeader}>
                <Users size={20} color="#3F51B5" />
                <Text style={styles.sectionTitle}>Available Seats</Text>
              </View>
              
              <View style={styles.seatsContainer}>
                {[1, 2, 3, 4].map((seat) => (
                  <TouchableOpacity
                    key={seat}
                    style={[
                      styles.seatOption,
                      availableSeats === seat && styles.selectedSeatOption
                    ]}
                    onPress={() => setAvailableSeats(seat)}
                  >
                    <Text style={[
                      styles.seatOptionText,
                      availableSeats === seat && styles.selectedSeatOptionText
                    ]}>{seat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <AlertCircle size={20} color="#3F51B5" />
              <Text style={styles.infoText}>
                By offering a ride, you agree to our terms and conditions. You are responsible for ensuring your vehicle is in good condition and you have a valid driver's license.
              </Text>
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity
              style={styles.offerRideButton}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={styles.offerRideButtonText}>Offer Ride</Text>
                  <View style={styles.offerRideButtonIcon}>
                    <Car size={18} color="white" />
                  </View>
                </>
              )}
            </TouchableOpacity>
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
    borderColor: '#3F51B5',
    backgroundColor: 'rgba(63, 81, 181, 0.05)',
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
  sectionTitleLarge: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 16,
    paddingLeft: 12,
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
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    borderColor: '#3F51B5',
  },
  timeOptionText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: fonts.medium,
  },
  selectedTimeOptionText: {
    color: '#3F51B5',
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
  vehicleSection: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 24,
  },
  vehicleCardContainer: {
    marginTop: 8,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleIconContainer: {
    marginRight: 16,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInputGroup: {
    flex: 1,
  },
  vehicleInputLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#757575',
    marginBottom: 6,
  },
  vehicleInputField: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  inputError: {
    borderBottomColor: '#F44336',
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#F44336',
    marginTop: 4,
  },
  seatsSection: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 24,
  },
  seatsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  seatOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'white',
  },
  selectedSeatOption: {
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    borderColor: '#3F51B5',
  },
  seatOptionText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.medium,
  },
  selectedSeatOptionText: {
    color: '#3F51B5',
    fontFamily: fonts.semiBold,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 81, 181, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#555',
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  offerRideButton: {
    backgroundColor: '#3F51B5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3F51B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  offerRideButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginRight: 12,
  },
  offerRideButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  licenseUploadContainer: {
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  licenseUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 150, 136, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  licenseUploadText: {
    marginLeft: 8,
    color: '#009688',
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  licenseHelperText: {
    marginTop: 8,
    color: '#757575',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  licensePreviewContainer: {
    marginTop: 8,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  licensePreview: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  licenseRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});