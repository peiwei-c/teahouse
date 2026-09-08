import React from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Face } from '../engine/faces';
import { IMAGES } from '../theme/images';
import { TEA } from '../theme/tea';
import { FaceArt, faceLabel } from './FaceArt';

export function tileDepthFor(tileW: number): number {
  return Math.max(4, Math.round(tileW * 0.08));
}

type LayerLook = {
  border: string;
  ridge: string;
  face: string;
  shadow: string;
  nativeShadow: string;
  shadowX: number;
  shadowY: number;
  blur: number;
  shadowAlpha: number;
};

const LAYER_LOOK: LayerLook[] = [
  {
    border: '#d6c4a4',
    ridge: '#c45c3a',
    face: '#fffdf8',
    shadow: 'rgba(18, 8, 2, 0.22)',
    nativeShadow: '#1a0c04',
    shadowX: 2,
    shadowY: 3,
    blur: 4,
    shadowAlpha: 0.22,
  },
  {
    border: '#163a8c',
    ridge: '#122c6e',
    face: '#f4f7ff',
    shadow: 'rgba(8, 18, 56, 0.42)',
    nativeShadow: '#081238',
    shadowX: 3,
    shadowY: 5,
    blur: 7,
    shadowAlpha: 0.42,
  },
  {
    border: '#c41422',
    ridge: '#9a1018',
    face: '#fff5f4',
    shadow: 'rgba(72, 8, 10, 0.44)',
    nativeShadow: '#48080a',
    shadowX: 4,
    shadowY: 6,
    blur: 8,
    shadowAlpha: 0.44,
  },
  {
    border: '#1a1412',
    ridge: '#0e0c0b',
    face: '#f7f6f4',
    shadow: 'rgba(6, 4, 4, 0.5)',
    nativeShadow: '#060404',
    shadowX: 4,
    shadowY: 7,
    blur: 9,
    shadowAlpha: 0.5,
  },
  {
    border: '#6a148c',
    ridge: '#4e0e68',
    face: '#faf4ff',
    shadow: 'rgba(42, 6, 58, 0.46)',
    nativeShadow: '#2a063a',
    shadowX: 5,
    shadowY: 8,
    blur: 10,
    shadowAlpha: 0.46,
  },
  {
    border: '#0a5a6e',
    ridge: '#084656',
    face: '#f2fafb',
    shadow: 'rgba(4, 28, 36, 0.46)',
    nativeShadow: '#041c24',
    shadowX: 5,
    shadowY: 8,
    blur: 11,
    shadowAlpha: 0.46,
  },
  {
    border: '#8c1028',
    ridge: '#6e0c1e',
    face: '#fff4f6',
    shadow: 'rgba(52, 6, 14, 0.48)',
    nativeShadow: '#34060e',
    shadowX: 5,
    shadowY: 9,
    blur: 12,
    shadowAlpha: 0.48,
  },
  {
    border: '#241878',
    ridge: '#1a1260',
    face: '#f4f3ff',
    shadow: 'rgba(12, 8, 48, 0.48)',
    nativeShadow: '#0c0830',
    shadowX: 6,
    shadowY: 9,
    blur: 12,
    shadowAlpha: 0.48,
  },
  {
    border: '#3a0e4a',
    ridge: '#2a0a36',
    face: '#f8f2fa',
    shadow: 'rgba(24, 4, 32, 0.5)',
    nativeShadow: '#180420',
    shadowX: 6,
    shadowY: 10,
    blur: 13,
    shadowAlpha: 0.5,
  },
];

export function lookForLayer(layer: number): LayerLook {
  const index = Math.min(Math.max(Math.floor(layer), 1), LAYER_LOOK.length) - 1;
  return LAYER_LOOK[index];
}

type Props = {
  face: Face;
  width: number;
  height: number;
  depth?: number;
  layer?: number;
  free?: boolean;
  picked?: boolean;
  pointed?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

export function Tile({
  face,
  width,
  height,
  depth = tileDepthFor(width),
  layer = 1,
  free,
  picked,
  pointed,
  onPress,
  disabled,
}: Props) {
  const lift = picked || pointed;
  const glow = free || lift;
  const look = lookForLayer(layer);
  const ring = pointed ? TEA.playRed : lift ? '#3dcc6a' : glow ? '#ffe08a' : null;
  const oSize = Math.round(Math.min(width, height) * 0.78);
  const oStroke = Math.max(3, Math.round(oSize * 0.14));
  const drop = Platform.OS === 'web'
    ? {
        boxShadow: `${look.shadowX}px ${look.shadowY}px ${look.blur}px ${look.shadow}`,
      }
    : {
        shadowColor: look.nativeShadow,
        shadowOffset: { width: look.shadowX, height: look.shadowY },
        shadowOpacity: look.shadowAlpha,
        shadowRadius: look.blur,
      };
  const faceRing = ring
    ? Platform.OS === 'web'
      ? { boxShadow: `0 0 0 3px ${ring}` }
      : {
          shadowColor: ring,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 3,
        }
    : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={
        pointed ? `${faceLabel(face)} tile, hinted` : `${faceLabel(face)} tile`
      }
      style={{
        width,
        height,
        zIndex: lift ? 4 : 1,
        transform: [{ translateX: lift ? -1 : 0 }, { translateY: lift ? -4 : 0 }],
      }}
    >
      <View
        pointerEvents="none"
        style={[
          styles.ridge,
          {
            width,
            height,
            backgroundColor: look.ridge,
            transform: [{ translateX: depth }, { translateY: depth }],
            ...drop,
          },
        ]}
      />
      <View
        style={[
          styles.face,
          {
            width,
            height,
            backgroundColor: look.face,
            borderColor: look.border,
            borderWidth: layer > 1 ? 3 : 1.75,
            ...faceRing,
          },
        ]}
      >
        <View pointerEvents="none" style={styles.textureWrap}>
          <Image source={IMAGES.tilePaper} resizeMode="cover" style={styles.texture} />
          <LinearGradient
            colors={['rgba(255,255,255,0.34)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.sheen}
          />
        </View>
        <View style={styles.inner}>
          <FaceArt face={face} size={Math.min(width, height)} />
        </View>
        {pointed ? (
          <View pointerEvents="none" style={styles.hintOWrap}>
            <View
              style={[
                styles.hintOHalo,
                {
                  width: oSize,
                  height: oSize,
                  borderRadius: oSize / 2,
                  borderWidth: oStroke + 3,
                },
              ]}
            />
            <View
              style={[
                styles.hintO,
                {
                  width: oSize,
                  height: oSize,
                  borderRadius: oSize / 2,
                  borderWidth: oStroke,
                },
              ]}
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ridge: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 10,
  },
  face: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textureWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  texture: {
    width: '100%',
    height: '100%',
    opacity: 0.42,
  },
  sheen: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  inner: {
    flex: 1,
    margin: 3,
    borderRadius: 7,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintOWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintOHalo: {
    position: 'absolute',
    borderColor: TEA.ivory,
  },
  hintO: {
    borderColor: TEA.playRed,
    backgroundColor: 'transparent',
  },
});
