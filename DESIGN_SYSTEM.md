# OxiCloud Design System — Figma Handoff Specification

**Philosophy:** Editorial Glassmorphism — High contrast, WCAG AA+, three core colors (White, Black, Neon Green), green accent ≤15% of visible area, clean typography hierarchy.

---

## 1. DESIGN TOKENS

### 1.1 Color Palette

| Token | HSL | HEX | Usage |
|---|---|---|---|
| `background` | `0 0% 100%` | `#FFFFFF` | Page background |
| `foreground` | `0 0% 5%` | `#0D0D0D` | Primary text |
| `primary` | `108 96% 52%` | `#4DFC0E` | Neon green — CTAs, links, accent |
| `primary-foreground` | `0 0% 0%` | `#000000` | Text on primary |
| `secondary` | `0 0% 5%` | `#0D0D0D` | Dark fills — sidebar, dark cards |
| `secondary-foreground` | `0 0% 98%` | `#FAFAFA` | Text on secondary |
| `muted` | `0 0% 96%` | `#F5F5F5` | Subtle backgrounds |
| `muted-foreground` | `0 0% 35%` | `#595959` | Secondary text, labels |
| `accent` | `108 96% 52%` | `#4DFC0E` | Same as primary |
| `accent-foreground` | `0 0% 5%` | `#0D0D0D` | Text on accent |
| `destructive` | `0 84% 50%` | `#EA3323` | Errors, delete actions |
| `destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Text on destructive |
| `border` | `0 0% 88%` | `#E0E0E0` | Borders, dividers |
| `input` | `0 0% 92%` | `#EBEBEB` | Input borders |
| `ring` | `108 96% 52%` | `#4DFC0E` | Focus ring |
| `popover` | `0 0% 100%` | `#FFFFFF` | Popovers, dropdowns |
| `card` | `0 0% 100%` | `#FFFFFF` | Cards |

**Sidebar Tokens:**

| Token | HSL | HEX |
|---|---|---|
| `sidebar-background` | `0 0% 5%` | `#0D0D0D` |
| `sidebar-foreground` | `0 0% 98%` | `#FAFAFA` |
| `sidebar-primary` | `108 96% 52%` | `#4DFC0E` |
| `sidebar-accent` | `0 0% 15%` | `#262626` |
| `sidebar-border` | `0 0% 20%` | `#333333` |

**Extended Palette (Brand):**

| Name | HEX | Usage |
|---|---|---|
| `oxi-white` | `#FFFFFF` | Pure white |
| `oxi-white-soft` | `#F4F4F4` | Soft backgrounds |
| `oxi-black` | `#000000` | Pure black |
| `oxi-charcoal` | `#232322` | Dark surfaces, poster-charcoal |
| `oxi-green` | `#4DFC0E` | Primary brand green |
| `oxi-green-dark` | `#3DD00A` | Hover state green |
| `oxi-gray-50` | `#F4F4F4` | Lightest gray |
| `oxi-gray-100` | `#EDEDED` | — |
| `oxi-gray-200` | `#D8D8D8` | — |
| `oxi-gray-300` | `#B3B3B3` | — |
| `oxi-gray-400` | `#858585` | — |
| `oxi-gray-500` | `#6B6B6B` | — |
| `oxi-gray-600` | `#4A4A4A` | — |
| `oxi-gray-700` | `#232322` | Same as charcoal |
| `oxi-gray-800` | `#1A1A1A` | — |
| `oxi-gray-900` | `#0A0A0A` | Near-black |

**Chart Colors:**

| Token | HSL | Usage |
|---|---|---|
| `chart-1` | `108 96% 52%` | Primary data |
| `chart-2` | `0 0% 30%` | Secondary data |
| `chart-3` | `0 0% 50%` | Tertiary data |
| `chart-4` | `108 60% 60%` | Light green data |
| `chart-5` | `0 0% 70%` | Muted data |

---

### 1.2 Typography

**Font Stack:**

