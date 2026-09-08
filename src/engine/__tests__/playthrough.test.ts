import { MAX_LEVEL, specFor } from '../progression';
import {
  dealTable,
  findFreePair,
  remainingCount,
  rngFromSeed,
  tapTile,
} from '../table';

const afternoon = new Date('2026-09-08T15:00:00');

function uniqueLevels(): number[] {
  const seen = new Set<string>();
  const levels: number[] = [];
  for (let level = 1; level <= MAX_LEVEL; level += 1) {
    const spec = specFor(level);
    const key = `${spec.layers}-${spec.tiles}-${spec.variety}`;
    if (seen.has(key)) continue;
    seen.add(key);
    levels.push(level);
  }
  return levels;
}

function greedyClear(level: number, seed: number) {
  const rng = rngFromSeed(seed * 10007 + level);
  let table = dealTable(afternoon, rng, level);
  const budget = specFor(level).tiles + 40;
  let steps = 0;
  while (remainingCount(table) > 0 && steps < budget) {
    const pair = findFreePair(table);
    if (!pair) {
      return {
        stuck: true,
        left: remainingCount(table),
        level,
        seed,
        spec: specFor(level),
      };
    }
    table = tapTile(table, pair[0].id, rng).table;
    table = tapTile(table, pair[1].id, rng).table;
    steps += 1;
  }
  return {
    stuck: remainingCount(table) > 0,
    left: remainingCount(table),
    level,
    seed,
    spec: specFor(level),
  };
}

describe('every table can be cleared', () => {
  const levels = uniqueLevels();

  it('covers every distinct layout in 1..100000', () => {
    expect(levels[0]).toBe(1);
    expect(specFor(levels[levels.length - 1]).tiles).toBe(specFor(MAX_LEVEL).tiles);
    expect(levels.length).toBeGreaterThan(40);
  });

  it('clears every distinct level on several deals', () => {
    const stuck: string[] = [];
    levels.forEach((level) => {
      for (let seed = 1; seed <= 3; seed += 1) {
        const result = greedyClear(level, seed);
        if (result.stuck) {
          stuck.push(
            `level ${result.level} seed ${result.seed} left ${result.left} (${result.spec.layers} layers, ${result.spec.tiles} tiles)`,
          );
        }
      }
    });
    expect(stuck).toEqual([]);
  });
});
