import { beforeEach, describe, expect, it, vi } from 'vitest';
import { entriesReducer, purgeOldEntries } from './entriesReducer';
import type { TimeEntry } from '../types/entry.types';
import { buildTimeEntry } from '@/test/fixtures/timeEntry';
import { RETENTION_DAYS } from '@/shared/constants/storage.constants';

const NOW = '2026-07-03T12:00:00.000Z';

const isoOnJuly3 = (hours: number, minutes = 0): string =>
  new Date(2026, 6, 3, hours, minutes, 0).toISOString();

beforeEach(() => {
  let uuidCounter = 0;
  vi.stubGlobal('crypto', {
    randomUUID: () => `uuid-${++uuidCounter}`,
  });
});

describe('purgeOldEntries', () => {
  it('drops entries older than the retention window', () => {
    const recent = buildTimeEntry({ startTime: isoOnJuly3(9) });
    const old = buildTimeEntry({
      startTime: new Date(2026, 5, 1, 9, 0, 0).toISOString(),
    });

    const result = purgeOldEntries([recent, old], NOW);

    expect(result).toEqual([recent]);
    expect(RETENTION_DAYS).toBe(28);
  });
});

describe('entriesReducer', () => {
  it('starts a timer and auto-pauses an existing active entry with an ADO ID', () => {
    const active = buildTimeEntry({
      id: 'active-1',
      adoId: '10001',
      status: 'active',
      startTime: isoOnJuly3(10),
      endTime: undefined,
    });

    const result = entriesReducer([active], {
      type: 'START_TIMER',
      payload: { title: 'New task', adoId: '20002', now: NOW },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const paused = result.entries.find((e) => e.id === 'active-1');
    const started = result.entries.find((e) => e.status === 'active');

    expect(paused?.status).toBe('paused');
    expect(paused?.endTime).toBe(NOW);
    expect(started).toMatchObject({
      title: 'New task',
      adoId: '20002',
      startTime: NOW,
      status: 'active',
    });
  });

  it('blocks starting a new timer when the active entry has no ADO ID', () => {
    const active = buildTimeEntry({
      id: 'active-1',
      adoId: undefined,
      status: 'active',
      endTime: undefined,
    });

    const result = entriesReducer([active], {
      type: 'START_TIMER',
      payload: { title: 'Blocked', adoId: '10001', now: NOW },
    });

    expect(result).toEqual({
      ok: false,
      entries: [active],
      error: 'Complete the active timer before switching — it has no ADO ID.',
    });
  });

  it('requires an ADO ID to pause', () => {
    const active = buildTimeEntry({
      status: 'active',
      adoId: undefined,
      endTime: undefined,
    });

    const result = entriesReducer([active], {
      type: 'PAUSE_TIMER',
      payload: { now: NOW },
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('ADO ID is required to pause.');
  });

  it('completes the active timer', () => {
    const active = buildTimeEntry({
      id: 'active-1',
      status: 'active',
      endTime: undefined,
    });

    const result = entriesReducer([active], {
      type: 'COMPLETE_TIMER',
      payload: { now: NOW },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.entries[0]).toMatchObject({
      id: 'active-1',
      status: 'completed',
      endTime: NOW,
    });
  });

  it('resumes a paused work item and pauses any other active timer first', () => {
    const activeOther = buildTimeEntry({
      id: 'active-other',
      adoId: '99999',
      status: 'active',
      startTime: isoOnJuly3(11),
      endTime: undefined,
    });
    const paused = buildTimeEntry({
      id: 'paused-target',
      adoId: '20002',
      title: 'Resume me',
      description: 'Paused work',
      status: 'paused',
      startTime: isoOnJuly3(8),
      endTime: isoOnJuly3(9),
    });

    const result = entriesReducer([activeOther, paused], {
      type: 'RESUME_TIMER',
      payload: { adoId: '20002', now: NOW },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const resumedActive = result.entries.find((e) => e.status === 'active');
    const pausedOther = result.entries.find((e) => e.id === 'active-other');

    expect(pausedOther?.status).toBe('paused');
    expect(resumedActive).toMatchObject({
      adoId: '20002',
      title: 'Resume me',
      description: 'Paused work',
      startTime: NOW,
    });
  });

  it('marks all paused segments for an ADO ID as completed', () => {
    const segments: TimeEntry[] = [
      buildTimeEntry({
        id: 'seg-1',
        adoId: '30003',
        status: 'paused',
      }),
      buildTimeEntry({
        id: 'seg-2',
        adoId: '30003',
        status: 'paused',
      }),
      buildTimeEntry({
        id: 'other',
        adoId: '40004',
        status: 'paused',
      }),
    ];

    const result = entriesReducer(segments, {
      type: 'COMPLETE_PAUSED',
      payload: { adoId: '30003' },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.entries.find((e) => e.id === 'seg-1')?.status).toBe('completed');
    expect(result.entries.find((e) => e.id === 'seg-2')?.status).toBe('completed');
    expect(result.entries.find((e) => e.id === 'other')?.status).toBe('paused');
  });

  it('ignores invalid manual entries without mutating state', () => {
    const entries = [buildTimeEntry({ id: 'existing' })];

    const emptyTitle = entriesReducer(entries, {
      type: 'ADD_MANUAL',
      payload: {
        title: '   ',
        startTime: isoOnJuly3(9),
        endTime: isoOnJuly3(10),
        now: NOW,
      },
    });
    const invertedRange = entriesReducer(entries, {
      type: 'ADD_MANUAL',
      payload: {
        title: 'Manual',
        startTime: isoOnJuly3(11),
        endTime: isoOnJuly3(10),
        now: NOW,
      },
    });

    expect(emptyTitle).toEqual({ ok: true, entries });
    expect(invertedRange).toEqual({ ok: true, entries });
  });

  it('adds a valid manual entry as completed', () => {
    const result = entriesReducer([], {
      type: 'ADD_MANUAL',
      payload: {
        title: '  Manual entry  ',
        adoId: '10001',
        startTime: isoOnJuly3(9),
        endTime: isoOnJuly3(10),
        now: NOW,
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({
      title: 'Manual entry',
      adoId: '10001',
      status: 'completed',
      startTime: isoOnJuly3(9),
      endTime: isoOnJuly3(10),
    });
  });
});
