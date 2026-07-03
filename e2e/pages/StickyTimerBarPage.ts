import type { Locator, Page } from '@playwright/test';

export class StickyTimerBarPage {
  readonly root: Locator;
  readonly idleMessage: Locator;
  readonly trackingLabel: Locator;
  readonly title: Locator;
  readonly timer: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('.dashboard__sticky-bar');
    this.idleMessage = page.getByText('No active timer');
    this.trackingLabel = page.getByText('Tracking', { exact: true });
    this.title = this.root.locator('.dashboard__sticky-title');
    this.timer = this.root.locator('.dashboard__sticky-timer');
  }

  async expectIdle(): Promise<void> {
    await this.idleMessage.waitFor();
  }

  async expectTracking(title: string): Promise<void> {
    await this.trackingLabel.waitFor();
    await this.title.filter({ hasText: title }).waitFor();
  }
}
