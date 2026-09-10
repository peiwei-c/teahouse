import React, { useEffect, useReducer, useState } from 'react';
import { AppState, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { BANNER_RETRY_MS, initialBanner, reduceBanner } from '../ads/banner';
import { AD_KEYWORDS, BANNER_AD_UNIT_ID } from '../ads/ids';
import { ensureAds } from '../ads/initAds';
import { watchInterstitial } from '../ads/interstitial';
import { TEA } from '../theme/tea';

const unitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : BANNER_AD_UNIT_ID;

export function AdBanner() {
  const { width } = useWindowDimensions();
  const [state, dispatch] = useReducer(reduceBanner, initialBanner);
  const [sdkReady, setSdkReady] = useState(false);
  const [banner, setBanner] = useState<BannerAd | null>(null);

  useEffect(() => {
    let live = true;
    void ensureAds().then((ok) => {
      if (live) setSdkReady(ok);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    return watchInterstitial((life) => {
      dispatch(life === 'opened' ? 'interstitial-opened' : 'interstitial-closed');
    });
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') dispatch('foreground');
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (state.phase !== 'loading' || state.fails === 0) return;
    const timer = setTimeout(() => banner?.load(), BANNER_RETRY_MS * state.fails);
    return () => clearTimeout(timer);
  }, [banner, state.phase, state.fails, state.generation]);

  if (!sdkReady || state.phase === 'hidden') return null;

  return (
    <View style={styles.bar} pointerEvents={state.phase === 'shown' ? 'auto' : 'none'}>
      <BannerAd
        key={state.generation}
        ref={setBanner}
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        width={Math.max(320, Math.floor(width))}
        requestOptions={{
          keywords: AD_KEYWORDS,
        }}
        onAdLoaded={() => dispatch('loaded')}
        onAdFailedToLoad={() => dispatch('failed')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: TEA.woodDark,
  },
});
