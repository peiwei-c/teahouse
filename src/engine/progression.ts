import { UNLOCK_ORDER } from './faces';

export const MAX_LEVEL = 100_000;

export type LevelSpec = {
  level: number;
  layers: number;
  tiles: number;
  variety: number;
};

const LAYER_BANDS: Array<{ from: number; to: number; layers: number }> = [
  { from: 1, to: 50, layers: 1 },
  { from: 51, to: 300, layers: 2 },
  { from: 301, to: 500, layers: 3 },
  { from: 501, to: 1000, layers: 4 },
  { from: 1001, to: 5000, layers: 5 },
  { from: 5001, to: 10000, layers: 6 },
  { from: 10001, to: 30000, layers: 7 },
  { from: 30001, to: 50000, layers: 8 },
  { from: 50001, to: 100000, layers: 9 },
];

const TILE_BANDS: Array<{ from: number; to: number; tilesFrom: number; tilesTo: number }> = [
  { from: 1, to: 50, tilesFrom: 6, tilesTo: 20 },
  { from: 51, to: 300, tilesFrom: 20, tilesTo: 50 },
  { from: 301, to: 500, tilesFrom: 50, tilesTo: 70 },
  { from: 501, to: 1000, tilesFrom: 70, tilesTo: 100 },
  { from: 1001, to: 5000, tilesFrom: 100, tilesTo: 130 },
  { from: 5001, to: 10000, tilesFrom: 130, tilesTo: 150 },
  { from: 10001, to: 30000, tilesFrom: 150, tilesTo: 180 },
  { from: 30001, to: 50000, tilesFrom: 180, tilesTo: 200 },
  { from: 50001, to: 100000, tilesFrom: 200, tilesTo: 300 },
];

function clampLevel(level: number): number {
  if (level < 1) return 1;
  if (level > MAX_LEVEL) return MAX_LEVEL;
  return Math.floor(level);
}

function evenLerp(from: number, to: number, t: number): number {
  const raw = Math.round(from + (to - from) * t);
  return raw % 2 === 0 ? raw : raw + 1;
}

export function layersFor(level: number): number {
  const n = clampLevel(level);
  const band = LAYER_BANDS.find((b) => n >= b.from && n <= b.to);
  return band?.layers ?? 9;
}

export function tileCountFor(level: number): number {
  const n = clampLevel(level);
  const band = TILE_BANDS.find((b) => n >= b.from && n <= b.to) ?? TILE_BANDS[TILE_BANDS.length - 1];
  const span = Math.max(1, band.to - band.from);
  const t = (n - band.from) / span;
  return evenLerp(band.tilesFrom, band.tilesTo, t);
}

export function varietyFor(level: number): number {
  const pairs = tileCountFor(level) / 2;
  return Math.max(2, Math.min(UNLOCK_ORDER.length, pairs));
}

export function specFor(level: number): LevelSpec {
  const n = clampLevel(level);
  return {
    level: n,
    layers: layersFor(n),
    tiles: tileCountFor(n),
    variety: varietyFor(n),
  };
}
