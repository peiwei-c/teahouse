import React, { useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from 'react-native-google-mobile-ads';
import { AD_KEYWORDS, BANNER_AD_UNIT_ID } from '../ads/ids';
import { TEA } from '../theme/tea';

const unitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : BANNER_AD_UNIT_ID;

export function AdBanner() {
  const bannerRef = useRef<BannerAd>(null);
  const [visible, setVisible] = useState(false);

  useForeground(() => {
    if (Platform.OS === 'ios') {
      bannerRef.current?.load();
    }
  });

  return (
    <View style={[styles.bar, !visible && styles.hidden]} pointerEvents={visible ? 'auto' : 'none'}>
      <BannerAd
        ref={bannerRef}
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          keywords: AD_KEYWORDS,
        }}
        onAdLoaded={() => setVisible(true)}
        onAdFailedToLoad={() => setVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: TEA.woodDark,
    overflow: 'hidden',
  },
  hidden: {
    height: 0,
  },
});
