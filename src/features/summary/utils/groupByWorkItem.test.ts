import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCountableForDate, groupByWorkItem } from './groupByWorkItem';
import { buildTimeEntry } from '@/test/fixtures/timeEntry';

const july3 = new Date(2026, 6, 3, 12, 0, 0);
const isoOnJuly3 = (hours: number, minutes = 0): string =>
  new Date(2026, 6, 3, hours, minutes, 0).toISOString();

afterEach(() => {
  vi.useRealTimers();
});

describe('getCountableForDate', () => {
  it('returns completed and paused entries for the date in start-time order', () => {
    const first = buildTimeEntry({
      id: 'first',
      startTime: isoOnJuly3(8),
      status: 'completed',
    });
    const second = buildTimeEntry({
      id: 'second',
      startTime: isoOnJuly3(10),
      status: 'paused',
    });
    const active = buildTimeEntry({
      id: 'active',
      startTime: isoOnJuly3(11),
      status: 'active',
    });

    const result = getCountableForDate([second, active, first], july3);

    expect(result.map((e) => e.id)).toEqual(['first', 'second']);
  });
});

describe('groupByWorkItem', () => {
  it('rolls up minutes per ADO ID and sorts by total descending', () => {
    const entries = [
      buildTimeEntry({
        adoId: '10001',
        title: 'Small task',
        startTime: isoOnJuly3(8),
        endTime: isoOnJuly3(8, 30),
        status: 'completed',
      }),
      buildTimeEntry({
        adoId: '20002',
        title: 'Big task A',
        startTime: isoOnJuly3(8),
        endTime: isoOnJuly3(10),
        status: 'completed',
      }),
      buildTimeEntry({
        adoId: '20002',
        title: 'Big task B',
        startTime: isoOnJuly3(10),
        endTime: isoOnJuly3(11),
        status: 'paused',
      }),
    ];

    const summaries = groupByWorkItem(entries, july3);

    expect(summaries.map((s) => s.adoId)).toEqual(['20002', '10001']);
    expect(summaries[0].totalMinutes).toBe(180);
    expect(summaries[1].totalMinutes).toBe(30);
  });

  it('groups entries without an ADO ID by title and includes active timers from today', () => {
    const now = new Date(2026, 6, 3, 11, 30, 0);
    vi.setSystemTime(now);
    const entries = [
      buildTimeEntry({
        adoId: undefined,
        title: 'Untracked work',
        startTime: isoOnJuly3(9),
        endTime: isoOnJuly3(9, 30),
        status: 'completed',
      }),
      buildTimeEntry({
        adoId: undefined,
        title: 'Untracked work',
        startTime: isoOnJuly3(10),
        endTime: undefined,
        status: 'active',
      }),
    ];

    const summaries = groupByWorkItem(entries, now);

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({
      adoId: undefined,
      title: 'Untracked work',
      totalMinutes: 120,
    });
    expect(summaries[0].entries).toHaveLength(2);
  });
});
