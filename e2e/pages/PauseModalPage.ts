import type { Locator, Page } from '@playwright/test';

export class PauseModalPage {
  readonly dialog: Locator;
  readonly adoIdInput: Locator;
  readonly pauseButton: Locator;
  readonly cancelButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog');
    this.adoIdInput = this.dialog.getByLabel('ADO Work Item ID *');
    this.pauseButton = this.dialog.getByRole('button', { name: 'Pause' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  async expectOpen(taskTitle: string): Promise<void> {
    await this.dialog.waitFor();
    await this.dialog.getByText(taskTitle).waitFor();
  }

  async assignAdoIdAndPause(adoId: string): Promise<void> {
    await this.adoIdInput.fill(adoId);
    await this.pauseButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
