import { useMemo } from 'react';
import { useEntries } from '@/features/entries/hooks/useEntries';
import { groupByDay } from '../utils/groupByDay';

export const useHistory = () => {
  const { entries } = useEntries();

  const days = useMemo(() => groupByDay(entries), [entries]);

  return { days };
};
