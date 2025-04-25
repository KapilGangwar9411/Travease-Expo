import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, Upload, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuthStore } from '@/store/auth-store';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import StyledText from '@/components/StyledText';
import { userService } from './services';

// Define the extended user type for the profile
interface ExtendedUserInfo {
  phoneNumber?: string;
  bio?: string;
  location?: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.photoURL || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Load extended profile data if available
  useEffect(() => {
    const loadExtendedProfileData = async () => {
      try {
        if (user?.id) {
          const jsonValue = await AsyncStorage.getItem(`extendedUserInfo_${user.id}`);
          if (jsonValue != null) {
            const extendedInfo: ExtendedUserInfo = JSON.parse(jsonValue);
            setPhoneNumber(extendedInfo.phoneNumber || '');
            setBio(extendedInfo.bio || '');
            setLocation(extendedInfo.location || '');
          }
        }
      } catch (error) {
        console.error('Error loading extended profile data:', error);
      }
    };

    loadExtendedProfileData();
    
    // Request permission for image picker
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access camera roll is required for changing profile photo.');
      }
    })();
  }, [user?.id]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', phone: '' };

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (phoneNumber && !/^\d{10}$/.test(phoneNumber.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setProfileImage(selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickImageFromCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access camera is required for taking a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setProfileImage(selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      let updatedPhotoURL = user?.photoURL;
      
      // Handle profile image upload if changed
      if (profileImage && profileImage !== user?.photoURL) {
        try {
          // Upload to backend API & Firebase Storage
          const result = await userService.uploadProfilePicture(profileImage);
          updatedPhotoURL = result.profileImage;
        } catch (error) {
          console.error('Error uploading profile image:', error);
          // Continue with other updates even if image upload fails
        }
      }
      
      // Update the core User fields including profile image
      await updateUser({
        name,
        email,
        photoURL: updatedPhotoURL
      });

      // Store the extended profile info in AsyncStorage
      if (user?.id) {
        const extendedInfo: ExtendedUserInfo = {
          phoneNumber,
          bio,
          location
        };
        
        await AsyncStorage.setItem(
          `extendedUserInfo_${user.id}`, 
          JSON.stringify(extendedInfo)
        );
      }

      // Success notification
      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeProfilePhoto = () => {
    Alert.alert(
      'Change Profile Photo',
      'How would you like to set your profile photo?',
      [
        {
          text: 'Take Photo',
          onPress: pickImageFromCamera
        },
        {
          text: 'Choose from Gallery',
          onPress: pickImageFromGallery
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Check size={22} color={colors.primary} />
              )}
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <StyledText weight="bold" style={styles.headerTitle}>
              Edit Profile
            </StyledText>
          ),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background
          }
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 64}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <View style={styles.avatarContainer}>
              <Avatar
                source={profileImage || user?.photoURL}
                name={user?.name || ''}
                size="large"
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleChangeProfilePhoto}
              >
                <Camera size={20} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleChangeProfilePhoto}>
              <StyledText weight="semiBold" style={styles.changePhotoText}>
                Change Profile Photo
              </StyledText>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <StyledText weight="medium" style={styles.label}>
                Full Name
              </StyledText>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#9E9E9E"
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <StyledText weight="medium" style={styles.label}>
                Email
              </StyledText>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9E9E9E"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <StyledText weight="medium" style={styles.label}>
                Phone Number
              </StyledText>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                placeholderTextColor="#9E9E9E"
                keyboardType="phone-pad"
              />
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <StyledText weight="medium" style={styles.label}>
                Location
              </StyledText>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="City, State"
                placeholderTextColor="#9E9E9E"
              />
            </View>

            <View style={styles.inputGroup}>
              <StyledText weight="medium" style={styles.label}>
                Bio
              </StyledText>
              <TextInput
                style={styles.textArea}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#9E9E9E"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Save Button for bottom of screen */}
          <Button
            title="Save Profile"
            onPress={handleUpdateProfile}
            variant="primary"
            style={styles.saveProfileButton}
            loading={isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 4,
  },
  saveButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.text,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  changePhotoText: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 8,
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    fontFamily: fonts.regular,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
    backgroundColor: 'white',
  },
  saveProfileButton: {
    marginTop: 12,
  },
}); 