import { useContext } from 'react';
import { EntriesContext, type EntriesContextValue } from './EntriesProvider';

export const useEntries = (): EntriesContextValue => {
  const ctx = useContext(EntriesContext);
  if (!ctx) throw new Error('useEntries must be used within EntriesProvider');
  return ctx;
};
