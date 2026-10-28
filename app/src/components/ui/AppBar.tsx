import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { maxContentWidth, radius, spacing } from '@/constants/theme';
import { useStrings } from '@/i18n/useStrings';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

import { AppText } from './AppText';

export interface AppBarProps {
  title: string;
  showBack?: boolean;
  brand?: boolean;
  action?: React.ReactNode;
  onBack?: () => void;
}

export function AppBar({ title, showBack = false, brand = false, action, onBack }: AppBarProps) {
  const s = useStrings();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={s.common.back}
            onPress={onBack ?? (() => router.back())}
            style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
        ) : brand ? (
          <View style={styles.brand}>
            <Ionicons name="cart-outline" size={20} color={colors.onPrimary} />
          </View>
        ) : (
          <View style={styles.spacer} />
        )}

        <AppText variant="h2" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>

        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    bar: {
      width: '100%',
      maxWidth: maxContentWidth,
      alignSelf: 'center',
      minHeight: 56,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    iconButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: -spacing.sm,
    },
    brand: {
      width: 42,
      height: 42,
      borderRadius: radius.sm,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    spacer: {
      width: 44,
    },
    title: {
      flex: 1,
    },
    action: {
      marginLeft: spacing.sm,
    },
    pressed: {
      opacity: 0.7,
    },
  });
