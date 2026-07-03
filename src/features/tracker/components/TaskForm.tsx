import { useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';
import { useEntries } from '@/features/entries/hooks/useEntries';
import { PausedList } from './PausedList';

type EntryMode = 'timer' | 'manual';

const toDatetimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const TaskForm = () => {
  const { activeEntry, pausedWorkItems, startTimer, addManualEntry } = useEntries();
  const [mode, setMode] = useState<EntryMode>('timer');
  const [title, setTitle] = useState('');
  const [adoId, setAdoId] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(toDatetimeLocal(new Date()));
  const [endTime, setEndTime] = useState(toDatetimeLocal(new Date()));
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setAdoId('');
    setDescription('');
    setError('');
  };

  const handleTimerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const err = startTimer({
      title: title.trim(),
      adoId: adoId.trim() || undefined,
      description: description.trim() || undefined,
    });
    if (err) {
      setError(err);
      return;
    }
    resetForm();
  };

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const startIso = new Date(startTime).toISOString();
    const endIso = new Date(endTime).toISOString();
    const ok = addManualEntry({
      title: title.trim(),
      adoId: adoId.trim() || undefined,
      description: description.trim() || undefined,
      startTime: startIso,
      endTime: endIso,
    });
    if (!ok) {
      setError('End time must be after start time.');
      return;
    }
    resetForm();
  };

  const adoListId = 'paused-ado-options';

  return (
    <div className="task-form">
      <PausedList />

      <div className="task-form__mode">
        <Button
          type="button"
          variant={mode === 'timer' ? 'primary' : 'secondary'}
          onClick={() => { setMode('timer'); setError(''); }}
        >
          Timer
        </Button>
        <Button
          type="button"
          variant={mode === 'manual' ? 'primary' : 'secondary'}
          onClick={() => { setMode('manual'); setError(''); }}
        >
          Manual
        </Button>
      </div>

      <form onSubmit={mode === 'timer' ? handleTimerSubmit : handleManualSubmit}>
        <Input
          label="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What are you working on?"
        />
        <Input
          label="ADO Work Item ID"
          value={adoId}
          onChange={(e) => setAdoId(e.target.value)}
          placeholder="e.g. 12345"
          list={pausedWorkItems.length > 0 ? adoListId : undefined}
        />
        {pausedWorkItems.length > 0 && (
          <datalist id={adoListId}>
            {pausedWorkItems.map((item) => (
              <option key={item.adoId} value={item.adoId}>
                {item.title}
              </option>
            ))}
          </datalist>
        )}
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes"
        />

        {mode === 'manual' && (
          <>
            <Input
              label="Start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="End"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </>
        )}

        {error && <p className="task-form__error">{error}</p>}

        {activeEntry && mode === 'timer' && (
          <p className="task-form__hint">
            Starting will auto-pause the active timer if it has an ADO ID.
          </p>
        )}

        <Button type="submit">
          {mode === 'timer' ? 'Start timer' : 'Log entry'}
        </Button>
      </form>
    </div>
  );
};
