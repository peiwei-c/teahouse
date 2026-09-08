import { rosterFor, type Face } from './faces';
import { tableReadyLine } from './greeting';
import { buildSeats, oneLayerSeats } from './layout';
import { specFor } from './progression';
import { shuffle, type Rng } from './rng';

export type { Face } from './faces';
export { FACES } from './faces';
export { SEATS, TILE_COUNT, buildSeats, layoutExtent } from './layout';
export { MAX_LEVEL, specFor } from './progression';
export { greeting, tableReadyLine } from './greeting';
export { rngFromSeed } from './rng';

export type Tile = {
  id: number;
  face: Face;
  col: number;
  row: number;
  layer: number;
};

export type Table = {
  tiles: readonly Tile[];
  gone: readonly number[];
  picked: number | null;
  undoStack: readonly (readonly [number, number])[];
  pointed: readonly number[];
  buddyLine: string;
  shuffles: number;
};

export type TapKind = 'blocked' | 'pick' | 'unpick' | 'match' | 'mismatch' | 'win';

export type TapResult = {
  table: Table;
  kind: TapKind;
};

const OVERLAP = 1;

function pairBag(tileCount: number, variety: number, rng: Rng): Face[] {
  const pairs = tileCount / 2;
  const roster = rosterFor(Math.min(variety, pairs));
  const n = roster.length;
  if (n < 2) {
    throw new Error(`Need at least 2 faces, roster has ${n}`);
  }
  const counts = Array(n).fill(1);
  let extra = pairs - n;
  let i = 0;
  while (extra > 0) {
    counts[i % n] += 1;
    extra -= 1;
    i += 1;
  }
  const bag: Face[] = [];
  roster.forEach((face, idx) => {
    for (let p = 0; p < counts[idx]; p += 1) {
      bag.push(face, face);
    }
  });
  return shuffle(bag, rng);
}

function seatsOverlap(a: { col: number; row: number }, b: { col: number; row: number }): boolean {
  return Math.abs(a.col - b.col) < OVERLAP && Math.abs(a.row - b.row) < OVERLAP;
}

export function remaining(table: Table): Tile[] {
  const gone = new Set(table.gone);
  return table.tiles.filter((tile) => !gone.has(tile.id));
}

export function remainingCount(table: Table): number {
  return remaining(table).length;
}

export function isCovered(table: Table, tile: Tile): boolean {
  return remaining(table).some(
    (other) => other.layer > tile.layer && seatsOverlap(tile, other),
  );
}

export function isFree(table: Table, tile: Tile): boolean {
  if (table.gone.includes(tile.id)) return false;
  if (isCovered(table, tile)) return false;
  const rowmates = remaining(table).filter(
    (other) => other.id !== tile.id && other.layer === tile.layer && other.row === tile.row,
  );
  const left = rowmates.some((other) => other.col === tile.col - 1);
  const right = rowmates.some((other) => other.col === tile.col + 1);
  return !left || !right;
}

export function findFreePair(table: Table): [Tile, Tile] | null {
  const free = remaining(table).filter((tile) => isFree(table, tile));
  for (let i = 0; i < free.length; i += 1) {
    for (let j = i + 1; j < free.length; j += 1) {
      if (free[i].face === free[j].face) return [free[i], free[j]];
    }
  }
  return null;
}

export function emptyTable(): Table {
  return {
    tiles: [],
    gone: [],
    picked: null,
    undoStack: [],
    pointed: [],
    buddyLine: 'The table is ready.',
    shuffles: 0,
  };
}

export function dealTable(
  now: Date = new Date(),
  rng: Rng = Math.random,
  level = 1,
): Table {
  const spec = specFor(level);
  const seats = buildSeats(spec.layers, spec.tiles);
  const bag = pairBag(seats.length, spec.variety, rng);
  if (bag.length !== seats.length) {
    throw new Error(`Need ${seats.length} faces, got ${bag.length}`);
  }
  let table: Table = {
    tiles: seats.map((seat, i) => ({ ...seat, face: bag[i] })),
    gone: [],
    picked: null,
    undoStack: [],
    pointed: [],
    buddyLine: tableReadyLine(now),
    shuffles: 0,
  };
  if (!findFreePair(table)) {
    table = kindShuffle(table, rng);
  }
  return table;
}

export function createTable(tiles: readonly Tile[], buddyLine = 'The table is ready.'): Table {
  return {
    tiles,
    gone: [],
    picked: null,
    undoStack: [],
    pointed: [],
    buddyLine,
    shuffles: 0,
  };
}

function withBuddy(table: Table, buddyLine: string, extra: Partial<Table> = {}): Table {
  return { ...table, buddyLine, pointed: extra.pointed ?? [], ...extra };
}

