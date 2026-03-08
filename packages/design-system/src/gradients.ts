/**
 * Gradient presets for LaunchKit applications.
 *
 * Provides curated gradient backgrounds for hero sections and containers.
 * Each preset includes CSS gradient definitions and optional animations.
 *
 * Architecture:
 * - Presets are grouped by theme (light/dark/universal)
 * - Some presets are "palette-aware" and derive colors from the current palette
 * - Animated gradients use CSS keyframe animations for premium feel
 *
 * Extracted from endorsed's WYSIWYG profile builder.
 *
 * @example
 * ```ts
 * import { getGradientStyle, GRADIENT_PRESETS } from '@fermi-ventures/launchkit-design-system/gradients';
 * import { getPaletteById } from '@fermi-ventures/launchkit-design-system/palettes';
 *
 * const palette = getPaletteById('dark-midnight');
 * const gradientStyle = getGradientStyle('midnight-aurora', palette);
 * ```
 */

import type { ColorPalette } from "./palettes.js";

export interface GradientPreset {
  /** Stable identifier - stored in layouts, don't rename */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** Optional description for UI tooltip */
  description?: string;
  /** Whether this works best with dark themes, light themes, or both */
  themeCompatibility: "dark" | "light" | "both";
  /** Whether this gradient uses palette colors (vs fixed colors) */
  paletteAware: boolean;
  /** Whether this gradient is animated */
  animated: boolean;
  /**
   * CSS gradient value. Use placeholders for palette-aware gradients:
   * - {{background}} - palette background color
   * - {{accent}} - palette accent color
   * - {{card}} - palette card color
   */
  gradient: string;
  /** Animation name (must be defined in globals.css) */
  animationName?: string;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Background size for animated gradients (e.g., "400% 400%") */
  backgroundSize?: string;
}

/**
 * Curated gradient presets.
 * Ordered by: palette-aware first, then by theme compatibility.
 */
export const GRADIENT_PRESETS: GradientPreset[] = [
  // ── No gradient (solid) ────────────────────────────────────
  {
    id: "none",
    name: "Solid Color",
    description: "Use palette background color",
    themeCompatibility: "both",
    paletteAware: true,
    animated: false,
    gradient: "none",
  },

  // ── Palette-aware gradients ────────────────────────────────
  {
    id: "subtle-fade",
    name: "Subtle Fade",
    description: "Gentle fade from lighter to background",
    themeCompatibility: "both",
    paletteAware: true,
    animated: false,
    gradient: "linear-gradient(to bottom, {{cardLight}}, {{background}})",
  },
  {
    id: "accent-glow",
    name: "Accent Glow",
    description: "Soft accent color glow at the top",
    themeCompatibility: "both",
    paletteAware: true,
    animated: false,
    gradient:
      "radial-gradient(ellipse 80% 50% at 50% -20%, {{accentFaded}}, transparent), {{background}}",
  },
  {
    id: "accent-sweep",
    name: "Accent Sweep",
    description: "Diagonal accent sweep with animation",
    themeCompatibility: "both",
    paletteAware: true,
    animated: true,
    gradient:
      "linear-gradient(135deg, {{background}} 0%, {{accentSubtle}} 50%, {{background}} 100%)",
    animationName: "gradient-sweep",
    animationDuration: 8,
    backgroundSize: "200% 200%",
  },

  // ── Dark theme gradients ───────────────────────────────────
  {
    id: "midnight-aurora",
    name: "Midnight Aurora",
    description: "Deep blue with purple shimmer",
    themeCompatibility: "dark",
    paletteAware: false,
    animated: true,
    gradient:
      "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)",
    animationName: "gradient-shift",
    animationDuration: 15,
    backgroundSize: "400% 400%",
  },
  {
    id: "cosmic-purple",
    name: "Cosmic Purple",
    description: "Rich purple to deep navy",
    themeCompatibility: "dark",
    paletteAware: false,
    animated: true,
    gradient:
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #1a1a2e 100%)",
    animationName: "gradient-shift",
    animationDuration: 12,
    backgroundSize: "400% 400%",
  },
  {
    id: "emerald-night",
    name: "Emerald Night",
    description: "Deep teal to dark forest",
    themeCompatibility: "dark",
    paletteAware: false,
    animated: true,
    gradient:
      "linear-gradient(135deg, #0f172a 0%, #064e3b 33%, #065f46 66%, #0f172a 100%)",
    animationName: "gradient-shift",
    animationDuration: 10,
    backgroundSize: "400% 400%",
  },
  {
    id: "premium-gold",
    name: "Premium Gold",
    description: "Luxurious dark with gold accents",
    themeCompatibility: "dark",
    paletteAware: false,
    animated: true,
    gradient:
      "linear-gradient(135deg, #1c1c1c 0%, #2a2015 25%, #3d2e1a 50%, #2a2015 75%, #1c1c1c 100%)",
    animationName: "gradient-shift",
    animationDuration: 12,
    backgroundSize: "400% 400%",
  },
  {
    id: "ocean-depth",
    name: "Ocean Depth",
    description: "Teal to deep navy gradient",
    themeCompatibility: "dark",
    paletteAware: false,
    animated: false,
    gradient: "linear-gradient(to bottom, #0d9488, #0f172a)",
  },
  {
    id: "charcoal-ember",
    name: "Charcoal Ember",
    description: "Dark with warm ember glow",
    themeCompatibility: "dark",
    paletteAware: false,
    animated: true,
    gradient:
      "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(234, 88, 12, 0.15), transparent 50%), linear-gradient(to bottom, #18181b, #27272a)",
    animationName: "gradient-pulse",
    animationDuration: 4,
    backgroundSize: "100% 100%",
  },

  // ── Light theme gradients ──────────────────────────────────
  {
    id: "dawn",
    name: "Dawn",
    description: "Warm coral to soft gold",
    themeCompatibility: "light",
    paletteAware: false,
    animated: true,
    gradient:
      "linear-gradient(135deg, #fff7ed 0%, #fef3c7 25%, #fce7f3 50%, #fef3c7 75%, #fff7ed 100%)",
    animationName: "gradient-shift",
    animationDuration: 10,
    backgroundSize: "400% 400%",
  },
  {
    id: "soft-sky",
    name: "Soft Sky",
    description: "Gentle blue to white fade",
    themeCompatibility: "light",
    paletteAware: false,
    animated: false,
    gradient: "linear-gradient(to bottom, #e0f2fe, #ffffff)",
  },
  {
    id: "rose-mist",
    name: "Rose Mist",
    description: "Delicate pink to cream",
    themeCompatibility: "light",
    paletteAware: false,
    animated: true,
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #fce7f3 25%, #fbcfe8 50%, #fce7f3 75%, #ffffff 100%)",
    animationName: "gradient-shift",
    animationDuration: 12,
    backgroundSize: "400% 400%",
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    description: "Cool mint to white",
    themeCompatibility: "light",
    paletteAware: false,
    animated: false,
    gradient: "linear-gradient(to bottom, #ecfdf5, #ffffff)",
  },

  // ── Universal gradients ────────────────────────────────────
  {
    id: "glass-shimmer",
    name: "Glass Shimmer",
    description: "Subtle light sweep animation",
    themeCompatibility: "both",
    paletteAware: true,
    animated: true,
    gradient:
      "linear-gradient(105deg, {{background}} 0%, {{background}} 40%, {{shimmer}} 50%, {{background}} 60%, {{background}} 100%)",
    animationName: "gradient-shimmer",
    animationDuration: 3,
    backgroundSize: "200% 100%",
  },
];

