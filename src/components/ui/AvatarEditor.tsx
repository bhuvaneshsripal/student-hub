import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, RotateCw, ZoomIn } from 'lucide-react';
import { Modal } from './Modal';

interface AvatarEditorProps {
  /** The picture the person just picked, before any edits. */
  file: File;
  onCancel: () => void;
  /** Fires with a compressed square JPEG data URL once the person saves. */
  onSave: (dataUrl: string) => void;
}

// Square output — big enough to look sharp at any size it's shown across
// the app, small enough to stay well under Firestore's 1MB document limit
// once JPEG-compressed.
const OUTPUT_SIZE = 480;
// The on-screen crop frame. Kept modest so the whole editor comfortably
// fits small phone screens without scrolling.
const VIEWPORT_SIZE = 280;

/**
 * A self-contained crop/rotate/zoom editor for the profile picture.
 * Pointer Events (not separate mouse/touch handlers) drive the drag-to-pan
 * gesture so the exact same code path works with a mouse on desktop and a
 * finger on mobile — no separate touch bugs to chase.
 */
export function AvatarEditor({ file, onCancel, onSave }: AvatarEditorProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // quick 90°-step rotation
  const [tilt, setTilt] = useState(0); // fine straighten, -30..30
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragState = useRef<{ x: number; y: number; startOffset: { x: number; y: number } } | null>(null);

  // Load the picked file into an <img> once.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setImg(image);
    image.onerror = () => setLoadError(true);
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Reset pan whenever a fresh rotation/zoom is applied via the 90° buttons,
  // since old offsets rarely make sense after a quarter-turn.
  function rotateBy(delta: number) {
    setRotation((r) => (r + delta + 360) % 360);
    setOffset({ x: 0, y: 0 });
  }

  const angleRad = useMemo(() => ((rotation + tilt) * Math.PI) / 180, [rotation, tilt]);

  const baseScale = useMemo(() => {
    if (!img) return 1;
    return Math.max(VIEWPORT_SIZE / img.naturalWidth, VIEWPORT_SIZE / img.naturalHeight);
  }, [img]);

  function draw(canvas: HTMLCanvasElement, size: number) {
    if (!img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const k = size / VIEWPORT_SIZE;
    const scale = baseScale * zoom * k;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2 + offset.x * k, size / 2 + offset.y * k);
    ctx.rotate(angleRad);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  }

  // Redraw the live preview whenever any transform value changes.
  useEffect(() => {
    if (!canvasRef.current) return;
    draw(canvasRef.current, VIEWPORT_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, zoom, angleRad, offset]);

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragState.current = { x: e.clientX, y: e.clientY, startOffset: offset };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.x;
    const dy = e.clientY - dragState.current.y;
    setOffset({ x: dragState.current.startOffset.x + dx, y: dragState.current.startOffset.y + dy });
  }
  function onPointerUp() {
    dragState.current = null;
  }
  // Desktop convenience: scroll wheel zooms instead of scrolling the page.
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(1, z - e.deltaY * 0.0015)));
  }

  function handleSave() {
    setSaving(true);
    // Let the "saving" state paint before the (cheap but synchronous)
    // canvas work runs, so the button shows feedback instantly.
    requestAnimationFrame(() => {
      const out = document.createElement('canvas');
      out.width = OUTPUT_SIZE;
      out.height = OUTPUT_SIZE;
      draw(out, OUTPUT_SIZE);
      const dataUrl = out.toDataURL('image/jpeg', 0.85);
      onSave(dataUrl);
    });
  }

  return (
    <Modal open onClose={onCancel} title="Edit profile picture" width="max-w-sm">
      <div className="flex flex-col items-center gap-5">
        {loadError ? (
          <p className="text-sm py-8" style={{ color: 'var(--ink-soft)' }}>
            Couldn't open that image. Please try a different file.
          </p>
        ) : !img ? (
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE, background: 'var(--bg-elev)' }}
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: 'var(--blue)', borderRightColor: 'var(--purple)' }}
            />
          </div>
        ) : (
          <>
            <div
              className="relative rounded-2xl overflow-hidden touch-none select-none"
              style={{
                width: VIEWPORT_SIZE,
                height: VIEWPORT_SIZE,
                background: 'var(--bg-elev)',
                border: '1px solid var(--line)',
                cursor: 'grab',
              }}
            >
              <canvas
                ref={canvasRef}
                width={VIEWPORT_SIZE}
                height={VIEWPORT_SIZE}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onWheel={onWheel}
                className="block touch-none"
              />
              {/* Crop-frame guide only — purely visual, doesn't affect output */}
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.55)' }}
              />
            </div>
            <p className="text-xs -mt-2" style={{ color: 'var(--ink-soft)' }}>
              Drag to reposition &middot; scroll or use the slider to zoom
            </p>

            <div className="w-full flex items-center gap-3">
              <ZoomIn size={16} style={{ color: 'var(--ink-soft)' }} />
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[var(--blue)]"
              />
            </div>

            <div className="w-full flex items-center gap-3">
              <span className="text-xs shrink-0 w-12" style={{ color: 'var(--ink-soft)' }}>Straighten</span>
              <input
                type="range"
                min={-30}
                max={30}
                step={1}
                value={tilt}
                onChange={(e) => setTilt(parseFloat(e.target.value))}
                className="flex-1 accent-[var(--blue)]"
              />
              <span className="text-xs shrink-0 w-8 text-right" style={{ color: 'var(--ink-soft)' }}>{tilt}&deg;</span>
            </div>

            <div className="w-full flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => rotateBy(-90)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
                style={{ border: '1px solid var(--line)', color: 'var(--ink)' }}
              >
                <RotateCcw size={15} /> Rotate left
              </button>
              <button
                type="button"
                onClick={() => rotateBy(90)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
                style={{ border: '1px solid var(--line)', color: 'var(--ink)' }}
              >
                <RotateCw size={15} /> Rotate right
              </button>
            </div>
          </>
        )}

        <div className="w-full flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium border"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!img || saving}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60"
            style={{ background: 'var(--blue)' }}
          >
            {saving ? 'Saving…' : 'Save photo'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
