/**
 * Locked palette — the only color tokens allowed in components.
 *
 * ESLint forbids hex literals (`#abc123`) in component files. Use these names
 * or the Tailwind classes backed by them (`text-fg`, `bg-card`, `border-border`,
 * `bg-accent text-accent-fg`, `text-success`, etc.).
 *
 * To change a color globally, edit `src/styles/tokens.css` — every token here
 * is just a name that resolves to a CSS variable at runtime.
 */
export const palette = {
  bg: 'rgb(var(--bg))',
  fg: 'rgb(var(--fg))',
  muted: 'rgb(var(--muted))',
  mutedFg: 'rgb(var(--muted-fg))',
  border: 'rgb(var(--border))',
  card: 'rgb(var(--card))',
  glass: 'rgb(var(--glass))',

  accent: 'rgb(var(--accent))',
  accentFg: 'rgb(var(--accent-fg))',
  accentSoft: 'rgb(var(--accent-soft))',

  success: 'rgb(var(--success))',
  warn: 'rgb(var(--warn))',
  danger: 'rgb(var(--danger))',
} as const;

export type PaletteToken = keyof typeof palette;

/**
 * Allowed spacing values — 4px-grid Linear-style discipline.
 * Components must compose only from these eight values.
 */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
} as const;

export type SpacingKey = keyof typeof spacing;
