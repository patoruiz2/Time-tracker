import { isSameDay, parseISO } from 'date-fns';
import type { TimeEntry, WorkItemSummary } from '@/features/entries/types/entry.types';
import { getEntryDurationMinutes } from '@/features/entries/utils/timeCalculations';

export const getCountableForDate = (
  entries: TimeEntry[],
  date: Date,
): TimeEntry[] =>
  entries
    .filter(
      (e) =>
        (e.status === 'completed' || e.status === 'paused') &&
        isSameDay(parseISO(e.startTime), date),
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

export const groupByWorkItem = (
  entries: TimeEntry[],
  date: Date = new Date(),
): WorkItemSummary[] => {
  const countable = getCountableForDate(entries, date);
  const activeToday = entries.filter(
    (e) => e.status === 'active' && isSameDay(parseISO(e.startTime), date),
  );
  const all = [...countable, ...activeToday];
  const map = new Map<string, WorkItemSummary>();

  for (const entry of all) {
    const key = entry.adoId ?? `__no_id__${entry.title}`;
    const existing = map.get(key);
    const minutes = getEntryDurationMinutes(entry);

    if (existing) {
      existing.totalMinutes += minutes;
      existing.entries.push(entry);
    } else {
      map.set(key, {
        adoId: entry.adoId,
        title: entry.title,
        totalMinutes: minutes,
        entries: [entry],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
};
