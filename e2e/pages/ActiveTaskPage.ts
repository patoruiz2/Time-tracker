import type { Locator, Page } from '@playwright/test';

export class ActiveTaskPage {
  readonly root: Locator;
  readonly title: Locator;
  readonly pauseButton: Locator;
  readonly completeButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('.active-task');
    this.title = this.root.locator('.active-task__title');
    this.pauseButton = this.root.getByRole('button', { name: 'Pause' });
    this.completeButton = this.root.getByRole('button', { name: 'Complete' });
  }

  async expectVisible(title: string): Promise<void> {
    await this.root.waitFor();
    await this.title.filter({ hasText: title }).waitFor();
  }

  async pause(): Promise<void> {
    await this.pauseButton.click();
  }

  async complete(): Promise<void> {
    await this.completeButton.click();
  }
}
