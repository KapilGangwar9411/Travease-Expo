import { colors } from './colors';

export const lightTheme = {
  background: colors.background,
  card: colors.card,
  text: colors.text,
  textSecondary: colors.textSecondary,
  textLight: colors.textLight,
  border: colors.border,
  borderLight: colors.borderLight,
  shadow: colors.shadow,
  primary: colors.primary,
  primaryLight: colors.primaryLight,
  secondary: colors.secondary,
  secondaryLight: colors.secondaryLight,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

export const darkTheme = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textLight: '#666666',
  border: '#333333',
  borderLight: '#222222',
  shadow: 'rgba(0, 0, 0, 0.5)',
  primary: colors.primary,
  primaryLight: 'rgba(76, 175, 80, 0.2)',
  secondary: colors.secondary,
  secondaryLight: 'rgba(66, 133, 244, 0.2)',
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

export const theme = {
  light: lightTheme,
  dark: darkTheme,
};

export default theme; 