import { describe, expect, it } from 'vitest';
import { groupByDay } from './groupByDay';
import { buildTimeEntry } from '@/test/fixtures/timeEntry';

const isoOnJuly3 = (hours: number, minutes = 0): string =>
  new Date(2026, 6, 3, hours, minutes, 0).toISOString();

describe('groupByDay', () => {
  it('groups countable entries by calendar day with totals and newest days first', () => {
    const july2Entry = buildTimeEntry({
      id: 'july-2',
      startTime: new Date(2026, 6, 2, 9, 0, 0).toISOString(),
      endTime: new Date(2026, 6, 2, 10, 0, 0).toISOString(),
      status: 'completed',
    });
    const july3Morning = buildTimeEntry({
      id: 'july-3-am',
      startTime: isoOnJuly3(9),
      endTime: isoOnJuly3(10),
      status: 'completed',
    });
    const july3Afternoon = buildTimeEntry({
      id: 'july-3-pm',
      startTime: isoOnJuly3(14),
      endTime: isoOnJuly3(15, 30),
      status: 'paused',
    });
    const active = buildTimeEntry({
      id: 'active',
      startTime: isoOnJuly3(16),
      status: 'active',
    });

    const groups = groupByDay([july3Afternoon, july2Entry, active, july3Morning]);

    expect(groups.map((g) => g.date)).toEqual(['2026-07-03', '2026-07-02']);
    expect(groups[0].entries.map((e) => e.id)).toEqual(['july-3-am', 'july-3-pm']);
    expect(groups[0].totalMinutes).toBe(150);
    expect(groups[1].totalMinutes).toBe(60);
    expect(groups[0].dateLabel).toMatch(/Jul 3, 2026/);
  });
});
