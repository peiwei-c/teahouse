import { create } from 'zustand';
import {
  dealTable,
  emptyTable,
  hasUndo,
  hint as hintTable,
  hintLabel,
  remainingCount,
  tapTile as tapTable,
  undo as undoTable,
  MAX_LEVEL,
  type Table,
} from '../engine/table';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  previewLevelFromLocation,
  saveSettings,
  type Settings,
} from '../services/persistence';

export type Screen = 'home' | 'play' | 'settings';

type GameState = {
  hydrated: boolean;
  screen: Screen;
  settings: Settings;
  table: Table;
  startedAt: number;
  clearMs: number | null;
  hydrate: () => Promise<void>;
  goHome: () => void;
  startPlay: () => void;
  nextTable: () => void;
  openSettings: () => void;
  tapTile: (id: number) => void;
  hint: () => void;
  undo: () => void;
  toggleSetting: (key: 'sound' | 'largeTiles' | 'showMatches') => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  hydrated: false,
  screen: 'home',
  settings: DEFAULT_SETTINGS,
  table: emptyTable(),
  startedAt: 0,
  clearMs: null,

  hydrate: async () => {
    const settings = await loadSettings();
    const preview = previewLevelFromLocation();
    set({
      settings: preview == null ? settings : { ...settings, level: preview },
      hydrated: true,
    });
  },

  goHome: () => set({ screen: 'home' }),

  startPlay: () => {
    const { settings } = get();
    set({
      screen: 'play',
      table: dealTable(new Date(), Math.random, settings.level),
      startedAt: Date.now(),
      clearMs: null,
    });
  },

  nextTable: () => {
    const { settings } = get();
    if (settings.level >= MAX_LEVEL) {
      set({ screen: 'home', clearMs: null });
      return;
    }
    const next = { ...settings, level: settings.level + 1 };
    set({
      settings: next,
      table: dealTable(new Date(), Math.random, next.level),
      startedAt: Date.now(),
      clearMs: null,
    });
    if (previewLevelFromLocation() == null) {
      void saveSettings(next);
    }
  },

  openSettings: () => set({ screen: 'settings' }),

  tapTile: (id) => {
    const { table, startedAt, clearMs } = get();
    const result = tapTable(table, id);
    set({
      table: result.table,
      clearMs:
        result.kind === 'win' && clearMs == null
          ? Math.max(0, Date.now() - startedAt)
          : clearMs,
    });
  },

  hint: () => set({ table: hintTable(get().table) }),

  undo: () => {
    const table = undoTable(get().table);
    set({
      table,
      clearMs: remainingCount(table) === 0 ? get().clearMs : null,
    });
  },

  toggleSetting: (key) => {
    const settings = { ...get().settings, [key]: !get().settings[key] };
    set({ settings });
    void saveSettings(settings);
  },
}));

export function selectCanUndo(state: GameState): boolean {
  return hasUndo(state.table);
}

export function selectHintLabel(state: GameState): 'Hint' | 'Help' {
  return hintLabel(state.table);
}

export function selectTilesLeft(state: GameState): number {
  return remainingCount(state.table);
}