| Role | Family | Fallbacks |
|---|---|---|
| **Display** (headings, hero) | `Roobert` | Inter, system-ui, sans-serif |
| **Body** (UI, paragraphs) | `Plus Jakarta Sans` | system-ui, sans-serif |
| **Imported backup** | `Inter` | system-ui |
| **Imported backup** | `Montserrat` | — |

**Type Scale:**

| Token | Size (mobile → desktop) | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `heading-xl` | 36→48→60→72px | 600 (semibold) | 0.92 | -0.03em | Hero titles |
| `heading-lg` | 30→36→48px | 600 | 0.95 | -0.025em | Section titles |
| `heading-md` | 24→30→36px | 600 | 1.25 (tight) | -0.02em | Card titles |
| `heading-sm` | 20→24px | 500 (medium) | 1.25 | normal | Subsections |
| `body-lg` | 18→20px | 400 | 1.625 (relaxed) | normal | Lead paragraphs |
| `body-md` | 16→18px | 400 | 1.625 | normal | Body copy |
| `text-base` | 16px | — | — | — | Default UI text |
| `text-sm` | 14px | — | — | — | Secondary UI |
| `text-xs` | 12px | — | — | — | Labels, captions |
| `text-[10px]` | 10px | — | — | — | Micro badges |
| `text-[11px]` | 11px | — | — | — | Helper text |

**Overline/Badge:**

| Property | Value |
|---|---|
| Size | 12px (xs) |
| Weight | 600 (semibold) |
| Case | UPPERCASE |
| Letter spacing | 0.12em |
| Padding | 20px H, 8px V |
| Border radius | Full (9999px) |
| Border | 1px solid primary |
| Color | primary |
| Fill | transparent |

---

### 1.3 Spacing Scale (Tailwind)

| Token | Value |
|---|---|
| `0.5` | 2px |
| `1` | 4px |
| `1.5` | 6px |
| `2` | 8px |
| `2.5` | 10px |
| `3` | 12px |
| `4` | 16px |
| `5` | 20px |
| `6` | 24px |
| `8` | 32px |
| `10` | 40px |
| `12` | 48px |
| `16` | 64px |
| `20` | 80px |
| `24` | 96px |

**Section Spacing:**

| Token | Mobile | Tablet | Desktop |
|---|---|---|---|
| `section-padding-sm` | 64px | 80px | 96px |
| `section-padding` | 96px | 128px | 160px |
| `section-padding-lg` | 128px | 160px | 192px |

---

### 1.4 Border Radius Scale

| Token | Value |
|---|---|
| `sm` | `calc(0.5rem - 4px)` = 4px |
| `md` | `calc(0.5rem - 2px)` = 6px |
| `lg` | `0.5rem` = 8px (base `--radius`) |
| `xl` | 12px |
| `2xl` | 16px |
| `3xl` | 24px |
| `4xl` | 32px |
| `full` | 9999px |

---

