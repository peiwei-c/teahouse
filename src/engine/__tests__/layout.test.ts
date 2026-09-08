import { allocate, buildSeats, layerGrids } from '../layout';

function countsByLayer(seats: Array<{ layer: number }>): number[] {
  const max = Math.max(...seats.map((s) => s.layer));
  const counts = Array(max).fill(0);
  seats.forEach((seat) => {
    counts[seat.layer - 1] += 1;
  });
  return counts;
}

function sizeOfLayer(seats: Array<{ col: number; row: number; layer: number }>, layer: number) {
  const cells = seats.filter((seat) => seat.layer === layer);
  const cols = new Set(cells.map((seat) => seat.col)).size;
  const rows = new Set(cells.map((seat) => seat.row)).size;
  return { cols, rows, count: cells.length };
}

describe('turtle layout', () => {
  it('steps each layer in by two seats, like 10x10 then 8x8 then 6x6', () => {
    const seats = buildSeats(5, 220);
    expect(seats).toHaveLength(220);
    expect(sizeOfLayer(seats, 1)).toEqual({ cols: 10, rows: 10, count: 100 });
    expect(sizeOfLayer(seats, 2)).toEqual({ cols: 8, rows: 8, count: 64 });
    expect(sizeOfLayer(seats, 3)).toEqual({ cols: 6, rows: 6, count: 36 });
    expect(sizeOfLayer(seats, 4)).toEqual({ cols: 4, rows: 4, count: 16 });
    expect(sizeOfLayer(seats, 5)).toEqual({ cols: 2, rows: 2, count: 4 });
  });

  it('uses a 4x4 base and a 2x2 top for a small two-layer table', () => {
    const seats = buildSeats(2, 20);
    expect(sizeOfLayer(seats, 1)).toEqual({ cols: 4, rows: 4, count: 16 });
    expect(sizeOfLayer(seats, 2)).toEqual({ cols: 2, rows: 2, count: 4 });
  });

  it('keeps each layer no larger than the one under it', () => {
    [2, 3, 5, 9].forEach((layers) => {
      const total = Math.max(layers * 2 + 6, 16);
      const even = total % 2 === 0 ? total : total + 1;
      const counts = allocate(layers, even);
      expect(counts.reduce((sum, n) => sum + n, 0)).toBe(even);
      for (let i = 1; i < counts.length; i += 1) {
        expect(counts[i]).toBeLessThanOrEqual(counts[i - 1]);
      }
    });
  });

  it('keeps stacked tiles on the same grid seats', () => {
    const seats = buildSeats(3, 24);
    seats.forEach((seat) => {
      expect(Number.isInteger(seat.col)).toBe(true);
      expect(Number.isInteger(seat.row)).toBe(true);
    });
  });

  it('builds a large nine-layer table', () => {
    const seats = buildSeats(9, 300);
    expect(seats).toHaveLength(300);
    expect(Math.max(...seats.map((s) => s.layer))).toBe(9);
    const grids = layerGrids(9, 300);
    expect(grids[2].cols).toBe(grids[1].cols - 2);
    expect(grids[2].rows).toBe(grids[1].rows - 2);
  });

  it('keeps leftover base tiles in a compact centered rectangle', () => {
    const seats = buildSeats(9, 300);
    const base = sizeOfLayer(seats, 1);
    expect(Math.abs(base.cols - base.rows)).toBeLessThanOrEqual(2);
    const layer2 = seats.filter((seat) => seat.layer === 2);
    const baseCols = seats.filter((seat) => seat.layer === 1).map((seat) => seat.col);
    const baseRows = seats.filter((seat) => seat.layer === 1).map((seat) => seat.row);
    const topCols = layer2.map((seat) => seat.col);
    const topRows = layer2.map((seat) => seat.row);
    const leftGap = Math.min(...topCols) - Math.min(...baseCols);
    const rightGap = Math.max(...baseCols) - Math.max(...topCols);
    const topGap = Math.min(...topRows) - Math.min(...baseRows);
    const bottomGap = Math.max(...baseRows) - Math.max(...topRows);
    expect(Math.abs(leftGap - rightGap)).toBeLessThanOrEqual(1);
    expect(Math.abs(topGap - bottomGap)).toBeLessThanOrEqual(1);
  });

  it('keeps one-layer eights in short rows so the ends stay free', () => {
    const seats = buildSeats(1, 8);
    const widths = new Map<number, number>();
    seats.forEach((seat) => {
      widths.set(seat.row, (widths.get(seat.row) ?? 0) + 1);
    });
    widths.forEach((width) => {
      expect(width).toBeLessThanOrEqual(3);
    });
  });
});
