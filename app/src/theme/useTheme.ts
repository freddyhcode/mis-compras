import { useAppData } from '@/shared/providers/AppDataProvider';

export function useTheme() {
  const { colors, theme, accent, setTheme, setAccent } = useAppData();
  return { colors, theme, accent, setTheme, setAccent };
}
