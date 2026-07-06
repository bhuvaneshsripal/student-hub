import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, ChevronDown } from 'lucide-react';

export function DataRestoreNotice() {
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="no-print overflow-hidden"
        >
          <div
            className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 accent-solid"
            style={{ background: 'var(--accent-solid)' }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] text-white"
            >
              <Info size={12} />
            </div>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs leading-snug flex-1 text-left"
              style={{ color: 'var(--ink)' }}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide">Backup</span>
                <motion.span
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown size={13} style={{ color: 'var(--ink-soft)' }} />
                </motion.span>
              </span>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block overflow-hidden mt-1"
                  >
                    If you have saved your data as a JSON file, then once you download it and keep it, you can re-import
                    that JSON file later. After doing so, all your data will be restored, and you'll be able to access it again.
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setVisible(false)}
              aria-label="Dismiss"
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
            >
              <X size={13} style={{ color: 'var(--ink-soft)' }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
