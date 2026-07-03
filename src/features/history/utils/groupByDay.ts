import { format, parseISO } from 'date-fns';
import type { TimeEntry } from '@/features/entries/types/entry.types';
import { getEntryDurationMinutes } from '@/features/entries/utils/timeCalculations';
import type { DayGroup } from '../types/history.types';

export const groupByDay = (entries: TimeEntry[]): DayGroup[] => {
  const countable = entries.filter((e) => e.status === 'completed' || e.status === 'paused');
  const map = new Map<string, TimeEntry[]>();

  for (const entry of countable) {
    const dayKey = format(parseISO(entry.startTime), 'yyyy-MM-dd');
    const list = map.get(dayKey) ?? [];
    list.push(entry);
    map.set(dayKey, list);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, dayEntries]) => {
      const totalMinutes = dayEntries.reduce(
        (sum, e) => sum + getEntryDurationMinutes(e),
        0,
      );
      return {
        date,
        dateLabel: format(parseISO(date), 'EEE, MMM d, yyyy'),
        entries: dayEntries.sort((a, b) => a.startTime.localeCompare(b.startTime)),
        totalMinutes,
      };
    });
};
