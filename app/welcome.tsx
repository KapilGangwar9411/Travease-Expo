import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { fonts } from '@/constants/fonts';
import StyledText from '@/components/StyledText';

export default function WelcomeScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Green gradient background */}
      <View style={styles.backgroundContainer}>
        <View style={styles.greenBackground} />
        <View style={styles.curvedBottom} />
      </View>
      
      {/* Phone mockup with map */}
      <View style={styles.phoneContainer}>
        <View style={styles.mapContainer}>
          <Image 
            source={require('@/assets/images/map.png')}
            style={styles.mapImage}
            resizeMode="cover"
          />
          
          {/* Live location user indicator */}
          <View style={styles.userLocationIndicator}>
            <View style={styles.userLocationDot}>
              <View style={styles.userLocationInnerDot} />
            </View>
            <View style={styles.userLocationRing} />
          </View>
          
          {/* Map labels - adjusted for the new map */}
          <Text style={[styles.mapLabel, { top: '25%', right: '30%' }]}>NIET Road</Text>
          <Text style={[styles.parkLabel, { bottom: '45%', left: '15%' }]}>Crossing Park</Text>
          
          {/* Map location PIN - adjusted position */}
          <View style={[styles.mapPin, { top: '30%', right: '40%' }]}>
            <View style={styles.pinOuter}>
              <View style={styles.pinInner} />
            </View>
            <View style={styles.pinTail} />
          </View>
          
          {/* Route distance indicator */}
          <View style={styles.routeDistanceContainer}>
            <Text style={styles.routeDistance}>3.5 km</Text>
            <Text style={styles.routeTime}>12 min</Text>
          </View>
          
          {/* Current location button */}
          <View style={styles.currentLocationButton}>
            <View style={styles.currentLocationIcon} />
          </View>
        </View>
      </View>
      
      {/* Content */}
      <View style={styles.contentContainer}>
        <StyledText weight="bold" style={styles.appTitle}>
          Travease - Your hassle-free
        </StyledText>
        <StyledText weight="bold" style={styles.appTitleSecondLine}>
          ride-sharing solution
        </StyledText>
        
        <StyledText weight="regular" style={styles.appDescription}>
          Get ready to experience hassle-free transportation. We've got everything you need to travel with ease. Let's get started!
        </StyledText>
        
        <View style={styles.paginationContainer}>
          <View style={[styles.paginationDot, styles.activeDot]} />
          <View style={styles.paginationDot} />
          <View style={styles.paginationDot} />
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => router.push('/login')}
          >
            <StyledText weight="semiBold" style={styles.skipButtonText}>Skip</StyledText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => router.push('/login')}
          >
            <StyledText weight="semiBold" style={styles.continueButtonText}>Continue</StyledText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  greenBackground: {
    backgroundColor: '#4CAF50',
    height: '50%',
    width: '100%',
  },
  curvedBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '55%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  phoneContainer: {
    width: '85%',
    height: '50%',
    alignSelf: 'center',
    marginTop: 40,
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 0,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  phoneHeader: {
    display: 'none',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  userLocationIndicator: {
    position: 'absolute',
    bottom: '25%',
    left: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  userLocationInnerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  userLocationRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    zIndex: 2,
  },
  mapLabel: {
    position: 'absolute',
    top: '35%',
    right: '20%',
    color: '#3F51B5',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  parkLabel: {
    position: 'absolute',
    bottom: '20%',
    left: '30%',
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.medium,
  },
  mapPin: {
    position: 'absolute',
    top: '40%',
    right: '25%',
    alignItems: 'center',
  },
  pinOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'red',
    transform: [{ rotate: '180deg' }],
  },
  routeDistanceContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  routeDistance: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    fontFamily: fonts.semiBold,
  },
  routeTime: {
    fontSize: 10,
    color: '#666',
    fontFamily: fonts.regular,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  currentLocationIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#4285F4',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    zIndex: 1,
  },
  appTitle: {
    fontSize: 26,
    color: '#333',
    textAlign: 'center',
    lineHeight: 34,
  },
  appTitleSecondLine: {
    fontSize: 26,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  appDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    width: '40%',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  continueButton: {
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    width: '40%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
  },
}); 