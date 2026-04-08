# OxiCloud Design System — Frosted Glass

## Creative North Star: "The Frosted Glass Editorial"

Pill-shaped components. Lime accent palette. Glassmorphism with backdrop-blur. Google Sans + Noto Sans.

---

## Colors

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#ADFF3B` (Lime, HSL 85 100% 62%) | Actions, success, active selection |
| `--background` | `#f9f9f9` (Off-white, HSL 0 0% 97.6%) | Canvas |
| `--foreground` | `#1a1c1c` (Charcoal, HSL 160 4% 11%) | Text |
| `--muted-foreground` | `#5f5e5e` (Gray, HSL 0 1% 37%) | Tertiary info |
| `--secondary` | `#2f3131` (Dark Charcoal, HSL 180 2% 19%) | Secondary buttons, inverted elements |

### Surface Tiers
Background shifts via surface tiers:
- Level 0: `--surface` (#f9f9f9) — canvas
- Level 1: `--card` (#ffffff) — card lift
- Level 2: `--muted` (#f3f3f4) — inset/input backgrounds

### Glassmorphism (Frosted Glass)
Used on nav bars, modals, and floating elements:
- `backdrop-blur-xl` for cards/modals
- `backdrop-blur-sm` for inputs/badges
- Semi-transparent backgrounds

### Contrast Rule
- ❌ Lime text on white backgrounds in light mode is **prohibited**
- ✅ Lime text on dark backgrounds only
- ✅ On white: use dark text or dark background behind lime

---

## Typography

- **Font Family:** Google Sans (primary), Noto Sans (fallback)
- **Headings:** Google Sans, font-weight 500–700
- **Body:** Noto Sans / Google Sans, 0.875rem–1rem
- **Labels:** 0.75rem, font-medium, tracking-wide

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
- Glassmorphism blur effects for floating UI

---

## Components

### Buttons — Pill-shaped (rounded-full)
- **Primary:** `bg-primary text-primary-foreground` — lime fill, dark text
- **Secondary:** `bg-secondary text-secondary-foreground` — dark charcoal fill, light text
- **Outline:** No bg, 1px border, text foreground
- **Muted CTA:** `bg-muted text-foreground` — light grey fill for landing page CTAs

### Inputs
- Default: `bg-muted` or `bg-input`, rounded-full
- Active/Focused: `bg-card` (solid white fill) + ring
- Error: Bold charcoal text, no red — use lime icon indicators

### Cards
- `bg-card` (pure white), `rounded-2xl`
- Minimal borders (`border-border/40`)
- Hover: subtle shadow or background shift

### Badges / Pills
- Rounded-full, small text
- Variants: `bg-muted`, `bg-primary/10`, inverted `bg-foreground text-background`
- High-contrast inverted style for emphasis

### Icons
- Lucide React icon set
- Line art style, 1.5–2px stroke weight
- Charcoal standard, Lime for active/success states

---

## Spacing

- Section padding: `py-16` to `py-24` for landing sections
- Card padding: `p-4` to `p-6`
- Gap between elements: `gap-2` to `gap-6`

---

## Dark Mode

Full dark mode support via CSS variables in `.dark` class:
- Background: `HSL(160 4% 11%)` — charcoal
- Card: `HSL(180 3% 14%)`
- Text: `HSL(0 0% 97.6%)` — off-white
- Primary remains lime with adjusted foreground

---

## Rules

### Do
- ✅ Pill-shaped buttons and inputs everywhere
- ✅ Lime as surgical accent — one primary action per screen
- ✅ Glassmorphism for floating elements (nav, modals)
- ✅ Solid white fill on focused/active inputs
- ✅ Use semantic color tokens from `index.css`, never hardcode colors

### Don't
- ❌ Red for errors (use bold charcoal + lime icon)
- ❌ Lime text on white backgrounds in light mode
- ❌ Square corners on interactive elements (always pill-shaped)
- ❌ Hardcoded color values in components
- ❌ Heavy drop shadows (use tonal layering or glassmorphism)
