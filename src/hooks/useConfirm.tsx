import { useCallback, useRef, useState } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
}

/**
 * Usage:
 *   const { confirm, dialog } = useConfirm();
 *   <button onClick={() => confirm({ message: 'Delete this task?' }, () => removeTask(id))}>
 *   ...render {dialog} once near the bottom of the page
 *
 * Every delete/remove action in the app should be routed through this so the
 * user is always asked to confirm before anything is actually removed.
 */
export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const actionRef = useRef<(() => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions, action: () => void) => {
    setOptions(opts);
    actionRef.current = action;
    setOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    actionRef.current?.();
    actionRef.current = null;
    setOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    actionRef.current = null;
    setOpen(false);
  }, []);

  const dialog = (
    <ConfirmDialog
      open={open}
      title={options.title}
      message={options.message}
      confirmLabel={options.confirmLabel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, dialog };
}
