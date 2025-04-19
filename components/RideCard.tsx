import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Users, Car, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { OfferedRide, RideMatch, RideRequest } from '@/types';
import { formatTime, getTimeUntil } from '@/utils/date-utils';
import { formatDistance } from '@/utils/location-utils';
import Card from './Card';
import Avatar from './Avatar';

interface RideCardProps {
  ride: RideRequest | OfferedRide | RideMatch;
  type: 'request' | 'offered' | 'match';
  onPress: () => void;
  user?: {
    name: string;
    photoURL?: string;
  };
}

export const RideCard: React.FC<RideCardProps> = ({
  ride,
  type,
  onPress,
  user,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'matched':
      case 'confirmed':
      case 'active':
        return colors.success;
      case 'completed':
        return colors.primary;
      case 'cancelled':
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  };
  
  const renderRideDetails = () => {
    if (type === 'request') {
      const request = ride as RideRequest;
      return (
        <>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              From: {request.pickup.name}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.danger} />
            <Text style={styles.locationText} numberOfLines={1}>
              To: {request.destination.name}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {formatTime(request.preferredTime)}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={[
                styles.statusText, 
                { color: getStatusColor(request.status) }
              ]}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Text>
            </View>
          </View>
        </>
      );
    } else if (type === 'offered') {
      const offered = ride as OfferedRide;
      return (
        <>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              From: {offered.pickup.name}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.danger} />
            <Text style={styles.locationText} numberOfLines={1}>
              To: {offered.destination.name}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {formatTime(offered.departureTime)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Users size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {offered.availableSeats} seats
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={[
                styles.statusText, 
                { color: getStatusColor(offered.status) }
              ]}>
                {offered.status.charAt(0).toUpperCase() + offered.status.slice(1)}
              </Text>
            </View>
          </View>
        </>
      );
    } else {
      const match = ride as RideMatch;
      return (
        <>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              Pickup: {match.commonPickup.name}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.danger} />
            <Text style={styles.locationText} numberOfLines={1}>
              Destination: {match.destination.name}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {formatTime(match.departureTime)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Users size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {match.riders.length} riders
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={[
                styles.statusText, 
                { color: getStatusColor(match.status) }
              ]}>
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </Text>
            </View>
          </View>
        </>
      );
    }
  };
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.card}>
        {user && (
          <View style={styles.userRow}>
            <Avatar source={user.photoURL} name={user.name} size="small" />
            <Text style={styles.userName}>{user.name}</Text>
          </View>
        )}
        
        {renderRideDetails()}
        
        <View style={styles.footer}>
          <Text style={styles.timeText}>
            {getTimeUntil(
              type === 'request' 
                ? (ride as RideRequest).preferredTime 
                : type === 'offered'
                  ? (ride as OfferedRide).departureTime
                  : (ride as RideMatch).departureTime
            )}
          </Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: fonts.medium,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
  statusBadge: {
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
});

export default RideCard;