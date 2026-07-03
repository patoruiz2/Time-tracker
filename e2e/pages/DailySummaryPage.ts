import type { Locator, Page } from '@playwright/test';

export class DailySummaryPage {
  readonly heading: Locator;
  readonly emptyMessage: Locator;
  readonly total: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: "Today's rollup" });
    this.emptyMessage = page.getByText('No tracked time today.');
    this.total = page.locator('.dashboard__total');
  }

  summaryRow(title: string): Locator {
    return this.page.locator('.summary-row').filter({ hasText: title });
  }

  async expectEmpty(): Promise<void> {
    await this.emptyMessage.waitFor();
  }

  async expectWorkItem(title: string): Promise<void> {
    await this.summaryRow(title).waitFor();
  }
}
