import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Pencil, Check, Settings as SettingsIcon, ZoomIn, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { useToastStore } from '../store/toastStore';

const OUTPUT_SIZE = 400;

export default function Profile() {
  const { profile, updateProfile } = useSettingsStore();
  const push = useToastStore((s) => s.push);
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  const nameParts = [profile.department.trim(), profile.year.trim()].filter(Boolean);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-3">
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
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--blue)] to-[var(--purple)] flex items-center justify-center text-white font-display font-bold text-2xl overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              profile.name.trim() ? profile.name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('') : ''
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Upload profile picture"
              title="Upload photo"
              className="w-7 h-7 rounded-full glass flex items-center justify-center"
            >
              <Camera size={13} style={{ color: 'var(--ink)' }} />
            </button>
            {profile.avatar && (
              <button
                onClick={() => setCropSrc(profile.avatar)}
                aria-label="Edit and crop profile picture"
                title="Edit / crop"
                className="w-7 h-7 rounded-full glass flex items-center justify-center"
              >
                <Pencil size={12} style={{ color: 'var(--ink)' }} />
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePick} className="hidden" />
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

      <div className="rounded-2xl overflow-hidden divide-y" style={{ border: '1px solid var(--line)', borderColor: 'var(--line)' }}>
        <FieldRow label="Student Name" value={profile.name} onChange={(v) => updateProfile({ name: v })} />
        <FieldRow label="Register Number" value={profile.registerNumber} onChange={(v) => updateProfile({ registerNumber: v })} />
        <FieldRow label="Department" value={profile.department} onChange={(v) => updateProfile({ department: v })} />
        <FieldRow label="Year" value={profile.year} onChange={(v) => updateProfile({ year: v })} />
        <FieldRow label="Semester" value={profile.semester} onChange={(v) => updateProfile({ semester: v })} />
      </div>

      {cropSrc && (
        <CropModal
          src={cropSrc}
          onCancel={() => setCropSrc(null)}
          onSave={(dataUrl) => {
            updateProfile({ avatar: dataUrl });
            push('Profile picture updated', 'success');
            setCropSrc(null);
          }}
        />
      )}
    </div>
  );
}

function FieldRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function save() {
    onChange(draft.trim());
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: 'var(--bg-elev)' }}>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium block mb-1" style={{ color: 'var(--ink-soft)' }}>{label}</span>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
            onBlur={save}
            className="w-full px-0 py-0.5 text-sm outline-none bg-transparent border-b"
            style={{ color: 'var(--ink)', borderColor: 'var(--purple)' }}
          />
        ) : (
          <p className="text-sm truncate" style={{ color: value ? 'var(--ink)' : 'var(--ink-soft)' }}>
            {value || `Add ${label.toLowerCase()}`}
          </p>
        )}
      </div>
      <button
        onClick={() => (editing ? save() : setEditing(true))}
        aria-label={editing ? `Save ${label}` : `Edit ${label}`}
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
      >
        {editing ? <Check size={15} style={{ color: 'var(--success)' }} /> : <Pencil size={14} style={{ color: 'var(--ink-soft)' }} />}
      </button>
    </div>
  );
}

/** Lightweight crop tool: pan (drag) + zoom (slider) over a fixed square
 * viewport, rendered out to a fixed-size square image on save. Avoids
 * pulling in an external cropper library. */
function CropModal({ src, onCancel, onSave }: { src: string; onCancel: () => void; onSave: (dataUrl: string) => void }) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const VIEWPORT = 260;

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImgSize({ w: img.width, h: img.height });
    img.src = src;
  }, [src]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  }, []);

  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  function reset() { setZoom(1); setPos({ x: 0, y: 0 }); }

  function save() {
    if (!imgSize.w || !imgSize.h) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      // Scale so the image covers the viewport square, matching the on-screen preview.
      const baseScale = Math.max(VIEWPORT / imgSize.w, VIEWPORT / imgSize.h) * zoom;
      const drawW = imgSize.w * baseScale;
      const drawH = imgSize.h * baseScale;
      const outScale = OUTPUT_SIZE / VIEWPORT;
      const dx = (VIEWPORT / 2 + pos.x - drawW / 2) * outScale;
      const dy = (VIEWPORT / 2 + pos.y - drawH / 2) * outScale;
      ctx.drawImage(img, dx, dy, drawW * outScale, drawH * outScale);
      onSave(canvas.toDataURL('image/png'));
    };
    img.src = src;
  }

  const baseScale = imgSize.w && imgSize.h ? Math.max(VIEWPORT / imgSize.w, VIEWPORT / imgSize.h) * zoom : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl p-5" style={{ background: 'var(--glass-solid)', border: '1px solid var(--line)' }}>
        <h3 className="font-display font-semibold text-base mb-1" style={{ color: 'var(--ink)' }}>Edit photo</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>Drag to reposition, use the slider to zoom.</p>
        <div
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="mx-auto rounded-2xl overflow-hidden relative cursor-move select-none"
          style={{ width: VIEWPORT, height: VIEWPORT, background: 'var(--bg)', border: '1px solid var(--line)', touchAction: 'none' }}
        >
          {imgSize.w > 0 && (
            <img
              src={src}
              alt="Crop preview"
              draggable={false}
              className="absolute top-1/2 left-1/2 max-w-none pointer-events-none"
              style={{
                width: imgSize.w * baseScale,
                height: imgSize.h * baseScale,
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <ZoomIn size={15} style={{ color: 'var(--ink-soft)' }} />
          <input
            type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
          <button onClick={reset} aria-label="Reset crop" title="Reset" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
            <RotateCcw size={14} style={{ color: 'var(--ink-soft)' }} />
          </button>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium border"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[var(--blue)] to-[var(--purple)]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
