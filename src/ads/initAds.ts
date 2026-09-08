import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { preloadInterstitial } from './interstitial';

export async function initAds(): Promise<void> {
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
    });
    await mobileAds().initialize();
    preloadInterstitial();
  } catch {
    // Keep the table playable if ads fail to start.
  }
}
