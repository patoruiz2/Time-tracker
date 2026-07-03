import { useMemo } from 'react';
import { useEntries } from '@/features/entries/hooks/useEntries';
import { groupByWorkItem } from '../utils/groupByWorkItem';
import { formatClipboardAll } from '../utils/formatClipboard';

export const useSummary = () => {
  const { entries } = useEntries();

  const summaries = useMemo(
    () => groupByWorkItem(entries, new Date()),
    [entries],
  );

  const totalMinutes = useMemo(
    () => summaries.reduce((sum, s) => sum + s.totalMinutes, 0),
    [summaries],
  );

  const clipboardText = useMemo(
    () => formatClipboardAll(summaries),
    [summaries],
  );

  return { summaries, totalMinutes, clipboardText };
};
