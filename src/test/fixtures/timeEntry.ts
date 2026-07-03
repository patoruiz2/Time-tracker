import type { TimeEntry } from '@/features/entries/types/entry.types';

let counter = 0;

export const resetEntryIds = (): void => {
  counter = 0;
};

export const buildTimeEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry => {
  counter += 1;
  const startTime = overrides.startTime ?? '2026-07-03T10:00:00.000Z';
  return {
    id: overrides.id ?? `test-entry-${counter}`,
    title: 'Test task',
    adoId: '10001',
    description: undefined,
    startTime,
    endTime: overrides.endTime,
    status: 'completed',
    createdAt: startTime,
    ...overrides,
  };
};
