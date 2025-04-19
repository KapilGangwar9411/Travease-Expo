import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Location, OfferedRide, RideMatch, RideRequest } from '@/types';
import { mockOfferedRides, mockRideMatches, mockRideRequests } from '@/mocks/rides';
import { calculateRidePrice, findMatchingRequests, findMatchingRides } from '@/utils/ride-utils';
import { calculateCenter } from '@/utils/location-utils';

interface RideState {
  rideRequests: RideRequest[];
  offeredRides: OfferedRide[];
  rideMatches: RideMatch[];
  isLoading: boolean;
  error: string | null;
  
  // Ride request actions
  createRideRequest: (
    userId: string,
    pickup: Location,
    destination: Location,
    preferredTime: string,
    interests: string[]
  ) => Promise<RideRequest>;
  
  updateRideRequest: (
    requestId: string,
    updates: Partial<RideRequest>
  ) => Promise<void>;
  
  cancelRideRequest: (requestId: string) => Promise<void>;
  
  // Offered ride actions
  offerRide: (
    driverId: string,
    pickup: Location,
    destination: Location,
    departureTime: string,
    vehicleInfo: any,
    availableSeats: number
  ) => Promise<OfferedRide>;
  
  updateOfferedRide: (
    rideId: string,
    updates: Partial<OfferedRide>
  ) => Promise<void>;
  
  cancelOfferedRide: (rideId: string) => Promise<void>;
  
  // Matching actions
  findMatches: (requestId: string) => Promise<OfferedRide[]>;
  
  createRideMatch: (
    requestId: string,
    offeredRideId: string
  ) => Promise<RideMatch>;
  
  getUserRides: (userId: string) => {
    requests: RideRequest[];
    offered: OfferedRide[];
    matches: RideMatch[];
  };
}

export const useRideStore = create<RideState>()(
  persist(
    (set, get) => ({
      rideRequests: [...mockRideRequests],
      offeredRides: [...mockOfferedRides],
      rideMatches: [...mockRideMatches],
      isLoading: false,
      error: null,
      
      createRideRequest: async (
        userId: string,
        pickup: Location,
        destination: Location,
        preferredTime: string,
        interests: string[]
      ) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newRequest: RideRequest = {
            id: `req${Date.now()}`,
            userId,
            pickup,
            destination,
            preferredTime,
            interests,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          
          set(state => ({
            rideRequests: [...state.rideRequests, newRequest],
            isLoading: false,
          }));
          
          return newRequest;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateRideRequest: async (requestId: string, updates: Partial<RideRequest>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            rideRequests: state.rideRequests.map(request => 
              request.id === requestId ? { ...request, ...updates } : request
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      cancelRideRequest: async (requestId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            rideRequests: state.rideRequests.map(request => 
              request.id === requestId ? { ...request, status: 'cancelled' } : request
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      offerRide: async (
        driverId: string,
        pickup: Location,
        destination: Location,
        departureTime: string,
        vehicleInfo: any,
        availableSeats: number
      ) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const price = calculateRidePrice(pickup, destination);
          
          const newRide: OfferedRide = {
            id: `off${Date.now()}`,
            driverId,
            pickup,
            destination,
            departureTime,
            vehicleInfo,
            availableSeats,
            price,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          
          set(state => ({
            offeredRides: [...state.offeredRides, newRide],
            isLoading: false,
          }));
          
          return newRide;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateOfferedRide: async (rideId: string, updates: Partial<OfferedRide>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            offeredRides: state.offeredRides.map(ride => 
              ride.id === rideId ? { ...ride, ...updates } : ride
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      cancelOfferedRide: async (rideId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            offeredRides: state.offeredRides.map(ride => 
              ride.id === rideId ? { ...ride, status: 'cancelled' } : ride
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      findMatches: async (requestId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const request = get().rideRequests.find(req => req.id === requestId);
          
          if (!request) {
            throw new Error('Ride request not found');
          }
          
          const matches = findMatchingRides(request, get().offeredRides);
          
          set({ isLoading: false });
          
          return matches;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      createRideMatch: async (requestId: string, offeredRideId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const request = get().rideRequests.find(req => req.id === requestId);
          const offeredRide = get().offeredRides.find(ride => ride.id === offeredRideId);
          
          if (!request || !offeredRide) {
            throw new Error('Ride request or offered ride not found');
          }
          
          // Create a new ride match
          const newMatch: RideMatch = {
            id: `match${Date.now()}`,
            riders: [request.userId],
            driverId: offeredRide.driverId,
            destination: offeredRide.destination,
            commonPickup: offeredRide.pickup,
            departureTime: offeredRide.departureTime,
            price: offeredRide.price,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
          };
          
          // Update the request and offered ride status
          set(state => ({
            rideMatches: [...state.rideMatches, newMatch],
            rideRequests: state.rideRequests.map(req => 
              req.id === requestId ? { ...req, status: 'matched' } : req
            ),
            offeredRides: state.offeredRides.map(ride => 
              ride.id === offeredRideId ? 
                { 
                  ...ride, 
                  availableSeats: ride.availableSeats - 1,
                  status: ride.availableSeats <= 1 ? 'active' : 'pending'
                } : ride
            ),
            isLoading: false,
          }));
          
          return newMatch;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      getUserRides: (userId: string) => {
        const state = get();
        
        return {
          requests: state.rideRequests.filter(req => req.userId === userId),
          offered: state.offeredRides.filter(ride => ride.driverId === userId),
          matches: state.rideMatches.filter(match => 
            match.riders.includes(userId) || match.driverId === userId
          ),
        };
      },
    }),
    {
      name: 'ride-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);