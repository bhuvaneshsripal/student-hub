import type { ColorScheme } from '../store/settingsStore';

/** Every CSS variable that changes between color schemes / light-dark
 * combinations. Applied directly as inline styles on <html> (highest
 * possible CSS priority — beats any stylesheet rule, class, or cascade
 * layer ordering issue) so switching the theme is guaranteed to take
 * effect immediately, everywhere it's used. */
const VARS = [
  '--blue', '--purple', '--line', '--glass', '--glass-border', '--shadow',
  '--accent-solid', '--accent-solid-border', '--search-bg', '--search-border',
  '--nav-panel-border', '--on-accent',
] as const;

type VarMap = Record<(typeof VARS)[number], string>;

const BLUE_LIGHT: VarMap = {
  '--blue': '#2563EB', '--purple': '#3B82F6',
  '--line': 'rgba(37, 99, 235, 0.16)',
  '--glass': 'rgba(239, 246, 255, 0.68)',
  '--glass-border': 'rgba(59, 130, 246, 0.30)',
  '--shadow': '0 10px 40px -12px rgba(37, 99, 235, 0.30)',
  '--accent-solid': '#EFF6FF', '--accent-solid-border': '#3B82F6',
  '--search-bg': 'rgba(239, 246, 255, 0.6)', '--search-border': 'rgba(59, 130, 246, 0.30)',
  '--nav-panel-border': 'rgba(59, 130, 246, 0.20)',
  '--on-accent': '#FFFFFF',
};

const BLUE_DARK: VarMap = {
  '--blue': '#3B82F6', '--purple': '#60A5FA',
  '--line': 'rgba(59, 130, 246, 0.18)',
  '--glass': 'rgba(9, 13, 24, 0.65)',
  '--glass-border': 'rgba(59, 130, 246, 0.30)',
  '--shadow': '0 10px 40px -12px rgba(59, 130, 246, 0.35)',
  '--accent-solid': '#0B1A33', '--accent-solid-border': '#3B82F6',
  '--search-bg': 'rgba(255, 255, 255, 0.07)', '--search-border': 'rgba(59, 130, 246, 0.35)',
  '--nav-panel-border': 'rgba(59, 130, 246, 0.22)',
  '--on-accent': '#FFFFFF',
};

const YELLOW_LIGHT: VarMap = {
  '--blue': '#F5A800', '--purple': '#FFCB3D',
  '--line': 'rgba(217, 119, 6, 0.18)',
  '--glass': 'rgba(255, 251, 235, 0.68)',
  '--glass-border': 'rgba(245, 168, 0, 0.35)',
  '--shadow': '0 10px 40px -12px rgba(217, 119, 6, 0.30)',
  '--accent-solid': '#FFFBEB', '--accent-solid-border': '#F5A800',
  '--search-bg': 'rgba(255, 251, 235, 0.6)', '--search-border': 'rgba(245, 168, 0, 0.30)',
  '--nav-panel-border': 'rgba(245, 168, 0, 0.20)',
  '--on-accent': '#171200',
};

const YELLOW_DARK: VarMap = {
  '--blue': '#F5A800', '--purple': '#FBBF24',
  '--line': 'rgba(245, 168, 0, 0.18)',
  '--glass': 'rgba(24, 18, 3, 0.65)',
  '--glass-border': 'rgba(245, 168, 0, 0.30)',
  '--shadow': '0 10px 40px -12px rgba(245, 168, 0, 0.35)',
  '--accent-solid': '#241C05', '--accent-solid-border': '#F5A800',
  '--search-bg': 'rgba(255, 255, 255, 0.07)', '--search-border': 'rgba(245, 168, 0, 0.35)',
  '--nav-panel-border': 'rgba(245, 168, 0, 0.22)',
  '--on-accent': '#171200',
};

export function applyTheme(mode: 'light' | 'dark', colorScheme: ColorScheme) {
  const vars =
    colorScheme === 'yellow'
      ? (mode === 'dark' ? YELLOW_DARK : YELLOW_LIGHT)
      : (mode === 'dark' ? BLUE_DARK : BLUE_LIGHT);

  const root = document.documentElement.style;
  for (const key of VARS) {
    root.setProperty(key, vars[key]);
  }

  // Keep the classes too (drives the .bg-mesh background-image swap,
  // which isn't expressed as a plain variable).
  document.documentElement.classList.toggle('dark', mode === 'dark');
  document.documentElement.classList.toggle('theme-yellow', colorScheme === 'yellow');
}
