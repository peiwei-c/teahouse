import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { APP_NAME } from '../constants/brand';
import { IMAGES } from '../theme/images';
import { TEA } from '../theme/tea';
import { UiText } from './UiText';

export function LoadingScreen() {
  return (
    <ImageBackground source={IMAGES.splash} style={styles.bg} resizeMode="cover">
      <View style={styles.scrim}>
        <UiText fit style={styles.title}>
          {APP_NAME}
        </UiText>
        <UiText fit style={styles.line}>
          Setting the table…
        </UiText>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 6, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: TEA.ivory,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  line: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: TEA.goldLight,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
});
