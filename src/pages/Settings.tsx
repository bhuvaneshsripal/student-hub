import { useRef } from 'react';
import { Download, Upload, Trash2, Moon } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useToastStore } from '../store/toastStore';

const STORAGE_KEYS = [
  'studenthub-settings', 'studenthub-timetable', 'studenthub-cgpa',
  'studenthub-attendance', 'studenthub-placement', 'studenthub-productivity',
];

export default function Settings() {
  const push = useToastStore((s) => s.push);
  const fileRef = useRef<HTMLInputElement>(null);

  function backup() {
    const data: Record<string, string> = {};
    STORAGE_KEYS.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v) data[k] = v;
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    push('Backup downloaded', 'success');
  }

  function restore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        Object.entries(data).forEach(([k, v]) => {
          if (STORAGE_KEYS.includes(k)) localStorage.setItem(k, v as string);
        });
        push('Data restored — reloading...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        push('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  }

  function clearAll() {
    if (!confirm('This will erase all Student Hub data on this device. Continue?')) return;
    STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    push('All data cleared — reloading...', 'info');
    setTimeout(() => window.location.reload(), 800);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Personalize the app and manage your data.</p>
      </div>

      <Card>
        <CardHeader title="Appearance" icon={<Moon size={16} />} />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Dark Mode</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Switch between light and dark themes.</p>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      <Card>
        <CardHeader title="Backup & Restore" />
        <p className="text-sm mb-4" style={{ color: 'var(--ink-soft)' }}>
          Export all your timetable, CGPA, attendance, placement, and productivity data as a JSON file, or import a previous backup.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button icon={<Download size={14} />} onClick={backup}>Export Backup (JSON)</Button>
          <Button variant="outline" icon={<Upload size={14} />} onClick={() => fileRef.current?.click()}>Import Backup</Button>
          <input ref={fileRef} type="file" accept="application/json" onChange={restore} className="hidden" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Danger Zone" />
        <p className="text-sm mb-4" style={{ color: 'var(--ink-soft)' }}>Permanently erase all locally stored data for this app.</p>
        <Button variant="danger" icon={<Trash2 size={14} />} onClick={clearAll}>Clear All Data</Button>
      </Card>
    </div>
  );
}