/**
 * Get a gradient preset by ID.
 */
export function getGradientPreset(id: string): GradientPreset | undefined {
  return GRADIENT_PRESETS.find((g) => g.id === id);
}

/**
 * Get gradient presets filtered by theme compatibility.
 */
export function getGradientPresetsForTheme(isDark: boolean): GradientPreset[] {
  const compatibility = isDark ? "dark" : "light";
  return GRADIENT_PRESETS.filter(
    (g) =>
      g.themeCompatibility === compatibility || g.themeCompatibility === "both"
  );
}

/**
 * Lighten a hex color by a percentage (0-100).
 */
function lightenHex(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(
    255,
    ((num >> 16) & 0xff) + Math.round(255 * (percent / 100))
  );
  const g = Math.min(
    255,
    ((num >> 8) & 0xff) + Math.round(255 * (percent / 100))
  );
  const b = Math.min(255, (num & 0xff) + Math.round(255 * (percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Add alpha to a hex color, returning rgba string.
 */
function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Replace palette placeholders in a gradient string.
 */
function interpolatePaletteColors(
  gradient: string,
  palette: ColorPalette
): string {
  const { colors } = palette;
  const isDark = palette.isDark;

  return gradient
    .replace(/\{\{background\}\}/g, colors.background)
    .replace(/\{\{accent\}\}/g, colors.accent)
    .replace(/\{\{card\}\}/g, colors.card)
    .replace(
      /\{\{cardLight\}\}/g,
      isDark ? lightenHex(colors.background, 5) : lightenHex(colors.background, -3)
    )
    .replace(/\{\{accentFaded\}\}/g, hexToRgba(colors.accent, 0.2))
    .replace(/\{\{accentSubtle\}\}/g, hexToRgba(colors.accent, 0.1))
    .replace(
      /\{\{shimmer\}\}/g,
      isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)"
    );
}

/**
 * Build CSS style object for a gradient preset.
 * Returns properties suitable for React inline styles.
 */
export function getGradientStyle(
  presetId: string,
  palette: ColorPalette
): React.CSSProperties {
  const preset = getGradientPreset(presetId);

  // Default to solid background color
  if (!preset || preset.id === "none") {
    return { backgroundColor: palette.colors.background };
  }

  // Interpolate palette colors if needed
  const gradient = preset.paletteAware
    ? interpolatePaletteColors(preset.gradient, palette)
    : preset.gradient;

  const style: React.CSSProperties = {
    background: gradient,
  };

  // Add animation properties
  if (preset.animated && preset.animationName) {
    style.backgroundSize = preset.backgroundSize;
    style.animation = `${preset.animationName} ${preset.animationDuration}s ease infinite`;
  }

  return style;
}

/**
 * Get CSS keyframes for gradient animations.
 * These should be added to globals.css.
 */
export const GRADIENT_KEYFRAMES = `
/* Gradient animation keyframes - add to globals.css */

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes gradient-sweep {
  0%, 100% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
}

@keyframes gradient-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes gradient-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
`;
