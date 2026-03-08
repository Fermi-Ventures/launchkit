/**
 * Color palette definitions for LaunchKit applications.
 *
 * Palettes define a complete set of semantic colors that work together.
 * Users can select a preset palette or choose "custom" to pick individual colors.
 *
 * Architecture notes:
 * - DEFAULT_PALETTES is the initial set shipped with the package
 * - Palette IDs should be stable (don't rename) as they're stored in user layouts
 * - In the future, this can be extended with database-backed custom palettes
 *
 * Color naming conventions:
 * - background: page/section background
 * - foreground: primary body text
 * - heading: h1-h6 headings
 * - muted: secondary/subdued text
 * - accent: primary action color, links, highlights
 * - accentForeground: text on accent-colored backgrounds
 * - card: card/panel backgrounds
 * - cardForeground: text inside cards
 * - border: borders and dividers
 *
 * Extracted from endorsed's WYSIWYG profile builder.
 *
 * @example
 * ```ts
 * import { getPalettes, getPaletteById, getDefaultPalette } from '@fermi-ventures/launchkit-design-system/palettes';
 *
 * // Get all palettes
 * const palettes = getPalettes();
 *
 * // Get specific palette
 * const midnight = getPaletteById('dark-midnight');
 *
 * // Get CSS vars
 * const vars = paletteToCssVars(midnight);
 * ```
 */

export interface ColorPalette {
  /** Stable identifier - stored in user layouts, don't rename */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** Optional description for UI tooltip */
  description?: string;
  /** Whether this is a dark theme (affects other UI decisions) */
  isDark: boolean;
  /** The actual color values */
  colors: {
    background: string;
    foreground: string;
    heading: string;
    muted: string;
    accent: string;
    accentForeground: string;
    card: string;
    cardForeground: string;
    border: string;
  };
}

/**
 * Default palettes shipped with LaunchKit.
 * These are the "built-in" options before admin customization.
 *
 * To add a new palette:
 * 1. Add it here with a unique, stable ID
 * 2. Ensure colors meet WCAG AA contrast ratios (4.5:1 for text)
 * 3. Test in both editor preview and public profile render
 */
