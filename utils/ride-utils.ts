import { OfferedRide, RideMatch, RideRequest, User } from '@/types';
import { calculateDistance, isNearby } from './location-utils';

export const findMatchingRides = (
  rideRequest: RideRequest,
  offeredRides: OfferedRide[],
  maxDistanceKm: number = 5
): OfferedRide[] => {
  return offeredRides.filter(ride => {
    // Check if destination is nearby
    const isDestinationNearby = isNearby(
      rideRequest.destination,
      ride.destination,
      maxDistanceKm
    );
    
    // Check if pickup is nearby
    const isPickupNearby = isNearby(
      rideRequest.pickup,
      ride.pickup,
      maxDistanceKm
    );
    
    // Check if departure time is within 30 minutes
    const requestTime = new Date(rideRequest.preferredTime).getTime();
    const rideTime = new Date(ride.departureTime).getTime();
    const timeDiffMinutes = Math.abs(requestTime - rideTime) / (1000 * 60);
    const isTimeCompatible = timeDiffMinutes <= 30;
    
    // Check if ride has available seats
    const hasSeats = ride.availableSeats > 0;
    
    // Check if ride is still pending
    const isPending = ride.status === 'pending';
    
    return isDestinationNearby && isPickupNearby && isTimeCompatible && hasSeats && isPending;
  });
};

export const findMatchingRequests = (
  offeredRide: OfferedRide,
  rideRequests: RideRequest[],
  maxDistanceKm: number = 5
): RideRequest[] => {
  return rideRequests.filter(request => {
    // Check if destination is nearby
    const isDestinationNearby = isNearby(
      request.destination,
      offeredRide.destination,
      maxDistanceKm
    );
    
    // Check if pickup is nearby
    const isPickupNearby = isNearby(
      request.pickup,
      offeredRide.pickup,
      maxDistanceKm
    );
    
    // Check if departure time is within 30 minutes
    const requestTime = new Date(request.preferredTime).getTime();
    const rideTime = new Date(offeredRide.departureTime).getTime();
    const timeDiffMinutes = Math.abs(requestTime - rideTime) / (1000 * 60);
    const isTimeCompatible = timeDiffMinutes <= 30;
    
    // Check if request is still pending
    const isPending = request.status === 'pending';
    
    return isDestinationNearby && isPickupNearby && isTimeCompatible && isPending;
  });
};

export const calculateRidePrice = (
  pickup: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): number => {
  const distance = calculateDistance(
    pickup.lat,
    pickup.lng,
    destination.lat,
    destination.lng
  );
  
  // Base fare + distance-based fare
  const baseFare = 50;
  const perKmRate = 15;
  
  return Math.round(baseFare + distance * perKmRate);
};

export const getMatchedUsers = (
  rideMatch: RideMatch,
  users: User[]
): User[] => {
  const matchedUsers: User[] = [];
  
  // Add riders
  rideMatch.riders.forEach(riderId => {
    const rider = users.find(user => user.id === riderId);
    if (rider) {
      matchedUsers.push(rider);
    }
  });
  
  // Add driver if exists
  if (rideMatch.driverId) {
    const driver = users.find(user => user.id === rideMatch.driverId);
    if (driver) {
      matchedUsers.push(driver);
    }
  }
  
  return matchedUsers;
};

export const getCommonInterests = (users: User[]): string[] => {
  if (users.length === 0) return [];
  
  // Start with the first user's interests
  let commonInterests = [...users[0].interests];
  
  // Intersect with each subsequent user's interests
  for (let i = 1; i < users.length; i++) {
    commonInterests = commonInterests.filter(interest => 
      users[i].interests.includes(interest)
    );
  }
  
  return commonInterests;
};