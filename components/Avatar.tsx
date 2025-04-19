import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ViewStyle, ActivityIndicator, ImageSourcePropType } from 'react-native';
import { colors } from '@/constants/colors';

interface AvatarProps {
  source?: string | ImageSourcePropType;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Reset error state when source changes
  useEffect(() => {
    if (source) {
      setHasError(false);
    }
  }, [source]);
  
  const getInitials = (name: string): string => {
    if (!name) return '';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };
  
  const getSize = (): number => {
    switch (size) {
      case 'small':
        return 32;
      case 'medium':
        return 48;
      case 'large':
        return 80;
      default:
        return 48;
    }
  };
  
  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 18;
      case 'large':
        return 24;
      default:
        return 18;
    }
  };
  
  const avatarSize = getSize();
  const fontSize = getFontSize();
  
  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    console.log('Image failed to load:', source);
    setIsLoading(false);
    setHasError(true);
  };

  const renderInitials = () => (
    <Text style={[styles.initials, { fontSize }]}>
      {name ? getInitials(name) : '?'}
    </Text>
  );
  
  const isSourceObject = source !== null && typeof source === 'object';
  
  return (
    <View
      style={[
        styles.container,
        { width: avatarSize, height: avatarSize },
        style,
      ]}
    >
      {source && !hasError ? (
        <>
          <Image
            source={isSourceObject ? source as ImageSourcePropType : { uri: source as string }}
            style={styles.image}
            resizeMode="cover"
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
          />
          {isLoading && (
            <ActivityIndicator 
              size="small" 
              color={colors.primary} 
              style={styles.loader} 
            />
          )}
        </>
      ) : renderInitials()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.primary,
    fontWeight: '600',
  },
  loader: {
    position: 'absolute',
  }
});

export default Avatar;