### 1.5 Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle depth |
| `shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Default elevation |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Medium cards |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Floating elements |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Modals |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Popovers |
| `glow-sm` | `0 0 20px rgba(77, 252, 14, 0.4)` | Green glow (small) |
| `glow` | `0 0 40px rgba(77, 252, 14, 0.5)` | Green glow (default) |
| `glow-lg` | `0 0 60px rgba(77, 252, 14, 0.6)` | Green glow (large) |
| `glow-white` | `0 0 40px rgba(255, 255, 255, 0.3)` | White glow (dark bg) |
| `inner-lg` | `inset 0 2px 20px 0 rgb(0 0 0 / 0.1)` | Inset depth |

**CSS Custom Shadows (index.css):**

| Token | Value |
|---|---|
| `--shadow-sm` | `0px 1px 2.75px -2px hsla(0,0%,0%,0.1)` |
| `--shadow` | `0px 1px 5.5px -2px hsla(0,0%,0%,0.1)` |
| `--shadow-md` | `0px 1px 8.25px -2px hsla(0,0%,0%,0.1)` |
| `--shadow-lg` | `0px 1px 13.75px -2px hsla(0,0%,0%,0.1)` |

---

### 1.6 Breakpoints

| Name | Min-width | Usage |
|---|---|---|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1400px | Container max |

---

### 1.7 Motion / Animation Tokens

| Token | Duration | Easing | Description |
|---|---|---|---|
| `fade-in` | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Fade + translateY(20px) |
| `fade-in-up` | 800ms | same | Fade + translateY(40px) |
| `fade-in-down` | 600ms | same | Fade + translateY(-20px) |
| `scale-in` | 500ms | same | Fade + scale(0.95→1) |
| `slide-up` | 600ms | same | Translate Y(30px→0) |
| `slide-in-right` | 600ms | same | Translate X(40px→0) |
| `slide-in-left` | 600ms | same | Translate X(-40px→0) |
| `float` | 5000ms | ease-in-out | Y(0→-15px→0) infinite |
| `pulse-glow` | 2500ms | ease-in-out | Box-shadow pulse infinite |
| `bounce-subtle` | 2500ms | ease-in-out | Y(0→-6px→0) infinite |
| `blob` | 6000ms | — | Organic blob movement |
| `accordion-down` | 200ms | ease-out | Radix height expand |
| `accordion-up` | 200ms | ease-out | Radix height collapse |

**Interactive Easing:**

| Effect | Property | Easing |
|---|---|---|
| `hover-lift` | transform, box-shadow | `cubic-bezier(0.34, 1.56, 0.64, 1)` 400ms |
| `btn-spring` | transform | `cubic-bezier(0.34, 1.56, 0.64, 1)` 300ms |
| `glass-hover` | all | 300ms default |
| `cta-advanced fill` | height | `cubic-bezier(0.4, 0, 0.2, 1)` 350ms |

**Stagger Delays:** 100ms, 200ms, 300ms, 400ms, 500ms

**Pill Toggle Spring:** `type: "spring", stiffness: 400, damping: 30` (framer-motion)

---

### 1.8 Glass Properties

| Token | Value |
|---|---|
| `--glass-blur` | 20px |
| `--glass-bg` | `hsl(0 0% 100% / 0.85)` |
| `--glass-border` | `hsl(0 0% 88%)` |
| `glass-card` | blur-xl + bg card/0.85 + border + rounded-lg |
| `glass-card-strong` | blur-2xl + bg card/0.92 + border + rounded-lg |
| `glass-nav` | bg background/0.80 + blur-xl + border-b |

---

## 2. COMPONENT INVENTORY

### Navigation
- `TopNavigation` — App header bar (glass-nav)
- `PilotNavigation` — Pilot demo nav
- `LandingNavbar` — Marketing page nav (mix-blend)
- `MainNavigation` — Primary sidebar nav
- `PillToggle` — Animated tab selector (framer-motion spring)

### Buttons
- `Button` — 7 variants × 4 sizes
- `AdvancedCTAButton` — Editorial fill-on-hover CTA (3 variants)

### Inputs
- `Input` — Standard text input
- `Textarea` — Multiline
- `Select` — Dropdown (Radix)
- `Checkbox` — Boolean toggle (Radix)
- `Switch` — On/off toggle (Radix)
- `Radio Group` — Option selection
- `Slider` — Range input
- `Calendar` — Date picker (react-day-picker)
- `Input OTP` — Verification code

### Layout
- `Card` — Content container
- `Separator` — Visual divider
- `Tabs` — Content tabs (Radix)
- `Accordion` — Collapsible sections
- `Collapsible` — Single collapsible
- `Resizable` — Resizable panels
- `ScrollArea` — Custom scrollbar
- `AspectRatio` — Fixed ratio container

### Overlay / Feedback
- `Dialog` — Modal window (Radix)
- `AlertDialog` — Confirmation modal
- `Sheet` — Slide-in panel
- `Drawer` — Bottom drawer (vaul)
- `Popover` — Contextual popup
- `Tooltip` — Hover hint
- `HoverCard` — Rich hover preview
- `DropdownMenu` — Action menu
- `ContextMenu` — Right-click menu
- `Menubar` — App menu bar
- `Command` — Command palette (cmdk)
- `NavigationMenu` — Mega-menu style nav

### Data Display
- `Table` — Data table
- `Badge` — Status/label tag
- `Avatar` — User image/initials
- `Progress` — Progress bar
- `Skeleton` — Loading placeholder
- `Chart` — Recharts wrapper

### Feedback
- `Toast` / `Sonner` — Notification toasts
- `Alert` — Inline alert banner

### Forms
- `Form` — React Hook Form wrapper
- `Label` — Form label

### Misc
- `Breadcrumb` — Path breadcrumbs
- `Pagination` — Page navigation
- `Carousel` — Content carousel (embla)
- `Sidebar` — Collapsible sidebar

---

## 3. COMPONENT SPECS

### 3.1 Button

**Base:** `inline-flex items-center justify-center gap-8px rounded-lg text-14px font-600 transition-200ms`

| Variant | Default State | Hover | Active | Disabled |
|---|---|---|---|---|
| `default` | bg: `#4DFC0E`, text: `#000` | bg: primary/90, shadow-glow-sm | — | opacity: 0.5 |
| `destructive` | bg: `#EA3323`, text: `#FFF` | bg: destructive/90 | — | opacity: 0.5 |
| `outline` | bg: `#FFF`, border: `#E0E0E0`, text: foreground | bg: muted, border: primary/50 | — | opacity: 0.5 |
| `secondary` | bg: `#0D0D0D`, text: `#FAFAFA` | bg: secondary/80 | — | opacity: 0.5 |
| `ghost` | bg: transparent | bg: `#0D0D0D`, text: `#FAFAFA` | — | opacity: 0.5 |
| `link` | text: `#4DFC0E`, underline-offset-4 | underline | — | opacity: 0.5 |
| `glow` | bg: `#4DFC0E`, text: `#000`, pulse-glow | shadow-glow | — | opacity: 0.5 |

