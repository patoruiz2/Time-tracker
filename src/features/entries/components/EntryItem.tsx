import { Badge } from '@/shared/components/Badge/Badge';
import { Button } from '@/shared/components/Button/Button';
import { formatDateTime } from '@/shared/utils/formatDate';
import type { TimeEntry } from '../types/entry.types';
import {
  formatDuration,
  getEntryDurationMinutes,
} from '../utils/timeCalculations';

interface EntryItemProps {
  entry: TimeEntry;
  onDelete: (id: string) => void;
}

const statusLabel = (status: TimeEntry['status']) => {
  if (status === 'paused') return 'Paused';
  if (status === 'active') return 'Active';
  return null;
};

export const EntryItem = ({ entry, onDelete }: EntryItemProps) => {
  const duration = formatDuration(getEntryDurationMinutes(entry));
  const label = statusLabel(entry.status);

  return (
    <li className="entry-item">
      <div className="entry-item__main">
        <span className="entry-item__title">{entry.title}</span>
        {entry.adoId && <Badge>#{entry.adoId}</Badge>}
        {label && <Badge className="badge--paused">{label}</Badge>}
        <span className="entry-item__duration">{duration}</span>
      </div>
      <div className="entry-item__meta">
        <span>
          {formatDateTime(entry.startTime)}
          {entry.endTime && ` → ${formatDateTime(entry.endTime)}`}
        </span>
        {entry.description && <span className="entry-item__desc">{entry.description}</span>}
      </div>
      <Button variant="danger" onClick={() => onDelete(entry.id)}>
        Delete
      </Button>
    </li>
  );
};
