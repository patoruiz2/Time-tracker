import type { TimeEntry } from '../../src/features/entries/types/entry.types';

const E2E_NOW = '2026-07-03T12:00:00.000Z';

export const E2E_FROZEN_TIME = new Date(E2E_NOW);

let entryCounter = 0;

const nextId = (prefix: string): string => {
  entryCounter += 1;
  return `e2e-${prefix}-${entryCounter}`;
};

export const resetEntryCounter = (): void => {
  entryCounter = 0;
};

export const buildEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry => {
  const startTime = overrides.startTime ?? E2E_NOW;
  return {
    id: nextId('entry'),
    title: 'E2E test task',
    adoId: '12345',
    description: 'Seeded for e2e',
    startTime,
    endTime: overrides.endTime,
    status: 'active',
    createdAt: startTime,
    ...overrides,
  };
};

export const buildCompletedEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry =>
  buildEntry({
    status: 'completed',
    endTime: '2026-07-03T13:00:00.000Z',
    ...overrides,
  });

export const buildPausedEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry =>
  buildEntry({
    status: 'paused',
    endTime: '2026-07-03T11:30:00.000Z',
    ...overrides,
  });

export const buildActiveEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry =>
  buildEntry({
    status: 'active',
    endTime: undefined,
    ...overrides,
  });

export const mockScenarios = {
  empty: (): TimeEntry[] => [],

  withCompletedToday: (): TimeEntry[] => [
    buildCompletedEntry({
      id: 'e2e-completed-1',
      title: 'Fix login bug',
      adoId: '10001',
      startTime: '2026-07-03T09:00:00.000Z',
      endTime: '2026-07-03T10:30:00.000Z',
    }),
  ],

  withPausedWorkItem: (): TimeEntry[] => [
    buildPausedEntry({
      id: 'e2e-paused-1',
      title: 'API integration',
      adoId: '20002',
      startTime: '2026-07-03T08:00:00.000Z',
      endTime: '2026-07-03T09:15:00.000Z',
    }),
  ],
};
