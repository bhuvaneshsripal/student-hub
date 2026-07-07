import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const COLORS = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--blue)' };

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 no-print">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              className="glass rounded-xl px-4 py-3 flex items-center gap-2.5 min-w-[260px] max-w-sm shadow-xl"
            >
              <Icon size={18} style={{ color: COLORS[t.variant] }} className="shrink-0" />
              <span className="text-sm flex-1" style={{ color: 'var(--ink)' }}>{t.message}</span>
              {t.onUndo && (
                <button
                  onClick={() => {
                    t.onUndo?.();
                    dismiss(t.id);
                  }}
                  className="text-xs font-semibold shrink-0 px-2 py-1 rounded-lg hover:opacity-80"
                  style={{ color: 'var(--blue)' }}
                >
                  Undo
                </button>
              )}
              <button onClick={() => dismiss(t.id)}>
                <X size={14} style={{ color: 'var(--ink-soft)' }} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
