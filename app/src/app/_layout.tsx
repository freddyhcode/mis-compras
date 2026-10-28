import '@/global.css';

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider, useAppData } from '@/shared/providers/AppDataProvider';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function ThemedApp() {
  const { colors, theme, loading } = useAppData();

  useEffect(() => {
    if (loading) return;
    // El splash nativo se mantiene hasta que la base de datos y los ajustes están listos.
    SplashScreen.hideAsync().catch(() => undefined);
  }, [loading]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const browser = globalThis as unknown as {
      document?: {
        documentElement: { style: { setProperty: (name: string, value: string) => void } };
      };
    };
    browser.document?.documentElement.style.setProperty('--app-focus', colors.primary);
  }, [colors.primary]);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <ThemedApp />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
