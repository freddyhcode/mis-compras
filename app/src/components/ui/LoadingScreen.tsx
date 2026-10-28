import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';
import { useStrings } from '@/i18n/useStrings';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

import { AppText } from './AppText';

export function LoadingScreen({ label }: { label?: string }) {
  const s = useStrings();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrapper}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText variant="small" color={colors.textMuted}>
        {label ?? s.common.loading}
      </AppText>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      backgroundColor: colors.background,
    },
  });
