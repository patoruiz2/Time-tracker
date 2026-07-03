import { describe, expect, it } from 'vitest';
import {
  formatDuration,
  getEntryDurationMinutes,
  getTodayEntries,
  isToday,
  isWithinRetention,
} from './timeCalculations';
import { buildTimeEntry } from '@/test/fixtures/timeEntry';

const july3 = new Date(2026, 6, 3, 12, 0, 0);
const isoOnJuly3 = (hours: number, minutes = 0): string =>
  new Date(2026, 6, 3, hours, minutes, 0).toISOString();

describe('getEntryDurationMinutes', () => {
  it('uses endTime for completed entries', () => {
    const entry = buildTimeEntry({
      startTime: isoOnJuly3(9),
      endTime: isoOnJuly3(10, 30),
      status: 'completed',
    });

    expect(getEntryDurationMinutes(entry)).toBe(90);
  });

  it('uses now for active entries without endTime', () => {
    const entry = buildTimeEntry({
      startTime: isoOnJuly3(10),
      endTime: undefined,
      status: 'active',
    });
    const now = new Date(2026, 6, 3, 11, 15, 0);

    expect(getEntryDurationMinutes(entry, now)).toBe(75);
  });

  it('clamps negative durations to zero', () => {
    const entry = buildTimeEntry({
      startTime: isoOnJuly3(11),
      endTime: isoOnJuly3(10),
      status: 'completed',
    });

    expect(getEntryDurationMinutes(entry)).toBe(0);
  });
});

describe('formatDuration', () => {
  it('formats sub-hour durations as minutes only', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  it('formats hour-plus durations with hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatDuration(120)).toBe('2h 0m');
  });
});

describe('isWithinRetention', () => {
  it('includes entries on or after the cutoff date', () => {
    const cutoff = new Date(2026, 6, 1);
    const kept = buildTimeEntry({ startTime: isoOnJuly3(9) });
    const purged = buildTimeEntry({
      startTime: new Date(2026, 5, 30, 9, 0, 0).toISOString(),
    });

    expect(isWithinRetention(kept, cutoff)).toBe(true);
    expect(isWithinRetention(purged, cutoff)).toBe(false);
  });
});

describe('isToday', () => {
  it('matches entries on the reference calendar day', () => {
    const todayEntry = buildTimeEntry({ startTime: isoOnJuly3(9) });
    const yesterdayEntry = buildTimeEntry({
      startTime: new Date(2026, 6, 2, 9, 0, 0).toISOString(),
    });

    expect(isToday(todayEntry, july3)).toBe(true);
    expect(isToday(yesterdayEntry, july3)).toBe(false);
  });
});

describe('getTodayEntries', () => {
  it('returns paused and completed entries from today, newest first', () => {
    const older = buildTimeEntry({
      id: 'older',
      startTime: isoOnJuly3(8),
      endTime: isoOnJuly3(9),
      status: 'completed',
    });
    const newer = buildTimeEntry({
      id: 'newer',
      startTime: isoOnJuly3(10),
      endTime: isoOnJuly3(11),
      status: 'paused',
    });
    const active = buildTimeEntry({
      id: 'active',
      startTime: isoOnJuly3(11),
      status: 'active',
    });
    const yesterday = buildTimeEntry({
      id: 'yesterday',
      startTime: new Date(2026, 6, 2, 10, 0, 0).toISOString(),
      status: 'completed',
    });

    const result = getTodayEntries([older, newer, active, yesterday]);

    expect(result.map((e) => e.id)).toEqual(['newer', 'older']);
  });
});
