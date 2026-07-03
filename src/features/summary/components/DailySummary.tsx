import { formatDuration } from '@/features/entries/utils/timeCalculations';
import { useSummary } from '../hooks/useSummary';
import { ClipboardButton } from './ClipboardButton';
import { SummaryRow } from './SummaryRow';

export const DailySummary = () => {
  const { summaries, totalMinutes, clipboardText } = useSummary();

  return (
    <section className="dashboard__section" aria-labelledby="summary-heading">
      <div className="dashboard__summary-header">
        <h2 id="summary-heading" className="section-title">Today&apos;s rollup</h2>
        <span className="dashboard__total">{formatDuration(totalMinutes)}</span>
      </div>
      {summaries.length === 0 ? (
        <p className="entry-list__empty">No tracked time today.</p>
      ) : (
        <>
          <div className="dashboard__rollup-scroll">
            {summaries.map((s) => (
              <SummaryRow key={s.adoId ?? s.title} summary={s} />
            ))}
          </div>
          <div className="dashboard__clipboard-preview">
            <div className="dashboard__clipboard-header">
              <h3 className="section-title">Clipboard preview</h3>
              <ClipboardButton text={clipboardText} label="Copy all" />
            </div>
            <pre className="dashboard__clipboard-text">{clipboardText}</pre>
          </div>
        </>
      )}
    </section>
  );
};
