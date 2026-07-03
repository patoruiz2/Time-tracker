import type { Page } from '@playwright/test';
import { STORAGE_KEYS } from '../../src/shared/constants/storage.constants';
import type { TimeEntry } from '../../src/features/entries/types/entry.types';

export const ENTRIES_STORAGE_KEY = STORAGE_KEYS.ENTRIES;

/**
 * Seeds localStorage before the app boots. Each Playwright browser context
 * is isolated, and e2e runs on a dedicated port (5174) so manual dev data
 * on localhost:5173 is never touched.
 */
export const seedEntriesStorage = async (
  page: Page,
  entries: TimeEntry[],
): Promise<void> => {
  await page.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key: ENTRIES_STORAGE_KEY, value: entries },
  );
};

export const readEntriesStorage = async (page: Page): Promise<TimeEntry[]> =>
  page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as TimeEntry[]) : [];
  }, ENTRIES_STORAGE_KEY);
