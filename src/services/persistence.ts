import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_LEVEL } from '../engine/progression';

const KEY = 'teahouse.settings.v1';

export type Settings = {
  sound: boolean;
  largeTiles: boolean;
  showMatches: boolean;
  level: number;
};

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  largeTiles: true,
  showMatches: true,
  level: 1,
};

export function clampLevel(level: unknown): number {
  if (typeof level !== 'number' || !Number.isFinite(level)) return 1;
  return Math.min(MAX_LEVEL, Math.max(1, Math.floor(level)));
}

export function previewLevelFromLocation(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = new URLSearchParams(window.location.search).get('level');
    if (raw == null || raw === '') return null;
    return clampLevel(Number(raw));
  } catch {
    return null;
  }
}

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      level: clampLevel(parsed.level),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}
