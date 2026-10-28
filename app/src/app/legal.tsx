import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { radius, spacing } from '@/constants/theme';
import { useStrings } from '@/i18n/useStrings';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

export default function LegalScreen() {
  const s = useStrings();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Screen title={s.legal.title} showBack>
      <Card style={styles.card}>
        <View style={styles.draft}>
          <AppText variant="small" color={colors.textMuted} weight="600">
            {s.legal.draft}
          </AppText>
        </View>

        <Section title={s.legal.privacyTitle}>
          {s.legal.privacyBody.map((paragraph) => (
            <AppText key={paragraph} variant="small" color={colors.textMuted}>
              {paragraph}
            </AppText>
          ))}
        </Section>

        <View style={styles.divider} />

        <Section title={s.legal.termsTitle}>
          {s.legal.termsBody.map((paragraph) => (
            <AppText key={paragraph} variant="small" color={colors.textMuted}>
              {paragraph}
            </AppText>
          ))}
        </Section>

        <View style={styles.divider} />

        <AppText variant="caption" color={colors.textMuted} align="center">
          {s.appName} · 100% local
        </AppText>
      </Card>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      gap: spacing.lg,
    },
    draft: {
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      padding: spacing.md,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
  });
