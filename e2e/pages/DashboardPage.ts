import type { Page } from '@playwright/test';
import { ActiveTaskPage } from './ActiveTaskPage';
import { DailySummaryPage } from './DailySummaryPage';
import { PauseModalPage } from './PauseModalPage';
import { PausedListPage } from './PausedListPage';
import { StickyTimerBarPage } from './StickyTimerBarPage';
import { TaskFormPage } from './TaskFormPage';

export class DashboardPage {
  readonly stickyBar: StickyTimerBarPage;
  readonly taskForm: TaskFormPage;
  readonly activeTask: ActiveTaskPage;
  readonly pauseModal: PauseModalPage;
  readonly pausedList: PausedListPage;
  readonly dailySummary: DailySummaryPage;

  constructor(private readonly page: Page) {
    this.stickyBar = new StickyTimerBarPage(page);
    this.taskForm = new TaskFormPage(page);
    this.activeTask = new ActiveTaskPage(page);
    this.pauseModal = new PauseModalPage(page);
    this.pausedList = new PausedListPage(page);
    this.dailySummary = new DailySummaryPage(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async expectLoaded(): Promise<void> {
    await this.page.getByRole('heading', { name: 'Quick log' }).waitFor();
    await this.page.getByRole('heading', { name: 'History' }).waitFor();
  }
}
