import { Location } from '@/types';

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

export const calculateCenter = (locations: Location[]): Location => {
  if (locations.length === 0) {
    return { lat: 0, lng: 0 };
  }
  
  let totalLat = 0;
  let totalLng = 0;
  
  locations.forEach(location => {
    totalLat += location.lat;
    totalLng += location.lng;
  });
  
  return {
    lat: totalLat / locations.length,
    lng: totalLng / locations.length
  };
};

export const isNearby = (
  location1: Location,
  location2: Location,
  maxDistanceKm: number = 5
): boolean => {
  const distance = calculateDistance(
    location1.lat,
    location1.lng,
    location2.lat,
    location2.lng
  );
  return distance <= maxDistanceKm;
};