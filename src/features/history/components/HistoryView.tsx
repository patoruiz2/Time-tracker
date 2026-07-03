import { useState } from 'react';
import { EntryItem } from '@/features/entries';
import { useEntries } from '@/features/entries/hooks/useEntries';
import { formatDuration } from '@/features/entries/utils/timeCalculations';
import { useHistory } from '../hooks/useHistory';

export const HistoryView = () => {
  const { days } = useHistory();
  const { deleteEntry } = useEntries();
  const [openDays, setOpenDays] = useState<Set<string>>(() => new Set());

  const toggleDay = (date: string) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  if (days.length === 0) {
    return <p className="entry-list__empty">No history yet.</p>;
  }

  return (
    <div className="dashboard__accordion">
      {days.map((day) => (
        <div key={day.date} className="dashboard__accordion-item">
          <button
            type="button"
            className="dashboard__accordion-header"
            onClick={() => toggleDay(day.date)}
            aria-expanded={openDays.has(day.date)}
          >
            <span>{day.dateLabel}</span>
            <span className="dashboard__accordion-meta">
              {formatDuration(day.totalMinutes)} · {day.entries.length} entries
            </span>
            <span aria-hidden="true">{openDays.has(day.date) ? '−' : '+'}</span>
          </button>
          {openDays.has(day.date) && (
            <ul className="entry-list__items dashboard__accordion-body">
              {day.entries.map((entry) => (
                <EntryItem key={entry.id} entry={entry} onDelete={deleteEntry} />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};
