import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { fonts } from '@/constants/fonts';

interface StyledTextProps extends TextProps {
  weight?: 'light' | 'regular' | 'medium' | 'semiBold' | 'bold';
}

export function StyledText({ 
  weight = 'regular',
  style, 
  children,
  ...props 
}: StyledTextProps) {
  
  let fontFamily;
  switch (weight) {
    case 'light':
      fontFamily = fonts.light;
      break;
    case 'regular':
      fontFamily = fonts.regular;
      break;
    case 'medium':
      fontFamily = fonts.medium;
      break;
    case 'semiBold':
      fontFamily = fonts.semiBold;
      break;
    case 'bold':
      fontFamily = fonts.bold;
      break;
    default:
      fontFamily = fonts.regular;
  }
  
  return (
    <Text 
      style={[{ fontFamily }, style]} 
      {...props}
    >
      {children}
    </Text>
  );
}

export default StyledText; 