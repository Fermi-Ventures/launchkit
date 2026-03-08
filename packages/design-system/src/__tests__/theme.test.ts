import { describe, it, expect } from "vitest";
import {
  hexToHsl,
  contrastForeground,
  CURATED_ACCENT_COLORS,
  THEME_PRESETS,
  CURATED_FONTS,
  buildGoogleFontsUrl,
} from "../theme";

describe("hexToHsl", () => {
  it("converts pure red", () => {
    expect(hexToHsl("#ff0000")).toBe("0 100% 50%");
  });

  it("converts pure green", () => {
    expect(hexToHsl("#00ff00")).toBe("120 100% 50%");
  });

  it("converts pure blue", () => {
    expect(hexToHsl("#0000ff")).toBe("240 100% 50%");
  });

  it("converts white", () => {
    expect(hexToHsl("#ffffff")).toBe("0 0% 100%");
  });

  it("converts black", () => {
    expect(hexToHsl("#000000")).toBe("0 0% 0%");
  });

  it("converts gray", () => {
    expect(hexToHsl("#808080")).toBe("0 0% 50%");
  });

  it("converts tailwind blue-500", () => {
    const result = hexToHsl("#3b82f6");
    // Should be approximately: 217° 91% 60%
    expect(result).toMatch(/^217 \d+% \d+%$/);
  });

  it("converts brand gold", () => {
    const result = hexToHsl("#d4a853");
    // Should be approximately: 43° 60% 58%
    expect(result).toMatch(/^\d+ \d+% \d+%$/);
  });
});

describe("contrastForeground", () => {
  it("returns dark text for light backgrounds", () => {
    // White background (lightness 100%)
    expect(contrastForeground("0 0% 100%")).toBe("210 51% 24%");
  });

  it("returns light text for dark backgrounds", () => {
    // Black background (lightness 0%)
    expect(contrastForeground("0 0% 0%")).toBe("0 0% 98%");
  });

  it("uses 55% as threshold", () => {
    // Just above threshold
    expect(contrastForeground("0 0% 56%")).toBe("210 51% 24%");
    // Just below threshold
    expect(contrastForeground("0 0% 54%")).toBe("0 0% 98%");
  });
});

describe("CURATED_ACCENT_COLORS", () => {
  it("has 12 colors", () => {
    expect(CURATED_ACCENT_COLORS).toHaveLength(12);
  });

  it("includes Navy as first color", () => {
    expect(CURATED_ACCENT_COLORS[0].name).toBe("Navy");
    expect(CURATED_ACCENT_COLORS[0].hex).toBe("#1e3a5f");
  });

  it("includes Slate as last color", () => {
    expect(CURATED_ACCENT_COLORS[11].name).toBe("Slate");
    expect(CURATED_ACCENT_COLORS[11].hex).toBe("#475569");
  });

  it("computes hsl and foreground for each color", () => {
    CURATED_ACCENT_COLORS.forEach((color) => {
      expect(color.hsl).toMatch(/^\d+ \d+% \d+%$/);
      expect(color.foreground).toMatch(/^\d+ \d+% \d+%$/);
    });
  });

  it("provides contrasting foreground for Navy", () => {
    const navy = CURATED_ACCENT_COLORS.find((c) => c.name === "Navy");
    // Navy is dark, should get light foreground
    expect(navy?.foreground).toBe("0 0% 98%");
  });
});

describe("THEME_PRESETS", () => {
  it("has 7 presets", () => {
    expect(THEME_PRESETS).toHaveLength(7);
  });

  it("includes Professional preset", () => {
    const professional = THEME_PRESETS.find((p) => p.id === "professional");
    expect(professional?.name).toBe("Professional");
    expect(professional?.config.baseMode).toBe("light");
    expect(professional?.config.accentColor).toBe("#1e3a5f");
    expect(professional?.config.fontHeading).toBe("Inter");
  });

  it("includes Executive preset with dark mode", () => {
    const executive = THEME_PRESETS.find((p) => p.id === "executive");
    expect(executive?.config.baseMode).toBe("dark");
    expect(executive?.config.fontHeading).toBe("Playfair Display");
  });

  it("all presets have stable IDs", () => {
    const ids = THEME_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(THEME_PRESETS.length); // No duplicates
    ids.forEach((id) => {
      expect(id).toMatch(/^[a-z-]+$/); // Lowercase kebab-case
    });
  });

  it("all presets have config objects", () => {
    THEME_PRESETS.forEach((preset) => {
      expect(preset.config).toBeDefined();
      expect(typeof preset.config.accentColor).toBe("string");
      expect(["light", "dark"]).toContain(preset.config.baseMode);
    });
  });
});

describe("CURATED_FONTS", () => {
  it("has 12 fonts", () => {
    expect(CURATED_FONTS).toHaveLength(12);
  });

  it("includes fonts from all categories", () => {
    const categories = new Set(CURATED_FONTS.map((f) => f.category));
    expect(categories).toContain("professional");
    expect(categories).toContain("elegant");
    expect(categories).toContain("modern");
    expect(categories).toContain("creative");
  });

  it("includes Inter as professional font", () => {
    const inter = CURATED_FONTS.find((f) => f.family === "Inter");
    expect(inter?.category).toBe("professional");
    expect(inter?.description).toBe("Clean");
  });

  it("includes Playfair Display as elegant font", () => {
    const playfair = CURATED_FONTS.find((f) => f.family === "Playfair Display");
    expect(playfair?.category).toBe("elegant");
  });

  it("all fonts have required fields", () => {
    CURATED_FONTS.forEach((font) => {
      expect(font.family).toBeTruthy();
      expect(font.category).toBeTruthy();
      expect(font.description).toBeTruthy();
    });
  });
});

describe("buildGoogleFontsUrl", () => {
  it("returns null when no fonts specified", () => {
    expect(buildGoogleFontsUrl()).toBeNull();
    expect(buildGoogleFontsUrl(undefined, undefined)).toBeNull();
  });

  it("builds URL for single font", () => {
    const url = buildGoogleFontsUrl("Inter");
    expect(url).toBe(
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    );
  });

  it("builds URL for two different fonts", () => {
    const url = buildGoogleFontsUrl("Inter", "Playfair Display");
    expect(url).toContain("family=Inter:wght@400;500;600;700");
    expect(url).toContain("family=Playfair+Display:wght@400;500;600;700");
    expect(url).toContain("&");
  });

  it("handles font names with spaces", () => {
    const url = buildGoogleFontsUrl("Playfair Display");
    expect(url).toContain("Playfair+Display");
  });

  it("deduplicates when heading and body fonts are the same", () => {
    const url = buildGoogleFontsUrl("Inter", "Inter");
    // Should only include Inter once
    const matches = url?.match(/family=Inter/g);
    expect(matches).toHaveLength(1);
  });

  it("includes font weights 400, 500, 600, 700", () => {
    const url = buildGoogleFontsUrl("Inter");
    expect(url).toContain("wght@400;500;600;700");
  });

  it("includes display=swap parameter", () => {
    const url = buildGoogleFontsUrl("Inter");
    expect(url).toContain("display=swap");
  });
});
