export type ThemeMode = 'light' | 'dark';

export const ACCENTS = ['lavanda', 'menta', 'durazno', 'rosa', 'cielo'] as const;

export type Accent = (typeof ACCENTS)[number];

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  onPrimary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  warningBorder: string;
  danger: string;
  dangerSoft: string;
  onDanger: string;
  gold: string;
  overlay: string;
}

export const palettes: Record<ThemeMode, ThemeColors> = {
  light: {
    primary: '#8B6FAF',
    primaryDark: '#6F568F',
    primarySoft: '#F0EAF7',
    onPrimary: '#FFFFFF',
    background: '#F9F8FB',
    surface: '#FFFFFF',
    text: '#2F2A36',
    textMuted: '#7C7487',
    border: '#E2DDE8',
    success: '#5F9E7F',
    successSoft: '#E8F4EE',
    warning: '#9A6B2F',
    warningSoft: '#FFF3E2',
    warningBorder: '#EED9B8',
    danger: '#C06464',
    dangerSoft: '#FBE9E9',
    onDanger: '#FFFFFF',
    gold: '#D6A76C',
    overlay: 'rgba(47, 42, 54, 0.45)',
  },
  dark: {
    primary: '#C4B0E6',
    primaryDark: '#A88FD0',
    primarySoft: '#3A3247',
    onPrimary: '#221E28',
    background: '#1A181D',
    surface: '#26222D',
    text: '#F4EFF8',
    textMuted: '#B7AEC4',
    border: '#3E3748',
    success: '#8FD3B0',
    successSoft: '#233A2E',
    warning: '#E0B77A',
    warningSoft: '#3A2E1F',
    warningBorder: '#5A462B',
    danger: '#E08A8A',
    dangerSoft: '#3A2323',
    onDanger: '#221E28',
    gold: '#E0B77A',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

type AccentTone = Pick<
  ThemeColors,
  'primary' | 'primaryDark' | 'primarySoft' | 'onPrimary' | 'background'
>;

export const accentPalettes: Record<Accent, Record<ThemeMode, AccentTone>> = {
  lavanda: {
    light: {
      primary: '#8B6FAF',
      primaryDark: '#6F568F',
      primarySoft: '#F0EAF7',
      onPrimary: '#FFFFFF',
      background: '#FAF9FC',
    },
    dark: {
      primary: '#C4B0E6',
      primaryDark: '#A88FD0',
      primarySoft: '#3A3247',
      onPrimary: '#221E28',
      background: '#1A181D',
    },
  },
  menta: {
    light: {
      primary: '#5F9E8A',
      primaryDark: '#477A6A',
      primarySoft: '#E8F4EE',
      onPrimary: '#FFFFFF',
      background: '#F8FBF9',
    },
    dark: {
      primary: '#9FD9C4',
      primaryDark: '#7FBFA8',
      primarySoft: '#233A2E',
      onPrimary: '#16241E',
      background: '#181C1A',
    },
  },
  durazno: {
    light: {
      primary: '#C98A6B',
      primaryDark: '#A66C51',
      primarySoft: '#FBEDE6',
      onPrimary: '#FFFFFF',
      background: '#FCFAF8',
    },
    dark: {
      primary: '#F0B79A',
      primaryDark: '#D3987B',
      primarySoft: '#3A2A22',
      onPrimary: '#2A1A14',
      background: '#1D1A18',
    },
  },
  rosa: {
    light: {
      primary: '#B9768E',
      primaryDark: '#965A70',
      primarySoft: '#F9EAF0',
      onPrimary: '#FFFFFF',
      background: '#FCF9FA',
    },
    dark: {
      primary: '#E8AFC2',
      primaryDark: '#C98FA4',
      primarySoft: '#3A2530',
      onPrimary: '#2A161F',
      background: '#1D181B',
    },
  },
  cielo: {
    light: {
      primary: '#6E93B8',
      primaryDark: '#537596',
      primarySoft: '#EAF2FA',
      onPrimary: '#FFFFFF',
      background: '#F8FAFC',
    },
    dark: {
      primary: '#A9CBE8',
      primaryDark: '#88AECC',
      primarySoft: '#22303A',
      onPrimary: '#14202A',
      background: '#171B1E',
    },
  },
};

export function themeColors(mode: ThemeMode, accent: Accent): ThemeColors {
  return {
    ...palettes[mode],
    ...accentPalettes[accent][mode],
  };
}
