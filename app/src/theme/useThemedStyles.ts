import { useMemo } from 'react';

import { useTheme } from './useTheme';
import type { ThemeColors } from './theme';

export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
