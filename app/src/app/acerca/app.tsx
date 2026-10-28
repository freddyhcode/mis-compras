import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SettingsRow } from '@/components/ui/SettingsRow';
import { spacing } from '@/constants/theme';
import { useStrings } from '@/i18n/useStrings';
import { useAppData } from '@/shared/providers/AppDataProvider';
import { useTheme } from '@/theme/useTheme';

export default function AppInfoScreen() {
  const s = useStrings();
  const { appVersion } = useAppData();
  const { colors } = useTheme();

  return (
    <Screen title={s.settings.appInfo} showBack>
      <Card style={styles.card}>
        <AppText variant="h1" color={colors.primary}>
          {s.appName}
        </AppText>
        <AppText variant="small" color={colors.textMuted}>
          {s.settings.version} {appVersion}
        </AppText>
        <AppText variant="small" color={colors.textMuted}>
          {s.about.whatIsBody}
        </AppText>
        <AppText variant="small" color={colors.textMuted}>
          {s.about.localBody}
        </AppText>
        <AppText variant="small" color={colors.textMuted}>
          {s.about.licenseTitle}: {s.about.licenseBody}
        </AppText>
      </Card>

      <SettingsRow
        icon="document-text-outline"
        title={s.settings.legal}
        description={s.settings.legalDesc}
        onPress={() => router.push('/legal')}
      />

      <View style={styles.footer}>
        <AppText variant="caption" color={colors.textMuted} align="center">
          {s.about.madeIn}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  footer: {
    paddingTop: spacing.lg,
  },
});