| Size | Height | Padding H | Radius | Font Size |
|---|---|---|---|---|
| `default` | 40px | 20px | 8px (lg) | 14px |
| `sm` | 36px | 16px | 6px (md) | 12px |
| `lg` | 48px | 32px | 8px (lg) | 16px |
| `icon` | 40×40px | 0 | 8px | — |

**Focus:** ring-2 ring-primary ring-offset-2

---

### 3.2 Input

| Property | Value |
|---|---|
| Height | 40px |
| Padding | 12px H, 8px V |
| Border | 1px solid `#EBEBEB` |
| Radius | 6px (md) |
| Background | `#FFFFFF` |
| Font | 14px (md:), 16px (mobile) |
| Placeholder | color `#595959` |
| Focus | ring-2 ring-primary ring-offset-2 |
| Disabled | opacity 0.5, cursor not-allowed |

---

### 3.3 Card

| Property | Value |
|---|---|
| Background | `#FFFFFF` |
| Border | 1px solid border/50 |
| Radius | 12px (xl) — `.rounded-xl` used in app |
| Shadow | shadow-sm |
| Padding | 24px (p-6) |

---

### 3.4 Dialog (Modal)

| Property | Value |
|---|---|
| Max width | 672px (`sm:max-w-2xl`) |
| Max height | 90vh |
| Radius | 8px (lg) |
| Background | `#FFFFFF` |
| Overlay | black/80 backdrop-blur |
| Header padding | 24px H, 20px T, 16px B |
| Body padding | 24px |
| Footer padding | 24px H, 16px V, border-t |

---

### 3.5 Table

