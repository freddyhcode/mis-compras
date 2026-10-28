import { Modal, StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

import { AppText } from './AppText';
import { Button } from './Button';

export interface DialogProps {
  visible: boolean;
  title: string;
  children?: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryVariant?: 'primary' | 'danger';
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function Dialog({
  visible,
  title,
  children,
  primaryLabel,
  onPrimary,
  primaryVariant = 'primary',
  primaryLoading = false,
  primaryDisabled = false,
  secondaryLabel,
  onSecondary,
}: DialogProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onSecondary?.()}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.copy}>
            <AppText variant="h2" accessibilityRole="header">
              {title}
            </AppText>
            {children}
          </View>
          <View style={styles.actions}>
            {secondaryLabel ? (
              <Button
                label={secondaryLabel}
                variant="secondary"
                onPress={onSecondary}
                style={styles.action}
              />
            ) : null}
            <Button
              label={primaryLabel}
              variant={primaryVariant}
              onPress={onPrimary}
              loading={primaryLoading}
              disabled={primaryDisabled}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      padding: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dialog: {
      width: '100%',
      maxWidth: 440,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.lg,
    },
    copy: {
      gap: spacing.sm,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    action: {
      flex: 1,
    },
  });
