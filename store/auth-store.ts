import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { mockUsers } from '@/mocks/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find user with matching email (mock authentication)
          const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (!user) {
            throw new Error('Invalid email or password');
          }
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if email already exists
          const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (existingUser) {
            throw new Error('Email already in use');
          }
          
          // Create new user
          const newUser: User = {
            id: `user${mockUsers.length + 1}`,
            name,
            email,
            photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
            userType: 'rider',
            points: 1000, // Welcome bonus
            totalRides: 0,
            interests: [],
            referralCode: `${name.substring(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
            isVerified: false,
            lastLoginDate: new Date().toISOString(),
          };
          
          // In a real app, we would save this to the backend
          // For now, we'll just set it in the state
          set({ user: newUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        set({ 
          user: { 
            ...currentUser, 
            ...userData,
            lastLoginDate: new Date().toISOString() 
          } 
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);