import { useState } from 'react';
import { Badge } from '@/shared/components/Badge/Badge';
import { Button } from '@/shared/components/Button/Button';
import { useEntries } from '@/features/entries/hooks/useEntries';
import { getDailyTotalMinutes } from '@/features/entries/utils/entrySelectors';
import {
  formatDuration,
  getEntryDurationMinutes,
} from '@/features/entries/utils/timeCalculations';
import { useTimer } from '../hooks/useTimer';
import { PauseAdoIdModal } from './PauseAdoIdModal';

export const ActiveTaskCard = () => {
  const { entries, activeEntry, pauseTimer, completeTimer } = useEntries();
  const { formatted } = useTimer(activeEntry);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!activeEntry) return null;

  const sessionMinutes = getEntryDurationMinutes(activeEntry);
  const dailyTotalMinutes = activeEntry.adoId
    ? getDailyTotalMinutes(entries, activeEntry.adoId)
    : undefined;

  const handlePause = () => {
    setActionError('');
    if (!activeEntry.adoId) {
      setPauseModalOpen(true);
      return;
    }
    const err = pauseTimer();
    if (err) setActionError(err);
  };

  const handlePauseWithAdoId = (adoId: string) => {
    const err = pauseTimer(adoId);
    if (err) setActionError(err);
    setPauseModalOpen(false);
  };

  const handleComplete = () => {
    setActionError('');
    const err = completeTimer();
    if (err) setActionError(err);
  };

  return (
    <>
      <div className="active-task">
        <div className="active-task__header">
          <span className="active-task__label">Active</span>
          {activeEntry.adoId && <Badge>#{activeEntry.adoId}</Badge>}
        </div>
        <h2 className="active-task__title">{activeEntry.title}</h2>
        {activeEntry.description && (
          <p className="active-task__desc">{activeEntry.description}</p>
        )}
        <div className="active-task__timers">
          <div>
            <span className="active-task__timer-label">Session</span>
            <div className="active-task__timer">{formatted}</div>
          </div>
          {dailyTotalMinutes !== undefined && (
            <div>
              <span className="active-task__timer-label">Today total</span>
              <div className="active-task__timer active-task__timer--secondary">
                {formatDuration(dailyTotalMinutes)}
              </div>
              {sessionMinutes < dailyTotalMinutes && (
                <span className="active-task__timer-hint">
                  incl. {formatDuration(dailyTotalMinutes - sessionMinutes)} earlier
                </span>
              )}
            </div>
          )}
        </div>
        {actionError && <p className="task-form__error">{actionError}</p>}
        <div className="active-task__actions">
          <Button variant="secondary" onClick={handlePause}>
            Pause
          </Button>
          <Button variant="danger" onClick={handleComplete}>
            Complete
          </Button>
        </div>
      </div>

      <PauseAdoIdModal
        open={pauseModalOpen}
        taskTitle={activeEntry.title}
        onClose={() => setPauseModalOpen(false)}
        onConfirm={handlePauseWithAdoId}
      />
    </>
  );
};
