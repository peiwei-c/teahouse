import { greeting, tableReadyLine } from '../greeting';

describe('greeting', () => {
  it('follows the time of day', () => {
    expect(greeting(new Date('2026-09-08T08:00:00'))).toBe('Good morning');
    expect(greeting(new Date('2026-09-08T15:00:00'))).toBe('Good afternoon');
    expect(greeting(new Date('2026-09-08T20:00:00'))).toBe('Good evening');
    expect(tableReadyLine(new Date('2026-09-08T20:00:00'))).toBe(
      'The evening table is ready.',
    );
  });
});
