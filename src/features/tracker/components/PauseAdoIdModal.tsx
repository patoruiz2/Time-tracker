import { useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';
import './PauseAdoIdModal.css';

interface PauseAdoIdModalProps {
  open: boolean;
  taskTitle: string;
  onClose: () => void;
  onConfirm: (adoId: string) => void;
}

export const PauseAdoIdModal = ({
  open,
  taskTitle,
  onClose,
  onConfirm,
}: PauseAdoIdModalProps) => {
  const [adoId, setAdoId] = useState('');

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = adoId.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setAdoId('');
  };

  const handleClose = () => {
    setAdoId('');
    onClose();
  };

  return (
    <div className="pause-modal-overlay" onClick={handleClose} role="presentation">
      <div
        className="pause-modal"
        role="dialog"
        aria-labelledby="pause-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="pause-modal-title" className="pause-modal__title">
          ADO ID required to pause
        </h3>
        <p className="pause-modal__desc">
          Assign an ADO work item ID to <strong>{taskTitle}</strong> before pausing.
        </p>
        <form onSubmit={handleSubmit}>
          <Input
            label="ADO Work Item ID *"
            value={adoId}
            onChange={(e) => setAdoId(e.target.value)}
            placeholder="e.g. 12345"
            autoFocus
          />
          <div className="pause-modal__actions">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!adoId.trim()}>
              Pause
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
