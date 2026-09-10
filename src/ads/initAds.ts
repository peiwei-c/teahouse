import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { preloadInterstitial } from './interstitial';

let started: Promise<boolean> | null = null;

async function startAds(): Promise<boolean> {
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
    });
    await mobileAds().initialize();
    preloadInterstitial();
    return true;
  } catch {
    return false;
  }
}

export function ensureAds(): Promise<boolean> {
  if (!started) started = startAds();
  return started;
}

export async function initAds(): Promise<void> {
  await ensureAds();
}