| Property | Value |
|---|---|
| Header row | bg: transparent or `muted/30`, h: 36px |
| Header text | 12px, font-500, color: `#595959` |
| Body row | py: 12px, border-b: border/30 |
| Body text | 14px default, 12px for secondary |
| Hover | group cursor-pointer, transition 200ms |
| Row border | 1px solid border/30 |

---

### 3.6 Badge

| Variant | Background | Text | Border |
|---|---|---|---|
| `default` | primary | primary-foreground | — |
| `secondary` | secondary | secondary-foreground | — |
| `outline` | transparent | foreground | 1px border |
| `destructive` | destructive | white | — |

| Size | Font | Padding | Radius |
|---|---|---|---|
| Default | 12px | 10px H, 2px V | full |
| Micro | 10px | 6px H, 0 V | full |

---

### 3.7 PillToggle (Tab Navigation)

| Property | Value |
|---|---|
| Container | inline-flex, gap-4px, p-4px, rounded-full, bg: muted/60, border: border/40 |
| Item padding | 20px H, 8px V |
| Item radius | full |
| Item font | 14px, font-500 |
| Active bg | foreground (animated via framer-motion) |
| Active text | background color |
| Inactive text | muted-foreground |
| Inactive hover | foreground color |
| Animation | spring stiffness:400, damping:30 |

---

### 3.8 Switch

| Property | Value |
|---|---|
| Track size | 28×16px (w-7 h-4) |
| Thumb size | 12×12px (h-3 w-3) |
| Track off | muted-foreground/20 |
| Track on | primary (`#4DFC0E`) |
| Thumb off | muted-foreground/70, translate-x 2px |
| Thumb on | primary-foreground, translate-x 14px |
| Transition | 150ms |
| Radius | full |

---

### 3.9 Select

| Property | Value |
|---|---|
| Trigger height | 40px (h-10) |
| Padding | 12px H |
| Border | 1px solid input |
| Radius | 6px (md) |
| Dropdown bg | popover |
| Item padding | 8px H, 6px V |
| Item hover | accent bg |

---

### 3.10 Avatar

| Property | Value |
|---|---|
| Sizes used | 32px (w-8), 56px (w-14), 64px (w-16) |
| Shape | circle (rounded-full) |
| Fallback bg | primary/10 |
| Fallback text | primary color |

---

### 3.11 Alert Dialog

| Property | Value |
|---|---|
| Width | auto (default Radix) |
| Radius | 8px |
| Title | 16px (text-base), font-semibold |
| Description | 14px (text-sm) |
| Actions gap | 8px |
| Destructive btn | bg-destructive text-white |

---

### 3.12 Advanced CTA Button

| Property | Value |
|---|---|
| Padding | 14px V, 28px H |
| Border | 2px solid currentColor |
| Font | 600 weight, uppercase, 0.05em spacing |
| Icon box | 24×24px, 1px border |
| Fill animation | height 0→100% from bottom, 350ms cubic-bezier(0.4,0,0.2,1) |
| Hover text | color changes (dark on green/white bg) |
| Icon rotation | 90deg on hover |

| Variant | Default Color | Fill Color | Hover Text |
|---|---|---|---|
| `default` (on dark) | `#FFF` | `#4DFC0E` | `#0D0D0D` |
| `dark` (on light) | `#0D0D0D` | `#0D0D0D` | `#FFF` |
| `light` (on dark) | `#FFF` | `#FFF` | `#0D0D0D` |

---

## 4. LAYOUT SYSTEM

### 4.1 Container

| Property | Value |
|---|---|
| Max width | 1400px (`2xl` breakpoint) |
| Padding | 32px (2rem) horizontal |
| Centering | margin: 0 auto |

**App content containers:**

| Context | Max Width | Padding |
|---|---|---|
| Settings/Dashboard | `max-w-5xl` (1024px) | px-6 (24px) |
| Landing sections | `max-w-7xl` (1280px) | px-4→px-6→px-8 |
| Dialog content | `max-w-2xl` (672px) | p-6 (24px) |

### 4.2 Grid

