import type { TimeEntry } from '@/features/entries/types/entry.types';

export interface DayGroup {
  date: string;
  dateLabel: string;
  entries: TimeEntry[];
  totalMinutes: number;
}
