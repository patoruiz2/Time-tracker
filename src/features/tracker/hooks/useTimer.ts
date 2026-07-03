import { useEffect, useState } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';
import type { TimeEntry } from '@/features/entries/types/entry.types';

export const formatElapsed = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
};

export const useTimer = (activeEntry: TimeEntry | undefined) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeEntry) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [activeEntry]);

  const elapsedSeconds = activeEntry
    ? Math.max(0, differenceInSeconds(now, parseISO(activeEntry.startTime)))
    : 0;

  return { elapsedSeconds, formatted: formatElapsed(elapsedSeconds) };
};
