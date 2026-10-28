import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { spacing } from '@/constants/theme';
import { categoryLabel, formatClp } from '@/features/purchases/format';
import { monthTotals, topCategories, yearMonthTotals } from '@/features/purchases/stats';
import type { Category } from '@/features/purchases/types';
import { useStrings } from '@/i18n/useStrings';
import { useAppData } from '@/shared/providers/AppDataProvider';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

export default function StatsScreen() {
  const s = useStrings();
  const { purchases, loading, language } = useAppData();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [period, setPeriod] = useState<3 | 6 | 12>(6);

  const periods = [
    { value: 3, label: s.stats.period3 },
    { value: 6, label: s.stats.period6 },
    { value: 12, label: s.stats.period12 },
  ] as const;

  const series = useMemo(
    () =>
      period === 12
        ? yearMonthTotals(purchases, new Date().getFullYear(), language)
        : monthTotals(purchases, period, language),
    [period, purchases, language],
  );
  const summary = useMemo(
    () => ({
      total: series.reduce((sum, entry) => sum + entry.total, 0),
      count: series.reduce((sum, entry) => sum + entry.count, 0),
      products: series.reduce((sum, entry) => sum + entry.products, 0),
    }),
    [series],
  );
  const activePeriod = periods.find((option) => option.value === period);
  const categories = useMemo(() => topCategories(purchases), [purchases]);

  if (loading) return <LoadingScreen />;

  if (purchases.length === 0) {
    return (
      <Screen title={s.stats.title} brand>
        <EmptyState title={s.stats.emptyTitle} description={s.stats.emptyDesc} />
      </Screen>
    );
  }

  return (
    <Screen title={s.stats.title} brand>
      <Card style={styles.summary}>
        <AppText variant="small" color={colors.textMuted}>
          {s.stats.periodTotal(activePeriod?.label ?? '')}
        </AppText>
        <AppText variant="display" color={colors.primary}>
          {formatClp(summary.total)}
        </AppText>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <View style={styles.stat}>
            <AppText variant="caption" color={colors.textMuted}>
              {s.stats.count}
            </AppText>
            <AppText variant="label">{summary.count}</AppText>
          </View>
          <View style={styles.stat}>
            <AppText variant="caption" color={colors.textMuted}>
              {s.stats.products}
            </AppText>
            <AppText variant="label">{summary.products}</AppText>
          </View>
        </View>
      </Card>

      <View style={styles.chips}>
        {periods.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={period === option.value}
            onPress={() => setPeriod(option.value)}
          />
        ))}
      </View>

      <Section title={s.stats.months}>
        <Card style={styles.list}>
          {series.map((entry, index) => (
            <View key={entry.key}>
              <View style={styles.monthRow}>
                <View style={styles.monthCopy}>
                  <AppText variant="label">{entry.label}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {s.stats.purchaseCount(entry.count)}
                  </AppText>
                </View>
                <AppText
                  variant="label"
                  color={entry.total > 0 ? colors.text : colors.textMuted}
                >
                  {formatClp(entry.total)}
                </AppText>
              </View>
              {index < series.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </Card>
      </Section>

      <Section title={s.stats.topCategories}>
        <Card style={styles.list}>
          {categories.map((entry) => (
            <View key={entry.category} style={styles.categoryRow}>
              <AppText variant="small">
                {categoryLabel(entry.category as Category, s)}
              </AppText>
              <AppText variant="small" color={colors.textMuted}>
                {formatClp(entry.total)}
              </AppText>
            </View>
          ))}
        </Card>
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
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.lg,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginTop: spacing.sm,
    },
    stat: {
      flex: 1,
      gap: 2,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    list: {
      gap: spacing.sm,
    },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      minHeight: 44,
    },
    monthCopy: {
      gap: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
  });
