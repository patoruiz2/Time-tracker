import { subDays } from 'date-fns';
import { RETENTION_DAYS } from '@/shared/constants/storage.constants';
import type { TimeEntry } from '../types/entry.types';
import { getActiveEntry, getPausedWorkItems } from './entrySelectors';

export type EntriesAction =
  | {
      type: 'START_TIMER';
      payload: { title: string; adoId?: string; description?: string; now: string };
    }
  | { type: 'PAUSE_TIMER'; payload: { now: string; adoId?: string } }
  | { type: 'COMPLETE_TIMER'; payload: { now: string } }
  | { type: 'RESUME_TIMER'; payload: { adoId: string; now: string } }
  | { type: 'COMPLETE_PAUSED'; payload: { adoId: string } }
  | {
      type: 'ADD_MANUAL';
      payload: {
        title: string;
        adoId?: string;
        description?: string;
        startTime: string;
        endTime: string;
        now: string;
      };
    }
  | { type: 'DELETE_ENTRY'; payload: { id: string } }
  | { type: 'UPDATE_ENTRY'; payload: { id: string; updates: Partial<TimeEntry> } }
  | { type: 'PURGE_OLD'; payload: { now: string } };

export type EntriesReducerResult =
  | { ok: true; entries: TimeEntry[] }
  | { ok: false; entries: TimeEntry[]; error: string };

const createEntry = (
  partial: Omit<TimeEntry, 'id' | 'createdAt'> & { now: string },
): TimeEntry => ({
  id: crypto.randomUUID(),
  title: partial.title,
  adoId: partial.adoId,
  description: partial.description,
  startTime: partial.startTime,
  endTime: partial.endTime,
  status: partial.status,
  createdAt: partial.now,
});

const closeActiveAsPaused = (
  entries: TimeEntry[],
  active: TimeEntry,
  now: string,
  adoId?: string,
): TimeEntry[] =>
  entries.map((entry) =>
    entry.id === active.id
      ? {
          ...entry,
          adoId: adoId ?? entry.adoId,
          endTime: now,
          status: 'paused' as const,
        }
      : entry,
  );

const closeActiveAsCompleted = (
  entries: TimeEntry[],
  active: TimeEntry,
  now: string,
): TimeEntry[] =>
  entries.map((entry) =>
    entry.id === active.id
      ? { ...entry, endTime: now, status: 'completed' as const }
      : entry,
  );

const pauseActiveIfPossible = (
  entries: TimeEntry[],
  now: string,
): EntriesReducerResult => {
  const active = getActiveEntry(entries);
  if (!active) return { ok: true, entries };

  if (!active.adoId) {
    return {
      ok: false,
      entries,
      error: 'Complete the active timer before switching — it has no ADO ID.',
    };
  }

  return { ok: true, entries: closeActiveAsPaused(entries, active, now) };
};

const latestPausedMeta = (
  entries: TimeEntry[],
  adoId: string,
): { title: string; description?: string } | undefined => {
  const paused = entries.filter((e) => e.adoId === adoId && e.status === 'paused');
  if (paused.length === 0) return undefined;
  const latest = paused.reduce((a, b) =>
    (a.endTime ?? a.startTime).localeCompare(b.endTime ?? b.startTime) >= 0 ? a : b,
  );
  return { title: latest.title, description: latest.description };
};

export const purgeOldEntries = (entries: TimeEntry[], now: string): TimeEntry[] => {
  const cutoff = subDays(new Date(now), RETENTION_DAYS).toISOString();
  return entries.filter((entry) => entry.startTime >= cutoff);
};

export const entriesReducer = (
  entries: TimeEntry[],
  action: EntriesAction,
): EntriesReducerResult => {
  switch (action.type) {
    case 'START_TIMER': {
      const { title, adoId, description, now } = action.payload;
      const pauseResult = pauseActiveIfPossible(entries, now);
      if (!pauseResult.ok) return pauseResult;

      const newEntry = createEntry({
        title,
        adoId,
        description,
        startTime: now,
        endTime: undefined,
        status: 'active',
        now,
      });
      return { ok: true, entries: [...pauseResult.entries, newEntry] };
    }

    case 'PAUSE_TIMER': {
      const { now, adoId: payloadAdoId } = action.payload;
      const active = getActiveEntry(entries);
      if (!active) {
        return { ok: false, entries, error: 'No active timer to pause.' };
      }

      const adoId = payloadAdoId ?? active.adoId;
      if (!adoId) {
        return {
          ok: false,
          entries,
          error: 'ADO ID is required to pause.',
        };
      }

      return {
        ok: true,
        entries: closeActiveAsPaused(entries, active, now, adoId),
      };
    }

    case 'COMPLETE_TIMER': {
      const { now } = action.payload;
      const active = getActiveEntry(entries);
      if (!active) {
        return { ok: false, entries, error: 'No active timer to complete.' };
      }
      return {
        ok: true,
        entries: closeActiveAsCompleted(entries, active, now),
      };
    }

    case 'RESUME_TIMER': {
      const { adoId, now } = action.payload;
      const paused = getPausedWorkItems(entries, new Date(now));
      if (!paused.some((p) => p.adoId === adoId)) {
        return { ok: false, entries, error: `#${adoId} is not on the paused list.` };
      }

      const pauseResult = pauseActiveIfPossible(entries, now);
      if (!pauseResult.ok) return pauseResult;

      const meta = latestPausedMeta(pauseResult.entries, adoId);
      if (!meta) {
        return { ok: false, entries, error: `No paused segments found for #${adoId}.` };
      }

      const newEntry = createEntry({
        adoId,
        title: meta.title,
        description: meta.description,
        startTime: now,
        endTime: undefined,
        status: 'active',
        now,
      });

      return { ok: true, entries: [...pauseResult.entries, newEntry] };
    }

    case 'COMPLETE_PAUSED': {
      const { adoId } = action.payload;
      const hasPaused = entries.some((e) => e.adoId === adoId && e.status === 'paused');
      if (!hasPaused) {
        return { ok: false, entries, error: `#${adoId} has no paused segments.` };
      }

      return {
        ok: true,
        entries: entries.map((entry) =>
          entry.adoId === adoId && entry.status === 'paused'
            ? { ...entry, status: 'completed' as const }
            : entry,
        ),
      };
    }

    case 'ADD_MANUAL': {
      const { title, adoId, description, startTime, endTime, now } = action.payload;
      if (!title.trim() || endTime <= startTime) return { ok: true, entries };
      const newEntry = createEntry({
        title: title.trim(),
        adoId,
        description,
        startTime,
        endTime,
        status: 'completed',
        now,
      });
      return { ok: true, entries: [...entries, newEntry] };
    }

    case 'DELETE_ENTRY':
      return { ok: true, entries: entries.filter((entry) => entry.id !== action.payload.id) };

    case 'UPDATE_ENTRY':
      return {
        ok: true,
        entries: entries.map((entry) =>
          entry.id === action.payload.id ? { ...entry, ...action.payload.updates } : entry,
        ),
      };

    case 'PURGE_OLD':
      return { ok: true, entries: purgeOldEntries(entries, action.payload.now) };

    default:
      return { ok: true, entries };
  }
};
