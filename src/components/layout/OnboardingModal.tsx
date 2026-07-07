import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export function OnboardingModal() {
  const { hasOnboarded, updateProfile, completeOnboarding } = useSettingsStore();
  const [form, setForm] = useState({ name: '', registerNumber: '', department: '', year: '', semester: '' });

  function submit() {
    updateProfile(form);
    completeOnboarding();
  }

  function skip() {
    completeOnboarding();
  }

  return (
    <AnimatePresence>
      {!hasOnboarded && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg glass rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] flex items-center justify-center text-[var(--on-accent)] shrink-0">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--ink)' }}>Welcome to Studo</h3>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Tell us a bit about yourself to personalize the app.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Student Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Alex Rivera" />
              <Field label="Register Number" value={form.registerNumber} onChange={(v) => setForm({ ...form, registerNumber: v })} placeholder="e.g. REG2024CS041" />
              <Field label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} placeholder="e.g. Computer Science" />
              <Field label="Year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} placeholder="e.g. 3rd Year" />
              <Field label="Semester" value={form.semester} onChange={(v) => setForm({ ...form, semester: v })} placeholder="e.g. Semester 5" />
            </div>

            <div className="flex items-center justify-between gap-2 pt-5">
              <button onClick={skip} className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>
                Skip for now
              </button>
              <button
                onClick={submit}
                disabled={!form.name.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--on-accent)] bg-gradient-to-r from-[var(--blue)] to-[var(--purple)] shadow-lg shadow-[var(--blue)]/25 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>{label}</span>
      <input
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
        style={{ background: 'var(--bg)', color: 'var(--ink)', border: '1px solid var(--line)' }}
      />
    </label>
  );
}
