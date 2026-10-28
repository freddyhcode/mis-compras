import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { spacing } from '@/constants/theme';
import { PurchaseCard } from '@/features/purchases/PurchaseCard';
import { categoryOptions } from '@/features/purchases/format';
import type { Category } from '@/features/purchases/types';
import { useStrings } from '@/i18n/useStrings';
import { useAppData } from '@/shared/providers/AppDataProvider';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

type CategoryFilter = 'all' | Category;

export default function HistoryScreen() {
  const s = useStrings();
  const { purchases, loading } = useAppData();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return purchases.filter((purchase) => {
      if (category !== 'all' && purchase.category !== category) return false;
      if (!term) return true;
      const haystack = [
        purchase.title,
        purchase.merchant ?? '',
        purchase.notes ?? '',
        ...purchase.items.map((item) => item.name),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [category, purchases, search]);

  if (loading) return <LoadingScreen />;

  return (
    <Screen title={s.history.title} brand>
      <TextField
        label={s.history.search}
        placeholder={s.history.searchPlaceholder}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        returnKeyType="search"
      />

      <View style={styles.chips}>
        <Chip
          label={s.history.all}
          selected={category === 'all'}
          onPress={() => setCategory('all')}
        />
        {categoryOptions(s).map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={category === option.value}
            onPress={() => setCategory(option.value)}
          />
        ))}
      </View>

      {filtered.length === 0 ? (
        purchases.length === 0 ? (
          <EmptyState
            title={s.home.emptyTitle}
            description={s.home.emptyDesc}
          />
        ) : (
          <EmptyState title={s.history.emptyTitle} description={s.history.emptyDesc} />
        )
      ) : (
        filtered.map((purchase) => (
          <PurchaseCard
            key={purchase.id}
            purchase={purchase}
            onPress={() => router.push(`/compra/${purchase.id}`)}
          />
        ))
      )}

      {purchases.length > 0 ? (
        <AppText variant="caption" color={colors.textMuted} align="center">
          {s.purchase.productCount(filtered.length)}
        </AppText>
      ) : null}
    </Screen>
  );
}

const createStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
  });
