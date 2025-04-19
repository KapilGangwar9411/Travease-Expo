import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WithdrawalRequest } from '@/types';
import { useAuthStore } from './auth-store';

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'ride' | 'referral' | 'withdrawal' | 'bonus';
  description: string;
  createdAt: string;
}

interface WalletState {
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  isLoading: boolean;
  error: string | null;
  
  addTransaction: (
    userId: string,
    amount: number,
    type: Transaction['type'],
    description: string
  ) => Promise<void>;
  
  requestWithdrawal: (
    userId: string,
    upiId: string,
    amount: number
  ) => Promise<void>;
  
  getUserTransactions: (userId: string) => Transaction[];
  
  getUserWithdrawalRequests: (userId: string) => WithdrawalRequest[];
  
  getUserBalance: (userId: string) => number;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      transactions: [],
      withdrawalRequests: [],
      isLoading: false,
      error: null,
      
      addTransaction: async (
        userId: string,
        amount: number,
        type: Transaction['type'],
        description: string
      ) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newTransaction: Transaction = {
            id: `tx${Date.now()}`,
            userId,
            amount,
            type,
            description,
            createdAt: new Date().toISOString(),
          };
          
          set(state => ({
            transactions: [...state.transactions, newTransaction],
            isLoading: false,
          }));
          
          // Update user points in auth store
          const user = useAuthStore.getState().user;
          if (user && user.id === userId) {
            useAuthStore.getState().updateUser({
              points: user.points + amount,
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      requestWithdrawal: async (
        userId: string,
        upiId: string,
        amount: number
      ) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if user has enough balance
          const balance = get().getUserBalance(userId);
          if (balance < amount) {
            throw new Error('Insufficient balance');
          }
          
          // Create withdrawal request
          const newRequest: WithdrawalRequest = {
            id: `wd${Date.now()}`,
            userId,
            upiId,
            amount,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          
          // Add withdrawal transaction
          const newTransaction: Transaction = {
            id: `tx${Date.now()}`,
            userId,
            amount: -amount,
            type: 'withdrawal',
            description: `Withdrawal request to UPI ID: ${upiId}`,
            createdAt: new Date().toISOString(),
          };
          
          set(state => ({
            withdrawalRequests: [...state.withdrawalRequests, newRequest],
            transactions: [...state.transactions, newTransaction],
            isLoading: false,
          }));
          
          // Update user points in auth store
          const user = useAuthStore.getState().user;
          if (user && user.id === userId) {
            useAuthStore.getState().updateUser({
              points: user.points - amount,
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      getUserTransactions: (userId: string) => {
        return get().transactions.filter(tx => tx.userId === userId);
      },
      
      getUserWithdrawalRequests: (userId: string) => {
        return get().withdrawalRequests.filter(req => req.userId === userId);
      },
      
      getUserBalance: (userId: string) => {
        const transactions = get().transactions.filter(tx => tx.userId === userId);
        return transactions.reduce((total, tx) => total + tx.amount, 0);
      },
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);