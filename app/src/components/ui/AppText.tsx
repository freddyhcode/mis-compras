import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { fonts, type as typography, type TextVariant } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
}

export function AppText({
  variant = 'body',
  color,
  weight,
  align,
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  const token = typography[variant];
  const effectiveWeight = weight ?? token.weight;
  const fontFamily =
    effectiveWeight === '700' || effectiveWeight === 'bold'
      ? fonts.bold
      : effectiveWeight === '600'
        ? fonts.semibold
        : fonts.regular;
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        {
          fontSize: token.size,
          lineHeight: token.lineHeight,
          fontWeight: token.weight,
          fontFamily,
          color: color ?? colors.text,
        },
        weight ? { fontWeight: weight } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
