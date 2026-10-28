import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { spacing } from '@/constants/theme';
import { PurchaseCard } from '@/features/purchases/PurchaseCard';
import { formatClp } from '@/features/purchases/format';
import { summaryForMonth } from '@/features/purchases/stats';
import { useStrings } from '@/i18n/useStrings';
import { useAppData } from '@/shared/providers/AppDataProvider';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

export default function HomeScreen() {
  const s = useStrings();
  const { purchases, loading, error, retry } = useAppData();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <Screen title={s.appName} brand>
        <Card>
          <AppText variant="small" color={colors.danger}>
            {error}
          </AppText>
          <Button label={s.home.retry} onPress={() => void retry()} />
        </Card>
      </Screen>
    );
  }

  const summary = summaryForMonth(purchases);
  const recent = purchases.slice(0, 5);

  return (
    <Screen title={s.appName} brand>
      <Card style={styles.summary}>
        <AppText variant="small" color={colors.textMuted}>
          {s.home.monthTotal}
        </AppText>
        <AppText variant="display" color={colors.primary}>
          {formatClp(summary.total)}
        </AppText>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <AppText variant="caption" color={colors.textMuted}>
              {s.home.purchases}
            </AppText>
            <AppText variant="label">{summary.count}</AppText>
          </View>
          <View style={styles.stat}>
            <AppText variant="caption" color={colors.textMuted}>
              {s.home.average}
            </AppText>
            <AppText variant="label">{formatClp(summary.average)}</AppText>
          </View>
        </View>
      </Card>

      <Button
        label={s.home.newPurchase}
        fullWidth
        onPress={() => router.push('/compra/nueva')}
      />

      <Section title={s.home.recent}>
        {recent.length === 0 ? (
          <EmptyState
            title={s.home.emptyTitle}
            description={s.home.emptyDesc}
          />
        ) : (
          recent.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onPress={() => router.push(`/compra/${purchase.id}`)}
            />
          ))
        )}
      </Section>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    summary: {
      gap: spacing.sm,
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.lg,
      marginTop: spacing.sm,
    },
    stat: {
      gap: 2,
    },
  });
