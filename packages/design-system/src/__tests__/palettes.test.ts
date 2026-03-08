import { describe, it, expect } from "vitest";
import {
  DEFAULT_PALETTES,
  getPalettes,
  getPaletteById,
  getDefaultPalette,
  paletteToCssVars,
  customColorsToCssVars,
  type ColorPalette,
} from "../palettes";

describe("DEFAULT_PALETTES", () => {
  it("has 16 palettes", () => {
    expect(DEFAULT_PALETTES).toHaveLength(16);
  });

  it("includes light and dark palettes", () => {
    const lightCount = DEFAULT_PALETTES.filter((p) => !p.isDark).length;
    const darkCount = DEFAULT_PALETTES.filter((p) => p.isDark).length;
    expect(lightCount).toBeGreaterThan(0);
    expect(darkCount).toBeGreaterThan(0);
  });

  it("has stable IDs for all palettes", () => {
    const ids = DEFAULT_PALETTES.map((p) => p.id);
    expect(new Set(ids).size).toBe(DEFAULT_PALETTES.length); // No duplicates
    ids.forEach((id) => {
      expect(id).toMatch(/^[a-z-]+$/); // Lowercase kebab-case
    });
  });

  it("all palettes have required color properties", () => {
    DEFAULT_PALETTES.forEach((palette) => {
      expect(palette.colors.background).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.colors.foreground).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.colors.heading).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.colors.muted).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.colors.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.colors.accentForeground).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.colors.card).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.colors.cardForeground).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.colors.border).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it("all palettes have names and ids", () => {
    DEFAULT_PALETTES.forEach((palette) => {
      expect(palette.id).toBeTruthy();
      expect(palette.name).toBeTruthy();
      expect(typeof palette.isDark).toBe("boolean");
    });
  });
});

describe("specific palettes", () => {
  it("light-clean has white background", () => {
    const lightClean = DEFAULT_PALETTES.find((p) => p.id === "light-clean");
    expect(lightClean?.colors.background).toBe("#ffffff");
    expect(lightClean?.isDark).toBe(false);
  });

  it("dark-midnight has dark background", () => {
    const midnight = DEFAULT_PALETTES.find((p) => p.id === "dark-midnight");
    expect(midnight?.colors.background).toBe("#020617");
    expect(midnight?.isDark).toBe(true);
  });

  it("light-mocha uses Pantone 2025 inspired colors", () => {
    const mocha = DEFAULT_PALETTES.find((p) => p.id === "light-mocha");
    expect(mocha?.description).toContain("Pantone 2025");
    expect(mocha?.isDark).toBe(false);
  });

  it("dark-gold uses brand gold accent", () => {
    const gold = DEFAULT_PALETTES.find((p) => p.id === "dark-gold");
    expect(gold?.colors.accent).toBe("#d4a853");
  });

  it("light-minimal uses pure black and white", () => {
    const minimal = DEFAULT_PALETTES.find((p) => p.id === "light-minimal");
    expect(minimal?.description).toContain("Pure black and white");
  });
});

describe("getPalettes", () => {
  it("returns all default palettes", () => {
    const palettes = getPalettes();
    expect(palettes).toEqual(DEFAULT_PALETTES);
    expect(palettes).toHaveLength(16);
  });
});

describe("getPaletteById", () => {
  it("returns the correct palette when found", () => {
    const midnight = getPaletteById("dark-midnight");
    expect(midnight.id).toBe("dark-midnight");
    expect(midnight.name).toBe("Dark Midnight");
  });

  it("falls back to first light palette when not found", () => {
    const result = getPaletteById("nonexistent");
    expect(result.isDark).toBe(false);
    expect(result).toBeTruthy();
  });

  it("returns a palette even for invalid ID", () => {
    const result = getPaletteById("");
    expect(result).toBeTruthy();
    expect(result.id).toBeTruthy();
  });
});

describe("getDefaultPalette", () => {
  it("returns dark-midnight palette", () => {
    const defaultPalette = getDefaultPalette();
    expect(defaultPalette.id).toBe("dark-midnight");
  });

  it("returns a dark theme", () => {
    const defaultPalette = getDefaultPalette();
    expect(defaultPalette.isDark).toBe(true);
  });
});

describe("paletteToCssVars", () => {
  it("converts all palette colors to CSS variables", () => {
    const palette = getPaletteById("light-clean");
    const vars = paletteToCssVars(palette);

    expect(vars["--palette-background"]).toBe("#ffffff");
    expect(vars["--palette-foreground"]).toBe("#1f2937");
    expect(vars["--palette-heading"]).toBe("#111827");
    expect(vars["--palette-muted"]).toBe("#6b7280");
    expect(vars["--palette-accent"]).toBe("#3b82f6");
    expect(vars["--palette-accent-foreground"]).toBe("#ffffff");
    expect(vars["--palette-card"]).toBe("#f9fafb");
    expect(vars["--palette-card-foreground"]).toBe("#1f2937");
    expect(vars["--palette-border"]).toBe("#e5e7eb");
  });

  it("includes all 9 CSS variables", () => {
    const palette = getPaletteById("dark-midnight");
    const vars = paletteToCssVars(palette);
    expect(Object.keys(vars)).toHaveLength(9);
  });

  it("uses correct CSS variable names", () => {
    const palette = getPaletteById("light-clean");
    const vars = paletteToCssVars(palette);
    const keys = Object.keys(vars);

    expect(keys).toContain("--palette-background");
    expect(keys).toContain("--palette-foreground");
    expect(keys).toContain("--palette-heading");
    expect(keys).toContain("--palette-muted");
    expect(keys).toContain("--palette-accent");
    expect(keys).toContain("--palette-accent-foreground");
    expect(keys).toContain("--palette-card");
    expect(keys).toContain("--palette-card-foreground");
    expect(keys).toContain("--palette-border");
  });
});

describe("customColorsToCssVars", () => {
  it("returns empty object for no colors", () => {
    const vars = customColorsToCssVars({});
    expect(Object.keys(vars)).toHaveLength(0);
  });

  it("includes only specified colors", () => {
    const vars = customColorsToCssVars({
      background: "#ffffff",
      accent: "#3b82f6",
    });

    expect(vars["--palette-background"]).toBe("#ffffff");
    expect(vars["--palette-accent"]).toBe("#3b82f6");
    expect(Object.keys(vars)).toHaveLength(2);
  });

  it("handles partial palette", () => {
    const vars = customColorsToCssVars({
      background: "#ffffff",
      foreground: "#000000",
      accent: "#ff0000",
    });

    expect(vars["--palette-background"]).toBe("#ffffff");
    expect(vars["--palette-foreground"]).toBe("#000000");
    expect(vars["--palette-accent"]).toBe("#ff0000");
    expect(vars["--palette-heading"]).toBeUndefined();
    expect(vars["--palette-muted"]).toBeUndefined();
  });

  it("handles all colors", () => {
    const allColors = {
      background: "#ffffff",
      foreground: "#000000",
      heading: "#111111",
      muted: "#666666",
      accent: "#3b82f6",
      accentForeground: "#ffffff",
      card: "#f9fafb",
      cardForeground: "#1f2937",
      border: "#e5e7eb",
    };

    const vars = customColorsToCssVars(allColors);
    expect(Object.keys(vars)).toHaveLength(9);
  });
});
