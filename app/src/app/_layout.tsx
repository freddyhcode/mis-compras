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
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppSplash } from '@/components/ui/AppSplash';
import { AppDataProvider, useAppData } from '@/shared/providers/AppDataProvider';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function ThemedApp() {
  const { colors, theme, loading } = useAppData();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const browser = globalThis as unknown as {
      document?: {
        documentElement: { style: { setProperty: (name: string, value: string) => void } };
      };
    };
    browser.document?.documentElement.style.setProperty('--app-focus', colors.primary);
  }, [colors.primary]);

  const showSplash = loading || !minElapsed;

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {showSplash ? (
        <AppSplash />
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <ThemedApp />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
