import { useRef, useState } from 'react';
import { Download, Upload, Trash2, Moon, Eye } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useToastStore } from '../store/toastStore';

const STORAGE_KEYS = [
  'studenthub-settings', 'studenthub-timetable', 'studenthub-cgpa',
  'studenthub-attendance', 'studenthub-placement', 'studenthub-productivity',
];

function buildBackupData() {
  const data: Record<string, string> = {};
  STORAGE_KEYS.forEach((k) => {
    const v = localStorage.getItem(k);
    if (v) data[k] = v;
  });
  return data;
}

export default function Settings() {
  const push = useToastStore((s) => s.push);
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewJson, setPreviewJson] = useState('');
  const [previewMode, setPreviewMode] = useState<'export' | 'import'>('export');
  const [pendingRestoreData, setPendingRestoreData] = useState<Record<string, unknown> | null>(null);

  function openExportPreview() {
    setPreviewMode('export');
    setPreviewJson(JSON.stringify(buildBackupData(), null, 2));
    setPendingRestoreData(null);
    setPreviewOpen(true);
  }

  function backup() {
    const data = buildBackupData();
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
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        setPreviewMode('import');
        setPreviewJson(JSON.stringify(data, null, 2));
        setPendingRestoreData(data);
        setPreviewOpen(true);
      } catch {
        push('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  }

  function confirmRestore() {
    if (!pendingRestoreData) return;
    Object.entries(pendingRestoreData).forEach(([k, v]) => {
      if (STORAGE_KEYS.includes(k)) localStorage.setItem(k, v as string);
    });
    push('Data restored — reloading...', 'success');
    setPreviewOpen(false);
    setTimeout(() => window.location.reload(), 1000);
  }

  function clearAll() {
    if (!confirm('This will erase all Studo data on this device. Continue?')) return;
    STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    push('All data cleared — reloading...', 'info');
    setTimeout(() => window.location.reload(), 800);
  }

  return (
    <div className="space-y-5">
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
          <Button variant="outline" icon={<Eye size={14} />} onClick={openExportPreview}>Preview Backup</Button>
          <input ref={fileRef} type="file" accept="application/json" onChange={restore} className="hidden" />
        </div>
        <p className="text-xs mt-4 leading-snug" style={{ color: 'var(--ink-soft)' }}>
          If you have saved your data as a JSON file, then once you download it and keep it, you can re-import that
          JSON file later. After doing so, all your data will be restored, and you'll be able to access it again.
        </p>
      </Card>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewMode === 'export' ? 'Backup Preview' : 'Restore Preview'}
        width="max-w-2xl"
      >
        <p className="text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>
          {previewMode === 'export'
            ? 'This is exactly what will be saved to your backup JSON file.'
            : 'Review the contents of this backup file before restoring it. Restoring will overwrite your current data.'}
        </p>
        <pre
          className="text-xs rounded-xl p-3 overflow-auto max-h-[50vh] whitespace-pre-wrap break-words"
          style={{ background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--ink)' }}
        >
          {previewJson || 'No data found.'}
        </pre>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setPreviewOpen(false)}>
            {previewMode === 'export' ? 'Close' : 'Cancel'}
          </Button>
          {previewMode === 'export' ? (
            <Button icon={<Download size={14} />} onClick={backup}>Download Backup</Button>
          ) : (
            <Button icon={<Upload size={14} />} onClick={confirmRestore}>Confirm Restore</Button>
          )}
        </div>
      </Modal>

      <Card>
        <CardHeader title="Danger Zone" />
        <p className="text-sm mb-4" style={{ color: 'var(--ink-soft)' }}>Permanently erase all locally stored data for this app.</p>
        <Button variant="danger" icon={<Trash2 size={14} />} onClick={clearAll}>Clear All Data</Button>
      </Card>
    </div>
  );
}
