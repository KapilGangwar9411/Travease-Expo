export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  userType: 'rider' | 'driver';
  upiId?: string;
  points: number;
  totalRides: number;
  interests: string[];
  referralCode: string;
  referredBy?: string;
  isVerified: boolean;
  lastLoginDate: string;
  vehicleInfo?: VehicleInfo;
}

export interface VehicleInfo {
  model: string;
  color: string;
  licensePlate: string;
  licenseUrl?: string;
  govtIdUrl?: string;
  seats: number;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface RideRequest {
  id: string;
  userId: string;
  destination: Location;
  pickup: Location;
  preferredTime: string;
  interests: string[];
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface OfferedRide {
  id: string;
  driverId: string;
  pickup: Location;
  destination: Location;
  departureTime: string;
  vehicleInfo: VehicleInfo;
  availableSeats: number;
  price: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface RideMatch {
  id: string;
  riders: string[];
  driverId?: string;
  destination: Location;
  commonPickup: Location;
  departureTime: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  upiId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'ride_match' | 'ride_update' | 'payment' | 'system';
  data?: any;
  createdAt: string;
}