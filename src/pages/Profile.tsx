import { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, User, Bot, Hash, Building2, GraduationCap, Layers, Mail, Pencil, RotateCcw as UndoIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { auth } from '../firebase';
import { AvatarEditor } from '../components/ui/AvatarEditor';
import { useToastStore } from '../store/toastStore';

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12MB — generous, since it's downscaled/compressed on save anyway

const FIELD_ICONS: Record<string, typeof User> = {
  'Student Name': User,
  'Register Number': Hash,
  'Department': Building2,
  'Year': GraduationCap,
  'Semester': Layers,
};

export default function Profile() {
  const { profile, updateProfile } = useSettingsStore();
  const pushToast = useToastStore((s) => s.push);
  // See Topbar.tsx for why this exists: Google's profile photo URL can
  // fail to load (blocked by an extension, expired, offline, etc), and
  // without this it leaves a broken-image icon instead of a clean fallback.
  const [avatarBroken, setAvatarBroken] = useState(false);
  useEffect(() => {
    setAvatarBroken(false);
  }, [profile.avatar]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      pushToast("That file isn't an image.", 'error');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      pushToast('That image is too large. Please pick one under 12MB.', 'error');
      return;
    }
    setPickedFile(file);
  }

  function saveAvatar(dataUrl: string) {
    updateProfile({ avatar: dataUrl, avatarIsCustom: true });
    setPickedFile(null);
    pushToast('Profile picture updated.', 'success');
  }

  function useAccountPhoto() {
    updateProfile({ avatar: auth.currentUser?.photoURL ?? '', avatarIsCustom: false });
    pushToast('Switched back to your account photo.', 'success');
  }

  const nameParts = [profile.department.trim(), profile.year.trim()].filter(Boolean);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-6">
      <div className="flex items-center justify-between gap-5 py-6">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Profile</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Your student information, shown across the app.</p>
        </div>
        <Link
          to="/settings"
          aria-label="Go to settings"
          title="Settings"
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          style={{ border: '1px solid var(--line)' }}
        >
          <SettingsIcon size={17} style={{ color: 'var(--ink)' }} />
        </Link>
      </div>

      <div className="flex items-center gap-5">
        {/* Picture defaults to your signed-in account's photo (e.g. Google),
            but can be replaced with your own — cropped and rotated — via
            the edit button below. */}
        <div className="relative shrink-0">
          <div className="w-25 h-25 rounded-2xl bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] flex items-center justify-center text-[var(--on-accent)] font-display font-bold text-2xl overflow-hidden">
            {profile.avatar && !avatarBroken ? (
              <img
                src={profile.avatar}
                alt="avatar"
                referrerPolicy="no-referrer"
                onError={() => setAvatarBroken(true)}
                className="w-full h-full object-cover"
              />
            ) : profile.name.trim() ? (
              profile.name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('')
            ) : (
              <Bot size={32} />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Edit profile picture"
            title="Edit profile picture"
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ background: 'var(--blue)', color: 'var(--on-accent)', border: '2px solid var(--bg)' }}
          >
            <Pencil size={13} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFilePicked}
            className="hidden"
          />
        </div>
        <div className="min-w-0">
          <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--ink)' }}>
            {profile.name.trim() || 'Add your name'}
          </h2>
          {nameParts.length > 0 && (
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{nameParts.join(' • ')}</p>
          )}
          {profile.avatarIsCustom && (
            <button
              type="button"
              onClick={useAccountPhoto}
              className="flex items-center gap-1.5 text-xs font-medium mt-1.5 hover:underline"
              style={{ color: 'var(--ink-soft)' }}
            >
              <UndoIcon size={12} /> Use account photo instead
            </button>
          )}
        </div>
      </div>

      {pickedFile && (
        <AvatarEditor
          file={pickedFile}
          onCancel={() => setPickedFile(null)}
          onSave={saveAvatar}
        />
      )}

      <div className="w-full max-w-6xl">
        <span className="text-xs font-semibold tracking-wide uppercase block mb-3" style={{ color: 'var(--ink-soft)' }}>
          Student details
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FieldRow label="Student Name" value={profile.name} onChange={(v) => updateProfile({ name: v })} />
          <FieldRow label="Register Number" value={profile.registerNumber} onChange={(v) => updateProfile({ registerNumber: v })} />
          <FieldRow label="Department" value={profile.department} onChange={(v) => updateProfile({ department: v })} />
          <FieldRow label="Year" value={profile.year} onChange={(v) => updateProfile({ year: v })} />
          <FieldRow label="Semester" value={profile.semester} onChange={(v) => updateProfile({ semester: v })} />
          <FieldRowStatic label="Email" value={auth.currentUser?.email ?? ''} />
        </div>
      </div>
      <style>{FIELD_INPUT_STYLE}</style>
    </div>
  );
}

function FieldRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = FIELD_ICONS[label] ?? User;

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function save() {
    onChange(draft.trim());
    setEditing(false);
  }

  return (
    <div
      onClick={() => !editing && setEditing(true)}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-colors duration-150"
      style={{
        background: 'var(--bg-elev)',
        border: '1px solid var(--line)',
        cursor: editing ? 'default' : 'pointer',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'var(--accent-solid)' }}
      >
        <Icon size={16} style={{ color: 'var(--accent-solid-border)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>{label}</span>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
            onBlur={save}
            className="field-edit-input w-full px-0 py-1 text-[15px]"
            style={{ color: 'var(--ink)' }}
          />
        ) : (
          <p className="text-[15px] truncate" style={{ color: value ? 'var(--ink)' : 'var(--ink-soft)' }}>
            {value || `Add ${label.toLowerCase()}`}
          </p>
        )}
      </div>
    </div>
  );
}

/** Read-only box — shows the account's login email. No edit affordance. */
function FieldRowStatic({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'var(--accent-solid)' }}
      >
        <Mail size={16} style={{ color: 'var(--accent-solid-border)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>{label}</span>
        <p className="text-[15px] truncate" style={{ color: value ? 'var(--ink)' : 'var(--ink-soft)' }}>
          {value || 'Not signed in'}
        </p>
      </div>
    </div>
  );
}

// !important here is intentional: text inputs carry native browser chrome
// (a default border/inset shadow) that some browsers re-apply on focus even
// after an inline style clears it. This rule guarantees the edit field is
// never anything but bare text with a blinking cursor, in every browser and
// regardless of any other style rule in the app.
const FIELD_INPUT_STYLE = `
  .field-edit-input {
    background: transparent !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    border-radius: 0 !important;
  }
  .field-edit-input:focus, .field-edit-input:focus-visible {
    background: transparent !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }
`;
