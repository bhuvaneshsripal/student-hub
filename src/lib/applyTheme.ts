/** Every CSS variable that changes between light and dark mode. Applied
 * directly as inline styles on <html> (highest possible CSS priority —
 * beats any stylesheet rule, class, or cascade layer ordering issue) so
 * switching the theme is guaranteed to take effect immediately, everywhere
 * it's used. */
const VARS = [
  '--blue', '--purple', '--line', '--glass', '--glass-border', '--shadow',
  '--accent-solid', '--accent-solid-border', '--search-bg', '--search-border',
  '--nav-panel-border', '--on-accent',
] as const;

type VarMap = Record<(typeof VARS)[number], string>;

// Light: white surfaces, sandal sidebar, one flat dark-green accent —
// --blue/--purple kept equal so no gradient renders as a two-tone glow.
const LIGHT: VarMap = {
  '--blue': '#1F5C3D', '--purple': '#1F5C3D',
  '--line': 'rgba(15, 30, 22, 0.10)',
  '--glass': 'rgba(255, 255, 255, 0.86)',
  '--glass-border': 'rgba(15, 30, 22, 0.10)',
  '--shadow': '0 10px 30px -14px rgba(15, 23, 20, 0.16)',
  '--accent-solid': '#F0FDF4', '--accent-solid-border': '#1F5C3D',
  '--search-bg': 'rgba(255, 255, 255, 0.7)', '--search-border': 'rgba(15, 30, 22, 0.10)',
  '--nav-panel-border': 'rgba(15, 30, 22, 0.10)',
  '--on-accent': '#FFFFFF',
};

// Dark: strictly black and white — --blue/--purple kept equal too, so
// dark mode never shows a colored gradient glow, only flat green text.
const DARK: VarMap = {
  '--blue': '#22C55E', '--purple': '#22C55E',
  '--line': 'rgba(255, 255, 255, 0.14)',
  '--glass': 'rgba(10, 10, 10, 0.72)',
  '--glass-border': 'rgba(255, 255, 255, 0.14)',
  '--shadow': '0 10px 30px -14px rgba(0, 0, 0, 0.65)',
  '--accent-solid': '#111111', '--accent-solid-border': '#22C55E',
  '--search-bg': 'rgba(255, 255, 255, 0.06)', '--search-border': 'rgba(255, 255, 255, 0.14)',
  '--nav-panel-border': 'rgba(255, 255, 255, 0.14)',
  '--on-accent': '#FFFFFF',
};

export function applyTheme(mode: 'light' | 'dark') {
  const vars = mode === 'dark' ? DARK : LIGHT;

  const root = document.documentElement.style;
  for (const key of VARS) {
    root.setProperty(key, vars[key]);
  }

  // Keep the class too (drives the .bg-mesh background-image swap, which
  // isn't expressed as a plain variable).
  document.documentElement.classList.toggle('dark', mode === 'dark');
}

/** Scales the root font-size (percentage of the browser default). Since
 * Tailwind's spacing and type scale are rem-based, this scales nearly the
 * entire UI — text, padding, icons sized in rem — proportionally, which is
 * what the Settings "Font Size" control uses under the hood. */
export function applyFontScale(percent: number) {
  document.documentElement.style.fontSize = `${percent}%`;
}

/** Zooms the whole page in/out, the same way a browser's own zoom control
 * does — a separate mechanism from Font Size above, so the two controls in
 * Settings act independently of each other. */
export function applyScreenScale(percent: number) {
  (document.documentElement.style as any).zoom = `${percent}%`;
}