export const DEFAULT_PALETTES: ColorPalette[] = [
  {
    id: "light-clean",
    name: "Light Clean",
    description: "Crisp white background with professional blue accent",
    isDark: false,
    colors: {
      background: "#ffffff",
      foreground: "#1f2937", // gray-800
      heading: "#111827", // gray-900
      muted: "#6b7280", // gray-500
      accent: "#3b82f6", // blue-500
      accentForeground: "#ffffff",
      card: "#f9fafb", // gray-50
      cardForeground: "#1f2937",
      border: "#e5e7eb", // gray-200
    },
  },
  {
    id: "light-warm",
    name: "Light Warm",
    description: "Warm cream tones with amber accent",
    isDark: false,
    colors: {
      background: "#fffbeb", // amber-50
      foreground: "#78350f", // amber-900
      heading: "#451a03", // amber-950
      muted: "#92400e", // amber-800
      accent: "#d97706", // amber-600
      accentForeground: "#ffffff",
      card: "#fef3c7", // amber-100
      cardForeground: "#78350f",
      border: "#fcd34d", // amber-300
    },
  },
  {
    id: "light-sage",
    name: "Light Sage",
    description: "Soft green tones for a calm, natural feel",
    isDark: false,
    colors: {
      background: "#f0fdf4", // green-50
      foreground: "#14532d", // green-900
      heading: "#052e16", // green-950
      muted: "#166534", // green-800
      accent: "#16a34a", // green-600
      accentForeground: "#ffffff",
      card: "#dcfce7", // green-100
      cardForeground: "#14532d",
      border: "#86efac", // green-300
    },
  },
  {
    id: "dark-professional",
    name: "Dark Professional",
    description: "Sophisticated dark slate with blue accent",
    isDark: true,
    colors: {
      background: "#0f172a", // slate-900
      foreground: "#e2e8f0", // slate-200
      heading: "#f8fafc", // slate-50
      muted: "#94a3b8", // slate-400
      accent: "#3b82f6", // blue-500
      accentForeground: "#ffffff",
      card: "#1e293b", // slate-800
      cardForeground: "#e2e8f0",
      border: "#334155", // slate-700
    },
  },
  {
    id: "dark-vibrant",
    name: "Dark Vibrant",
    description: "Modern dark theme with purple accent",
    isDark: true,
    colors: {
      background: "#18181b", // zinc-900
      foreground: "#e4e4e7", // zinc-200
      heading: "#fafafa", // zinc-50
      muted: "#a1a1aa", // zinc-400
      accent: "#a855f7", // purple-500
      accentForeground: "#ffffff",
      card: "#27272a", // zinc-800
      cardForeground: "#e4e4e7",
      border: "#3f3f46", // zinc-700
    },
  },
  {
    id: "dark-midnight",
    name: "Dark Midnight",
    description: "Deep blue-black with cyan accent",
    isDark: true,
    colors: {
      background: "#020617", // slate-950
      foreground: "#cbd5e1", // slate-300
      heading: "#f1f5f9", // slate-100
      muted: "#64748b", // slate-500
      accent: "#06b6d4", // cyan-500
      accentForeground: "#ffffff",
      card: "#0f172a", // slate-900
      cardForeground: "#cbd5e1",
      border: "#1e293b", // slate-800
    },
  },

  // ── Additional Premium Palettes ────────────────────────────────

  {
    id: "light-rose",
    name: "Light Rose",
    description: "Soft blush pink with rose accent",
    isDark: false,
    colors: {
      background: "#fff1f2", // rose-50
      foreground: "#881337", // rose-900
      heading: "#4c0519", // rose-950
      muted: "#be123c", // rose-700
      accent: "#e11d48", // rose-600
      accentForeground: "#ffffff",
      card: "#ffe4e6", // rose-100
      cardForeground: "#881337",
      border: "#fda4af", // rose-300
    },
  },
  {
    id: "light-sky",
    name: "Light Sky",
    description: "Airy sky blue with teal accent",
    isDark: false,
    colors: {
      background: "#f0f9ff", // sky-50
      foreground: "#0c4a6e", // sky-900
      heading: "#082f49", // sky-950
      muted: "#0369a1", // sky-700
      accent: "#0891b2", // cyan-600
      accentForeground: "#ffffff",
      card: "#e0f2fe", // sky-100
      cardForeground: "#0c4a6e",
      border: "#7dd3fc", // sky-300
    },
  },
  {
    id: "light-lavender",
    name: "Light Lavender",
    description: "Gentle violet tones for a creative feel",
    isDark: false,
    colors: {
      background: "#faf5ff", // purple-50
      foreground: "#581c87", // purple-900
      heading: "#3b0764", // purple-950
      muted: "#7e22ce", // purple-700
      accent: "#9333ea", // purple-600
      accentForeground: "#ffffff",
      card: "#f3e8ff", // purple-100
      cardForeground: "#581c87",
      border: "#d8b4fe", // purple-300
    },
  },
  {
    id: "dark-emerald",
    name: "Dark Emerald",
    description: "Rich forest green with emerald accent",
    isDark: true,
    colors: {
      background: "#022c22", // emerald-950
      foreground: "#a7f3d0", // emerald-200
      heading: "#d1fae5", // emerald-100
      muted: "#6ee7b7", // emerald-300
      accent: "#10b981", // emerald-500
      accentForeground: "#ffffff",
      card: "#064e3b", // emerald-900
      cardForeground: "#a7f3d0",
      border: "#065f46", // emerald-800
    },
  },
  {
    id: "dark-gold",
    name: "Dark Gold",
    description: "Luxurious dark with elegant gold accent",
    isDark: true,
    colors: {
      background: "#1c1c1c", // near-black
      foreground: "#e5e5e5", // neutral-200
      heading: "#fafafa", // neutral-50
      muted: "#a3a3a3", // neutral-400
      accent: "#d4a853", // brand gold
      accentForeground: "#1c1c1c",
      card: "#262626", // neutral-800
      cardForeground: "#e5e5e5",
      border: "#404040", // neutral-700
    },
  },
  {
    id: "dark-rose",
    name: "Dark Rose",
    description: "Moody dark with warm rose accent",
    isDark: true,
    colors: {
      background: "#1a1a1a", // near-black
      foreground: "#fecdd3", // rose-200
      heading: "#fff1f2", // rose-50
      muted: "#fb7185", // rose-400
      accent: "#f43f5e", // rose-500
      accentForeground: "#ffffff",
      card: "#2a2a2a", // dark gray
      cardForeground: "#fecdd3",
      border: "#3f3f3f", // gray
    },
  },
  {
    id: "light-mocha",
    name: "Light Mocha",
    description: "Warm brown tones inspired by Pantone 2025",
    isDark: false,
    colors: {
      background: "#faf6f3", // warm white
      foreground: "#44403c", // stone-700
      heading: "#292524", // stone-800
      muted: "#78716c", // stone-500
      accent: "#a16207", // amber-700
      accentForeground: "#ffffff",
      card: "#f5f0eb", // warm cream
      cardForeground: "#44403c",
      border: "#d6d3d1", // stone-300
    },
  },
  {
    id: "dark-mocha",
    name: "Dark Mocha",
    description: "Rich coffee tones with warm amber accent",
    isDark: true,
    colors: {
      background: "#1c1917", // stone-900
      foreground: "#d6d3d1", // stone-300
      heading: "#fafaf9", // stone-50
      muted: "#a8a29e", // stone-400
      accent: "#d97706", // amber-600
      accentForeground: "#ffffff",
      card: "#292524", // stone-800
      cardForeground: "#d6d3d1",
      border: "#44403c", // stone-700
    },
  },
  {
    id: "light-minimal",
    name: "Light Minimal",
    description: "Pure black and white for maximum clarity",
    isDark: false,
    colors: {
      background: "#ffffff",
      foreground: "#171717", // neutral-900
      heading: "#0a0a0a", // neutral-950
      muted: "#525252", // neutral-600
      accent: "#171717", // neutral-900
      accentForeground: "#ffffff",
      card: "#fafafa", // neutral-50
      cardForeground: "#171717",
      border: "#e5e5e5", // neutral-200
    },
  },
  {
    id: "dark-minimal",
    name: "Dark Minimal",
    description: "High contrast monochrome for impact",
    isDark: true,
    colors: {
      background: "#0a0a0a", // neutral-950
      foreground: "#e5e5e5", // neutral-200
      heading: "#ffffff",
      muted: "#a3a3a3", // neutral-400
      accent: "#ffffff",
      accentForeground: "#0a0a0a",
      card: "#171717", // neutral-900
      cardForeground: "#e5e5e5",
      border: "#262626", // neutral-800
    },
  },
];

