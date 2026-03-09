/**
 * Liturgical colour palettes with full 50–900 shade ramps.
 *
 * These palettes are designed to integrate with the `Theme.colors.primary` shape
 * defined in `theme.ts`. Each palette is a valid `Theme['colors']['primary']` value.
 *
 * The 500 token is the canonical "main" colour; lighter/darker values are auto-derived
 * for surfaces, borders, and text overlays.
 *
 * Colour choices follow traditional Western liturgical practice:
 *   - **Green**  – Ordinary Time (growth, hope)
 *   - **Purple** – Advent, Lent (penance, preparation)
 *   - **Gold**   – Christmas, Easter (joy, celebration) — also covers "white"
 *   - **Red**    – Pentecost, martyrs (fire, Holy Spirit)
 */

/** Type alias matching `Theme.colors.primary` */
interface ColorPalette {
  readonly 50: string;
  readonly 100: string;
  readonly 200: string;
  readonly 300: string;
  readonly 400: string;
  readonly 500: string;
  readonly 600: string;
  readonly 700: string;
  readonly 800: string;
  readonly 900: string;
}

/**
 * Liturgical colour system.
 *
 * Each key corresponds to a colour keyword returned by `getLiturgicalSeason().color`.
 */
export const LiturgicalColors: Readonly<Record<string, ColorPalette>> = {
  /** Ordinary Time — verdant green */
  green: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  /** Advent & Lent — royal purple */
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  /** Christmas & Easter — warm gold */
  gold: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  /** Pentecost & martyrs — vibrant red */
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
} as const;
