// GoBaby Travel V2.0 — 5th Anniversary Edition
// Dark cinematic design system — "Your Gateway To Anywhere"

export const Theme = {
  // ─── Surface tokens (deep cinematic dark) ────────────────────────
  bg: '#060f20',           // Page background
  surface: '#091525',      // Card / surface
  hero: '#07132a',         // Hero band
  elevated: '#0e2040',     // Raised / floating elements
  border: '#1a2d4a',       // Hairline borders

  // ─── Brand accents ───────────────────────────────────────────────
  primary: '#4a9eff',      // Electric blue — main CTA / portals
  gold: '#f0b429',         // Anniversary gold
  teal: '#00c9a7',
  purple: '#9b59b6',
  orange: '#ff8c00',
  coral: '#ff6b6b',

  // ─── Text ────────────────────────────────────────────────────────
  text: '#ffffff',
  textMuted: '#7a9ab8',
  textSubtle: '#5a7898',

  // ─── State ───────────────────────────────────────────────────────
  success: '#10b981',
  danger: '#ef4444',

  // ─── Translucents (frosted overlays) ─────────────────────────────
  whiteAlpha04: 'rgba(255,255,255,0.04)',
  whiteAlpha06: 'rgba(255,255,255,0.06)',
  whiteAlpha08: 'rgba(255,255,255,0.08)',
  whiteAlpha12: 'rgba(255,255,255,0.12)',
  whiteAlpha18: 'rgba(255,255,255,0.18)',
  blackAlpha40: 'rgba(0,0,0,0.4)',
  blackAlpha60: 'rgba(0,0,0,0.6)',
};

export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const Font = {
  xxs: 10,
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  xxxl: 44,
};

// Portal accent palette — each portal feels like a different world
export const PortalAccents = {
  book: { color: '#4a9eff', glow: 'rgba(74,158,255,0.22)' },
  visa: { color: '#00c9a7', glow: 'rgba(0,201,167,0.22)' },
  transport: { color: '#ff8c00', glow: 'rgba(255,140,0,0.22)' },
  plan: { color: '#f0b429', glow: 'rgba(240,180,41,0.22)' },
  rewards: { color: '#9b59b6', glow: 'rgba(155,89,182,0.22)' },
  health: { color: '#ff6b6b', glow: 'rgba(255,107,107,0.22)' },
};
