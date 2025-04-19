import { OfferedRide, RideMatch, RideRequest } from '@/types';

export const mockRideRequests: RideRequest[] = [
  {
    id: 'req1',
    userId: 'user1',
    destination: {
      lat: 28.6129,
      lng: 77.2295,
      name: 'India Gate',
      address: 'Rajpath, India Gate, New Delhi, Delhi 110001'
    },
    pickup: {
      lat: 28.5710,
      lng: 77.2580,
      name: 'Nehru Place',
      address: 'Nehru Place, New Delhi, Delhi 110019'
    },
    preferredTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    interests: ['1', '7'],
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req2',
    userId: 'user3',
    destination: {
      lat: 28.6304,
      lng: 77.2177,
      name: 'Connaught Place',
      address: 'Connaught Place, New Delhi, Delhi 110001'
    },
    pickup: {
      lat: 28.5565,
      lng: 77.1937,
      name: 'Saket Mall',
      address: 'District Centre, Sector 6, Pushp Vihar, New Delhi, Delhi 110017'
    },
    preferredTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    interests: ['4', '9'],
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

export const mockOfferedRides: OfferedRide[] = [
  {
    id: 'off1',
    driverId: 'user2',
    pickup: {
      lat: 28.5710,
      lng: 77.2580,
      name: 'Nehru Place',
      address: 'Nehru Place, New Delhi, Delhi 110019'
    },
    destination: {
      lat: 28.6129,
      lng: 77.2295,
      name: 'India Gate',
      address: 'Rajpath, India Gate, New Delhi, Delhi 110001'
    },
    departureTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    vehicleInfo: {
      model: 'Maruti Swift',
      color: 'Silver',
      licensePlate: 'DL10AB1234',
      seats: 4,
    },
    availableSeats: 3,
    price: 120,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'off2',
    driverId: 'user4',
    pickup: {
      lat: 28.5565,
      lng: 77.1937,
      name: 'Saket Mall',
      address: 'District Centre, Sector 6, Pushp Vihar, New Delhi, Delhi 110017'
    },
    destination: {
      lat: 28.6304,
      lng: 77.2177,
      name: 'Connaught Place',
      address: 'Connaught Place, New Delhi, Delhi 110001'
    },
    departureTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    vehicleInfo: {
      model: 'Hyundai Creta',
      color: 'White',
      licensePlate: 'DL02CD5678',
      seats: 5,
    },
    availableSeats: 4,
    price: 150,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

export const mockRideMatches: RideMatch[] = [
  {
    id: 'match1',
    riders: ['user1', 'user3'],
    driverId: 'user2',
    destination: {
      lat: 28.6129,
      lng: 77.2295,
      name: 'India Gate',
      address: 'Rajpath, India Gate, New Delhi, Delhi 110001'
    },
    commonPickup: {
      lat: 28.5710,
      lng: 77.2580,
      name: 'Nehru Place',
      address: 'Nehru Place, New Delhi, Delhi 110019'
    },
    departureTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    price: 100,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
];