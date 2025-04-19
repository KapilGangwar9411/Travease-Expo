import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StyledText from './StyledText';

interface ThemeToggleProps {
  showLabel?: boolean;
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ 
  showLabel = true, 
  isDark, 
  onToggle 
}: ThemeToggleProps) {
  return (
    <View style={styles.container}>
      {showLabel && (
        <StyledText style={styles.label} weight="medium">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </StyledText>
      )}
      <TouchableOpacity 
        style={[styles.toggle, isDark ? styles.toggleDark : styles.toggleLight]} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={isDark ? 'moon' : 'sunny'} 
          size={showLabel ? 18 : 22} 
          color={isDark ? '#FFF' : '#FF9800'} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginRight: 8,
    fontSize: 14,
  },
  toggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleLight: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  toggleDark: {
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
  },
});

export default ThemeToggle; 