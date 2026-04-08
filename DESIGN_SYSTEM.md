# OxiCloud Design System — Frosted Glass (Solid Edition)

## Creative North Star: "The Solid Editorial"

Pill-shaped components. Lime accent palette. Solid surfaces with tonal layering. Google Sans + Noto Sans.

---

## Colors

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#ADFF3B` (Lime, HSL 85 100% 62%) | Actions, success, active selection |
| `--background` | `#FBFBFB` (Off-white, HSL 0 0% 98.4%) | Page canvas |
| `--card` | `#f8f8f8` (Light gray, HSL 0 0% 97.3%) | Cards, panels, containers |
| `--border` | `#eaeaea` (Gray, HSL 0 0% 91.8%) | Dividers, card borders, table borders |
| `--foreground` | `#1a1c1c` (Charcoal, HSL 160 4% 11%) | Text |
| `--muted-foreground` | `#5f5e5e` (Gray, HSL 0 1% 37%) | Tertiary info |
| `--secondary` | `#2f3131` (Dark Charcoal, HSL 180 2% 19%) | Secondary buttons, inverted elements |

### Surface Tiers
Background shifts via surface tiers:
- Level 0: `--background` (#FBFBFB) - page canvas
- Level 1: `--card` (#f8f8f8) - card lift
- Level 2: `--muted` (#f3f3f4) - inset/input backgrounds

### No Blur Rule
- `backdrop-blur` is **prohibited** everywhere in the UI.
- All surfaces must use solid background colors.
- No semi-transparent backgrounds (e.g. `bg-card/80` is not allowed; use `bg-card`).

### Contrast Rule
- Lime text on white backgrounds in light mode is **prohibited**
- Lime text on dark backgrounds only
- On white: use dark text or dark background behind lime

---

## Typography

- **Font Family:** Google Sans (primary), Noto Sans (fallback)
- **Headings:** Google Sans, font-weight 500-700
- **Body:** Noto Sans / Google Sans, 0.875rem-1rem
- **Labels:** 0.75rem, font-medium, tracking-wide
- **Copy rule:** Do not use long dashes (em dashes or en dashes) anywhere in UI copy.

---

## Border Radius

All interactive components use **pill-shaped** (rounded-full) radii:
- Buttons: `rounded-full`
- Inputs & select triggers: `rounded-full`
- Badges: `rounded-full`
- Cards & modals: `rounded-2xl`
- Dialogs: `rounded-2xl`

The CSS variable `--radius: 0px` in the base layer is overridden at the component level. Pill shapes are the standard.

---

## Elevation & Depth

- Minimal use of drop shadows
- Tonal layering preferred (background color shifts between surface tiers)
- No glassmorphism or blur effects

---

## Components

### Navigation bars
- Solid background using `--background` or `--card`
- No blur, no transparency

### Modals and floating panels
- Solid `--card` background
- Light `--border` border
- Subtle shadow for depth
- No blur

### Buttons - Pill-shaped (rounded-full)
- **Primary:** `bg-primary text-primary-foreground` - lime fill, dark text
- **Secondary:** `bg-secondary text-secondary-foreground` - dark charcoal fill, light text
- **Outline:** No bg, 1px border, text foreground
- **Muted CTA:** `bg-muted text-foreground` - light grey fill for landing page CTAs

### Inputs
- Default: `bg-muted`, rounded-full, solid background
- Active/Focused: `bg-card` (solid fill) + ring
- Error: Bold charcoal text, no red - use lime icon indicators

### Cards
- `bg-card` (#f8f8f8), `rounded-2xl`
- Border using `border-border`
- Hover: subtle shadow or background shift

### Badges / Pills
- Rounded-full, small text, solid background
- Variants: `bg-muted`, `bg-primary/10`, inverted `bg-foreground text-background`
- High-contrast inverted style for emphasis

### Icons
- Lucide React icon set
- Line art style, 1.5-2px stroke weight
- Charcoal standard, Lime for active/success states

---

## Spacing

- Section padding: `py-16` to `py-24` for landing sections
- Card padding: `p-4` to `p-6`
- Gap between elements: `gap-2` to `gap-6`

---

## Dark Mode

Full dark mode support via CSS variables in `.dark` class:
- Background: `HSL(160 4% 7%)` - deep charcoal
- Card: `HSL(160 4% 10%)`
- Text: `HSL(0 0% 95%)` - off-white
- Primary remains lime with adjusted foreground

---

## Rules

### Do
- Use solid backgrounds everywhere
- Pill-shaped buttons and inputs everywhere
- Lime as surgical accent - one primary action per screen
- Solid white fill on focused/active inputs
- Use semantic color tokens from `index.css`, never hardcode colors

### Don't
- `backdrop-blur` anywhere in the interface
- Semi-transparent backgrounds on surfaces
- Red for errors (use bold charcoal + lime icon)
- Lime text on white backgrounds in light mode
- Square corners on interactive elements (always pill-shaped)
- Hardcoded color values in components
- Heavy drop shadows (use tonal layering)
- Long dashes (em dashes / en dashes) in UI copy
