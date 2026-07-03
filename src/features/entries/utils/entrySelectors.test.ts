import { describe, expect, it } from 'vitest';
import {
  getActiveEntry,
  getDailyTotalMinutes,
  getPausedWorkItems,
} from './entrySelectors';
import { buildTimeEntry } from '@/test/fixtures/timeEntry';

const july3 = new Date(2026, 6, 3, 12, 0, 0);
const isoOnJuly3 = (hours: number, minutes = 0): string =>
  new Date(2026, 6, 3, hours, minutes, 0).toISOString();

describe('getActiveEntry', () => {
  it('returns the single active entry when present', () => {
    const active = buildTimeEntry({ id: 'active', status: 'active', endTime: undefined });
    const completed = buildTimeEntry({ id: 'done', status: 'completed' });

    expect(getActiveEntry([completed, active])?.id).toBe('active');
    expect(getActiveEntry([completed])).toBeUndefined();
  });
});

describe('getDailyTotalMinutes', () => {
  it('sums paused and completed segments for an ADO ID on the given day', () => {
    const entries = [
      buildTimeEntry({
        adoId: '10001',
        startTime: isoOnJuly3(8),
        endTime: isoOnJuly3(9),
        status: 'completed',
      }),
      buildTimeEntry({
        adoId: '10001',
        startTime: isoOnJuly3(10),
        endTime: isoOnJuly3(10, 30),
        status: 'paused',
      }),
      buildTimeEntry({
        adoId: '20002',
        startTime: isoOnJuly3(8),
        endTime: isoOnJuly3(9),
        status: 'completed',
      }),
    ];

    expect(getDailyTotalMinutes(entries, '10001', july3)).toBe(90);
  });

  it('includes the active timer when it started today', () => {
    const now = new Date(2026, 6, 3, 11, 0, 0);
    const entries = [
      buildTimeEntry({
        adoId: '10001',
        startTime: isoOnJuly3(10),
        endTime: undefined,
        status: 'active',
      }),
    ];

    expect(getDailyTotalMinutes(entries, '10001', july3, now)).toBe(60);
  });
});

describe('getPausedWorkItems', () => {
  it('groups paused segments by ADO ID using the latest segment metadata', () => {
    const entries = [
      buildTimeEntry({
        id: 'seg-1',
        adoId: '30003',
        title: 'Older title',
        startTime: isoOnJuly3(8),
        endTime: isoOnJuly3(8, 30),
        status: 'paused',
      }),
      buildTimeEntry({
        id: 'seg-2',
        adoId: '30003',
        title: 'Latest title',
        description: 'Latest description',
        startTime: isoOnJuly3(9),
        endTime: isoOnJuly3(9, 45),
        status: 'paused',
      }),
    ];
    const now = new Date(2026, 6, 3, 12, 0, 0);

    const items = getPausedWorkItems(entries, now);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      adoId: '30003',
      title: 'Latest title',
      description: 'Latest description',
      dailyTotalMinutes: 75,
    });
  });

  it('excludes paused work items that match the currently active ADO ID', () => {
    const now = new Date(2026, 6, 3, 12, 0, 0);
    const entries = [
      buildTimeEntry({
        adoId: '10001',
        status: 'active',
        startTime: isoOnJuly3(11),
        endTime: undefined,
      }),
      buildTimeEntry({
        adoId: '10001',
        status: 'paused',
        startTime: isoOnJuly3(8),
        endTime: isoOnJuly3(9),
      }),
      buildTimeEntry({
        adoId: '20002',
        status: 'paused',
        startTime: isoOnJuly3(8),
        endTime: isoOnJuly3(8, 30),
      }),
    ];

    const items = getPausedWorkItems(entries, now);

    expect(items.map((item) => item.adoId)).toEqual(['20002']);
  });
});
