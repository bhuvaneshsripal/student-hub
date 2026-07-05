import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, children, width = 'max-w-lg' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full ${width} glass-solid rounded-2xl p-6 max-h-[85vh] overflow-y-auto`}
            style={{ background: 'var(--glass-solid)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--ink)' }}>{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/[0.08]">
                <X size={18} style={{ color: 'var(--ink-soft)' }} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
