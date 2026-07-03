import type { Locator, Page } from '@playwright/test';

export class TaskFormPage {
  readonly titleInput: Locator;
  readonly adoIdInput: Locator;
  readonly descriptionInput: Locator;
  readonly timerModeButton: Locator;
  readonly manualModeButton: Locator;
  readonly startTimerButton: Locator;
  readonly logEntryButton: Locator;
  readonly startTimeInput: Locator;
  readonly endTimeInput: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.titleInput = page.getByLabel('Title *');
    this.adoIdInput = page.getByLabel('ADO Work Item ID', { exact: true });
    this.descriptionInput = page.getByLabel('Description');
    this.timerModeButton = page.getByRole('button', { name: 'Timer', exact: true });
    this.manualModeButton = page.getByRole('button', { name: 'Manual', exact: true });
    this.startTimerButton = page.getByRole('button', { name: 'Start timer' });
    this.logEntryButton = page.getByRole('button', { name: 'Log entry' });
    this.startTimeInput = page.getByLabel('Start');
    this.endTimeInput = page.getByLabel('End');
    this.errorMessage = page.locator('.task-form__error');
  }

  async selectTimerMode(): Promise<void> {
    await this.timerModeButton.click();
  }

  async selectManualMode(): Promise<void> {
    await this.manualModeButton.click();
  }

  async fillTitle(title: string): Promise<void> {
    await this.titleInput.fill(title);
  }

  async fillAdoId(adoId: string): Promise<void> {
    await this.adoIdInput.fill(adoId);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async startTimer(options: {
    title: string;
    adoId?: string;
    description?: string;
  }): Promise<void> {
    await this.selectTimerMode();
    await this.fillTitle(options.title);
    if (options.adoId) await this.fillAdoId(options.adoId);
    if (options.description) await this.fillDescription(options.description);
    await this.startTimerButton.click();
  }

  async logManualEntry(options: {
    title: string;
    adoId?: string;
    startTime: string;
    endTime: string;
  }): Promise<void> {
    await this.selectManualMode();
    await this.fillTitle(options.title);
    if (options.adoId) await this.fillAdoId(options.adoId);
    await this.startTimeInput.fill(options.startTime);
    await this.endTimeInput.fill(options.endTime);
    await this.logEntryButton.click();
  }
}
