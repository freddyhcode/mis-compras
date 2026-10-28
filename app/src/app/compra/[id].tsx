import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { spacing } from '@/constants/theme';
import {
  categoryLabel,
  formatClp,
  formatQuantity,
  purchaseTotalClp,
  subtotalClp,
  unitLabel,
} from '@/features/purchases/format';
import { sharePurchase } from '@/features/purchases/share';
import { useStrings } from '@/i18n/useStrings';
import { useAppData } from '@/shared/providers/AppDataProvider';
import { formatDate, formatDateTime } from '@/shared/utils/date';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

export default function PurchaseDetailScreen() {
  const s = useStrings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { purchases, loading } = useAppData();
  const purchase = purchases.find((item) => item.id === id);

  if (loading) return <LoadingScreen />;

  if (!purchase) {
    return (
      <Screen title={s.purchase.detailTitle} showBack>
        <EmptyState
          title={s.purchase.notFound}
          description={s.history.emptyDesc}
          actionLabel={s.common.back}
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  return <PurchaseDetail purchaseId={purchase.id} />;
}

function PurchaseDetail({ purchaseId }: { purchaseId: string }) {
  const s = useStrings();
  const { purchases, duplicatePurchase, removePurchase, language } = useAppData();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const purchase = purchases.find((item) => item.id === purchaseId);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!purchase) {
    return (
      <Screen title={s.purchase.detailTitle} showBack>
        <EmptyState title={s.purchase.notFound} description={s.history.emptyDesc} />
      </Screen>
    );
  }

  const handleDuplicate = async () => {
    setDuplicating(true);
    setError(null);
    try {
      const copy = await duplicatePurchase(purchase.id);
      router.replace(`/compra/${copy.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : s.errors.save);
    } finally {
      setDuplicating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removePurchase(purchase.id);
      setDeleteOpen(false);
      router.back();
    } catch (cause) {
      setDeleteOpen(false);
      setError(cause instanceof Error ? cause.message : s.errors.delete);
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    setError(null);
    try {
      const result = await sharePurchase(purchase, s, language);
      if (result === 'copied') {
        setNotice(s.share.copied);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : s.share.error);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Screen title={purchase.title} showBack>
      <Card style={styles.infoCard}>
        <View style={styles.totalHeader}>
          <View style={styles.totalCopy}>
            <AppText variant="caption" color={colors.textMuted}>
              {s.purchase.total}
            </AppText>
            <AppText variant="display" color={colors.primary}>
              {formatClp(purchaseTotalClp(purchase))}
            </AppText>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Button
            label={s.purchase.share}
            variant="secondary"
            loading={sharing}
            onPress={() => void handleShare()}
            style={styles.headerAction}
          />
          <Button
            label={s.purchase.edit}
            variant="secondary"
            onPress={() => router.push(`/compra/${purchase.id}/editar`)}
            style={styles.headerAction}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.metaList}>
          <AppText variant="caption" color={colors.textMuted}>
            {s.purchase.createdAt} {formatDateTime(purchase.createdAt)}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {s.purchase.date}: {formatDate(purchase.purchasedAt)}
          </AppText>
          {purchase.merchant ? (
            <AppText variant="caption" color={colors.textMuted}>
              {s.purchase.merchant}: {purchase.merchant}
            </AppText>
          ) : null}
          <AppText variant="caption" color={colors.textMuted}>
            {s.purchase.category}: {categoryLabel(purchase.category, s)}
          </AppText>
        </View>

        {purchase.notes ? (
          <AppText variant="small" color={colors.textMuted}>
            {purchase.notes}
          </AppText>
        ) : null}
      </Card>

      <Section title={s.purchase.products}>
        {purchase.items.length === 0 ? (
          <Card>
            <AppText variant="small" color={colors.textMuted}>
              {s.purchase.noProducts}
            </AppText>
          </Card>
        ) : (
          purchase.items.map((item) => (
            <Card
              key={item.id}
              onPress={() =>
                router.push(`/compra/${purchase.id}/producto?productoId=${item.id}`)
              }
              accessibilityLabel={`${item.name}, ${formatClp(subtotalClp(item))}`}
            >
              <View style={styles.productRow}>
                <View style={styles.productCopy}>
                  <AppText variant="label" numberOfLines={1}>
                    {item.name}
                  </AppText>
                  <AppText variant="small" color={colors.textMuted}>
                    {formatQuantity(item.quantityMilli, item.unit, language)}{' '}
                    {unitLabel(item.unit, item.quantityMilli, s)} ×{' '}
                    {formatClp(item.unitPriceClp)}
                  </AppText>
                </View>
                <AppText variant="label">{formatClp(subtotalClp(item))}</AppText>
              </View>
            </Card>
          ))
        )}

        <Button
          label={s.purchase.addProduct}
          variant="secondary"
          fullWidth
          onPress={() => router.push(`/compra/${purchase.id}/producto`)}
        />
      </Section>

      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : null}

      <View style={styles.actionsRow}>
        <Button
          label={s.purchase.duplicate}
          variant="secondary"
          loading={duplicating}
          onPress={() => void handleDuplicate()}
          style={styles.actionButton}
        />
        <Button
          label={s.purchase.deleteAction}
          variant="danger"
          onPress={() => setDeleteOpen(true)}
          style={styles.actionButton}
        />
      </View>

      <Dialog
        visible={deleteOpen}
        title={s.purchase.deleteTitle}
        primaryLabel={s.purchase.deleteConfirm}
        primaryVariant="danger"
        primaryLoading={deleting}
        onPrimary={() => void handleDelete()}
        secondaryLabel={s.common.cancel}
        onSecondary={() => setDeleteOpen(false)}
      >
        <AppText variant="small" color={colors.textMuted}>
          {s.purchase.deleteBody}
        </AppText>
      </Dialog>

      <Dialog
        visible={notice !== null}
        title={s.purchase.share}
        primaryLabel={s.common.close}
        onPrimary={() => setNotice(null)}
      >
        <AppText variant="small" color={colors.textMuted}>
          {notice}
        </AppText>
      </Dialog>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    infoCard: {
      gap: spacing.md,
    },
    totalHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    totalCopy: {
      flex: 1,
      gap: 2,
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    headerAction: {
      flex: 1,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    metaList: {
      gap: 2,
    },
    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    productCopy: {
      flex: 1,
      gap: 2,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });
