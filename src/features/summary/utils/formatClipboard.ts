import type { WorkItemSummary } from '@/features/entries/types/entry.types';
import { formatDuration } from '@/features/entries/utils/timeCalculations';

const formatWorkItemLine = (summary: WorkItemSummary): string => {
  const idPart = summary.adoId ? `#${summary.adoId}` : '(no ADO ID)';
  return `${idPart} — ${summary.title} — ${formatDuration(summary.totalMinutes)}`;
};

export const formatClipboardAll = (summaries: WorkItemSummary[]): string =>
  summaries.map(formatWorkItemLine).join('\n');
