import { expect, test } from '../fixtures';
import { mockScenarios } from '../fixtures/entries';
import { ENTRIES_STORAGE_KEY, readEntriesStorage } from '../fixtures/storage';

test.describe('Timer workflow', () => {
  test('starts a timer and shows active task UI', async ({ dashboard, gotoWithEntries }) => {
    await gotoWithEntries(mockScenarios.empty());

    await dashboard.expectLoaded();
    await dashboard.dailySummary.expectEmpty();
    await dashboard.stickyBar.expectIdle();

    await dashboard.taskForm.startTimer({
      title: 'Implement e2e tests',
      adoId: '54321',
    });

    await dashboard.activeTask.expectVisible('Implement e2e tests');
    await dashboard.stickyBar.expectTracking('Implement e2e tests');
  });

  test('requires ADO ID before pausing a timer without one', async ({
    dashboard,
    gotoWithEntries,
  }) => {
    await gotoWithEntries(mockScenarios.empty());

    await dashboard.taskForm.startTimer({ title: 'Untracked spike' });
    await dashboard.activeTask.expectVisible('Untracked spike');

    await dashboard.activeTask.pause();
    await dashboard.pauseModal.expectOpen('Untracked spike');
    await dashboard.pauseModal.assignAdoIdAndPause('99999');

    await dashboard.pausedList.expectWorkItem('99999', 'Untracked spike');
    await dashboard.stickyBar.expectIdle();
  });

  test('completes an active timer and updates today rollup', async ({
    dashboard,
    gotoWithEntries,
    page,
  }) => {
    await gotoWithEntries(mockScenarios.empty());

    await dashboard.taskForm.startTimer({
      title: 'Ship feature',
      adoId: '44444',
    });
    await dashboard.activeTask.expectVisible('Ship feature');

    await dashboard.activeTask.complete();

    await dashboard.activeTask.root.waitFor({ state: 'hidden' });
    await dashboard.stickyBar.expectIdle();
    await dashboard.dailySummary.expectWorkItem('Ship feature');

    const entries = await readEntriesStorage(page);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      title: 'Ship feature',
      adoId: '44444',
      status: 'completed',
    });
  });

  test('resumes a paused work item from the list', async ({ dashboard, gotoWithEntries }) => {
    await gotoWithEntries(mockScenarios.withPausedWorkItem());

    await dashboard.pausedList.resume('20002');

    await dashboard.activeTask.expectVisible('API integration');
    await dashboard.stickyBar.expectTracking('API integration');
  });

  test('auto-pauses active timer with ADO ID when starting a new one', async ({
    dashboard,
    gotoWithEntries,
  }) => {
    await gotoWithEntries(mockScenarios.empty());

    await dashboard.taskForm.startTimer({
      title: 'First task',
      adoId: '11111',
    });
    await dashboard.activeTask.expectVisible('First task');

    await dashboard.taskForm.startTimer({
      title: 'Second task',
      adoId: '22222',
    });

    await dashboard.activeTask.expectVisible('Second task');
    await dashboard.pausedList.expectWorkItem('11111', 'First task');
  });

  test('completes a paused work item without resuming', async ({
    dashboard,
    gotoWithEntries,
    page,
  }) => {
    await gotoWithEntries(mockScenarios.withPausedWorkItem());

    await dashboard.pausedList.complete('20002');

    await dashboard.pausedList.heading.waitFor({ state: 'hidden' });
    await dashboard.dailySummary.expectWorkItem('API integration');

    const entries = await readEntriesStorage(page);
    expect(entries.every((e) => e.status === 'completed')).toBe(true);
  });
});

test.describe('Manual entry', () => {
  test('logs a completed entry and updates today rollup', async ({
    dashboard,
    gotoWithEntries,
    page,
  }) => {
    await gotoWithEntries(mockScenarios.empty());

    await dashboard.taskForm.logManualEntry({
      title: 'Code review',
      adoId: '30003',
      startTime: '2026-07-03T09:00',
      endTime: '2026-07-03T10:00',
    });

    await dashboard.dailySummary.expectWorkItem('Code review');
    await expect(dashboard.dailySummary.total).not.toHaveText('0m');

    const entries = await readEntriesStorage(page);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      title: 'Code review',
      adoId: '30003',
      status: 'completed',
    });
  });
});

test.describe('Seeded mock data', () => {
  test('renders paused work items from mock storage', async ({ dashboard, gotoWithEntries }) => {
    await gotoWithEntries(mockScenarios.withPausedWorkItem());

    await dashboard.expectLoaded();
    await dashboard.pausedList.expectWorkItem('20002', 'API integration');
    await dashboard.stickyBar.expectIdle();
  });

  test('renders completed entries in today rollup from mock storage', async ({
    dashboard,
    gotoWithEntries,
  }) => {
    await gotoWithEntries(mockScenarios.withCompletedToday());

    await dashboard.dailySummary.expectWorkItem('Fix login bug');
    await dashboard.stickyBar.expectIdle();
  });
});

test.describe('Storage isolation', () => {
  test('only seeds the e2e storage key in the test browser context', async ({
    page,
    gotoWithEntries,
  }) => {
    await gotoWithEntries(mockScenarios.withCompletedToday());

    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).toEqual([ENTRIES_STORAGE_KEY]);

    const foreignKey = 'unrelated-app:data';
    await page.evaluate(
      ({ foreignKey: key }) => {
        localStorage.setItem(key, '{"should":"remain"}');
      },
      { foreignKey },
    );

    const keysAfter = await page.evaluate(() => Object.keys(localStorage).sort());
    expect(keysAfter).toContain(foreignKey);
    expect(keysAfter).toContain(ENTRIES_STORAGE_KEY);
  });
});
