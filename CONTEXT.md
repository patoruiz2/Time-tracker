# Time Tracker

A personal time tracker for logging work against Azure DevOps work items. Tracks how long you spend on each piece of work throughout the day.

## Language

**Work Item**:
The unit of work you are tracking, identified by an optional ADO work item ID (`adoId`). A Work Item can span multiple timer sessions across the day.
_Avoid_: Task, ticket, issue

**Time Entry**:
A single segment of tracked time with a start and end. Each segment belongs to one Work Item (via title and optional `adoId`). Status is `active`, `paused`, or `completed`. Paused segments appear in the daily history for time accounting — pause frequency is not tracked as a metric.
_Avoid_: Session, log, record

**ADO ID** (`adoId`):
The Azure DevOps work item number that identifies a Work Item. When two entries share the same `adoId`, their time is accumulated together in daily summaries.
_Avoid_: ID, work item ID, ticket number

**Pause**:
Stops the clock on the current Time Entry by closing the segment (`endTime` set, status `paused`). The Work Item is added to the paused list — whether paused explicitly or by a Switch. Requires an `adoId`; if the active entry has none, the user must provide one before pausing — the `adoId` is applied to the segment being closed.
_Avoid_: Stop (when you mean pause), suspend

**Complete**:
Closes the current Time Entry (`endTime` set, status `completed`) and removes the Work Item from the paused list. Does not require an `adoId`. When switching away from an active entry without `adoId`, Complete is the only way to close it — pause is not available. Can also be triggered from the paused list without resuming — all paused segments for that Work Item become `completed`.
_Avoid_: Stop, finish, done

**Paused list**:
The set of Work Items that were explicitly paused and not yet completed. Shown in a dedicated "En pausa" section and as options in the `adoId` combobox.
_Avoid_: Recent items, history, backlog

**Active timer**:
The single Time Entry currently running (`status: active`). Only one may exist at a time.
_Avoid_: Current task, running timer

**Resume**:
Starts a new Time Entry for a Work Item from the paused list, inheriting its `adoId`, title, and description. Removes the Work Item from the paused list while the timer runs. If another timer with an `adoId` is active, it is auto-paused first. If the active entry has no `adoId`, the user must Complete it before resuming.
_Avoid_: Restart, unpause

**Switch**:
Starting or resuming a different Work Item while a timer is active auto-pauses the current one (if it has an `adoId`) and begins the new segment. If the active entry has no `adoId`, the user must Complete it before switching.
_Avoid_: Context switch, change task

**Session time**:
The elapsed time of the current active Time Entry only. Shown on the running timer.
_Avoid_: Current time, elapsed

**Daily total**:
The sum of all Time Entry durations for a Work Item on a given calendar day, including paused and completed segments. Paused time counts toward the day it was worked, even if the Work Item is resumed on a later day.
_Avoid_: Accumulated time, total time

**Paused list persistence**:
Work Items on the paused list remain there across calendar days until completed or resumed. Daily totals do not carry over — each day starts fresh for accumulation purposes.
_Avoid_: Overnight reset, session expiry

**Manual entry**:
A Time Entry recorded retroactively with explicit start and end times. Always `completed`, never added to the paused list, but counts toward the daily total for its `adoId`.
_Avoid_: Log entry, manual log

## Example dialogue

**Dev:** Tengo `#12345` corriendo y me piden urgente `#67890`. ¿Qué hago?

**Expert:** Switch: `#12345` se pausa solo y arranca `#67890`. Los dos quedan en "En pausa" excepto el activo.

**Dev:** Y si estaba en "Daily standup" sin ADO ID?

**Expert:** No se puede pausar. Tenés que **Completar** el standup y después arrancar el otro.

**Dev:** Pauso `#12345` el viernes a las 18h con 2h. ¿Cuánto muestra el resumen del viernes?

**Expert:** 2h, aunque siga en pausa. El lunes retomás: el daily total del lunes arranca en 0 para ese día; las 2h del viernes no se mezclan.

**Dev:** ¿Cuento cuántas veces pausó alguien una task?

**Expert:** No. Los segmentos pausados son solo para contabilizar tiempo, no para métricas de pausa.