/**
 * Get available color palettes.
 *
 * Currently returns the built-in defaults. In the future, this can be
 * modified to fetch from database for admin-editable palettes.
 *
 * @example
 * // Future database-backed implementation:
 * export async function getPalettes(): Promise<ColorPalette[]> {
 *   const dbPalettes = await prisma.colorPalette.findMany({ where: { isActive: true } })
 *   return [...DEFAULT_PALETTES, ...dbPalettes.map(mapDbToPalette)]
 * }
 */
export function getPalettes(): ColorPalette[] {
  return DEFAULT_PALETTES;
}

/**
 * Get a palette by ID, falling back to the first light palette if not found.
 */
export function getPaletteById(id: string): ColorPalette {
  const palettes = getPalettes();
  return (
    palettes.find((p) => p.id === id) ??
    palettes.find((p) => !p.isDark) ??
    palettes[0]
  );
}

/**
 * Get the default palette (Dark Midnight).
 *
 * The default is intentionally a dark theme - it looks more polished
 * out of the box and makes a stronger first impression for users
 * who haven't customized their profile design.
 */
export function getDefaultPalette(): ColorPalette {
  const palettes = getPalettes();
  return palettes.find((p) => p.id === "dark-midnight") ?? palettes[0];
}

/**
 * Build CSS custom properties from a palette.
 * Returns an object suitable for inline styles.
 */
export function paletteToCssVars(
  palette: ColorPalette
): Record<string, string> {
  const { colors } = palette;
  return {
    "--palette-background": colors.background,
    "--palette-foreground": colors.foreground,
    "--palette-heading": colors.heading,
    "--palette-muted": colors.muted,
    "--palette-accent": colors.accent,
    "--palette-accent-foreground": colors.accentForeground,
    "--palette-card": colors.card,
    "--palette-card-foreground": colors.cardForeground,
    "--palette-border": colors.border,
  };
}

/**
 * Build CSS custom properties from custom color values.
 * Used when palette is "custom" and user has picked individual colors.
 */
export function customColorsToCssVars(
  colors: Partial<ColorPalette["colors"]>
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (colors.background) vars["--palette-background"] = colors.background;
  if (colors.foreground) vars["--palette-foreground"] = colors.foreground;
  if (colors.heading) vars["--palette-heading"] = colors.heading;
  if (colors.muted) vars["--palette-muted"] = colors.muted;
  if (colors.accent) vars["--palette-accent"] = colors.accent;
  if (colors.accentForeground)
    vars["--palette-accent-foreground"] = colors.accentForeground;
  if (colors.card) vars["--palette-card"] = colors.card;
  if (colors.cardForeground)
    vars["--palette-card-foreground"] = colors.cardForeground;
  if (colors.border) vars["--palette-border"] = colors.border;
  return vars;
}
