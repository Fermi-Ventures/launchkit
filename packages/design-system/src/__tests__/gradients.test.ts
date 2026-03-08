import { describe, it, expect } from "vitest";
import {
  GRADIENT_PRESETS,
  getGradientPreset,
  getGradientPresetsForTheme,
  getGradientStyle,
  GRADIENT_KEYFRAMES,
  type GradientPreset,
} from "../gradients";
import { getPaletteById } from "../palettes";

describe("GRADIENT_PRESETS", () => {
  it("has 15 gradients", () => {
    expect(GRADIENT_PRESETS).toHaveLength(15);
  });

  it("has stable IDs for all gradients", () => {
    const ids = GRADIENT_PRESETS.map((g) => g.id);
    expect(new Set(ids).size).toBe(GRADIENT_PRESETS.length); // No duplicates
    ids.forEach((id) => {
      expect(id).toMatch(/^[a-z-]+$/); // Lowercase kebab-case
    });
  });

  it("includes none (solid) gradient", () => {
    const none = GRADIENT_PRESETS.find((g) => g.id === "none");
    expect(none?.name).toBe("Solid Color");
    expect(none?.gradient).toBe("none");
    expect(none?.paletteAware).toBe(true);
  });

  it("all gradients have required fields", () => {
    GRADIENT_PRESETS.forEach((gradient) => {
      expect(gradient.id).toBeTruthy();
      expect(gradient.name).toBeTruthy();
      expect(gradient.gradient).toBeTruthy();
      expect(typeof gradient.paletteAware).toBe("boolean");
      expect(typeof gradient.animated).toBe("boolean");
      expect(["dark", "light", "both"]).toContain(gradient.themeCompatibility);
    });
  });

  it("animated gradients have animation properties", () => {
    const animated = GRADIENT_PRESETS.filter((g) => g.animated);
    animated.forEach((gradient) => {
      expect(gradient.animationName).toBeTruthy();
      expect(typeof gradient.animationDuration).toBe("number");
      expect(gradient.backgroundSize).toBeTruthy();
    });
  });

  it("non-animated gradients don't have animation properties", () => {
    const nonAnimated = GRADIENT_PRESETS.filter((g) => !g.animated);
    nonAnimated.forEach((gradient) => {
      if (gradient.id !== "none") {
        expect(gradient.animationName).toBeUndefined();
        expect(gradient.backgroundSize).toBeUndefined();
      }
    });
  });
});

