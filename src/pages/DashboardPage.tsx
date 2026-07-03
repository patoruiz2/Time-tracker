import { ActiveTaskCard, StickyTimerBar, TaskForm } from '@/features/tracker';
import { DailySummary } from '@/features/summary';
import { HistoryView } from '@/features/history';
import './DashboardPage.css';

export const DashboardPage = () => (
  <div className="dashboard">
    <StickyTimerBar />

    <section className="dashboard__section" aria-labelledby="tracker-heading">
      <h2 id="tracker-heading" className="section-title">Quick log</h2>
      <div className="dashboard__tracker-compact">
        <ActiveTaskCard />
        <TaskForm />
      </div>
    </section>

    <DailySummary />

    <section className="dashboard__section" aria-labelledby="history-heading">
      <h2 id="history-heading" className="section-title">History</h2>
      <HistoryView />
    </section>
  </div>
);
