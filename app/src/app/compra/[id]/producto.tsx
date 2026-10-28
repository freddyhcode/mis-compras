import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { TextField } from '@/components/ui/TextField';
import { spacing } from '@/constants/theme';
import {
  formatClp,
  formatQuantityInput,
  parseClpInput,
  parseQuantityInput,
  unitOptions,
} from '@/features/purchases/format';
import type { PurchaseItem, Unit } from '@/features/purchases/types';
import { useStrings } from '@/i18n/useStrings';
import { useAppData } from '@/shared/providers/AppDataProvider';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

export default function ProductScreen() {
  const s = useStrings();
  const { id, productoId } = useLocalSearchParams<{ id: string; productoId?: string }>();
  const { purchases, loading } = useAppData();
  const purchase = purchases.find((item) => item.id === id);

  if (loading) return <LoadingScreen />;

  if (!purchase) {
    return (
      <Screen title={s.product.newTitle} showBack>
        <EmptyState
          title={s.purchase.notFound}
          description={s.history.emptyDesc}
          actionLabel={s.common.back}
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const product = productoId
    ? purchase.items.find((entry) => entry.id === productoId)
    : undefined;

  return <ProductForm purchaseId={purchase.id} product={product} />;
}

function ProductForm({
  purchaseId,
  product,
}: {
  purchaseId: string;
  product?: PurchaseItem;
}) {
  const s = useStrings();
  const { addItem, updateItem, removeItem, language } = useAppData();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [name, setName] = useState(product?.name ?? '');
  const [quantityText, setQuantityText] = useState(
    product ? formatQuantityInput(product.quantityMilli, language) : '1',
  );
  const [unit, setUnit] = useState<Unit>(product?.unit ?? 'un');
  const [priceText, setPriceText] = useState(
    product ? String(product.unitPriceClp) : '',
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const quantityMilli = parseQuantityInput(quantityText);
  const unitPriceClp = parseClpInput(priceText);
  const preview = Math.round((quantityMilli * unitPriceClp) / 1000);

  const validate = (): boolean => {
    let valid = true;
    setNameError(null);
    setQuantityError(null);
    setPriceError(null);

    if (!name.trim()) {
      setNameError(s.product.invalidName);
      valid = false;
    }
    if (quantityMilli <= 0) {
      setQuantityError(s.product.invalidQuantity);
      valid = false;
    } else if (unit === 'un' && quantityMilli % 1000 !== 0) {
      setQuantityError(s.product.invalidInteger);
      valid = false;
    }
    if (unitPriceClp < 0) {
      setPriceError(s.product.invalidPrice);
      valid = false;
    }

    return valid;
  };

  const handleSave = async (andAdd: boolean) => {
    setError(null);
    setNotice(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const input = {
        name,
        quantityMilli,
        unit,
        unitPriceClp,
      };

      if (product) {
        await updateItem(purchaseId, product.id, input);
        router.back();
        return;
      }

      await addItem(purchaseId, input);
      if (andAdd) {
        setName('');
        setQuantityText('1');
        setUnit('un');
        setPriceText('');
        setNameError(null);
        setQuantityError(null);
        setPriceError(null);
        setNotice(s.purchase.saved);
      } else {
        router.replace(`/compra/${purchaseId}`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : s.errors.save);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      await removeItem(purchaseId, product.id);
      setDeleteOpen(false);
      router.back();
    } catch (cause) {
      setDeleteOpen(false);
      setError(cause instanceof Error ? cause.message : s.errors.delete);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Screen title={product ? s.product.editTitle : s.product.newTitle} showBack>
      <Section title={s.product.formTitle}>
        <TextField
          label={s.product.name}
          placeholder={s.product.namePlaceholder}
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (nameError) setNameError(null);
          }}
          required
          maxLength={80}
          error={nameError ?? undefined}
        />

        <TextField
          label={s.product.quantity}
          value={quantityText}
          onChangeText={(text) => {
            setQuantityText(text.replace(/[^0-9,.]/g, ''));
            if (quantityError) setQuantityError(null);
          }}
          keyboardType="decimal-pad"
          help={unit === 'un' ? s.product.integerHelp : s.product.decimalHelp}
          required
          error={quantityError ?? undefined}
        />

        <View style={styles.units}>
          <AppText variant="label">{s.product.unit}</AppText>
          <View style={styles.chips}>
            {unitOptions(s).map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={unit === option.value}
                onPress={() => setUnit(option.value)}
              />
            ))}
          </View>
        </View>

        <TextField
          label={s.product.price}
          value={priceText}
          onChangeText={(text) => {
            setPriceText(text.replace(/[^\d]/g, ''));
            if (priceError) setPriceError(null);
          }}
          keyboardType="number-pad"
          help={`${s.product.subtotal}: ${formatClp(preview)}`}
          error={priceError ?? undefined}
        />
      </Section>

      <Card style={styles.subtotal}>
        <AppText variant="small" color={colors.textMuted}>
          {s.product.subtotal}
        </AppText>
        <AppText variant="h2" color={colors.primary}>
          {formatClp(preview)}
        </AppText>
      </Card>

      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
      {notice ? (
        <AppText variant="small" color={colors.success}>
          {notice}
        </AppText>
      ) : null}

      <View style={styles.actionsRow}>
        <Button
          label={s.product.save}
          loading={saving}
          onPress={() => void handleSave(false)}
          style={styles.actionButton}
        />

        {!product ? (
          <Button
            label={s.product.saveAndAdd}
            variant="secondary"
            disabled={saving}
            onPress={() => void handleSave(true)}
            style={styles.actionButton}
          />
        ) : (
          <Button
            label={s.product.deleteAction}
            variant="danger"
            onPress={() => setDeleteOpen(true)}
            style={styles.actionButton}
          />
        )}
      </View>

      <Dialog
        visible={deleteOpen}
        title={s.product.deleteTitle}
        primaryLabel={s.product.deleteConfirm}
        primaryVariant="danger"
        primaryLoading={deleting}
        onPrimary={() => void handleDelete()}
        secondaryLabel={s.common.cancel}
        onSecondary={() => setDeleteOpen(false)}
      >
        <AppText variant="small" color={colors.textMuted}>
          {s.product.deleteBody}
        </AppText>
      </Dialog>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    units: {
      gap: spacing.sm,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    subtotal: {
      gap: spacing.xs,
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });
