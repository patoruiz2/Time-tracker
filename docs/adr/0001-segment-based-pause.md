# Segment-based pause closes Time Entries

The time tracker needs pause-without-complete, concurrent work items (one active, many paused), and daily accumulation by `adoId`. We decided that **pausing closes the current Time Entry** (`endTime` set, `status: paused`) and **resuming creates a new Time Entry** for the same Work Item. Accumulation is the sum of segments per calendar day — not a single open timer that freezes in place.

We rejected keeping one open entry on pause (no `endTime`, clock frozen internally). That model complicates duration math, blurs the boundary with manual entries, and makes daily totals harder to reason about when a Work Item spans hours or days. Closed segments give each worked interval a real start/end, count toward the day they were worked even while still on the paused list, and align with how `groupByWorkItem` already aggregates multiple entries.

## Considered options

- **Close segment on pause (chosen).** Each pause/resume cycle is a distinct Time Entry. Daily total = sum of segments for that `adoId` on that day.
- **Freeze open entry on pause.** One entry stays `active`-like with internal pause offsets. Resume continues the same row. Rejected: harder to represent in history, awkward cross-day behavior, and no clear win for a tracker that already treats each start/stop as a segment.

## Consequences

- `EntryStatus` gains `paused` alongside `active` and `completed`.
- Daily summaries and entry history must include `paused` segments, not only `completed`.
- The paused list is a **Work Item** concern (keyed by `adoId`), not a single row — one Work Item may have several paused segments in a day, but appears once in the list.
- Session time (running clock) and daily total (accumulated segments) are separate UI concerns.
