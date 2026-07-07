import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A generic confirmation dialog used before any destructive/delete action.
 * Keep this the single place that renders "are you sure?" prompts so the
 * whole app asks for confirmation consistently before removing anything.
 */
export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} width="max-w-sm">
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(240,68,56,0.12)' }}
        >
          <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
        </div>
        <p className="text-sm pt-1.5" style={{ color: 'var(--ink-soft)' }}>{message}</p>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
