import { useEntries } from '../hooks/useEntries';
import { getTodayEntries } from '../utils/timeCalculations';
import { EntryItem } from './EntryItem';

export const EntryList = () => {
  const { entries, deleteEntry } = useEntries();
  const todayEntries = getTodayEntries(entries);

  if (todayEntries.length === 0) {
    return <p className="entry-list__empty">No entries logged today.</p>;
  }

  return (
    <section className="entry-list">
      <h2 className="section-title">Today&apos;s entries</h2>
      <ul className="entry-list__items">
        {todayEntries.map((entry) => (
          <EntryItem key={entry.id} entry={entry} onDelete={deleteEntry} />
        ))}
      </ul>
    </section>
  );
};