| Pattern | Columns | Gap |
|---|---|---|
| Form fields | 2 cols (`grid-cols-2`) | 12px (gap-3) |
| Card grid | 1→2→3 cols responsive | 16–24px |
| Dashboard KPIs | 2→4 cols | 16px |

### 4.3 Spacing Rules

| Context | Value |
|---|---|
| Page top padding | 32px (py-8) |
| Section header margin-bottom | 32px (mb-8) |
| Card internal padding | 24px (p-6) |
| Card header to content | 16px (mb-4) |
| Form field gaps | 12px (gap-3) |
| Label to input | 6px (space-y-1.5) |
| Button icon gap | 6px (mr-1.5) |
| Table cell padding | 12px vertical |
| Dialog section spacing | 20px (space-y-5) |

---

## 5. POSTER MODULE SYSTEM

Background section variants used in landing pages:

| Class | Background | Text |
|---|---|---|
| `poster-white` | `#FFFFFF` | `#0D0D0D` |
| `poster-black` | `#0D0D0D` | `#FAFAFA` |
| `poster-green` | `#4DFC0E` | `#000000` |
| `poster-grey` | `#F5F5F5` | `#0D0D0D` |
| `poster-charcoal` | `hsl(0 0% 13%)` = `#212121` | `#FFFFFF` |

---

## 6. JSON TOKENS

