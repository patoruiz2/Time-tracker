import { useState } from 'react';
import { Badge } from '@/shared/components/Badge/Badge';
import { Button } from '@/shared/components/Button/Button';
import { formatDuration } from '@/features/entries/utils/timeCalculations';
import { useEntries } from '@/features/entries/hooks/useEntries';

export const PausedList = () => {
  const { pausedWorkItems, resumeTimer, completePausedWorkItem } = useEntries();
  const [error, setError] = useState('');

  if (pausedWorkItems.length === 0) return null;

  const handleResume = (adoId: string) => {
    const err = resumeTimer(adoId);
    setError(err ?? '');
  };

  const handleComplete = (adoId: string) => {
    const err = completePausedWorkItem(adoId);
    setError(err ?? '');
  };

  return (
    <div className="paused-list">
      <h3 className="paused-list__title">En pausa</h3>
      {error && <p className="task-form__error">{error}</p>}
      <ul className="paused-list__items">
        {pausedWorkItems.map((item) => (
          <li key={item.adoId} className="paused-list__item">
            <div className="paused-list__main">
              <Badge>#{item.adoId}</Badge>
              <span className="paused-list__name">{item.title}</span>
              <span className="paused-list__total">
                {formatDuration(item.dailyTotalMinutes)} today
              </span>
            </div>
            <div className="paused-list__actions">
              <Button
                type="button"
                variant="primary"
                onClick={() => handleResume(item.adoId)}
              >
                Resume
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleComplete(item.adoId)}
              >
                Complete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
