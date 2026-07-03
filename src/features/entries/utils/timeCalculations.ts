import { differenceInMinutes, isSameDay, parseISO } from 'date-fns';
import type { TimeEntry } from '../types/entry.types';

export const getEntryDurationMinutes = (entry: TimeEntry, now = new Date()): number => {
  const end = entry.endTime ?? now.toISOString();
  return Math.max(0, differenceInMinutes(parseISO(end), parseISO(entry.startTime)));
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

export const isWithinRetention = (entry: TimeEntry, cutoffDate: Date): boolean =>
  parseISO(entry.startTime) >= cutoffDate;

export const isToday = (entry: TimeEntry, reference = new Date()): boolean =>
  isSameDay(parseISO(entry.startTime), reference);

export const getTodayEntries = (entries: TimeEntry[]): TimeEntry[] =>
  entries
    .filter((e) => (e.status === 'completed' || e.status === 'paused') && isToday(e))
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
