import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { MapPin, Search } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Location } from '@/types';
import { popularLocations } from '@/mocks/locations';
import Input from './Input';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value?: Location;
  onSelect: (location: Location) => void;
  error?: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  value,
  onSelect,
  error,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Location[]>([]);
  
  const handleSearch = (text: string) => {
    setQuery(text);
    setIsSearching(true);
    setShowResults(true);
    
    // Simulate API call to search locations
    setTimeout(() => {
      const filtered = popularLocations.filter(location => 
        location.name?.toLowerCase().includes(text.toLowerCase()) ||
        location.address?.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filtered);
      setIsSearching(false);
    }, 500);
  };
  
  const handleSelect = (location: Location) => {
    onSelect(location);
    setShowResults(false);
    setQuery('');
  };
  
  return (
    <View style={styles.container}>
      {value ? (
        <View style={styles.selectedLocationContainer}>
          <Text style={styles.label}>{label}</Text>
          <TouchableOpacity 
            style={styles.selectedLocation}
            onPress={() => setShowResults(true)}
          >
            <MapPin size={18} color={colors.primary} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationName}>{value.name || ''}</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>
                {value.address || ''}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <Input
          label={label}
          placeholder={placeholder}
          value={query}
          onChangeText={handleSearch}
          onFocus={() => setShowResults(true)}
          leftIcon={<Search size={18} color={colors.textSecondary} />}
          error={error}
        />
      )}
      
      {showResults && (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => `${item.lat}-${item.lng}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                >
                  <MapPin size={16} color={colors.textSecondary} />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultName}>{item.name || ''}</Text>
                    <Text style={styles.resultAddress} numberOfLines={1}>
                      {item.address || ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.resultsList}
            />
          ) : query.length > 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No locations found</Text>
            </View>
          ) : (
            <View style={styles.popularContainer}>
              <Text style={styles.popularTitle}>Popular Locations</Text>
              <FlatList
                data={popularLocations.slice(0, 5)}
                keyExtractor={(item) => `${item.lat}-${item.lng}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleSelect(item)}
                  >
                    <MapPin size={16} color={colors.textSecondary} />
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultName}>{item.name || ''}</Text>
                      <Text style={styles.resultAddress} numberOfLines={1}>
                        {item.address || ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  selectedLocationContainer: {
    marginBottom: 16,
  },
  selectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
    maxHeight: 200,
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resultTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  resultAddress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    color: colors.textSecondary,
  },
  popularContainer: {
    padding: 12,
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
});

export default LocationInput;