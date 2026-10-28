import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { fonts, radius, spacing } from '@/constants/theme';
import { useStrings } from '@/i18n/useStrings';
import { useTheme } from '@/theme/useTheme';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { ThemeColors } from '@/theme/theme';

import { AppText } from './AppText';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  inputStyle?: TextStyle;
}

export function TextField({
  label,
  help,
  error,
  required = false,
  inputStyle,
  onFocus,
  onBlur,
  multiline,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const s = useStrings();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <AppText variant="label">{label}</AppText>
        {required ? (
          <AppText variant="caption" color={colors.textMuted} weight="600">
            {s.common.required}
          </AppText>
        ) : null}
      </View>

      <TextInput
        {...rest}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={help}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          Platform.OS === 'web' ? styles.webInput : null,
          multiline ? styles.multiline : null,
          focused ? styles.inputFocused : null,
          error ? styles.inputError : null,
          inputStyle,
        ]}
      />

      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : help ? (
        <AppText variant="small" color={colors.textMuted}>
          {help}
        </AppText>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      gap: spacing.sm,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    input: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: 16,
      fontFamily: fonts.regular,
      color: colors.text,
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    inputError: {
      borderColor: colors.danger,
    },
    webInput: {
      outlineStyle: 'none',
    } as unknown as TextStyle,
    multiline: {
      minHeight: 96,
      textAlignVertical: 'top',
    },
  });
