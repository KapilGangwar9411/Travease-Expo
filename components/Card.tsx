import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const getCardStyle = (): ViewStyle => {
    let cardStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'default':
        cardStyle = styles.defaultCard;
        break;
      case 'elevated':
        cardStyle = styles.elevatedCard;
        break;
      case 'outlined':
        cardStyle = styles.outlinedCard;
        break;
    }
    
    // Padding styles
    switch (padding) {
      case 'none':
        cardStyle = { ...cardStyle, ...styles.noPadding };
        break;
      case 'small':
        cardStyle = { ...cardStyle, ...styles.smallPadding };
        break;
      case 'medium':
        cardStyle = { ...cardStyle, ...styles.mediumPadding };
        break;
      case 'large':
        cardStyle = { ...cardStyle, ...styles.largePadding };
        break;
    }
    
    return cardStyle;
  };
  
  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  defaultCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  elevatedCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  outlinedCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  noPadding: {
    padding: 0,
  },
  smallPadding: {
    padding: 8,
  },
  mediumPadding: {
    padding: 16,
  },
  largePadding: {
    padding: 24,
  },
});

export default Card;