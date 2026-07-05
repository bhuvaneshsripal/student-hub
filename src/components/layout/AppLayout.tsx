import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { FAB } from '../ui/FAB';
import { ToastContainer } from '../ui/Toast';
import { useSettingsStore } from '../../store/settingsStore';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-mesh flex">
      <ToastContainer />
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r" style={{ borderColor: 'var(--line)' }}>
        <Sidebar />
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 h-full w-64 glass"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-3 w-8 h-8 flex items-center justify-center">
                <X size={18} style={{ color: 'var(--ink)' }} />
              </button>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <FAB />
    </div>
  );
}
