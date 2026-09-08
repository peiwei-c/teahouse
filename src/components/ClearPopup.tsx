import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { formatClearTime } from '../engine/clearTime';
import { IMAGES } from '../theme/images';
import { FONTS, TEA } from '../theme/tea';
import { CreamButton } from './TeaScene';
import { UiText } from './UiText';

type Props = {
  visible: boolean;
  clearMs: number;
  nextLabel: string;
  onNext: () => void;
};

export function ClearPopup({ visible, clearMs, nextLabel, onNext }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.scrim} accessibilityViewIsModal>
      <View style={styles.card} accessibilityRole="alert">
        <Image source={IMAGES.companion} style={styles.cat} resizeMode="cover" />
        <UiText numberOfLines={2} style={styles.title}>
          The table is clear
        </UiText>
        <UiText fit style={styles.lead}>
          You took
        </UiText>
        <UiText numberOfLines={2} style={styles.time}>
          {formatClearTime(clearMs)}
        </UiText>
        <CreamButton onPress={onNext} accessibilityLabel={nextLabel} style={styles.next}>
          <UiText fit style={styles.nextLabel}>
            {nextLabel}
          </UiText>
        </CreamButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(13, 40, 28, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    zIndex: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: TEA.ivory,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: TEA.gold,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: TEA.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  cat: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 10,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 26,
    color: TEA.ink,
    textAlign: 'center',
  },
  lead: {
    fontFamily: FONTS.ui,
    fontSize: 16,
    color: TEA.inkSoft,
    marginTop: 10,
  },
  time: {
    fontFamily: FONTS.display,
    fontSize: 28,
    color: TEA.ink,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  next: {
    alignSelf: 'stretch',
  },
  nextLabel: {
    fontFamily: FONTS.ui,
    fontSize: 22,
    color: TEA.ink,
  },
});