```json
{
  "colors": {
    "background": { "hsl": "0 0% 100%", "hex": "#FFFFFF" },
    "foreground": { "hsl": "0 0% 5%", "hex": "#0D0D0D" },
    "primary": { "hsl": "108 96% 52%", "hex": "#4DFC0E" },
    "primary-foreground": { "hsl": "0 0% 0%", "hex": "#000000" },
    "secondary": { "hsl": "0 0% 5%", "hex": "#0D0D0D" },
    "secondary-foreground": { "hsl": "0 0% 98%", "hex": "#FAFAFA" },
    "muted": { "hsl": "0 0% 96%", "hex": "#F5F5F5" },
    "muted-foreground": { "hsl": "0 0% 35%", "hex": "#595959" },
    "destructive": { "hsl": "0 84% 50%", "hex": "#EA3323" },
    "destructive-foreground": { "hsl": "0 0% 100%", "hex": "#FFFFFF" },
    "border": { "hsl": "0 0% 88%", "hex": "#E0E0E0" },
    "input": { "hsl": "0 0% 92%", "hex": "#EBEBEB" },
    "ring": { "hsl": "108 96% 52%", "hex": "#4DFC0E" },
    "card": { "hsl": "0 0% 100%", "hex": "#FFFFFF" },
    "popover": { "hsl": "0 0% 100%", "hex": "#FFFFFF" },
    "sidebar": {
      "background": { "hsl": "0 0% 5%", "hex": "#0D0D0D" },
      "foreground": { "hsl": "0 0% 98%", "hex": "#FAFAFA" },
      "primary": { "hsl": "108 96% 52%", "hex": "#4DFC0E" },
      "accent": { "hsl": "0 0% 15%", "hex": "#262626" },
      "border": { "hsl": "0 0% 20%", "hex": "#333333" }
    },
    "brand": {
      "oxi-green": "#4DFC0E",
      "oxi-green-dark": "#3DD00A",
      "oxi-charcoal": "#232322",
      "oxi-black": "#000000",
      "oxi-white": "#FFFFFF",
      "oxi-white-soft": "#F4F4F4"
    },
    "gray-scale": {
      "50": "#F4F4F4",
      "100": "#EDEDED",
      "200": "#D8D8D8",
      "300": "#B3B3B3",
      "400": "#858585",
      "500": "#6B6B6B",
      "600": "#4A4A4A",
      "700": "#232322",
      "800": "#1A1A1A",
      "900": "#0A0A0A"
    },
    "chart": {
      "1": { "hsl": "108 96% 52%" },
      "2": { "hsl": "0 0% 30%" },
      "3": { "hsl": "0 0% 50%" },
      "4": { "hsl": "108 60% 60%" },
      "5": { "hsl": "0 0% 70%" }
    }
  },
  "typography": {
    "fontFamily": {
      "display": ["Roobert", "Inter", "system-ui", "sans-serif"],
      "body": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      "mono": ["SFMono-Regular", "Menlo", "monospace"]
    },
    "scale": {
      "heading-xl": { "size": "36-72px", "weight": 600, "lineHeight": 0.92, "letterSpacing": "-0.03em" },
      "heading-lg": { "size": "30-48px", "weight": 600, "lineHeight": 0.95, "letterSpacing": "-0.025em" },
      "heading-md": { "size": "24-36px", "weight": 600, "lineHeight": 1.25, "letterSpacing": "-0.02em" },
      "heading-sm": { "size": "20-24px", "weight": 500, "lineHeight": 1.25 },
      "body-lg": { "size": "18-20px", "weight": 400, "lineHeight": 1.625 },
      "body-md": { "size": "16-18px", "weight": 400, "lineHeight": 1.625 },
      "text-sm": { "size": "14px" },
      "text-xs": { "size": "12px" },
      "overline": { "size": "12px", "weight": 600, "case": "uppercase", "letterSpacing": "0.12em" }
    }
  },
  "spacing": {
    "0": "0px", "0.5": "2px", "1": "4px", "1.5": "6px", "2": "8px",
    "2.5": "10px", "3": "12px", "4": "16px", "5": "20px", "6": "24px",
    "8": "32px", "10": "40px", "12": "48px", "16": "64px", "20": "80px", "24": "96px"
  },
  "radii": {
    "sm": "4px", "md": "6px", "lg": "8px", "xl": "12px",
    "2xl": "16px", "3xl": "24px", "4xl": "32px", "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "glow": "0 0 40px rgba(77, 252, 14, 0.5)",
    "glow-sm": "0 0 20px rgba(77, 252, 14, 0.4)",
    "glow-lg": "0 0 60px rgba(77, 252, 14, 0.6)"
  },
  "breakpoints": {
    "sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px", "2xl": "1400px"
  },
  "motion": {
    "easing": {
      "default": "cubic-bezier(0.16, 1, 0.3, 1)",
      "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      "smooth": "cubic-bezier(0.4, 0, 0.2, 1)"
    },
    "duration": {
      "fast": "150ms", "normal": "200ms", "medium": "300ms",
      "slow": "600ms", "slower": "800ms"
    }
  },
  "glass": {
    "blur": "20px",
    "background": "hsl(0 0% 100% / 0.85)",
    "backgroundStrong": "hsl(0 0% 100% / 0.92)",
    "border": "hsl(0 0% 88%)"
  },
  "container": {
    "maxWidth": "1400px",
    "padding": "32px"
  }
}
```

---

## 7. FIGMA REBUILD NOTES

1. **Create a Variables collection** with all color tokens above. Use HSL values.
2. **Font loading:** Import Roobert (from Adobe Fonts / Typekit ID `vqr7mdo`), Plus Jakarta Sans (Google Fonts), Inter (fallback).
3. **Component approach:** Build shadcn-style primitives → compose into app components.
4. **Glass effects:** Use Figma's Background Blur (20px) + Fill opacity (85%) + 1px border at `#E0E0E0`.
5. **Green glow hover:** Use Drop Shadow with `#4DFC0E` at 15-50% opacity, 40px spread.
6. **Pill Toggle:** Use Auto Layout with animated indicator (represent with variant swap in Figma).
7. **CTA Button:** Create 3 variants (default/dark/light) with interactive component for the fill-from-bottom hover.
8. **Dark sidebar:** Use sidebar tokens as a separate mode in variables.
9. **Poster sections:** Create 5 frame variants (white/black/green/grey/charcoal) as section templates.
10. **All border-radius is subtle** — most cards use 8-12px, pills use full rounding.
