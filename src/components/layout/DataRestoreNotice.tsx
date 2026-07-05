import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

export function DataRestoreNotice() {
  const [visible, setVisible] = useState(true);

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
            className="flex items-start gap-3 rounded-2xl px-4 py-3 accent-solid"
            style={{ background: 'var(--accent-solid)' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] text-white"
            >
              <Info size={16} />
            </div>
            <p className="text-sm leading-snug flex-1" style={{ color: 'var(--ink)' }}>
              If you have saved your data as a JSON file, then once you download it and keep it, you can re-import
              that JSON file later. After doing so, all your data will be restored, and you'll be able to access it again.
            </p>
            <button
              onClick={() => setVisible(false)}
              aria-label="Dismiss"
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
            >
              <X size={16} style={{ color: 'var(--ink-soft)' }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