describe("palette-aware gradients", () => {
  it("palette-aware gradients use placeholders", () => {
    const paletteAware = GRADIENT_PRESETS.filter((g) => g.paletteAware);
    paletteAware.forEach((gradient) => {
      if (gradient.id !== "none") {
        expect(gradient.gradient).toMatch(/\{\{/); // Has placeholder syntax
      }
    });
  });

  it("has palette placeholders for common tokens", () => {
    const subtleFade = GRADIENT_PRESETS.find((g) => g.id === "subtle-fade");
    expect(subtleFade?.gradient).toContain("{{cardLight}}");
    expect(subtleFade?.gradient).toContain("{{background}}");
  });

  it("accent-glow uses accentFaded placeholder", () => {
    const accentGlow = GRADIENT_PRESETS.find((g) => g.id === "accent-glow");
    expect(accentGlow?.gradient).toContain("{{accentFaded}}");
  });
});

describe("dark theme gradients", () => {
  it("midnight-aurora is dark-only", () => {
    const midnight = GRADIENT_PRESETS.find((g) => g.id === "midnight-aurora");
    expect(midnight?.themeCompatibility).toBe("dark");
    expect(midnight?.animated).toBe(true);
  });

  it("cosmic-purple is dark-only", () => {
    const cosmic = GRADIENT_PRESETS.find((g) => g.id === "cosmic-purple");
    expect(cosmic?.themeCompatibility).toBe("dark");
  });

  it("emerald-night is dark-only", () => {
    const emerald = GRADIENT_PRESETS.find((g) => g.id === "emerald-night");
    expect(emerald?.themeCompatibility).toBe("dark");
  });
});

describe("light theme gradients", () => {
  it("dawn is light-only", () => {
    const dawn = GRADIENT_PRESETS.find((g) => g.id === "dawn");
    expect(dawn?.themeCompatibility).toBe("light");
    expect(dawn?.animated).toBe(true);
  });

  it("soft-sky is light-only", () => {
    const softSky = GRADIENT_PRESETS.find((g) => g.id === "soft-sky");
    expect(softSky?.themeCompatibility).toBe("light");
    expect(softSky?.animated).toBe(false);
  });

  it("rose-mist is light-only", () => {
    const roseMist = GRADIENT_PRESETS.find((g) => g.id === "rose-mist");
    expect(roseMist?.themeCompatibility).toBe("light");
  });
});

describe("universal gradients", () => {
  it("glass-shimmer works with both themes", () => {
    const glass = GRADIENT_PRESETS.find((g) => g.id === "glass-shimmer");
    expect(glass?.themeCompatibility).toBe("both");
    expect(glass?.paletteAware).toBe(true);
  });
});

describe("getGradientPreset", () => {
  it("returns the correct gradient when found", () => {
    const midnight = getGradientPreset("midnight-aurora");
    expect(midnight?.id).toBe("midnight-aurora");
    expect(midnight?.name).toBe("Midnight Aurora");
  });

  it("returns undefined when not found", () => {
    const result = getGradientPreset("nonexistent");
    expect(result).toBeUndefined();
  });

  it("can find none gradient", () => {
    const none = getGradientPreset("none");
    expect(none?.id).toBe("none");
  });
});

describe("getGradientPresetsForTheme", () => {
  it("returns dark and universal gradients for dark theme", () => {
    const darkGradients = getGradientPresetsForTheme(true);
    darkGradients.forEach((gradient) => {
      expect(["dark", "both"]).toContain(gradient.themeCompatibility);
    });
  });

  it("returns light and universal gradients for light theme", () => {
    const lightGradients = getGradientPresetsForTheme(false);
    lightGradients.forEach((gradient) => {
      expect(["light", "both"]).toContain(gradient.themeCompatibility);
    });
  });

  it("universal gradients appear in both sets", () => {
    const darkGradients = getGradientPresetsForTheme(true);
    const lightGradients = getGradientPresetsForTheme(false);

    const universalIds = GRADIENT_PRESETS.filter(
      (g) => g.themeCompatibility === "both"
    ).map((g) => g.id);

    universalIds.forEach((id) => {
      expect(darkGradients.some((g) => g.id === id)).toBe(true);
      expect(lightGradients.some((g) => g.id === id)).toBe(true);
    });
  });

  it("dark-only gradients don't appear for light theme", () => {
    const lightGradients = getGradientPresetsForTheme(false);
    const darkIds = lightGradients.map((g) => g.id);
    expect(darkIds).not.toContain("midnight-aurora");
    expect(darkIds).not.toContain("cosmic-purple");
  });

  it("light-only gradients don't appear for dark theme", () => {
    const darkGradients = getGradientPresetsForTheme(true);
    const darkIds = darkGradients.map((g) => g.id);
    expect(darkIds).not.toContain("dawn");
    expect(darkIds).not.toContain("soft-sky");
  });
});

describe("getGradientStyle", () => {
  const lightPalette = getPaletteById("light-clean");
  const darkPalette = getPaletteById("dark-midnight");

  it("returns solid background for 'none' preset", () => {
    const style = getGradientStyle("none", lightPalette);
    expect(style.backgroundColor).toBe("#ffffff");
    expect(style.background).toBeUndefined();
  });

  it("returns solid background for nonexistent preset", () => {
    const style = getGradientStyle("nonexistent", darkPalette);
    expect(style.backgroundColor).toBe("#020617");
  });

  it("returns gradient string for non-palette-aware gradients", () => {
    const style = getGradientStyle("midnight-aurora", darkPalette);
    expect(style.background).toBeTruthy();
    expect(style.background).toContain("linear-gradient");
  });

  it("interpolates palette colors for palette-aware gradients", () => {
    const style = getGradientStyle("accent-glow", lightPalette);
    expect(style.background).toContain("#ffffff"); // background
    expect(style.background).not.toContain("{{"); // No placeholders
  });

  it("adds animation properties for animated gradients", () => {
    const style = getGradientStyle("midnight-aurora", darkPalette);
    expect(style.backgroundSize).toBe("400% 400%");
    expect(style.animation).toContain("gradient-shift");
    expect(style.animation).toContain("15s");
  });

  it("doesn't add animation properties for non-animated gradients", () => {
    const style = getGradientStyle("ocean-depth", darkPalette);
    expect(style.backgroundSize).toBeUndefined();
    expect(style.animation).toBeUndefined();
  });

  it("interpolates background placeholder", () => {
    const style = getGradientStyle("subtle-fade", lightPalette);
    expect(style.background).toContain("#ffffff");
  });

  it("works with dark palettes", () => {
    const style = getGradientStyle("accent-sweep", darkPalette);
    expect(style.background).toBeTruthy();
    expect(style.background).not.toContain("{{");
  });
});

describe("GRADIENT_KEYFRAMES", () => {
  it("includes all required keyframes", () => {
    expect(GRADIENT_KEYFRAMES).toContain("@keyframes gradient-shift");
    expect(GRADIENT_KEYFRAMES).toContain("@keyframes gradient-sweep");
    expect(GRADIENT_KEYFRAMES).toContain("@keyframes gradient-pulse");
    expect(GRADIENT_KEYFRAMES).toContain("@keyframes gradient-shimmer");
  });

  it("gradient-shift uses background-position", () => {
    expect(GRADIENT_KEYFRAMES).toContain("background-position: 0% 50%");
    expect(GRADIENT_KEYFRAMES).toContain("background-position: 100% 50%");
  });

  it("gradient-pulse uses opacity", () => {
    expect(GRADIENT_KEYFRAMES).toContain("opacity: 1");
    expect(GRADIENT_KEYFRAMES).toContain("opacity: 0.8");
  });

  it("has valid CSS syntax", () => {
    // Check for balanced braces
    const openBraces = (GRADIENT_KEYFRAMES.match(/{/g) || []).length;
    const closeBraces = (GRADIENT_KEYFRAMES.match(/}/g) || []).length;
    expect(openBraces).toBe(closeBraces);
  });
});
