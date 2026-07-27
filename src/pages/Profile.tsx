import { useState, useEffect, useRef } from 'react';
import { Pencil, Check, Settings as SettingsIcon, User, Bot, Hash, Building2, GraduationCap, Layers, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { auth } from '../firebase';

const FIELD_ICONS: Record<string, typeof User> = {
  'Student Name': User,
  'Register Number': Hash,
  'Department': Building2,
  'Year': GraduationCap,
  'Semester': Layers,
};

export default function Profile() {
  const { profile, updateProfile } = useSettingsStore();
  // See Topbar.tsx for why this exists: Google's profile photo URL can
  // fail to load (blocked by an extension, expired, offline, etc), and
  // without this it leaves a broken-image icon instead of a clean fallback.
  const [avatarBroken, setAvatarBroken] = useState(false);
  useEffect(() => {
    setAvatarBroken(false);
  }, [profile.avatar]);

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
        {/* Picture is synced automatically from your signed-in account
            (e.g. Google profile photo) — no manual upload here. */}
        <div className="w-25 h-25 rounded-2xl bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] flex items-center justify-center text-[var(--on-accent)] font-display font-bold text-2xl overflow-hidden shrink-0">
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
        <div>
          <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--ink)' }}>
            {profile.name.trim() || 'Add your name'}
          </h2>
          {nameParts.length > 0 && (
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{nameParts.join(' • ')}</p>
          )}
        </div>
      </div>

      <div
        className="w-full max-w-6xl rounded-2xl p-[2px]"
        style={{
          background: "linear-gradient(135deg, var(--blue), var(--purple))",
          boxShadow: "0 8px 30px -8px rgba(197, 200, 214, 0.85)",
        }}
        >
      
        <div
          className="rounded-[14px] overflow-hidden divide-y"
          style={{ background: 'var(--bg-elev)' }}
        >
          <div className="px-5 py-4" style={{ borderColor: 'var(--line)' }}>
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--ink-soft)' }}>
              Student details
            </span>
          </div>
          <FieldRow label="Student Name" value={profile.name} onChange={(v) => updateProfile({ name: v })} />
          <FieldRow label="Register Number" value={profile.registerNumber} onChange={(v) => updateProfile({ registerNumber: v })} />
          <FieldRow label="Department" value={profile.department} onChange={(v) => updateProfile({ department: v })} />
          <FieldRow label="Year" value={profile.year} onChange={(v) => updateProfile({ year: v })} />
          <FieldRow label="Semester" value={profile.semester} onChange={(v) => updateProfile({ semester: v })} />
          <FieldRowStatic label="Email" value={auth.currentUser?.email ?? ''} />
        </div>
      </div>
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
    <div className="flex items-center gap-4 px-5 py-4" style={{ background: 'var(--bg-elev)' }}>
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
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
            onBlur={save}
            className="w-full px-0 py-1 text-[15px] outline-none border-none bg-transparent"
            style={{ color: 'var(--ink)' }}
          />
        ) : (
          <p className="text-[15px] truncate" style={{ color: value ? 'var(--ink)' : 'var(--ink-soft)' }}>
            {value || `Add ${label.toLowerCase()}`}
          </p>
        )}
      </div>
      <button
        onClick={() => (editing ? save() : setEditing(true))}
        aria-label={editing ? `Save ${label}` : `Edit ${label}`}
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
      >
        {editing ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Pencil size={15} style={{ color: 'var(--ink-soft)' }} />}
      </button>
    </div>
  );
}

/** Read-only box — shows the account's login email. No edit affordance. */
function FieldRowStatic({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4" style={{ background: 'var(--bg-elev)' }}>
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
