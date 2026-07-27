import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { FAB } from '../ui/FAB';
import { ToastContainer } from '../ui/Toast';
import { OnboardingModal } from './OnboardingModal';
import { useSettingsStore } from '../../store/settingsStore';
import { applyTheme } from '../../lib/applyTheme';
import { useClassReminders } from '../../hooks/useClassReminders';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useSettingsStore((s) => s.theme);
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed);

  useClassReminders();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Lock body scroll while the mobile drawer is open so the page behind it
  // doesn't scroll and bleed through/overlay the menu.
  useEffect(() => {
    document.body.classList.toggle('no-scroll', mobileOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-mesh flex">
      <OnboardingModal />
      <ToastContainer />
      {/* Desktop sidebar */}
      <aside
        className="hidden md:block shrink-0 border-r overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ borderColor: 'var(--sidebar-line)', background: 'var(--sidebar-bg)', width: sidebarCollapsed ? 76 : 256 }}
      >
        <Sidebar collapsible />
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[60] md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 h-full w-72 max-w-[80vw] border-r overflow-y-auto"
              style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-line)' }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 right-3 w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: 'var(--sidebar-ink)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={18} />
              </button>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 pb-28 md:p-6 md:pb-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <FAB />
    </div>
  );
}
