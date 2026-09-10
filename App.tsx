import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { initAds } from './src/ads/initAds';
import { AdBanner } from './src/components/AdBanner';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { HomeScreen } from './src/components/HomeScreen';
import { LoadingScreen } from './src/components/LoadingScreen';
import { PlayScreen } from './src/components/PlayScreen';
import { SettingsScreen } from './src/components/SettingsScreen';
import { useGameAudio } from './src/audio/session';
import { useGameStore } from './src/store/gameStore';
import { FONT_MAP } from './src/theme/fonts';
import { ANDROID_TOP_INSET } from './src/theme/androidTopInset';
import { TEA } from './src/theme/tea';

void SplashScreen.preventAutoHideAsync();

const MIN_BOOT_MS = 700;

function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== 'web' || width <= 520) {
    return <>{children}</>;
  }
  const frameH = Math.min(844, Math.max(640, height - 24));
  const frameW = Math.round(frameH * (390 / 844));
  return (
    <View style={styles.webStage}>
      <View style={[styles.phone, { width: frameW, height: frameH }]}>{children}</View>
    </View>
  );
}

function AppShell() {
  const [fontsLoaded, fontError] = useFonts(FONT_MAP);
  const fontsReady = fontsLoaded || !!fontError;
  const screen = useGameStore((s) => s.screen);
  const hydrated = useGameStore((s) => s.hydrated);
  const hydrate = useGameStore((s) => s.hydrate);
  const goHome = useGameStore((s) => s.goHome);
  const [splashElapsed, setSplashElapsed] = useState(false);
  useGameAudio();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    void initAds();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSplashElapsed(true), MIN_BOOT_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated || !fontsReady) return;
    void SplashScreen.hideAsync();
  }, [hydrated, fontsReady]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (useGameStore.getState().screen !== 'home') {
        goHome();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [goHome]);

  if (!hydrated || !fontsReady || !splashElapsed) {
    return (
      <PhoneFrame>
        <LoadingScreen />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle="light-content" />
          <View style={styles.screen}>
            {screen === 'home' ? (
              <HomeScreen />
            ) : screen === 'settings' ? (
              <SettingsScreen />
            ) : (
              <PlayScreen />
            )}
          </View>
          <AdBanner />
        </SafeAreaView>
      </View>
    </PhoneFrame>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TEA.woodDark,
  },
  safe: {
    flex: 1,
    paddingTop: ANDROID_TOP_INSET,
  },
  screen: {
    flex: 1,
    minHeight: 0,
  },
  webStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#cbb392',
  },
  phone: {
    overflow: 'hidden',
    borderRadius: 36,
    borderWidth: 8,
    borderColor: '#5a3a28',
    backgroundColor: TEA.woodDark,
  },
});
