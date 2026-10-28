import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { SettingsRow } from '@/components/ui/SettingsRow';
import { spacing } from '@/constants/theme';
import { exportPurchasesToXlsx } from '@/features/purchases/exportXlsx';
import { seedDemoData } from '@/features/purchases/seeder';
import type { Language } from '@/i18n/language';
import { useStrings } from '@/i18n/useStrings';
import { useAppData } from '@/shared/providers/AppDataProvider';
import { appMode, isDevelopment } from '@/shared/runtime/appMode';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

export default function SettingsScreen() {
  const s = useStrings();
  const { purchases, resetAll, theme, accent, createPurchase, addItem, language, setLanguage } =
    useAppData();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [seedOpen, setSeedOpen] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const modeLabel =
    appMode === 'development'
      ? s.env.development
      : appMode === 'demo'
        ? s.env.demo
        : s.env.production;

  const handleExport = async () => {
    setExporting(true);
    setNotice(null);
    try {
      await exportPurchasesToXlsx(purchases, s);
      setNotice({
        title: s.settings.exportSuccess,
        message: s.settings.exportSuccessBody,
      });
    } catch (cause) {
      setNotice({
        title: s.settings.exportError,
        message: cause instanceof Error ? cause.message : s.settings.exportError,
      });
    } finally {
      setExporting(false);
    }
  };

  const handleLanguage = async (next: Language) => {
    try {
      await setLanguage(next);
    } catch {
      setNotice({
        title: s.settings.language,
        message: s.settings.deleteError,
      });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setNotice(null);
    try {
      await resetAll();
      setDeleteOpen(false);
      setNotice({
        title: s.settings.deleteTitle,
        message: s.settings.deleteSuccess,
      });
    } catch (cause) {
      setDeleteOpen(false);
      setNotice({
        title: s.settings.deleteTitle,
        message: cause instanceof Error ? cause.message : s.settings.deleteError,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setNotice(null);
    try {
      const count = await seedDemoData({ createPurchase, addItem });
      setSeedOpen(false);
      setNotice({
        title: s.settings.seed,
        message: s.settings.seedSuccess(count),
      });
    } catch (cause) {
      setSeedOpen(false);
      setNotice({
        title: s.settings.seed,
        message: cause instanceof Error ? cause.message : s.settings.seedError,
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Screen
      title={s.settings.title}
      brand
    >
      <Section title={s.settings.language}>
        <View style={styles.chips}>
          <Chip
            label={s.settings.spanish}
            selected={language === 'es'}
            onPress={() => void handleLanguage('es')}
          />
          <Chip
            label={s.settings.english}
            selected={language === 'en'}
            onPress={() => void handleLanguage('en')}
          />
        </View>
      </Section>

      <Section title={s.settings.appearance}>
        <SettingsRow
          icon="color-palette-outline"
          title={s.settings.appearance}
          description={`${theme === 'light' ? s.settings.light : s.settings.dark} · ${
            s.accents[accent]
          }`}
          onPress={() => router.push('/acerca/apariencia')}
        />
      </Section>

      <Section title={s.settings.data}>
        <SettingsRow
          icon="download-outline"
          title={s.settings.export}
          description={s.settings.exportDesc}
          onPress={exporting ? undefined : () => void handleExport()}
          trailing={exporting ? <AppText variant="caption">…</AppText> : undefined}
        />
        <SettingsRow
          icon="trash-outline"
          title={s.settings.deleteAll}
          description={s.settings.deleteAllDesc}
          destructive
          onPress={() => setDeleteOpen(true)}
        />
      </Section>

      <Section title={s.settings.aboutSection}>
        <SettingsRow
          icon="person-outline"
          title={s.settings.creator}
          description={s.settings.creatorDesc}
          onPress={() => router.push('/acerca/creador')}
        />
        <SettingsRow
          icon="phone-portrait-outline"
          title={s.settings.appInfo}
          description={s.settings.appInfoDesc}
          onPress={() => router.push('/acerca/app')}
        />
      </Section>

      {isDevelopment ? (
        <Section title={s.settings.dev}>
          <SettingsRow
            icon="construct-outline"
            title={s.settings.mode}
            description={modeLabel}
          />
          <SettingsRow
            icon="flask-outline"
            title={s.settings.seed}
            description={s.settings.seedDesc}
            onPress={seeding ? undefined : () => setSeedOpen(true)}
            trailing={seeding ? <AppText variant="caption">…</AppText> : undefined}
          />
        </Section>
      ) : null}

      <Card style={styles.privacy}>
        <AppText variant="small" color={colors.textMuted}>
          {s.settings.privacy}
        </AppText>
      </Card>

      {notice ? (
        <Dialog
          visible
          title={notice.title}
          primaryLabel={s.common.close}
          onPrimary={() => setNotice(null)}
        >
          <AppText variant="small" color={colors.textMuted}>
            {notice.message}
          </AppText>
        </Dialog>
      ) : null}

      <Dialog
        visible={deleteOpen}
        title={s.settings.deleteTitle}
        primaryLabel={s.settings.deleteConfirm}
        primaryVariant="danger"
        primaryLoading={deleting}
        onPrimary={() => void handleDelete()}
        secondaryLabel={s.common.cancel}
        onSecondary={() => setDeleteOpen(false)}
      >
        <AppText variant="small" color={colors.textMuted}>
          {s.settings.deleteBody}
        </AppText>
      </Dialog>

      <Dialog
        visible={seedOpen}
        title={s.settings.seed}
        primaryLabel={s.settings.seedConfirm}
        primaryLoading={seeding}
        onPrimary={() => void handleSeed()}
        secondaryLabel={s.common.cancel}
        onSecondary={() => setSeedOpen(false)}
      >
        <AppText variant="small" color={colors.textMuted}>
          {s.settings.seedBody}
        </AppText>
      </Dialog>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    privacy: {
      gap: spacing.sm,
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
    },
  });
