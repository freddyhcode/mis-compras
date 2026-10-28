import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { radius, spacing } from '@/constants/theme';
import { useStrings } from '@/i18n/useStrings';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import {
  ACCENTS,
  accentPalettes,
  themeColors,
  type Accent,
  type ThemeColors,
  type ThemeMode,
} from '@/theme/theme';

const modes: ThemeMode[] = ['light', 'dark'];

export default function AppearanceScreen() {
  const s = useStrings();
  const { colors, theme, accent, setTheme, setAccent } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Screen title={s.settings.appearance} showBack>
      <Section title={s.settings.theme}>
        <View style={styles.themeRow}>
          {modes.map((mode) => {
            const selected = theme === mode;
            const preview = themeColors(mode, accent);
            return (
              <Pressable
                key={mode}
                accessibilityRole="radio"
                accessibilityLabel={mode === 'light' ? s.settings.light : s.settings.dark}
                accessibilityState={{ selected }}
                onPress={() => void setTheme(mode)}
                style={({ pressed }) => [
                  styles.themeCard,
                  selected ? styles.selected : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <View
                  style={[
                    styles.preview,
                    { backgroundColor: preview.background, borderColor: preview.border },
                  ]}
                >
                  <View style={[styles.previewBar, { backgroundColor: preview.primary }]} />
                  <View style={[styles.previewLine, { backgroundColor: preview.textMuted }]} />
                  <View style={[styles.previewLineShort, { backgroundColor: preview.border }]} />
                </View>
                <View style={styles.themeLabel}>
                  <AppText variant="label" weight={selected ? '600' : '400'}>
                    {mode === 'light' ? s.settings.light : s.settings.dark}
                  </AppText>
                  {selected ? (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title={s.settings.color}>
        <View style={styles.colorList}>
          {ACCENTS.map((option: Accent) => {
            const selected = accent === option;
            const tone = accentPalettes[option][theme];
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityLabel={s.accents[option]}
                accessibilityState={{ selected }}
                onPress={() => void setAccent(option)}
                style={({ pressed }) => [
                  styles.colorRow,
                  selected ? styles.selected : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <View style={[styles.colorBlock, { backgroundColor: tone.primary }]} />
                <AppText variant="label" style={styles.colorLabel} weight={selected ? '600' : '400'}>
                  {s.accents[option]}
                </AppText>
                {selected ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Section>

      <AppText variant="caption" color={colors.textMuted} align="center">
        {s.settings.autoSave}
      </AppText>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    themeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    themeCard: {
      flex: 1,
      gap: spacing.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    preview: {
      height: 76,
      borderRadius: radius.sm,
      borderWidth: 1,
      padding: spacing.sm,
      gap: 6,
      justifyContent: 'center',
    },
    previewBar: {
      width: '55%',
      height: 10,
      borderRadius: 3,
    },
    previewLine: {
      width: '80%',
      height: 6,
      borderRadius: 3,
      opacity: 0.7,
    },
    previewLineShort: {
      width: '45%',
      height: 6,
      borderRadius: 3,
    },
    themeLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xs,
    },
    colorList: {
      gap: spacing.sm,
    },
    colorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 48,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    colorBlock: {
      width: 30,
      height: 30,
      borderRadius: 6,
    },
    colorLabel: {
      flex: 1,
    },
    selected: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    pressed: {
      opacity: 0.7,
    },
  });