export function tapTile(table: Table, id: number, rng: Rng = Math.random): TapResult {
  const tile = remaining(table).find((item) => item.id === id);
  if (!tile || !isFree(table, tile)) {
    return {
      kind: 'blocked',
      table: withBuddy(table, 'That one is still tucked in.'),
    };
  }

  if (table.picked == null) {
    return {
      kind: 'pick',
      table: withBuddy(table, 'One more like that one.', { picked: id }),
    };
  }

  if (table.picked === id) {
    return {
      kind: 'unpick',
      table: withBuddy(table, 'Whenever you are ready.', { picked: null }),
    };
  }

  const first = table.tiles.find((item) => item.id === table.picked);
  if (!first || first.face !== tile.face) {
    return {
      kind: 'mismatch',
      table: withBuddy(table, 'Those two are different. Try another.', { picked: id }),
    };
  }

  const gone = [...table.gone, first.id, tile.id];
  const next: Table = withBuddy(table, 'Nice pair.', {
    gone,
    picked: null,
    undoStack: [...table.undoStack, [first.id, tile.id]],
  });
  if (remainingCount(next) === 0) {
    return { kind: 'win', table: withBuddy(next, 'The table is clear. Tea?') };
  }
  if (!findFreePair(next)) {
    return { kind: 'match', table: kindShuffle(next, rng) };
  }
  return { kind: 'match', table: next };
}

function forceFreePair(table: Table): Table {
  const live = remaining(table);
  const free = live.filter((tile) => isFree(table, tile));
  if (free.length < 2) return table;
  const [a, b] = free;
  if (a.face === b.face) return table;
  const donor = live.find((tile) => tile.id !== a.id && tile.id !== b.id && tile.face === a.face);
  if (donor) {
    const tiles = table.tiles.map((tile) => {
      if (tile.id === b.id) return { ...tile, face: donor.face };
      if (tile.id === donor.id) return { ...tile, face: b.face };
      return tile;
    });
    return { ...table, tiles };
  }
  const ofA = live.filter((tile) => tile.face === a.face).length;
  if (ofA >= 2) return table;
  const tiles = table.tiles.map((tile) =>
    tile.id === b.id ? { ...tile, face: a.face } : tile,
  );
  return { ...table, tiles };
}

function flattenRemaining(table: Table): Table {
  const live = remaining(table);
  if (live.length < 2) return table;
  const seats = oneLayerSeats(live.length, 1, 1);
  const byId = new Map(live.map((tile, i) => [tile.id, seats[i]]));
  return {
    ...table,
    tiles: table.tiles.map((tile) => {
      const seat = byId.get(tile.id);
      if (!seat) return tile;
      return { ...tile, col: seat.col, row: seat.row, layer: 1 };
    }),
  };
}

function ensureFreePair(table: Table): Table {
  if (findFreePair(table)) return table;
  let next = forceFreePair(table);
  if (findFreePair(next)) return next;
  next = flattenRemaining(next);
  if (findFreePair(next)) return next;
  return forceFreePair(next);
}

export function hint(table: Table, rng: Rng = Math.random): Table {
  const pair = findFreePair(table);
  if (pair) {
    return withBuddy(table, 'These two can go.', {
      pointed: [pair[0].id, pair[1].id],
      picked: table.picked,
    });
  }
  return kindShuffle(table, rng);
}

export function kindShuffle(table: Table, rng: Rng = Math.random): Table {
  const live = remaining(table);
  const faces = shuffle(
    live.map((tile) => tile.face),
    rng,
  );
  const byId = new Map(live.map((tile, i) => [tile.id, faces[i]]));
  let next: Table = {
    ...table,
    tiles: table.tiles.map((tile) =>
      byId.has(tile.id) ? { ...tile, face: byId.get(tile.id)! } : tile,
    ),
    picked: null,
    shuffles: table.shuffles + 1,
  };
  if (!findFreePair(next)) {
    next = ensureFreePair(next);
  }
  const pair = findFreePair(next);
  return withBuddy(next, 'Let’s try another way.', {
    pointed: pair ? [pair[0].id, pair[1].id] : [],
    picked: null,
    shuffles: next.shuffles,
    tiles: next.tiles,
  });
}

export function undo(table: Table): Table {
  if (table.undoStack.length === 0) return table;
  const stack = table.undoStack.slice();
  const ids = stack.pop()!;
  const gone = table.gone.filter((id) => !ids.includes(id));
  return withBuddy(table, 'Here they are again.', {
    gone,
    undoStack: stack,
    picked: null,
  });
}

export function hasUndo(table: Table): boolean {
  return table.undoStack.length > 0;
}

export function hintLabel(table: Table): 'Hint' | 'Help' {
  return findFreePair(table) ? 'Hint' : 'Help';
}
