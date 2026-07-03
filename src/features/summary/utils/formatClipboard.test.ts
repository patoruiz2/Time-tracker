import { describe, expect, it } from 'vitest';
import { formatClipboardAll } from './formatClipboard';
import type { WorkItemSummary } from '@/features/entries/types/entry.types';

describe('formatClipboardAll', () => {
  it('formats each work item on its own line with ADO ID and duration', () => {
    const summaries: WorkItemSummary[] = [
      {
        adoId: '10001',
        title: 'Fix login',
        totalMinutes: 90,
        entries: [],
      },
      {
        adoId: undefined,
        title: 'Misc work',
        totalMinutes: 45,
        entries: [],
      },
    ];

    expect(formatClipboardAll(summaries)).toBe(
      '#10001 — Fix login — 1h 30m\n(no ADO ID) — Misc work — 45m',
    );
  });
});
