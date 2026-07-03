export type EntryStatus = 'active' | 'paused' | 'completed';

export interface TimeEntry {
  id: string;
  title: string;
  adoId?: string;
  description?: string;
  startTime: string;
  endTime?: string;
  status: EntryStatus;
  createdAt: string;
}

export interface WorkItemSummary {
  adoId?: string;
  title: string;
  totalMinutes: number;
  entries: TimeEntry[];
}

export interface PausedWorkItem {
  adoId: string;
  title: string;
  description?: string;
  dailyTotalMinutes: number;
}
