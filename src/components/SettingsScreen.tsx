import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { PRIVACY_POLICY_URL } from '../constants/brand';
import { useGameStore } from '../store/gameStore';
import { TOP_BUFFER } from '../theme/androidTopInset';
import { FONTS, TEA } from '../theme/tea';
import { CreamButton, TeaScene } from './TeaScene';
import { UiText } from './UiText';

function Toggle({ on, onPress, label }: { on: boolean; onPress: () => void; label: string }) {
  return (
    <CreamButton
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      style={[styles.toggle, on && styles.toggleOn]}
    >
      <View style={[styles.knob, on && styles.knobOn]} />
    </CreamButton>
  );
}

export function SettingsScreen() {
  const goHome = useGameStore((s) => s.goHome);
  const settings = useGameStore((s) => s.settings);
  const toggleSetting = useGameStore((s) => s.toggleSetting);

  return (
    <TeaScene>
      <View style={styles.root}>
        <View style={styles.hud}>
          <CreamButton onPress={goHome} accessibilityLabel="Home">
            <UiText fit style={styles.hudText}>
              Home
            </UiText>
          </CreamButton>
          <View style={styles.chip}>
            <UiText fit style={styles.chipCount}>
              Settings
            </UiText>
            <UiText fit style={styles.chipLabel}>
              Level {settings.level}
            </UiText>
          </View>
        </View>

        <View style={styles.list}>
          <View style={styles.row}>
            <View style={styles.copy}>
              <UiText fit style={styles.name}>
                Sound
              </UiText>
              <UiText numberOfLines={2} style={styles.help}>
                Soft taps when a pair matches
              </UiText>
            </View>
            <Toggle
              on={settings.sound}
              onPress={() => toggleSetting('sound')}
              label="Sound"
            />
          </View>
          <View style={styles.row}>
            <View style={styles.copy}>
              <UiText fit style={styles.name}>
                Bigger tiles
              </UiText>
              <UiText numberOfLines={2} style={styles.help}>
                Easier to see and tap
              </UiText>
            </View>
            <Toggle
              on={settings.largeTiles}
              onPress={() => toggleSetting('largeTiles')}
              label="Bigger tiles"
            />
          </View>
          <View style={styles.row}>
            <View style={styles.copy}>
              <UiText fit style={styles.name}>
                Show matches
              </UiText>
              <UiText numberOfLines={2} style={styles.help}>
                Glow tiles that can be paired
              </UiText>
            </View>
            <Toggle
              on={settings.showMatches}
              onPress={() => toggleSetting('showMatches')}
              label="Show matches"
            />
          </View>
          <View style={styles.how}>
            <UiText fit style={styles.name}>
              How to play
            </UiText>
            <UiText style={styles.help}>
              Tap two matching tiles that are free on the left or right. Animals
              and tea-house pictures both count. Pairs disappear. Clear the table
              to sit at the next one. If you get stuck, Help will find another way.
            </UiText>
          </View>
          <CreamButton
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            accessibilityRole="link"
            accessibilityLabel="Privacy Policy"
            style={styles.privacy}
          >
            <UiText fit style={styles.name}>
              Privacy Policy
            </UiText>
          </CreamButton>
        </View>
      </View>
    </TeaScene>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 10 + TOP_BUFFER,
    paddingBottom: 18,
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
  },
  hudText: {
    fontFamily: FONTS.ui,
    fontSize: 18,
    lineHeight: 22,
    color: TEA.ink,
  },
  chip: {
    flex: 1,
    minHeight: 54,
    minWidth: 0,
    borderRadius: 16,
    backgroundColor: TEA.creamBtn,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    shadowColor: '#5a3418',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  chipCount: {
    fontFamily: FONTS.display,
    fontSize: 22,
    color: TEA.ink,
  },
  chipLabel: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    color: TEA.inkSoft,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  list: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 84,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: TEA.creamBtn,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: FONTS.ui,
    fontSize: 22,
    color: TEA.ink,
  },
  help: {
    marginTop: 2,
    fontFamily: FONTS.uiBold,
    fontSize: 15,
    color: TEA.inkSoft,
  },
  how: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: TEA.creamBtn,
  },
  privacy: {
    minHeight: 54,
  },
  toggle: {
    width: 68,
    minHeight: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: '#c9b8a8',
    paddingHorizontal: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#3d8a5a',
    alignItems: 'flex-end',
  },
  knob: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  knobOn: {},
});
