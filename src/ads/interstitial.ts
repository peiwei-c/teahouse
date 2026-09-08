import { Platform, StatusBar } from 'react-native';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { AD_KEYWORDS, INTERSTITIAL_AD_UNIT_ID } from './ids';

const unitId = __DEV__ ? TestIds.INTERSTITIAL : INTERSTITIAL_AD_UNIT_ID;

let interstitial: InterstitialAd | null = null;

export function preloadInterstitial(): void {
  if (!interstitial) {
    interstitial = InterstitialAd.createForAdRequest(unitId, {
      keywords: AD_KEYWORDS,
    });
    interstitial.addAdEventListener(AdEventType.OPENED, () => {
      if (Platform.OS === 'ios') StatusBar.setHidden(true);
    });
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      if (Platform.OS === 'ios') StatusBar.setHidden(false);
      interstitial?.load();
    });
    interstitial.addAdEventListener(AdEventType.ERROR, () => {
      if (Platform.OS === 'ios') StatusBar.setHidden(false);
      interstitial?.load();
    });
  }
  interstitial.load();
}

export function showInterstitial(): Promise<void> {
  if (!interstitial?.loaded) return Promise.resolve();

  const ad = interstitial;
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      unsubClosed();
      unsubError();
      resolve();
    };
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, finish);
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, finish);
    ad.show().catch(finish);
  });
}
