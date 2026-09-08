import { formatClearTime } from '../clearTime';

describe('formatClearTime', () => {
  it('uses seconds for a short table', () => {
    expect(formatClearTime(0)).toBe('0 seconds');
    expect(formatClearTime(1000)).toBe('1 second');
    expect(formatClearTime(32_400)).toBe('32 seconds');
  });

  it('speaks minutes and seconds for elderly eyes', () => {
    expect(formatClearTime(60_000)).toBe('1 minute');
    expect(formatClearTime(83_000)).toBe('1 minute 23 seconds');
    expect(formatClearTime(185_000)).toBe('3 minutes 5 seconds');
  });

  it('includes hours when a table runs long', () => {
    expect(formatClearTime(3_661_000)).toBe('1 hour 1 minute 1 second');
  });
});
