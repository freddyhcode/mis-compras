import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';

import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDisabled = disabled || loading;

  const palette = {
    primary: {
      background: colors.primary,
      border: colors.primary,
      text: colors.onPrimary,
      pressed: colors.primaryDark,
    },
    secondary: {
      background: colors.surface,
      border: colors.primary,
      text: colors.primary,
      pressed: colors.primarySoft,
    },
    ghost: {
      background: 'transparent',
      border: 'transparent',
      text: colors.primary,
      pressed: colors.primarySoft,
    },
    danger: {
      background: colors.danger,
      border: colors.danger,
      text: colors.onDanger,
      pressed: colors.primaryDark,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed && !isDisabled ? palette.pressed : palette.background,
          borderColor: palette.border,
          opacity: isDisabled ? 0.5 : 1,
        },
        fullWidth ? styles.fullWidth : null,
        Platform.OS === 'web' && !isDisabled ? styles.webCursor : null,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={palette.text} />
        ) : icon ? (
          <Ionicons name={icon} size={18} color={palette.text} />
        ) : null}
        <AppText variant="label" color={palette.text} weight="600">
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const createStyles = () =>
  StyleSheet.create({
    base: {
      minHeight: 48,
      borderRadius: radius.md,
      borderWidth: 1,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fullWidth: {
      width: '100%',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    webCursor: {
      cursor: 'pointer',
    } as ViewStyle,
  });
