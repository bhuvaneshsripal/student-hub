import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useSettingsStore } from '../store/settingsStore';
import { useToastStore } from '../store/toastStore';

export default function Profile() {
  const { profile, updateProfile } = useSettingsStore();
  const push = useToastStore((s) => s.push);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { updateProfile({ avatar: reader.result as string }); push('Profile picture updated', 'success'); };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Your student information, shown across the app.</p>
      </div>

      <Card>
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] flex items-center justify-center text-white font-display font-bold text-2xl overflow-hidden">
              {profile.avatar ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" /> : profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full glass flex items-center justify-center">
              <Camera size={13} style={{ color: 'var(--ink)' }} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--ink)' }}>{profile.name}</h2>
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{profile.department} • {profile.year}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Student Name" value={profile.name} onChange={(v) => updateProfile({ name: v })} />
          <Field label="Register Number" value={profile.registerNumber} onChange={(v) => updateProfile({ registerNumber: v })} />
          <Field label="Department" value={profile.department} onChange={(v) => updateProfile({ department: v })} />
          <Field label="Year" value={profile.year} onChange={(v) => updateProfile({ year: v })} />
          <Field label="Semester" value={profile.semester} onChange={(v) => updateProfile({ semester: v })} />
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>{label}</span>
      <input
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
        style={{ background: 'var(--bg)', color: 'var(--ink)', border: '1px solid var(--line)' }}
      />
    </label>
  );
}
