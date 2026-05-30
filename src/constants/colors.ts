export const Colors = {
  brand: {
    primary: '#5B6EF5',       // vibrant indigo
    primaryDark: '#3D52D5',
    primaryLight: '#EEF0FF',
    secondary: '#FF6B9D',     // pink accent
    secondaryLight: '#FFF0F6',
    tertiary: '#00C9A7',      // teal
    tertiaryLight: '#E0FBF6',
    gradient: ['#5B6EF5', '#9B59F5'] as string[],  // indigo → purple
  },
  neutral: {
    50: '#F8F9FF',
    100: '#F0F1FA',
    150: '#E8EAF6',
    200: '#DDE0F5',
    300: '#C5C9E8',
    400: '#9297C4',
    500: '#6B71A8',
    600: '#484E88',
    700: '#2F3470',
    800: '#1E2255',
    900: '#10143A',
  },
  semantic: {
    success: '#00B894',
    successBg: '#D4F7F0',
    warning: '#F39C12',
    warningBg: '#FEF9E7',
    danger: '#E74C3C',
    dangerBg: '#FDEDEC',
    info: '#3498DB',
    infoBg: '#EBF5FB',
  },
  card: '#FFFFFF',
  cardBorder: '#EBEBF5',
  bg: '#EDEEF8',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;
