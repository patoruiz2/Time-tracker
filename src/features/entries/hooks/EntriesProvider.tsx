import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '@/shared/constants/storage.constants';
import { toISO } from '@/shared/utils/formatDate';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import type { PausedWorkItem, TimeEntry } from '../types/entry.types';
import { getPausedWorkItems } from '../utils/entrySelectors';
import { entriesReducer, purgeOldEntries, type EntriesAction } from '../utils/entriesReducer';

export interface EntriesContextValue {
  entries: TimeEntry[];
  activeEntry: TimeEntry | undefined;
  pausedWorkItems: PausedWorkItem[];
  startTimer: (input: {
    title: string;
    adoId?: string;
    description?: string;
  }) => string | null;
  pauseTimer: (adoId?: string) => string | null;
  completeTimer: () => string | null;
  resumeTimer: (adoId: string) => string | null;
  completePausedWorkItem: (adoId: string) => string | null;
  addManualEntry: (input: {
    title: string;
    adoId?: string;
    description?: string;
    startTime: string;
    endTime: string;
  }) => boolean;
  deleteEntry: (id: string) => void;
  updateEntry: (id: string, updates: Partial<TimeEntry>) => void;
}

export const EntriesContext = createContext<EntriesContextValue | null>(null);

const loadEntries = (raw: TimeEntry[]): TimeEntry[] =>
  purgeOldEntries(raw, toISO());

export const EntriesProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useLocalStorage<TimeEntry[]>(STORAGE_KEYS.ENTRIES, []);

  useEffect(() => {
    setEntries((prev) => loadEntries(prev));
  }, [setEntries]);

  const dispatch = useCallback(
    (action: EntriesAction): string | null => {
      let error: string | null = null;
      setEntries((prev) => {
        const result = entriesReducer(loadEntries(prev), action);
        if (!result.ok) error = result.error;
        return loadEntries(result.entries);
      });
      return error;
    },
    [setEntries],
  );

  const activeEntry = useMemo(
    () => entries.find((e) => e.status === 'active'),
    [entries],
  );

  const pausedWorkItems = useMemo(
    () => getPausedWorkItems(entries),
    [entries],
  );

  const startTimer = useCallback(
    (input: { title: string; adoId?: string; description?: string }) =>
      dispatch({
        type: 'START_TIMER',
        payload: { ...input, now: toISO() },
      }),
    [dispatch],
  );

  const pauseTimer = useCallback(
    (adoId?: string) =>
      dispatch({
        type: 'PAUSE_TIMER',
        payload: { now: toISO(), adoId },
      }),
    [dispatch],
  );

  const completeTimer = useCallback(
    () => dispatch({ type: 'COMPLETE_TIMER', payload: { now: toISO() } }),
    [dispatch],
  );

  const resumeTimer = useCallback(
    (adoId: string) =>
      dispatch({
        type: 'RESUME_TIMER',
        payload: { adoId, now: toISO() },
      }),
    [dispatch],
  );

  const completePausedWorkItem = useCallback(
    (adoId: string) => dispatch({ type: 'COMPLETE_PAUSED', payload: { adoId } }),
    [dispatch],
  );

  const addManualEntry = useCallback(
    (input: {
      title: string;
      adoId?: string;
      description?: string;
      startTime: string;
      endTime: string;
    }): boolean => {
      if (!input.title.trim() || input.endTime <= input.startTime) return false;
      dispatch({
        type: 'ADD_MANUAL',
        payload: { ...input, now: toISO() },
      });
      return true;
    },
    [dispatch],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_ENTRY', payload: { id } });
    },
    [dispatch],
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<TimeEntry>) => {
      dispatch({ type: 'UPDATE_ENTRY', payload: { id, updates } });
    },
    [dispatch],
  );

  const value = useMemo(
    () => ({
      entries,
      activeEntry,
      pausedWorkItems,
      startTimer,
      pauseTimer,
      completeTimer,
      resumeTimer,
      completePausedWorkItem,
      addManualEntry,
      deleteEntry,
      updateEntry,
    }),
    [
      entries,
      activeEntry,
      pausedWorkItems,
      startTimer,
      pauseTimer,
      completeTimer,
      resumeTimer,
      completePausedWorkItem,
      addManualEntry,
      deleteEntry,
      updateEntry,
    ],
  );

  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
};
