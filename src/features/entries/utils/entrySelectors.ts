import { isSameDay, parseISO } from 'date-fns';
import type { PausedWorkItem, TimeEntry } from '../types/entry.types';
import { getEntryDurationMinutes } from './timeCalculations';

export const getActiveEntry = (entries: TimeEntry[]): TimeEntry | undefined =>
  entries.find((e) => e.status === 'active');

export const getDailyTotalMinutes = (
  entries: TimeEntry[],
  adoId: string,
  day: Date = new Date(),
  now: Date = new Date(),
): number => {
  let total = entries
    .filter(
      (e) =>
        e.adoId === adoId &&
        (e.status === 'paused' || e.status === 'completed') &&
        isSameDay(parseISO(e.startTime), day),
    )
    .reduce((sum, e) => sum + getEntryDurationMinutes(e, now), 0);

  const active = entries.find((e) => e.status === 'active' && e.adoId === adoId);
  if (active && isSameDay(parseISO(active.startTime), day)) {
    total += getEntryDurationMinutes(active, now);
  }

  return total;
};

const latestPausedSegment = (segments: TimeEntry[]): TimeEntry =>
  segments.reduce((a, b) =>
    (a.endTime ?? a.startTime).localeCompare(b.endTime ?? b.startTime) >= 0 ? a : b,
  );

export const getPausedWorkItems = (
  entries: TimeEntry[],
  now: Date = new Date(),
): PausedWorkItem[] => {
  const active = getActiveEntry(entries);
  const byAdo = new Map<string, TimeEntry[]>();

  for (const entry of entries) {
    if (entry.status !== 'paused' || !entry.adoId) continue;
    const list = byAdo.get(entry.adoId) ?? [];
    list.push(entry);
    byAdo.set(entry.adoId, list);
  }

  const items: PausedWorkItem[] = [];
  for (const [adoId, segments] of byAdo) {
    if (active?.adoId === adoId) continue;
    const latest = latestPausedSegment(segments);
    items.push({
      adoId,
      title: latest.title,
      description: latest.description,
      dailyTotalMinutes: getDailyTotalMinutes(entries, adoId, now, now),
    });
  }

  return items.sort((a, b) => a.adoId.localeCompare(b.adoId));
};
