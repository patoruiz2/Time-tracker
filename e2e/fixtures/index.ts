import { test as base } from '@playwright/test';
import type { TimeEntry } from '../../src/features/entries/types/entry.types';
import { E2E_FROZEN_TIME, resetEntryCounter } from './entries';
import { seedEntriesStorage } from './storage';
import { DashboardPage } from '../pages/DashboardPage';

export type AppFixtures = {
  dashboard: DashboardPage;
  /**
   * Navigate with mock entries seeded in an isolated browser context.
   * Must be called instead of `page.goto` when seeding is required.
   */
  gotoWithEntries: (entries?: TimeEntry[]) => Promise<void>;
};

export const test = base.extend<AppFixtures>({
  dashboard: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  gotoWithEntries: async ({ page }, use) => {
    resetEntryCounter();

    await use(async (entries = []) => {
      await seedEntriesStorage(page, entries);
      await page.clock.install({ time: E2E_FROZEN_TIME });
      await page.goto('/');
    });
  },
});

export { expect } from '@playwright/test';
