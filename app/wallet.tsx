import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  TextInput,
  Animated,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  Wallet as WalletIcon, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Plus,
  Car,
  Users,
  Gift,
  ChevronRight,
  CreditCard,
  X,
  Check,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuthStore } from '@/store/auth-store';
import { useWalletStore } from '@/store/wallet-store';
import { formatDateTime } from '@/utils/date-utils';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StyledText from '@/components/StyledText';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 180 : 160;

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    transactions, 
    addTransaction, 
    requestWithdrawal, 
    getUserTransactions, 
    getUserBalance, 
    isLoading 
  } = useWalletStore();
  
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [error, setError] = useState('');
  const [upiIdValid, setUpiIdValid] = useState(false);
  const [amountValid, setAmountValid] = useState(false);
  
  const userTransactions = user ? getUserTransactions(user.id) : [];
  const userBalance = user ? getUserBalance(user.id) : 0;
  
  // Animation values
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const balanceScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp'
  });
  
  const balanceOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp'
  });
  
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
  
  // Add some mock transactions if none exist
  useEffect(() => {
    if (user && userTransactions.length === 0) {
      // Welcome bonus
      addTransaction(
        user.id,
        1000,
        'bonus',
        'Welcome bonus'
      );
      
      // Ride completion
      addTransaction(
        user.id,
        500,
        'ride',
        'Completed ride to India Gate'
      );
      
      // Referral bonus
      addTransaction(
        user.id,
        2000,
        'referral',
        'Referral bonus: Neha joined'
      );
    }
  }, [user]);
  
  // Validate UPI ID and Amount
  useEffect(() => {
    // Basic UPI validation - contains @ symbol
    setUpiIdValid(upiId.includes('@') && upiId.length > 3);
    
    // Amount validation
    const amount = parseInt(withdrawAmount);
    setAmountValid(!isNaN(amount) && amount >= 100 && amount <= userBalance);
  }, [upiId, withdrawAmount, userBalance]);
  
  const handleWithdraw = async () => {
    if (!user) return;
    
    const amount = parseInt(withdrawAmount);
    
    if (!upiIdValid) {
      setError('Please enter a valid UPI ID');
      return;
    }
    
    if (!amountValid) {
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
      } else if (amount < 100) {
        setError('Minimum withdrawal amount is ₹100');
      } else if (amount > userBalance) {
        setError('Insufficient balance');
      }
      return;
    }
    
    try {
      await requestWithdrawal(user.id, upiId, amount);
      
      Alert.alert(
        'Withdrawal Requested',
        'Your withdrawal request has been submitted and will be processed within 24 hours.',
        [{ text: 'OK' }]
      );
      
      setWithdrawAmount('');
      setShowWithdraw(false);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'ride':
        return <Car size={24} color="#4285F4" />;
      case 'referral':
        return <Users size={24} color="#9C27B0" />;
      case 'withdrawal':
        return <ArrowUp size={24} color="#F44336" />;
      case 'bonus':
        return <Gift size={24} color="#4CAF50" />;
      default:
        return <Clock size={24} color="#757575" />;
    }
  };
  
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'ride':
        return '#E3F2FD';
      case 'referral':
        return '#F3E5F5';
      case 'withdrawal':
        return '#FFEBEE';
      case 'bonus':
        return '#E8F5E9';
      default:
        return '#EEEEEE';
    }
  };

  const renderTransaction = (item: any, index: number) => (
    <Card 
      key={item.id || index}
      variant="default" 
      style={{
        ...styles.transactionCard,
        marginBottom: index === userTransactions.length - 1 ? 100 : 12
      }}
    >
      <View style={styles.transactionItem}>
        <View style={[
          styles.transactionIconContainer,
          { backgroundColor: getTransactionColor(item.type) }
        ]}>
          {getTransactionIcon(item.type)}
        </View>
        <View style={styles.transactionDetails}>
          <StyledText weight="medium" style={styles.transactionDescription}>
            {item.description}
          </StyledText>
          <StyledText weight="regular" style={styles.transactionDate}>
            {formatDateTime(item.createdAt)}
          </StyledText>
        </View>
        <StyledText weight="semiBold" style={[
          styles.transactionAmount,
          item.amount >= 0 ? styles.positiveAmount : styles.negativeAmount
        ]}>
          {item.amount >= 0 ? '+' : ''}{item.amount}
          <StyledText weight="medium" style={styles.pointsText}> pts</StyledText>
        </StyledText>
      </View>
    </Card>
  );
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ 
          headerShown: false 
        }} />
        <View style={styles.centerContainer}>
          <WalletIcon size={60} color="#BDBDBD" />
          <StyledText weight="semiBold" style={styles.loginTitle}>Please Login</StyledText>
          <StyledText weight="regular" style={styles.loginSubtitle}>
            You need to login to access your wallet
          </StyledText>
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
          colors={['#4A80F0', '#3867D6']}
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
                <WalletIcon size={24} color="white" />
                <StyledText weight="semiBold" style={styles.headerCompactTitle}>Wallet</StyledText>
              </View>
              <View style={styles.placeholderWidth} />
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
              <StyledText weight="bold" style={styles.headerTitle}>My Wallet</StyledText>
              <StyledText weight="medium" style={styles.headerSubtitle}>
                Manage your points and transactions
              </StyledText>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
      
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
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
          {/* Balance Card with Animation */}
          <Animated.View style={[
            styles.balanceCardContainer,
            {
              transform: [{ scale: balanceScale }],
              opacity: balanceOpacity
            }
          ]}>
            <Card variant="elevated" style={styles.balanceCard}>
              <LinearGradient
                colors={['#4A80F0', '#3867D6']}
                style={styles.balanceGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.balanceHeader}>
                  <StyledText weight="medium" style={styles.balanceLabel}>Total Balance</StyledText>
                  <CreditCard size={24} color="white" style={styles.balanceIcon} />
                </View>
                
                <View style={styles.balanceContent}>
                  <StyledText weight="bold" style={styles.balanceValue}>
                    {userBalance}
                    <StyledText weight="semiBold" style={styles.balanceUnit}> points</StyledText>
                  </StyledText>
                  <StyledText weight="medium" style={styles.balanceEquivalent}>
                    ≈ ₹{(userBalance / 1000).toFixed(2)}
                  </StyledText>
                </View>
                
                <View style={styles.balanceActions}>
                  <TouchableOpacity
                    style={styles.balanceActionButton}
                    onPress={() => setShowWithdraw(true)}
                  >
                    <View style={styles.actionButtonIcon}>
                      <ArrowUp size={18} color="#4A80F0" />
                    </View>
                    <StyledText weight="medium" style={styles.actionButtonText}>
                      Withdraw
                    </StyledText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.balanceActionButton}
                    onPress={() => router.push('/referrals')}
                  >
                    <View style={[styles.actionButtonIcon, styles.earnMoreIcon]}>
                      <Plus size={18} color="#4CAF50" />
                    </View>
                    <StyledText weight="medium" style={styles.actionButtonText}>
                      Earn More
                    </StyledText>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Card>
          </Animated.View>
          
          {/* Withdrawal Form */}
          {showWithdraw && (
            <Card variant="elevated" style={styles.withdrawCard}>
              <View style={styles.withdrawHeader}>
                <StyledText weight="semiBold" style={styles.withdrawTitle}>Withdraw Points</StyledText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowWithdraw(false);
                    setError('');
                  }}
                >
                  <X size={20} color="#757575" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.withdrawForm}>
                <View style={styles.inputContainer}>
                  <StyledText weight="medium" style={styles.inputLabel}>UPI ID</StyledText>
                  <View style={styles.textInputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. name@upi"
                      value={upiId}
                      onChangeText={setUpiId}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    {upiId.length > 0 && (
                      <View style={[
                        styles.validationIcon,
                        upiIdValid ? styles.validIcon : styles.invalidIcon
                      ]}>
                        {upiIdValid ? (
                          <Check size={16} color="white" />
                        ) : (
                          <X size={16} color="white" />
                        )}
                      </View>
                    )}
                  </View>
                  <View style={[
                    styles.inputUnderline,
                    upiIdValid ? styles.validUnderline : 
                    (upiId.length > 0 ? styles.invalidUnderline : styles.neutralUnderline)
                  ]} />
                </View>
                
                <View style={styles.inputContainer}>
                  <StyledText weight="medium" style={styles.inputLabel}>
                    Amount (in points)
                  </StyledText>
                  <View style={styles.textInputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Minimum 100 points"
                      value={withdrawAmount}
                      onChangeText={setWithdrawAmount}
                      keyboardType="numeric"
                    />
                    {withdrawAmount.length > 0 && (
                      <View style={[
                        styles.validationIcon,
                        amountValid ? styles.validIcon : styles.invalidIcon
                      ]}>
                        {amountValid ? (
                          <Check size={16} color="white" />
                        ) : (
                          <X size={16} color="white" />
                        )}
                      </View>
                    )}
                  </View>
                  <View style={[
                    styles.inputUnderline,
                    amountValid ? styles.validUnderline : 
                    (withdrawAmount.length > 0 ? styles.invalidUnderline : styles.neutralUnderline)
                  ]} />
                </View>
                
                {error ? (
                  <View style={styles.errorContainer}>
                    <AlertTriangle size={16} color="#F44336" />
                    <StyledText weight="medium" style={styles.errorText}>{error}</StyledText>
                  </View>
                ) : null}
                
                <View style={styles.infoContainer}>
                  <StyledText weight="medium" style={styles.infoText}>
                    1,000 points = ₹1
                  </StyledText>
                  <StyledText weight="regular" style={styles.infoSubtext}>
                    Minimum withdrawal: 100 points
                  </StyledText>
                  <StyledText weight="regular" style={styles.infoSubtext}>
                    Processing time: 24 hours
                  </StyledText>
                </View>
                
                <Button
                  title="Withdraw Points"
                  onPress={handleWithdraw}
                  variant="primary"
                  loading={isLoading}
                  disabled={!upiIdValid || !amountValid || isLoading}
                  style={styles.withdrawButton}
                  fullWidth
                />
              </View>
            </Card>
          )}
          
          {/* Transactions */}
          <View style={styles.transactionsContainer}>
            <View style={styles.sectionHeader}>
              <StyledText weight="semiBold" style={styles.sectionTitle}>
                Transaction History
              </StyledText>
              <StyledText weight="medium" style={styles.sectionSubtitle}>
                {userTransactions.length} transactions
              </StyledText>
            </View>
            
            {userTransactions.length > 0 ? (
              userTransactions.map((transaction, index) => 
                renderTransaction(transaction, index)
              )
            ) : (
              <View style={styles.emptyStateContainer}>
                <Clock size={48} color="#BDBDBD" />
                <StyledText weight="medium" style={styles.emptyStateText}>
                  No transactions yet
                </StyledText>
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  flexOne: {
    flex: 1,
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
  scrollView: {
    flex: 1,
    paddingTop: HEADER_HEIGHT - 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 40,
  },
  balanceCardContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  balanceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  balanceGradient: {
    padding: 20,
    borderRadius: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceIcon: {
    opacity: 0.9,
  },
  balanceLabel: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  balanceContent: {
    marginBottom: 25,
  },
  balanceValue: {
    color: 'white',
    fontSize: 40,
  },
  balanceUnit: {
    fontSize: 20,
    opacity: 0.9,
  },
  balanceEquivalent: {
    color: 'white',
    opacity: 0.8,
    fontSize: 14,
    marginTop: 4,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
    justifyContent: 'center',
  },
  actionButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 128, 240, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  earnMoreIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  actionButtonText: {
    color: '#333',
    fontSize: 14,
  },
  withdrawCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  withdrawHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  withdrawTitle: {
    fontSize: 18,
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawForm: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.medium,
  },
  validationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validIcon: {
    backgroundColor: '#4CAF50',
  },
  invalidIcon: {
    backgroundColor: '#F44336',
  },
  inputUnderline: {
    height: 2,
    marginTop: 4,
  },
  neutralUnderline: {
    backgroundColor: '#E0E0E0',
  },
  validUnderline: {
    backgroundColor: '#4CAF50',
  },
  invalidUnderline: {
    backgroundColor: '#F44336',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  infoContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    color: '#2E7D32',
    fontSize: 16,
    marginBottom: 8,
  },
  infoSubtext: {
    color: '#2E7D32',
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 4,
  },
  withdrawButton: {
    marginTop: 16,
  },
  transactionsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  transactionCard: {
    marginHorizontal: 4,
    borderRadius: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 16,
  },
  pointsText: {
    fontSize: 12,
    opacity: 0.8,
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#F44336',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9E9E9E',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loginTitle: {
    fontSize: 20,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    width: 200,
  },
  safeArea: {
    width: '100%',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  placeholderWidth: {
    width: 40,
  },
});