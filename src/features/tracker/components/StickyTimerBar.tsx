import { Badge } from '@/shared/components/Badge/Badge';
import { useEntries } from '@/features/entries/hooks/useEntries';
import { getDailyTotalMinutes } from '@/features/entries/utils/entrySelectors';
import { formatDuration } from '@/features/entries/utils/timeCalculations';
import { useTimer } from '../hooks/useTimer';

export const StickyTimerBar = () => {
  const { entries, activeEntry } = useEntries();
  const { formatted } = useTimer(activeEntry);

  if (!activeEntry) {
    return (
      <div className="dashboard__sticky-bar dashboard__sticky-bar--idle">
        <span>No active timer</span>
      </div>
    );
  }

  const dailyTotal = activeEntry.adoId
    ? getDailyTotalMinutes(entries, activeEntry.adoId)
    : undefined;

  return (
    <div className="dashboard__sticky-bar">
      <span className="dashboard__sticky-label">Tracking</span>
      <span className="dashboard__sticky-title">{activeEntry.title}</span>
      {activeEntry.adoId && <Badge>#{activeEntry.adoId}</Badge>}
      <span className="dashboard__sticky-timer">{formatted}</span>
      {dailyTotal !== undefined && (
        <span className="dashboard__sticky-daily">
          {formatDuration(dailyTotal)} today
        </span>
      )}
    </div>
  );
};
