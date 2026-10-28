import Constants from 'expo-constants';

export const APP_MODES = ['development', 'demo', 'production'] as const;

export type AppMode = (typeof APP_MODES)[number];

const raw = Constants.expoConfig?.extra?.appMode;
export const appMode: AppMode = APP_MODES.includes(raw as AppMode)
  ? (raw as AppMode)
  : 'production';

export const isDevelopment = appMode === 'development';
export const isDemo = appMode === 'demo';
export const isProduction = appMode === 'production';
