import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { useStrings } from '@/i18n/useStrings';
import { useAppData } from '@/shared/providers/AppDataProvider';
import { appMode, isProduction } from '@/shared/runtime/appMode';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

export function EnvironmentBadge() {
  const s = useStrings();
  const { mode } = useAppData();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (isProduction) return null;

  const appLabel = appMode === 'demo' ? s.env.demo : s.env.development;
  const dataLabel = mode === 'web-dev' ? s.env.web : mode === 'plain-dev' ? s.env.plain : null;
  const label = dataLabel ? `${appLabel} · ${dataLabel}` : appLabel;

  return (
    <View style={styles.badge} accessibilityLiveRegion="polite">
      <Ionicons name="construct-outline" size={14} color={colors.primary} />
      <AppText variant="caption" color={colors.primary} weight="600" style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    text: {
      flex: 1,
    },
  });
