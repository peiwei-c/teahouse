import React from 'react';
import { Image } from 'react-native';
import { FACE_LABELS, type Face } from '../engine/faces';
import { FACE_IMAGES } from '../theme/images';

export function faceLabel(face: Face): string {
  return FACE_LABELS[face];
}

export function FaceArt({ face, size }: { face: Face; size: number }) {
  const art = Math.round(size * 0.86);
  return (
    <Image
      source={FACE_IMAGES[face]}
      style={{ width: art, height: art, borderRadius: Math.round(art * 0.12) }}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    />
  );
}
