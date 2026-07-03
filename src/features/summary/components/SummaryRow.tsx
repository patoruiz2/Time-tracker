import { Badge } from '@/shared/components/Badge/Badge';
import { formatDuration } from '@/features/entries/utils/timeCalculations';
import type { WorkItemSummary } from '@/features/entries/types/entry.types';

interface SummaryRowProps {
  summary: WorkItemSummary;
}

export const SummaryRow = ({ summary }: SummaryRowProps) => (
  <article className="summary-row">
    {summary.adoId && <Badge>#{summary.adoId}</Badge>}
    <h3 className="summary-row__title">{summary.title}</h3>
    <p className="summary-row__duration">{formatDuration(summary.totalMinutes)}</p>
  </article>
);
