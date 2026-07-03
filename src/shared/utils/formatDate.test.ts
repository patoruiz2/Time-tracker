import { describe, expect, it } from 'vitest';
import { formatDateTime, formatTime, minutesBetween, toISO } from './formatDate';

describe('formatDate utilities', () => {
  it('serializes dates to ISO strings', () => {
    const date = new Date(2026, 6, 3, 15, 30, 0);
    expect(toISO(date)).toBe(date.toISOString());
  });

  it('formats clock and date-time strings in local time', () => {
    const local = new Date(2026, 6, 3, 15, 30, 0);
    const iso = local.toISOString();

    expect(formatTime(iso)).toBe('15:30');
    expect(formatDateTime(iso)).toBe('Jul 3, 2026 15:30');
  });

  it('calculates minute differences between ISO timestamps', () => {
    const start = new Date(2026, 6, 3, 9, 0, 0).toISOString();
    const end = new Date(2026, 6, 3, 10, 45, 0).toISOString();

    expect(minutesBetween(start, end)).toBe(105);
  });
});
