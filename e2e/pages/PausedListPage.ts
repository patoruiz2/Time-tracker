import type { Locator, Page } from '@playwright/test';

export class PausedListPage {
  readonly root: Locator;
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('.paused-list');
    this.heading = page.getByRole('heading', { name: 'En pausa' });
  }

  itemForAdoId(adoId: string): Locator {
    return this.root.locator('.paused-list__item').filter({ hasText: `#${adoId}` });
  }

  async expectWorkItem(adoId: string, title: string): Promise<void> {
    await this.heading.waitFor();
    const item = this.itemForAdoId(adoId);
    await item.waitFor();
    await item.getByText(title).waitFor();
  }

  async resume(adoId: string): Promise<void> {
    await this.itemForAdoId(adoId).getByRole('button', { name: 'Resume' }).click();
  }

  async complete(adoId: string): Promise<void> {
    await this.itemForAdoId(adoId).getByRole('button', { name: 'Complete' }).click();
  }
}
