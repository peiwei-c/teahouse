import {
  createTable,
  dealTable,
  findFreePair,
  hint,
  isFree,
  remainingCount,
  rngFromSeed,
  tapTile,
  undo,
  type Table,
  type Tile,
} from '../table';
import { specFor } from '../progression';
import { buildSeats } from '../layout';

const afternoon = new Date('2026-09-08T15:00:00');

function tile(partial: Partial<Tile> & Pick<Tile, 'id' | 'face'>): Tile {
  return {
    col: 0,
    row: 0,
    layer: 1,
    ...partial,
  };
}

function countFaces(table: Table): Record<string, number> {
  const counts: Record<string, number> = {};
  table.tiles.forEach((item) => {
    counts[item.face] = (counts[item.face] ?? 0) + 1;
  });
  return counts;
}

describe('dealTable', () => {
  it('sets even faces and a ready line for level 1', () => {
    const table = dealTable(afternoon, rngFromSeed(7), 1);
    expect(table.tiles.length % 2).toBe(0);
    expect(table.buddyLine).toBe('The afternoon table is ready.');
    Object.values(countFaces(table)).forEach((count) => {
      expect(count % 2).toBe(0);
    });
    expect(table.tiles).toHaveLength(6);
    expect(table.tiles.some((t) => t.face === 'cat' || t.face === 'dog')).toBe(true);
  });
});

describe('free tiles', () => {
  it('lets an uncovered end of a row go, and keeps the middle tucked in', () => {
    const table = createTable([
      tile({ id: 1, face: 'cat', col: 0, row: 0 }),
      tile({ id: 2, face: 'dog', col: 1, row: 0 }),
      tile({ id: 3, face: 'bird', col: 2, row: 0 }),
    ]);
    expect(isFree(table, table.tiles[0])).toBe(true);
    expect(isFree(table, table.tiles[1])).toBe(false);
    expect(isFree(table, table.tiles[2])).toBe(true);
  });

  it('keeps a lower tile tucked in when a higher one sits on it', () => {
    const table = createTable([
      tile({ id: 1, face: 'cat', col: 2, row: 1, layer: 1 }),
      tile({ id: 2, face: 'dog', col: 2, row: 1, layer: 2 }),
    ]);
    expect(isFree(table, table.tiles[0])).toBe(false);
    expect(isFree(table, table.tiles[1])).toBe(true);
  });
});

describe('tapTile', () => {
  it('clears a matching free pair and can put them back', () => {
    const table = createTable([
      tile({ id: 1, face: 'cat', col: 0, row: 0 }),
      tile({ id: 2, face: 'dog', col: 1, row: 0 }),
      tile({ id: 3, face: 'cat', col: 2, row: 0 }),
    ]);
    const first = tapTile(table, 1);
    expect(first.kind).toBe('pick');
    const matched = tapTile(first.table, 3);
    expect(matched.kind).toBe('match');
    expect(remainingCount(matched.table)).toBe(1);
    const restored = undo(matched.table);
    expect(remainingCount(restored)).toBe(3);
    expect(restored.buddyLine).toBe('Here they are again.');
  });

  it('clears the table when the last pair goes', () => {
    const table = createTable([
      tile({ id: 1, face: 'panda', col: 0, row: 0 }),
      tile({ id: 2, face: 'panda', col: 2, row: 0 }),
    ]);
    const first = tapTile(table, 1);
    const won = tapTile(first.table, 2);
    expect(won.kind).toBe('win');
    expect(remainingCount(won.table)).toBe(0);
    expect(won.table.buddyLine).toBe('The table is clear. Tea?');
  });

  it('does not pick a tile that is still tucked in', () => {
    const table = createTable([
      tile({ id: 1, face: 'cat', col: 0, row: 0 }),
      tile({ id: 2, face: 'dog', col: 1, row: 0 }),
      tile({ id: 3, face: 'bird', col: 2, row: 0 }),
    ]);
    const result = tapTile(table, 2);
    expect(result.kind).toBe('blocked');
    expect(result.table.picked).toBeNull();
  });
});

describe('hint', () => {
  it('points at a free pair when one is waiting', () => {
    const table = createTable([
      tile({ id: 1, face: 'cat', col: 0, row: 0 }),
      tile({ id: 2, face: 'dog', col: 1, row: 0 }),
      tile({ id: 3, face: 'cat', col: 2, row: 0 }),
    ]);
    const next = hint(table, rngFromSeed(1));
    expect(next.buddyLine).toBe('These two can go.');
    expect(next.pointed).toEqual([1, 3]);
  });

  it('kind-shuffles a stuck table so a pair can go', () => {
    const table = createTable([
      tile({ id: 1, face: 'cat', col: 0, row: 0 }),
      tile({ id: 2, face: 'dog', col: 1, row: 0 }),
    ]);
    expect(findFreePair(table)).toBeNull();
    const next = hint(table, rngFromSeed(3));
    expect(next.shuffles).toBe(1);
    expect(findFreePair(next)).not.toBeNull();
    expect(next.buddyLine).toBe('Let’s try another way.');
  });

  it('lays buried leftovers in a short row so a pair can go', () => {
    const table = createTable([
      tile({ id: 1, face: 'cat', col: 2, row: 1, layer: 1 }),
      tile({ id: 2, face: 'dog', col: 2, row: 1, layer: 2 }),
    ]);
    expect(findFreePair(table)).toBeNull();
    const next = hint(table, rngFromSeed(4));
    expect(findFreePair(next)).not.toBeNull();
    expect(remainingCount(next)).toBe(2);
  });
});

function greedyPlay(level: number, seed: number) {
  let table = dealTable(afternoon, rngFromSeed(seed), level);
  let steps = 0;
  while (remainingCount(table) > 0 && steps < 200) {
    const pair = findFreePair(table);
    if (!pair) {
      return { stuck: true, left: remainingCount(table), table };
    }
    const first = tapTile(table, pair[0].id);
    const second = tapTile(first.table, pair[1].id);
    table = second.table;
    steps += 1;
  }
  return { stuck: remainingCount(table) > 0, left: remainingCount(table), table };
}

describe('level 8', () => {
  it('uses short rows so the ends stay free', () => {
    const spec = specFor(8);
    expect(spec.tiles).toBe(8);
    expect(spec.layers).toBe(1);
    const seats = buildSeats(spec.layers, spec.tiles);
    const byRow = new Map<number, number>();
    seats.forEach((seat) => {
      byRow.set(seat.row, (byRow.get(seat.row) ?? 0) + 1);
    });
    byRow.forEach((width) => {
      expect(width).toBeLessThanOrEqual(3);
    });
  });

  it('can be cleared without getting stuck', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const result = greedyPlay(8, seed);
      expect(result).toEqual({ stuck: false, left: 0, table: expect.any(Object) });
    }
  });
});
