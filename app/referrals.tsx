import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  Users, 
  Copy, 
  Share2, 
  Gift, 
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Award,
  UserPlus
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useWalletStore } from '@/store/wallet-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import StyledText from '@/components/StyledText';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 180 : 160;

export default function ReferralsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { addTransaction } = useWalletStore();
  
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
  
  const handleCopyReferralCode = () => {
    if (!user) return;
    
    // In a real app, we would use Clipboard.setString
    Alert.alert(
      'Copied!',
      `Referral code ${user.referralCode} copied to clipboard.`,
      [{ text: 'OK' }]
    );
  };
  
  const handleShareReferralCode = async () => {
    if (!user) return;
    
    try {
      // In a real app, we would use Share.share
      Alert.alert(
        'Share',
        'Sharing referral code...',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleApplyReferralCode = () => {
    if (!user) return;
    
    if (!referralCode) {
      setError('Please enter a referral code');
      return;
    }
    
    if (referralCode === user.referralCode) {
      setError("You can't use your own referral code");
      return;
    }
    
    if (user.referredBy) {
      setError('You have already used a referral code');
      return;
    }
    
    // Check if referral code exists (mock implementation)
    const isValidCode = referralCode.length >= 6;
    
    if (!isValidCode) {
      setError('Invalid referral code');
      return;
    }
    
    // Update user with referral code
    updateUser({
      referredBy: referralCode
    });
    
    // Add points to user
    addTransaction(
      user.id,
      2000,
      'referral',
      `Referral bonus: Used code ${referralCode}`
    );
    
    setSuccess('Referral code applied successfully! You earned 2000 points.');
    setReferralCode('');
    setError('');
  };
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContainer}>
          <StyledText weight="semiBold" style={styles.title}>Please Login</StyledText>
          <Button
            title="Login"
            onPress={() => router.push('/login')}
            variant="primary"
            style={styles.loginButton}
          />
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
          colors={['#4A80F0', '#7F5DF1']}
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
                <UserPlus size={22} color="white" />
                <StyledText weight="semiBold" style={styles.headerCompactTitle}>
                  Referrals
                </StyledText>
              </View>
              <View style={{ width: 40 }} />
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
              
              <StyledText weight="bold" style={styles.headerTitle}>Referrals</StyledText>
              <StyledText weight="medium" style={styles.headerSubtitle}>
                Invite friends & earn rewards together
              </StyledText>
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
        {/* Reward Banner */}
        <View style={styles.rewardBanner}>
          <View style={styles.rewardTextContainer}>
            <StyledText weight="bold" style={styles.rewardAmount}>₹2000</StyledText>
            <StyledText weight="medium" style={styles.rewardText}>for each friend you invite</StyledText>
          </View>
          <Gift size={48} color="white" />
        </View>
        
        {/* Referral Code Card */}
        <Card variant="elevated" style={styles.referralCard}>
          <View style={styles.referralCardHeader}>
            <StyledText weight="semiBold" style={styles.cardTitle}>Your Referral Code</StyledText>
            <Award size={24} color={colors.primary} />
          </View>
          
          <View style={styles.codeBox}>
            <StyledText weight="bold" style={styles.codeText}>{user.referralCode}</StyledText>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={handleCopyReferralCode}
            >
              <Copy size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <StyledText weight="regular" style={styles.codeDescription}>
            Share this code with friends and you both get ₹2000 when they sign up!
          </StyledText>
          
          <Button
            title="Share With Friends"
            onPress={handleShareReferralCode}
            variant="primary"
            icon={<Share2 size={18} color="white" />}
            style={styles.shareButton}
          />
        </Card>
        
        {/* Apply Referral Code Card */}
        <Card variant="elevated" style={styles.applyCard}>
          <StyledText weight="semiBold" style={styles.cardTitle}>Have a Referral Code?</StyledText>
          
          {user.referredBy ? (
            <View style={styles.alreadyAppliedContainer}>
              <CheckCircle size={24} color={colors.success} />
              <View style={styles.alreadyAppliedTextContainer}>
                <StyledText weight="semiBold" style={styles.alreadyAppliedTitle}>
                  Code Applied Successfully
                </StyledText>
                <StyledText weight="regular" style={styles.alreadyAppliedText}>
                  You've used the code: {user.referredBy}
                </StyledText>
              </View>
            </View>
          ) : (
            <>
              <Input
                placeholder="Enter referral code"
                value={referralCode}
                onChangeText={(text) => {
                  setReferralCode(text);
                  setError('');
                  setSuccess('');
                }}
                style={styles.referralInput}
              />
              
              {error ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color={colors.danger} />
                  <StyledText weight="medium" style={styles.errorText}>{error}</StyledText>
                </View>
              ) : null}
              
              {success ? (
                <View style={styles.successContainer}>
                  <CheckCircle size={16} color={colors.success} />
                  <StyledText weight="medium" style={styles.successText}>{success}</StyledText>
                </View>
              ) : null}
              
              <Button
                title="Apply Code"
                onPress={handleApplyReferralCode}
                variant="primary"
                style={styles.applyButton}
              />
            </>
          )}
        </Card>
        
        {/* How It Works Card */}
        <Card variant="elevated" style={styles.howItWorksCard}>
          <StyledText weight="semiBold" style={styles.cardTitle}>How It Works</StyledText>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumberContainer}>
              <StyledText weight="bold" style={styles.stepNumberText}>1</StyledText>
            </View>
            <View style={styles.stepContent}>
              <StyledText weight="semiBold" style={styles.stepTitle}>Share Your Code</StyledText>
              <StyledText weight="regular" style={styles.stepDescription}>
                Share your unique referral code with friends and family
              </StyledText>
            </View>
          </View>
          
          <View style={styles.stepDivider} />
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepNumberContainer, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
              <StyledText weight="bold" style={[styles.stepNumberText, { color: '#4CAF50' }]}>2</StyledText>
            </View>
            <View style={styles.stepContent}>
              <StyledText weight="semiBold" style={styles.stepTitle}>They Sign Up</StyledText>
              <StyledText weight="regular" style={styles.stepDescription}>
                When they sign up using your code, they get ₹2000 points
              </StyledText>
            </View>
          </View>
          
          <View style={styles.stepDivider} />
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepNumberContainer, { backgroundColor: 'rgba(233, 30, 99, 0.15)' }]}>
              <StyledText weight="bold" style={[styles.stepNumberText, { color: '#E91E63' }]}>3</StyledText>
            </View>
            <View style={styles.stepContent}>
              <StyledText weight="semiBold" style={styles.stepTitle}>You Get Rewarded</StyledText>
              <StyledText weight="regular" style={styles.stepDescription}>
                You also get ₹2000 points for each successful referral
              </StyledText>
            </View>
          </View>
        </Card>
        
        <View style={styles.bottomSpace} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 16,
  },
  loginButton: {
    width: 200,
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
  scrollView: {
    flex: 1,
    paddingTop: HEADER_HEIGHT - 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  rewardBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rewardTextContainer: {
    flex: 1,
  },
  rewardAmount: {
    fontSize: 28,
    color: 'white',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  referralCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  referralCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    color: colors.text,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 22,
    color: 'white',
    letterSpacing: 1,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  shareButton: {
    width: '100%',
  },
  applyCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  referralInput: {
    marginTop: 12,
    marginBottom: 8,
  },
  alreadyAppliedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  alreadyAppliedTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  alreadyAppliedTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  alreadyAppliedText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.danger,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  successText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.success,
  },
  applyButton: {
    marginTop: 8,
  },
  howItWorksCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  stepNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 128, 240, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    color: colors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stepDivider: {
    height: 24,
    width: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 18,
  },
  bottomSpace: {
    height: 40,
  }
});