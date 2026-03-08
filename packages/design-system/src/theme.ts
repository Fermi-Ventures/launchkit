/**
 * Theme utilities for LaunchKit applications.
 *
 * This module provides:
 * - Color conversion utilities (hex → HSL)
 * - Curated color and font palettes for theme pickers
 * - Google Fonts URL builder
 * - WCAG-compliant contrast calculation
 *
 * Extracted from endorsed's WYSIWYG profile builder.
 *
 * @example
 * ```ts
 * import { hexToHsl, CURATED_ACCENT_COLORS, buildGoogleFontsUrl } from '@fermi-ventures/launchkit-design-system/theme';
 *
 * // Convert hex to HSL
 * const hsl = hexToHsl('#3b82f6'); // "217 91% 60%"
 *
 * // Use curated colors
 * const navy = CURATED_ACCENT_COLORS.find(c => c.name === 'Navy');
 *
 * // Load Google Fonts
 * const url = buildGoogleFontsUrl('Inter', 'Playfair Display');
 * ```
 */

// ── Hex → HSL conversion ────────────────────────────────────

/**
 * Convert a 6-digit hex color (#RRGGBB) to space-separated HSL string ("H S% L%").
 * Returns the HSL values without the hsl() wrapper to match the CSS variable convention.
 */
export function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    // Achromatic
    return `0 0% ${Math.round(l * 100)}%`;
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Compute a foreground color that contrasts well with the given HSL background.
 * Returns an HSL string for either near-white or near-black text.
 * Uses simplified relative luminance check on the lightness component.
 */
export function contrastForeground(hslString: string): string {
  const parts = hslString.split(/\s+/);
  const lightness = parseInt(parts[2], 10);
  // If lightness > 55%, use dark text; otherwise use light text
  return lightness > 55 ? "210 51% 24%" : "0 0% 98%";
}

// ── Curated accent color palette ────────────────────────────

export interface CuratedColor {
  name: string;
  hex: string;
  hsl: string;
  foreground: string;
}

function makePalette(
  colors: Array<{ name: string; hex: string }>
): CuratedColor[] {
  return colors.map(({ name, hex }) => {
    const hsl = hexToHsl(hex);
    return { name, hex, hsl, foreground: contrastForeground(hsl) };
  });
}

export const CURATED_ACCENT_COLORS: CuratedColor[] = makePalette([
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Emerald", hex: "#059669" },
  { name: "Lime", hex: "#65a30d" },
  { name: "Gold", hex: "#d4a853" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Red", hex: "#dc2626" },
  { name: "Pink", hex: "#db2777" },
  { name: "Purple", hex: "#7c3aed" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Slate", hex: "#475569" },
]);

// ── Curated theme presets ───────────────────────────────────

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: {
    accentColor?: string;
    baseMode?: "light" | "dark";
    fontHeading?: string;
    fontBody?: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean and corporate",
    config: {
      accentColor: "#1e3a5f",
      baseMode: "light",
      fontHeading: "Inter",
      fontBody: "Inter",
    },
  },
  {
    id: "executive",
    name: "Executive",
    description: "Authoritative and premium",
    config: {
      accentColor: "#1e3a5f",
      baseMode: "dark",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
    },
  },
  {
    id: "creative",
    name: "Creative",
    description: "Warm and expressive",
    config: {
      accentColor: "#ea580c",
      baseMode: "light",
      fontHeading: "DM Sans",
      fontBody: "Nunito",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Reduced and content-first",
    config: {
      accentColor: "#475569",
      baseMode: "light",
      fontHeading: "Inter",
      fontBody: "Inter",
    },
  },
  {
    id: "bold",
    name: "Bold",
    description: "High contrast and striking",
    config: {
      accentColor: "#7c3aed",
      baseMode: "dark",
      fontHeading: "Space Grotesk",
      fontBody: "Inter",
    },
  },
  {
    id: "modern",
    name: "Modern",
    description: "Tech-forward and clean",
    config: {
      accentColor: "#0d9488",
      baseMode: "light",
      fontHeading: "Inter",
      fontBody: "Inter",
    },
  },
  {
    id: "warm",
    name: "Warm",
    description: "Approachable and human",
    config: {
      accentColor: "#db2777",
      baseMode: "light",
      fontHeading: "Merriweather",
      fontBody: "Inter",
    },
  },
];

// ── Curated font library ────────────────────────────────────

export interface CuratedFont {
  family: string;
  category: "professional" | "elegant" | "modern" | "creative";
  description: string;
}

export const CURATED_FONTS: CuratedFont[] = [
  // Professional
  { family: "Inter", category: "professional", description: "Clean" },
  { family: "Roboto", category: "professional", description: "Versatile" },
  { family: "Source Sans 3", category: "professional", description: "Readable" },
  // Elegant
  { family: "Playfair Display", category: "elegant", description: "Refined" },
  { family: "Lora", category: "elegant", description: "Literary" },
  { family: "Crimson Text", category: "elegant", description: "Classic" },
  // Modern
  { family: "Space Grotesk", category: "modern", description: "Geometric" },
  { family: "DM Sans", category: "modern", description: "Sharp" },
  { family: "JetBrains Mono", category: "modern", description: "Technical" },
  // Creative
  { family: "Nunito", category: "creative", description: "Friendly" },
  { family: "Poppins", category: "creative", description: "Playful" },
  { family: "Quicksand", category: "creative", description: "Light" },
];

// ── Google Fonts link URL builder ───────────────────────────

/**
 * Build a Google Fonts <link> URL for the given font families.
 * Returns null if no custom fonts are specified.
 * URL-encodes font family names with spaces (e.g. "Playfair Display" → "Playfair+Display").
 */
export function buildGoogleFontsUrl(
  fontHeading?: string,
  fontBody?: string
): string | null {
  const families: string[] = [];

  if (fontHeading) {
    families.push(fontHeading);
  }
  if (fontBody && fontBody !== fontHeading) {
    families.push(fontBody);
  }

  if (families.length === 0) return null;

  const params = families
    .map((f) => `family=${f.replace(/\s+/g, "+")}:wght@400;500;600;700`)
    .join("&");

  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
