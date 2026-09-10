import React from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { unlockAudio } from '../audio/session';
import { APP_NAME, APP_PLAY, APP_PLAY_HINT } from '../constants/brand';
import { greeting, specFor, type Face } from '../engine/table';
import { useGameStore } from '../store/gameStore';
import { FACE_IMAGES, IMAGES } from '../theme/images';
import { FONTS, TEA } from '../theme/tea';
import { CreamButton } from './TeaScene';
import { Tile } from './Tile';
import { UiText } from './UiText';

const SHOWCASE: Array<{ face: Face; left: number; top: number; layer: number }> = [
  { face: 'cat', left: 0, top: 18, layer: 1 },
  { face: 'corgi', left: 48, top: 18, layer: 1 },
  { face: 'calico', left: 96, top: 18, layer: 1 },
  { face: 'kettle', left: 144, top: 18, layer: 1 },
  { face: 'arctic', left: 192, top: 18, layer: 1 },
  { face: 'persimmon', left: 96, top: 18, layer: 2 },
  { face: 'shiba', left: 144, top: 18, layer: 2 },
];

export function HomeScreen() {
  const startPlay = useGameStore((s) => s.startPlay);
  const openSettings = useGameStore((s) => s.openSettings);
  const level = useGameStore((s) => s.settings.level);
  const hello = greeting(new Date());
  const spec = specFor(level);

  return (
    <ImageBackground source={IMAGES.splash} style={styles.bg} resizeMode="cover">
      <View style={styles.scrim} />
      <View style={styles.center}>
        <View style={styles.plaque}>
          <UiText fit style={styles.hello}>
            {hello}
          </UiText>
          <UiText fit style={styles.title}>
            {APP_NAME}
          </UiText>
          <UiText fit style={styles.line}>
            Level {spec.level} · {spec.layers} {spec.layers === 1 ? 'layer' : 'layers'}
          </UiText>
        </View>

        <View style={styles.spread}>
          {SHOWCASE.map((item) => (
            <View
              key={`${item.face}-${item.left}`}
              style={[
                styles.spreadTile,
                {
                  left: item.left + (item.layer - 1) * 5,
                  top: item.top + (item.layer - 1) * 5,
                  zIndex: item.layer,
                },
              ]}
            >
              <Tile face={item.face} width={48} height={52} layer={item.layer} />
            </View>
          ))}
        </View>

        <View style={styles.tray}>
          <CreamButton
            onPress={() => {
              unlockAudio();
              startPlay();
            }}
            style={styles.play}
            accessibilityLabel="Play"
          >
            <Image source={FACE_IMAGES.cat} style={styles.playCat} />
            <UiText fit style={styles.playTitle}>
              {APP_PLAY}
            </UiText>
            <UiText numberOfLines={2} style={styles.playHint}>
              {APP_PLAY_HINT} · {spec.tiles} tiles
            </UiText>
          </CreamButton>
          <CreamButton
            onPress={() => {
              unlockAudio();
              openSettings();
            }}
            style={styles.settings}
            accessibilityLabel="Settings"
          >
            <UiText fit style={styles.settingsText}>
              Settings
            </UiText>
          </CreamButton>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18, 8, 4, 0.18)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 18,
  },
  plaque: {
    minWidth: 260,
    maxWidth: '100%',
    alignItems: 'center',
    backgroundColor: '#e8c25a',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff3c0',
    shadowColor: '#8a5a18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  hello: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    color: TEA.ink,
    letterSpacing: 0.4,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 34,
    color: TEA.ink,
    lineHeight: 38,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  line: {
    marginTop: 4,
    fontFamily: FONTS.ui,
    fontSize: 15,
    color: TEA.inkSoft,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  spread: {
    width: 260,
    height: 100,
    position: 'relative',
  },
  spreadTile: {
    position: 'absolute',
  },
  tray: {
    width: '100%',
    maxWidth: 340,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#5a3014',
  },
  play: {
    flex: 1,
    minHeight: 108,
    backgroundColor: TEA.ivory,
    borderWidth: 2,
    borderColor: '#fff8e0',
  },
  playCat: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginBottom: 2,
  },
  playTitle: {
    fontFamily: FONTS.ui,
    fontSize: 32,
    color: TEA.ink,
  },
  playHint: {
    fontFamily: FONTS.uiBold,
    fontSize: 15,
    color: TEA.inkSoft,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  settings: {
    minHeight: 108,
    paddingHorizontal: 12,
    backgroundColor: '#e8c547',
    flexGrow: 0,
    flexShrink: 0,
  },
  settingsText: {
    fontFamily: FONTS.ui,
    fontSize: 18,
    lineHeight: 22,
    color: TEA.ink,
    textAlign: 'center',
  },
});
