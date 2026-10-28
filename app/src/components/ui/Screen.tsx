import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { maxContentWidth, spacing } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

import { AppBar } from './AppBar';
import { AppText } from './AppText';
import { EnvironmentBadge } from './EnvironmentBadge';

export interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  brand?: boolean;
  action?: React.ReactNode;
  onBack?: () => void;
  scroll?: boolean;
  contentStyle?: object;
  showEnvironment?: boolean;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export function Screen({
  children,
  title,
  subtitle,
  showBack = false,
  brand = false,
  action,
  onBack,
  scroll = true,
  contentStyle,
  showEnvironment = true,
  scrollViewRef,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = spacing.xl + insets.bottom;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {title ? (
        <AppBar title={title} showBack={showBack} brand={brand} action={action} onBack={onBack} />
      ) : null}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {showEnvironment ? <EnvironmentBadge /> : null}
            {subtitle ? (
              <AppText variant="small" color={colors.textMuted}>
                {subtitle}
              </AppText>
            ) : null}
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, styles.flex, { paddingBottom: bottomPadding }, contentStyle]}>
            {showEnvironment ? <EnvironmentBadge /> : null}
            {subtitle ? (
              <AppText variant="small" color={colors.textMuted}>
                {subtitle}
              </AppText>
            ) : null}
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
});
