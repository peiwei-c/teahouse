import { dealTable, findFreePair, isFree, remaining, rngFromSeed } from '../table';
import { layersFor, specFor, tileCountFor, varietyFor, MAX_LEVEL } from '../progression';
import { buildSeats } from '../layout';

const EDGES = [1, 50, 51, 300, 301, 500, 501, 1000, 1001, 5000, 5001, 10000, 10001, 30000, 30001, 50000, 50001, 100000];

describe('level spec', () => {
  it('uses one layer for the first 50 tables', () => {
    expect(layersFor(1)).toBe(1);
    expect(layersFor(50)).toBe(1);
    expect(layersFor(51)).toBe(2);
  });

  it('steps layers on the bands', () => {
    expect(layersFor(300)).toBe(2);
    expect(layersFor(301)).toBe(3);
    expect(layersFor(500)).toBe(3);
    expect(layersFor(501)).toBe(4);
    expect(layersFor(1000)).toBe(4);
    expect(layersFor(1001)).toBe(5);
    expect(layersFor(5000)).toBe(5);
    expect(layersFor(5001)).toBe(6);
    expect(layersFor(10000)).toBe(6);
    expect(layersFor(10001)).toBe(7);
    expect(layersFor(30000)).toBe(7);
    expect(layersFor(30001)).toBe(8);
    expect(layersFor(50000)).toBe(8);
    expect(layersFor(50001)).toBe(9);
    expect(layersFor(MAX_LEVEL)).toBe(9);
  });

  it('grows tiles as the level climbs', () => {
    expect(tileCountFor(1)).toBe(6);
    expect(tileCountFor(50)).toBe(20);
    expect(tileCountFor(300)).toBe(50);
    expect(tileCountFor(500)).toBe(70);
    expect(tileCountFor(1000)).toBe(100);
    expect(tileCountFor(5000)).toBe(130);
    expect(tileCountFor(10000)).toBe(150);
    expect(tileCountFor(30000)).toBe(180);
    expect(tileCountFor(50000)).toBe(200);
    expect(tileCountFor(100000)).toBe(300);
    expect(varietyFor(1)).toBe(3);
    expect(tileCountFor(1) % 2).toBe(0);
  });

  it('never drops layers or tiles from one level to the next', () => {
    const samples = [1, 49, 50, 51, 299, 300, 301, 999, 1000, 1001, 4999, 5000, 5001, 9999, 10000, 10001, 29999, 30000, 30001, 49999, 50000, 50001, 99999, 100000];
    for (let i = 1; i < samples.length; i += 1) {
      expect(layersFor(samples[i])).toBeGreaterThanOrEqual(layersFor(samples[i - 1]));
      expect(tileCountFor(samples[i])).toBeGreaterThanOrEqual(tileCountFor(samples[i - 1]));
      expect(varietyFor(samples[i])).toBeGreaterThanOrEqual(varietyFor(samples[i - 1]));
    }
  });
});

function expectPlayable(level: number, seed = level) {
  const spec = specFor(level);
  const seats = buildSeats(spec.layers, spec.tiles);
  expect(seats).toHaveLength(spec.tiles);
  expect(Math.max(...seats.map((s) => s.layer))).toBe(spec.layers);
  const table = dealTable(new Date('2026-09-08T15:00:00'), rngFromSeed(seed), level);
  expect(table.tiles).toHaveLength(spec.tiles);
  expect(remaining(table).filter((t) => isFree(table, t)).length).toBeGreaterThanOrEqual(2);
  expect(findFreePair(table)).not.toBeNull();
  const counts: Record<string, number> = {};
  table.tiles.forEach((tile) => {
    counts[tile.face] = (counts[tile.face] ?? 0) + 1;
  });
  Object.values(counts).forEach((n) => {
    expect(n % 2).toBe(0);
    expect(n).toBeGreaterThanOrEqual(2);
  });
  expect(Object.keys(counts).length).toBe(spec.variety);
}

describe('playable tables', () => {
  it('deals a free pair on every band edge', () => {
    EDGES.forEach((level) => expectPlayable(level));
  });

  it('deals a free pair in the middle of each band', () => {
    [25, 150, 400, 750, 2500, 7500, 20000, 40000, 75000].forEach((level) => expectPlayable(level));
  });
});
