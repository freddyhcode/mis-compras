import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

import { AppText } from './AppText';

export interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  onPress?: () => void;
  destructive?: boolean;
  trailing?: React.ReactNode;
}

export function SettingsRow({
  icon,
  title,
  description,
  onPress,
  destructive = false,
  trailing,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const content = (
    <>
      <View style={[styles.icon, destructive ? styles.iconDanger : null]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? colors.danger : colors.primary}
        />
      </View>
      <View style={styles.copy}>
        <AppText variant="label" color={destructive ? colors.danger : colors.text}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="small" color={colors.textMuted}>
            {description}
          </AppText>
        ) : null}
      </View>
      {trailing ??
        (onPress ? (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        ) : null)}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      {content}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      minHeight: 60,
    },
    pressed: {
      backgroundColor: colors.primarySoft,
    },
    icon: {
      width: 38,
      height: 38,
      borderRadius: radius.sm,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconDanger: {
      backgroundColor: colors.dangerSoft,
    },
    copy: {
      flex: 1,
      gap: 2,
    },
  });
