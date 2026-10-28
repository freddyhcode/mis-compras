import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { radius, spacing } from '@/constants/theme';
import { useStrings } from '@/i18n/useStrings';
import { branding } from '@/shared/config/branding';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

function isConfigured(value: string): boolean {
  return value.trim().length > 0 && value !== 'No definido';
}

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function LinkRow({
  icon,
  label,
  value,
  href,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  href?: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const active = isConfigured(value) && Boolean(href);

  const content = (
    <>
      <View style={styles.linkIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.linkCopy}>
        <AppText variant="caption" color={colors.textMuted}>
          {label}
        </AppText>
        <AppText
          variant="small"
          color={active ? colors.text : colors.textMuted}
          numberOfLines={1}
        >
          {value}
        </AppText>
      </View>
      {active ? <Ionicons name="open-outline" size={16} color={colors.textMuted} /> : null}
    </>
  );

  if (!active || !href) {
    return <View style={styles.linkRow}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${label}: ${value}`}
      onPress={() => {
        void Linking.openURL(href).catch(() => undefined);
      }}
      style={({ pressed }) => [styles.linkRow, pressed ? styles.pressed : null]}
    >
      {content}
    </Pressable>
  );
}

export default function CreatorScreen() {
  const s = useStrings();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const initial = branding.creator.trim().charAt(0).toUpperCase() || 'C';
  const contactHref = isConfigured(branding.contact)
    ? branding.contact.includes('@')
      ? `mailto:${branding.contact}`
      : branding.contact
    : undefined;

  return (
    <Screen title={s.settings.creator} showBack>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <AppText variant="h1" color={colors.onPrimary}>
              {initial}
            </AppText>
          </View>
          <View style={styles.identity}>
            <AppText variant="h2" numberOfLines={1}>
              {branding.creator}
            </AppText>
            <AppText variant="small" color={colors.textMuted}>
              {s.about.madeIn}
            </AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.links}>
          <LinkRow
            icon="globe-outline"
            label={s.settings.website}
            value={branding.website}
            href={isUrl(branding.website) ? branding.website : undefined}
          />
          <LinkRow
            icon="logo-github"
            label={s.settings.github}
            value={branding.github}
            href={isUrl(branding.github) ? branding.github : undefined}
          />
          <LinkRow
            icon="mail-outline"
            label={s.settings.contact}
            value={branding.contact}
            href={contactHref}
          />
          <LinkRow
            icon="cafe-outline"
            label={s.settings.support}
            value={branding.support}
            href={isUrl(branding.support) ? branding.support : undefined}
          />
        </View>
      </Card>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      gap: spacing.lg,
      padding: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.primarySoft,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    identity: {
      flex: 1,
      gap: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    links: {
      gap: spacing.xs,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 52,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.sm,
    },
    linkIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.sm,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    linkCopy: {
      flex: 1,
      gap: 1,
    },
    pressed: {
      backgroundColor: colors.primarySoft,
    },
  });
