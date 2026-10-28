import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { spacing } from '@/constants/theme';
import { categoryOptions } from '@/features/purchases/format';
import type { Category, Purchase } from '@/features/purchases/types';
import { useStrings } from '@/i18n/useStrings';
import { useAppData } from '@/shared/providers/AppDataProvider';
import { useTheme } from '@/theme/useTheme';

export default function EditPurchaseScreen() {
  const s = useStrings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { purchases, loading } = useAppData();
  const purchase = purchases.find((item) => item.id === id);

  if (loading) return <LoadingScreen />;

  if (!purchase) {
    return (
      <Screen title={s.purchase.editTitle} showBack>
        <EmptyState
          title={s.purchase.notFound}
          description={s.history.emptyDesc}
          actionLabel={s.common.back}
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  return <PurchaseForm key={purchase.id} purchase={purchase} />;
}

function PurchaseForm({ purchase }: { purchase: Purchase }) {
  const s = useStrings();
  const { updatePurchase } = useAppData();
  const { colors } = useTheme();
  const [title, setTitle] = useState(purchase.title);
  const [purchasedAt, setPurchasedAt] = useState(purchase.purchasedAt);
  const [merchant, setMerchant] = useState(purchase.merchant ?? '');
  const [category, setCategory] = useState<Category>(purchase.category ?? 'otros');
  const [notes, setNotes] = useState(purchase.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setTitleError(null);
    setDateError(null);

    let invalid = false;
    if (!title.trim()) {
      setTitleError(s.purchase.invalidTitle);
      invalid = true;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(purchasedAt)) {
      setDateError(s.purchase.invalidDate);
      invalid = true;
    }
    if (invalid) return;

    setSaving(true);
    try {
      await updatePurchase(purchase.id, {
        title,
        purchasedAt,
        merchant: merchant.trim() || undefined,
        category,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : s.errors.save);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title={s.purchase.editTitle} showBack>
      <TextField
        label={s.purchase.title}
        value={title}
        onChangeText={(value) => {
          setTitle(value);
          if (titleError) setTitleError(null);
        }}
        required
        maxLength={80}
        error={titleError ?? undefined}
      />
      <TextField
        label={s.purchase.date}
        value={purchasedAt}
        onChangeText={(value) => {
          setPurchasedAt(value);
          if (dateError) setDateError(null);
        }}
        help={s.purchase.dateHelp}
        autoCapitalize="none"
        required
        error={dateError ?? undefined}
      />
      <TextField
        label={s.purchase.merchant}
        placeholder={s.purchase.merchantPlaceholder}
        value={merchant}
        onChangeText={setMerchant}
        maxLength={80}
      />

      <View style={styles.categories}>
        <AppText variant="label">{s.purchase.category}</AppText>
        <View style={styles.chips}>
          {categoryOptions(s).map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={category === option.value}
              onPress={() => setCategory(option.value)}
            />
          ))}
        </View>
      </View>

      <TextField
        label={s.purchase.notes}
        placeholder={s.purchase.notesPlaceholder}
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={500}
      />

      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : null}

      <Button
        label={s.purchase.save}
        fullWidth
        loading={saving}
        onPress={() => void handleSave()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  categories: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
