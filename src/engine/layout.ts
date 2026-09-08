export type Seat = {
  id: number;
  col: number;
  row: number;
  layer: number;
};

export type LayerGrid = {
  cols: number;
  rows: number;
  count: number;
};

function clampSide(n: number): number {
  return Math.max(2, n);
}

function pyramid(cols: number, rows: number, layers: number): LayerGrid[] {
  return Array.from({ length: layers }, (_, i) => {
    const c = clampSide(cols - 2 * i);
    const r = clampSide(rows - 2 * i);
    return { cols: c, rows: r, count: c * r };
  });
}

function footprint(count: number): { w: number; h: number } {
  if (count <= 2) return { w: count, h: 1 };
  if (count <= 4) return { w: 2, h: Math.ceil(count / 2) };
  if (count <= 8) return { w: Math.ceil(count / 2), h: 2 };
  if (count <= 15) return { w: Math.ceil(count / 3), h: 3 };
  const h = Math.max(3, Math.round(Math.sqrt(count / 1.6)));
  const w = Math.ceil(count / h);
  return { w, h };
}

/** Leftover base tiles sit in a compact rectangle so the turtle stays centered. */
function squareFootprint(count: number): { w: number; h: number } {
  const side = Math.max(2, Math.round(Math.sqrt(count)));
  let best = { w: side, h: Math.ceil(count / side), score: Infinity };
  for (let w = Math.max(2, side - 4); w <= side + 4; w += 1) {
    const h = Math.ceil(count / w);
    const empty = w * h - count;
    const score = Math.abs(w - h) * 10 + empty;
    if (score < best.score) best = { w, h, score };
  }
  return { w: best.w, h: best.h };
}

export function oneLayerSeats(count: number, layer = 1, idStart = 1, width?: number): Seat[] {
  const cols =
    width ??
    (count <= 2
      ? count
      : count <= 20
        ? 3
        : count <= 40
          ? 6
          : count <= 80
            ? 8
            : count <= 160
              ? 10
              : count <= 280
                ? 12
                : 14);
  const seats: Seat[] = [];
  let id = idStart;
  let placed = 0;
  let row = 0;
  while (placed < count) {
    const left = count - placed;
    const colsThisRow = Math.min(cols, left);
    const offset = Math.floor((cols - colsThisRow) / 2);
    for (let i = 0; i < colsThisRow; i += 1) {
      seats.push({ id: id++, col: offset + i, row, layer });
      placed += 1;
    }
    row += 1;
  }
  return seats;
}

export function layerGrids(layers: number, total: number): LayerGrid[] {
  if (layers <= 1) {
    const { w, h } = footprint(total);
    return [{ cols: w, rows: h, count: total }];
  }

  let best: { score: number; grids: LayerGrid[] } | null = null;
  const maxSide = Math.max(4, Math.ceil(Math.sqrt(total)) + 2);

  for (let cols = 2; cols <= maxSide; cols += 1) {
    for (let rows = 2; rows <= maxSide; rows += 1) {
      if (Math.abs(cols - rows) > 2) continue;
      const grids = pyramid(cols, rows, layers);
      const sum = grids.reduce((n, grid) => n + grid.count, 0);
      if (sum > total) continue;
      const leftover = total - sum;
      const score = leftover * 8 + Math.abs(cols - rows);
      if (!best || score < best.score) {
        const baseCount = grids[0].count + leftover;
        let base: LayerGrid = { ...grids[0], count: baseCount };
        if (leftover > 0) {
          const { w, h } = squareFootprint(baseCount);
          base = { cols: w, rows: h, count: baseCount };
        }
        const next = grids.map((grid, i) => (i === 0 ? base : grid));
        best = { score, grids: next };
      }
    }
  }

  if (best) return best.grids;

  const fallback = Array.from({ length: layers }, (_, i) => ({
    cols: 2,
    rows: 2,
    count: i === 0 ? Math.max(2, total - 2 * (layers - 1)) : 2,
  }));
  const used = fallback.reduce((n, grid) => n + grid.count, 0);
  fallback[0].count += total - used;
  return fallback;
}

export function allocate(layers: number, total: number): number[] {
  return layerGrids(layers, total).map((grid) => grid.count);
}

function centeredRect(
  minCol: number,
  maxCol: number,
  minRow: number,
  maxRow: number,
  cols: number,
  rows: number,
): Array<[number, number]> {
  const width = maxCol - minCol + 1;
  const height = maxRow - minRow + 1;
  const w = Math.min(cols, width);
  const h = Math.min(rows, height);
  const startC = minCol + Math.floor((width - w) / 2);
  const startR = minRow + Math.floor((height - h) / 2);
  const spots: Array<[number, number]> = [];
  for (let r = 0; r < h; r += 1) {
    for (let c = 0; c < w; c += 1) {
      spots.push([startC + c, startR + r]);
    }
  }
  return spots;
}

export function buildSeats(layers: number, count: number): Seat[] {
  if (count % 2 !== 0) {
    throw new Error(`Tile count must be even, got ${count}`);
  }
  if (layers <= 1) return oneLayerSeats(count, 1, 1);

  const grids = layerGrids(layers, count);
  const base = oneLayerSeats(grids[0].count, 1, 1, grids[0].cols);
  let minCol = Infinity;
  let maxCol = -Infinity;
  let minRow = Infinity;
  let maxRow = -Infinity;
  base.forEach((seat) => {
    minCol = Math.min(minCol, seat.col);
    maxCol = Math.max(maxCol, seat.col);
    minRow = Math.min(minRow, seat.row);
    maxRow = Math.max(maxRow, seat.row);
  });

  const seats = base.slice();
  let id = base.length + 1;
  for (let layer = 2; layer <= layers; layer += 1) {
    const grid = grids[layer - 1];
    const spots = centeredRect(minCol, maxCol, minRow, maxRow, grid.cols, grid.rows);
    spots.slice(0, grid.count).forEach(([col, row]) => {
      seats.push({ id: id++, col, row, layer });
    });
  }
  if (seats.length !== count) {
    throw new Error(`Need ${count} seats, built ${seats.length}`);
  }
  return seats;
}

export function layoutExtent(seats: readonly { col: number; row: number }[]): {
  cols: number;
  rows: number;
} {
  let maxCol = 0;
  let maxRow = 0;
  seats.forEach((seat) => {
    maxCol = Math.max(maxCol, seat.col);
    maxRow = Math.max(maxRow, seat.row);
  });
  return { cols: maxCol + 1, rows: maxRow + 1 };
}

export const SEATS = buildSeats(3, 36);
export const TILE_COUNT = SEATS.length;
