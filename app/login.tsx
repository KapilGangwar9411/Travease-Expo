import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput,
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { fonts } from '@/constants/fonts';
import { useAuthStore } from '@/store/auth-store';
import StyledText from '@/components/StyledText';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(false);
  
  useEffect(() => {
    setIsValid(phoneNumber.length === 10 && /^\d+$/.test(phoneNumber));
  }, [phoneNumber]);
  
  const handleSendOTP = async () => {
    // For development: Allow login even with empty/invalid phone
    // In production, you would use: if (!isValid) return;
    
    try {
      // Always use Kapil's account for testing - no validation needed
      await login('kurmikapil154@gmail.com', 'password123');
      
      // Immediately navigate to home screen
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{ 
          headerShown: false
        }} 
      />
      
      {/* Green Header */}
      <View style={styles.headerContainer}>
        <View style={styles.greenHeader}>
          <View style={styles.welcomeContainer}>
            <StyledText weight="bold" style={styles.welcomeText}>Welcome Back</StyledText>
          </View>
        </View>
        
        {/* Curved white section */}
        <View style={styles.curvedBottom} />
      </View>
      
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Phone Number Input */}
        <View style={styles.inputSection}>
          <StyledText weight="medium" style={styles.inputLabel}>Phone Number</StyledText>
          
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCode}>
              <StyledText weight="medium" style={styles.countryCodeText}>+91</StyledText>
            </View>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.phoneInput}
              keyboardType="number-pad"
              placeholder="Enter your mobile number"
              maxLength={10}
            />
            <View style={[styles.checkIconContainer, !isValid && phoneNumber.length > 0 ? styles.errorIcon : (isValid ? styles.successIcon : styles.neutralIcon)]}>
              {phoneNumber.length > 0 ? (
                isValid ? (
                  <Check size={14} color="white" />
                ) : (
                  <X size={14} color="white" />
                )
              ) : null}
            </View>
          </View>
          
          <View style={[styles.underline, !isValid && phoneNumber.length > 0 ? styles.errorUnderline : (isValid ? styles.successUnderline : styles.neutralUnderline)]} />
        </View>
        
        {/* OTP Button */}
        <TouchableOpacity 
          style={[styles.otpButton, !isValid && styles.disabledButton]}
          onPress={handleSendOTP}
          disabled={!isValid || isLoading}
        >
          <StyledText weight="semiBold" style={styles.otpButtonText}>SEND OTP</StyledText>
        </TouchableOpacity>
        
        {/* Footer */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  greenHeader: {
    backgroundColor: '#4CAF50',
    height: '25%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 40,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  curvedBottom: {
    position: 'absolute',
    top: '22%',
    width: '100%',
    height: '78%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: '50%',
    zIndex: 1,
  },
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 20,
    color: '#666',
    marginBottom: 10,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 18,
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    fontFamily: fonts.medium,
    paddingVertical: 8,
  },
  checkIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  neutralIcon: {
    backgroundColor: 'transparent',
  },
  successIcon: {
    backgroundColor: '#4CAF50',
  },
  errorIcon: {
    backgroundColor: '#F44336',
  },
  underline: {
    height: 2,
    marginTop: 4,
  },
  neutralUnderline: {
    backgroundColor: '#E0E0E0',
  },
  successUnderline: {
    backgroundColor: '#4CAF50',
  },
  errorUnderline: {
    backgroundColor: '#F44336',
  },
  otpButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
    opacity: 0.7,
  },
  otpButtonText: {
    color: 'white',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 24,
    left: 0,
    right: 0,
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