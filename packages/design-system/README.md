# @fermi-ventures/launchkit-design-system

Design system utilities for LaunchKit applications - color palettes, gradients, and theme utilities.

Extracted from endorsed's production WYSIWYG profile builder. Battle-tested with 16 color palettes, 15 gradient presets, and complete theming system.

## Installation

```bash
npm install @fermi-ventures/launchkit-design-system
```

### Configuration

Add to your project's `.npmrc`:

```
@fermi-ventures:registry=https://npm.pkg.github.com
```

## Features

- **16 Color Palettes** - Light and dark themes with semantic color tokens
- **15 Gradient Presets** - Palette-aware and fixed gradients with animations
- **Theme Utilities** - Color conversion, contrast calculation, Google Fonts integration
- **12 Curated Fonts** - Professional, elegant, modern, and creative categories
- **7 Theme Presets** - Pre-configured combinations of colors, fonts, and modes

## Usage

### Color Palettes

```typescript
import { getPalettes, getPaletteById, paletteToCssVars } from '@fermi-ventures/launchkit-design-system/palettes';

// Get all palettes
const palettes = getPalettes(); // 16 palettes

// Get specific palette
const midnight = getPaletteById('dark-midnight');

// Apply to React component
const cssVars = paletteToCssVars(midnight);
<div style={cssVars}>
  {/* Uses --palette-background, --palette-foreground, etc. */}
</div>
```

**Available Palettes:**

Light themes: `light-clean`, `light-warm`, `light-sage`, `light-rose`, `light-sky`, `light-lavender`, `light-mocha`, `light-minimal`

Dark themes: `dark-professional`, `dark-vibrant`, `dark-midnight`, `dark-emerald`, `dark-gold`, `dark-rose`, `dark-mocha`, `dark-minimal`

### Gradients

```typescript
import { getGradientStyle, getGradientPresetsForTheme } from '@fermi-ventures/launchkit-design-system/gradients';
import { getPaletteById } from '@fermi-ventures/launchkit-design-system/palettes';

const palette = getPaletteById('dark-midnight');
const gradientStyle = getGradientStyle('midnight-aurora', palette);

<div style={gradientStyle}>
  {/* Animated gradient background */}
</div>

// Get gradients for current theme
const darkGradients = getGradientPresetsForTheme(true); // isDark = true
```

**Available Gradients:**

Palette-aware: `none`, `subtle-fade`, `accent-glow`, `accent-sweep`, `glass-shimmer`

Dark: `midnight-aurora`, `cosmic-purple`, `emerald-night`, `premium-gold`, `ocean-depth`, `charcoal-ember`

Light: `dawn`, `soft-sky`, `rose-mist`, `mint-fresh`

**Gradient Animations:**

Add these keyframes to your `globals.css`:

```typescript
import { GRADIENT_KEYFRAMES } from '@fermi-ventures/launchkit-design-system/gradients';

// Copy GRADIENT_KEYFRAMES to your globals.css
console.log(GRADIENT_KEYFRAMES);
```

### Theme Utilities

```typescript
import { hexToHsl, contrastForeground, buildGoogleFontsUrl, CURATED_ACCENT_COLORS } from '@fermi-ventures/launchkit-design-system/theme';

// Convert hex to HSL
const hsl = hexToHsl('#3b82f6'); // "217 91% 60%"

// Get contrasting foreground
const fg = contrastForeground(hsl); // Returns light or dark text color

// Load Google Fonts
const url = buildGoogleFontsUrl('Inter', 'Playfair Display');
// https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap

// Use curated colors
const navy = CURATED_ACCENT_COLORS.find(c => c.name === 'Navy');
console.log(navy.hex); // "#1e3a5f"
console.log(navy.hsl); // Pre-computed HSL
console.log(navy.foreground); // Pre-computed contrasting foreground
```

### Theme Presets

```typescript
import { THEME_PRESETS } from '@fermi-ventures/launchkit-design-system/theme';

// Get all presets
const professional = THEME_PRESETS.find(p => p.id === 'professional');
/*
{
  id: "professional",
  name: "Professional",
  description: "Clean and corporate",
  config: {
    accentColor: "#1e3a5f",
    baseMode: "light",
    fontHeading: "Inter",
    fontBody: "Inter"
  }
}
*/
```

**Available Presets:**

- `professional` - Clean and corporate (light, Inter, navy)
- `executive` - Authoritative and premium (dark, Playfair Display, navy)
- `creative` - Warm and expressive (light, DM Sans + Nunito, orange)
- `minimal` - Reduced and content-first (light, Inter, slate)
- `bold` - High contrast and striking (dark, Space Grotesk, purple)
- `modern` - Tech-forward and clean (light, Inter, teal)
- `warm` - Approachable and human (light, Merriweather, pink)

### Curated Fonts

```typescript
import { CURATED_FONTS } from '@fermi-ventures/launchkit-design-system/theme';

// Filter by category
const professional = CURATED_FONTS.filter(f => f.category === 'professional');
// Inter, Roboto, Source Sans 3

const elegant = CURATED_FONTS.filter(f => f.category === 'elegant');
// Playfair Display, Lora, Crimson Text

const modern = CURATED_FONTS.filter(f => f.category === 'modern');
// Space Grotesk, DM Sans, JetBrains Mono

const creative = CURATED_FONTS.filter(f => f.category === 'creative');
// Nunito, Poppins, Quicksand
```

## Custom Colors

```typescript
import { customColorsToCssVars } from '@fermi-ventures/launchkit-design-system/palettes';

// Use custom colors instead of palette
const vars = customColorsToCssVars({
  background: '#ffffff',
  foreground: '#000000',
  accent: '#ff0000'
});

<div style={vars}>
  {/* Uses only the specified custom colors */}
</div>
```

## TypeScript Types

```typescript
import type {
  ColorPalette,
  GradientPreset,
  CuratedColor,
  CuratedFont,
  ThemePreset
} from '@fermi-ventures/launchkit-design-system';

// All exports are fully typed
```

## CSS Variable Reference

When using `paletteToCssVars()`, the following CSS variables are set:

- `--palette-background` - Page/section background
- `--palette-foreground` - Primary body text
- `--palette-heading` - Heading text (h1-h6)
- `--palette-muted` - Secondary/subdued text
- `--palette-accent` - Primary action color, links, highlights
- `--palette-accent-foreground` - Text on accent-colored backgrounds
- `--palette-card` - Card/panel backgrounds
- `--palette-card-foreground` - Text inside cards
- `--palette-border` - Borders and dividers

## Extending Palettes

Future versions will support database-backed custom palettes:

```typescript
// Future API (not yet implemented)
export async function getPalettes(): Promise<ColorPalette[]> {
  const dbPalettes = await prisma.colorPalette.findMany({ where: { isActive: true } })
  return [...DEFAULT_PALETTES, ...dbPalettes.map(mapDbToPalette)]
}
```

## Extracted From

- **endorsed** - 836 lines of production-tested design tokens

## License

MIT
