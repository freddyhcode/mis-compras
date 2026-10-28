import { StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

import { AppText } from './AppText';

export interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function Section({ title, description, children, action }: SectionProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      {title || action ? (
        <View style={styles.header}>
          <View style={styles.copy}>
            {title ? (
              <AppText variant="h2" accessibilityRole="header">
                {title}
              </AppText>
            ) : null}
            {description ? (
              <AppText variant="small" color={colors.textMuted}>
                {description}
              </AppText>
            ) : null}
          </View>
          {action}
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  body: {
    gap: spacing.sm,
  },
});
