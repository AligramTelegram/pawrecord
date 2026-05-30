import { Platform } from 'react-native';

export const Typography = {
  display: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    sizes: { xl: 36, lg: 28, md: 22 },
  },
  body: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    sizes: { lg: 17, md: 15, sm: 13, xs: 11 },
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    sizes: { md: 13 },
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 24,
  full: 9999,
} as const;
