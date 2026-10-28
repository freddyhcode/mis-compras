import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { radius, spacing } from '@/constants/theme';
import { useStrings } from '@/i18n/useStrings';
import { branding } from '@/shared/config/branding';
import { useTheme } from '@/theme/useTheme';

export function AppSplash() {
  const s = useStrings();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.icon, { backgroundColor: colors.primary }]}>
          <Ionicons name="cart-outline" size={34} color={colors.onPrimary} />
        </View>
        <AppText variant="h1" color={colors.primary} align="center">
          {branding.appName}
        </AppText>
        <AppText variant="small" color={colors.textMuted} align="center">
          {s.home.subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '82%',
    maxWidth: 320,
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderRadius: radius.lg,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
