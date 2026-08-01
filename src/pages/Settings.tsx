import { useRef, useState } from 'react';
import { Download, Upload, Trash2, Moon, Eye, BellRing, BellOff, Minus, Plus, RotateCcw } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Switch } from '../components/ui/Switch';
import { useToastStore } from '../store/toastStore';
import { useConfirm } from '../hooks/useConfirm';
import { useSettingsStore } from '../store/settingsStore';

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
  const { confirm, dialog } = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewJson, setPreviewJson] = useState('');
  const [previewMode, setPreviewMode] = useState<'export' | 'import'>('export');
  const [pendingRestoreData, setPendingRestoreData] = useState<Record<string, unknown> | null>(null);

  const classReminders = useSettingsStore((s) => s.classReminders);
  const toggleClassReminders = useSettingsStore((s) => s.toggleClassReminders);
  const systemNotifications = useSettingsStore((s) => s.systemNotifications);
  const toggleSystemNotifications = useSettingsStore((s) => s.toggleSystemNotifications);
  const fontScale = useSettingsStore((s) => s.fontScale);
  const increaseFontScale = useSettingsStore((s) => s.increaseFontScale);
  const decreaseFontScale = useSettingsStore((s) => s.decreaseFontScale);
  const setFontScale = useSettingsStore((s) => s.setFontScale);
  const screenScale = useSettingsStore((s) => s.screenScale);
  const increaseScreenScale = useSettingsStore((s) => s.increaseScreenScale);
  const decreaseScreenScale = useSettingsStore((s) => s.decreaseScreenScale);
  const setScreenScale = useSettingsStore((s) => s.setScreenScale);

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
    confirm(
      { title: 'Clear all data?', message: 'This will erase all Studo data on this device. This cannot be undone.', confirmLabel: 'Clear Data' },
      () => {
        STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
        push('All data cleared — reloading...', 'info');
        setTimeout(() => window.location.reload(), 800);
      }
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Personalize the app and manage your data.</p>
      </div>

      <Card>
        <CardHeader title="Appearance" icon={<Moon size={16} />} color="purple" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Dark Mode</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Switch between light and dark themes.</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-px my-4" style={{ background: 'var(--line)' }} />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Font Size</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Make text throughout the app bigger or smaller.</p>
          </div>
          <SizeStepper value={fontScale} min={85} max={130} onDecrease={decreaseFontScale} onIncrease={increaseFontScale} onReset={() => setFontScale(100)} />
        </div>
        <div className="h-px my-4" style={{ background: 'var(--line)' }} />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Screen Size</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Zoom the whole app in or out, like a browser zoom.</p>
          </div>
          <SizeStepper value={screenScale} min={80} max={120} onDecrease={decreaseScreenScale} onIncrease={increaseScreenScale} onReset={() => setScreenScale(100)} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Notifications" icon={<BellRing size={16} />} color="blue" />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Notify before class</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Get a browser notification 10 minutes before each class in your timetable.</p>
          </div>
          <Switch
            checked={classReminders}
            label="Toggle class reminders"
            onIcon={<BellRing size={13} className="text-[var(--blue)]" />}
            offIcon={<BellOff size={13} className="text-[var(--ink-soft)]" />}
            onChange={async () => {
              if (!classReminders && 'Notification' in window && Notification.permission === 'default') {
                await Notification.requestPermission();
              }
              toggleClassReminders();
            }}
          />
        </div>
        <div className="h-px my-4" style={{ background: 'var(--line)' }} />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>System notifications</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Show every in-app notification as a normal device notification, just like your other apps.</p>
          </div>
          <Switch
            checked={systemNotifications}
            label="Toggle system notifications"
            onIcon={<BellRing size={13} className="text-[var(--blue)]" />}
            offIcon={<BellOff size={13} className="text-[var(--ink-soft)]" />}
            onChange={async () => {
              if (!systemNotifications && 'Notification' in window && Notification.permission === 'default') {
                await Notification.requestPermission();
              }
              toggleSystemNotifications();
            }}
          />
        </div>
        {(classReminders || systemNotifications) && 'Notification' in window && Notification.permission === 'denied' && (
          <p className="text-xs mt-3" style={{ color: 'var(--danger)' }}>
            Notifications are blocked for this site in your browser settings, so they won't show up until you allow them.
          </p>
        )}
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

      {dialog}
    </div>
  );
}

/** Shared -/percentage/+ control used by both the Font Size and Screen Size
 * rows above. The two rows pass in independent state/actions, so adjusting
 * one never affects the other. */
function SizeStepper({
  value, min, max, onDecrease, onIncrease, onReset,
}: {
  value: number; min: number; max: number;
  onDecrease: () => void; onIncrease: () => void; onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--line)' }}>
      <button
        onClick={onDecrease}
        disabled={value <= min}
        aria-label="Decrease size"
        title="Decrease size"
        className="w-8 h-8 rounded-md flex items-center justify-center disabled:opacity-40 hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
      >
        <Minus size={14} style={{ color: 'var(--ink)' }} />
      </button>
      <button
        onClick={onReset}
        aria-label="Reset size"
        title="Reset to default"
        className="min-w-[48px] h-8 px-2 rounded-md flex items-center justify-center gap-1 text-xs font-semibold hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
        style={{ color: 'var(--ink)' }}
      >
        {value === 100 ? <RotateCcw size={12} /> : null}
        {value}%
      </button>
      <button
        onClick={onIncrease}
        disabled={value >= max}
        aria-label="Increase size"
        title="Increase size"
        className="w-8 h-8 rounded-md flex items-center justify-center disabled:opacity-40 hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
      >
        <Plus size={14} style={{ color: 'var(--ink)' }} />
      </button>
    </div>
  );
}
