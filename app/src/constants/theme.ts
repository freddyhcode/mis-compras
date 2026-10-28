import type { TextStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
} as const;

export const type = {
  display: { size: 28, lineHeight: 36, weight: '700' },
  h1: { size: 22, lineHeight: 30, weight: '700' },
  h2: { size: 19, lineHeight: 27, weight: '600' },
  body: { size: 16, lineHeight: 24, weight: '400' },
  small: { size: 14, lineHeight: 21, weight: '400' },
  caption: { size: 12, lineHeight: 17, weight: '400' },
  label: { size: 15, lineHeight: 21, weight: '600' },
} as const satisfies Record<
  string,
  { size: number; lineHeight: number; weight: TextStyle['fontWeight'] }
>;

export type TextVariant = keyof typeof type;

export const maxContentWidth = 760;
