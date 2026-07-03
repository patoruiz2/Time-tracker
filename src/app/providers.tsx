import { EntriesProvider } from '@/features/entries/hooks/EntriesProvider';
import type { ReactNode } from 'react';

export const Providers = ({ children }: { children: ReactNode }) => (
  <EntriesProvider>{children}</EntriesProvider>
);
