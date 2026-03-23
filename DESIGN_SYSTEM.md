# OxiCloud Design System — Neon Brutalism

## Creative North Star: "The High-Contrast Editorial"

Sharp 0px radii. Four-color palette. Tonal layering. Space Grotesk + Inter.

---

## Colors

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#ADFF3B` (Lime) | Actions, success, active selection |
| `--background` | `#f9f9f9` (Off-white) | Canvas |
| `--foreground` | `#1a1c1c` (Charcoal) | Text, errors (bold) |
| `--muted-foreground` | `#5f5e5e` (Gray) | Tertiary info |

### No-Line Rule
No 1px borders for sectioning. Use background color shifts via surface tiers:
- Level 0: `--surface` (#f9f9f9)
- Level 1: `--surface-container-lowest` (#ffffff) — card lift
- Level 2: `--surface-container-highest` (#e2e2e2) — inset/input

### Glassmorphism (Frosted Neon)
Floating nav/modals only: `surface` at 80% opacity + `20px` backdrop-blur.

---

## Typography

- **Display (LG/MD/SM):** Space Grotesk, 3.5rem–2.25rem, tracking -0.02em, bold
- **Headline (LG/MD/SM):** Space Grotesk, 2rem–1.5rem, bold
- **Body (LG/MD/SM):** Inter, 1rem–0.75rem
- **Labels:** Inter, 0.75rem, uppercase, tracking 0.12em

---

## Elevation & Depth

No drop shadows. Tonal layering only.
- Ambient shadow (floating elements): `on_surface` at 4% opacity, 40px blur, 20px offset

---

## Components

### Buttons — 0px radius
- **Primary:** `bg-primary text-primary-foreground`
- **Secondary:** `bg-secondary text-secondary-foreground`
- **Outline:** No bg, 1px border `foreground/20`, text `foreground`

### Inputs
- Default: `bg-surface-container-low`
- Active: `bg-surface-container-highest` + 2px bottom border in `primary`
- Error: Bold charcoal text, no red

### Cards
- `bg-card` (pure white), no border, no shadow
- Hover: ambient shadow only

### Badges
- No border-radius, no borders
- Variants: primary bg, secondary bg, outline with surface-container-low

### Icons
- Line art only, 1.5–2px stroke weight
- Charcoal standard, Lime for active/success
- Never filled icons

---

## Spacing

Use dramatic whitespace. `8.5rem` (py-24) and `7rem` (py-20) for section padding.

---

## Rules

### Do
- ✅ Massive whitespace
- ✅ Lime as surgical accent — one primary action per screen
- ✅ Strict vertical grid for text; cards/images may break grid

### Don't
- ❌ Rounded corners (0px is the rule)
- ❌ Red for errors (use bold charcoal + lime icon)
- ❌ 100% opaque borders (use background shifts)
- ❌ Filled icons
- ❌ Drop shadows (use ambient diffusion only)
