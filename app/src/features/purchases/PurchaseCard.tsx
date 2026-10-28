import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/constants/theme';
import { useStrings } from '@/i18n/useStrings';
import { formatDate } from '@/shared/utils/date';
import { useTheme } from '@/theme/useTheme';

import { categoryLabel, formatClp, purchaseTotalClp } from './format';
import type { Purchase } from './types';

export function PurchaseCard({
  purchase,
  onPress,
}: {
  purchase: Purchase;
  onPress: () => void;
}) {
  const s = useStrings();
  const { colors } = useTheme();
  const total = purchaseTotalClp(purchase);

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${purchase.title}, ${formatClp(total)}`}
    >
      <View style={styles.row}>
        <View style={styles.copy}>
          <AppText variant="label" numberOfLines={1}>
            {purchase.title}
          </AppText>
          <AppText variant="small" color={colors.textMuted} numberOfLines={1}>
            {formatDate(purchase.purchasedAt)}
            {purchase.merchant ? ` · ${purchase.merchant}` : ''}
            {` · ${s.purchase.productCount(purchase.items.length)}`}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {categoryLabel(purchase.category, s)}
          </AppText>
        </View>
        <AppText variant="h2" color={colors.primary}>
          {formatClp(total)}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
