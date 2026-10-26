import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';
import { AppProvider } from './src/context/AppContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { NotificationProvider } from './src/context/NotificationContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  useEffect(() => {
    // Release native OS splash immediately so our rich animated splash screen is visible
    const timer = setTimeout(async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {}
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppProvider>
          <NotificationProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </NotificationProvider>
        </AppProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
