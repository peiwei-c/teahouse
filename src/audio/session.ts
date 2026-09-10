import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  type AudioPlayer,
} from 'expo-audio';
import { useGameStore } from '../store/gameStore';

const BGM = require('../../assets/audio/lofi-bgm.wav');
const SELECT = require('../../assets/audio/tile-select.wav');
const BLOCKED = require('../../assets/audio/tile-blocked.wav');

const SFX_OPTS = { keepAudioSessionActive: true, updateInterval: 1000 } as const;

let started = false;
let wanted: boolean | null = null;
let bgm: AudioPlayer | null = null;
let selectA: AudioPlayer | null = null;
let selectB: AudioPlayer | null = null;
let selectFlip = false;
let blocked: AudioPlayer | null = null;
let appSub: { remove(): void } | null = null;

function inForeground(state: AppStateStatus = AppState.currentState): boolean {
  return state === 'active' || state === 'unknown';
}

async function replay(player: AudioPlayer | null): Promise<void> {
  if (!wanted || !player) return;
  try {
    await player.seekTo(0);
    player.play();
  } catch {
    // Web may block playback until a later gesture.
  }
}

function syncBgm(): void {
  if (!bgm || wanted == null) return;
  try {
    if (wanted && inForeground()) {
      void setIsAudioActiveAsync(true);
      if (!bgm.playing) bgm.play();
    } else {
      bgm.pause();
    }
  } catch {
    // Ignore autoplay and native session errors.
  }
}

function onAppState(state: AppStateStatus): void {
  if (state !== 'active') {
    bgm?.pause();
    return;
  }
  syncBgm();
}

export async function initAudio(): Promise<void> {
  if (started) return;
  started = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'duckOthers',
      allowsRecording: false,
    });
    bgm = createAudioPlayer(BGM, { ...SFX_OPTS, updateInterval: 2000 });
    bgm.loop = true;
    bgm.volume = 0.34;
    selectA = createAudioPlayer(SELECT, SFX_OPTS);
    selectB = createAudioPlayer(SELECT, SFX_OPTS);
    selectA.volume = 0.74;
    selectB.volume = 0.74;
    blocked = createAudioPlayer(BLOCKED, SFX_OPTS);
    blocked.volume = 0.62;
    appSub?.remove();
    appSub = AppState.addEventListener('change', onAppState);
    syncBgm();
  } catch (error) {
    started = false;
    console.warn('[TeaHouse] audio', error);
  }
}

export function setSoundEnabled(on: boolean): void {
  wanted = on;
  if (!on) {
    bgm?.pause();
    void setIsAudioActiveAsync(false);
    return;
  }
  syncBgm();
}

export function unlockAudio(): void {
  if (wanted) syncBgm();
}

export function playTileSfx(free: boolean): void {
  if (!wanted) return;
  unlockAudio();
  if (free) {
    const player = selectFlip ? selectB : selectA;
    selectFlip = !selectFlip;
    void replay(player);
    return;
  }
  void replay(blocked);
}

export function useGameAudio(): void {
  const hydrated = useGameStore((s) => s.hydrated);
  const sound = useGameStore((s) => s.settings.sound);

  useEffect(() => {
    if (!hydrated) return;
    void initAudio();
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    setSoundEnabled(sound);
  }, [hydrated, sound]);
}
