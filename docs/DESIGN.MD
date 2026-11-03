# Design System
## Fixora - High-Fidelity Design System & UI Specification

- **Design direction:** Premium, trustworthy, contemporary home-services marketplace
- **Primary use:** High-fidelity client demo
- **Scope:** Frontend only; no backend assumptions
- **Source of truth:** This document plus the supplied product brief (`product.md`)
- **Visual inspiration:** Market patterns observed in Urban Company and NoBroker, translated into an original Fixora identity—not copied screens or brand assets.

---

## 1. Design Intent

Fixora should feel dependable, calm, clear, and service-oriented. The design should balance the warmth of a consumer marketplace with the precision of a well-run service operation.

### Design Principles
1. **Trust is a UI feature:** Pricing, scope, booking status, technician details, and support must be visible when they matter.
2. **One dominant action:** Every page has a clearly prioritized next step.
3. **Layered information:** Show the essentials first; use detail sections, drawers, and progressive disclosure for secondary information.
4. **Repeatable patterns:** Shared components should behave and look the same across portals.
5. **Useful whitespace:** Whitespace separates concepts and improves scanning; it is not filler.
6. **Mobile first, not mobile only:** Customer pages are optimized for narrow screens; admin pages use desktop density responsibly.
7. **Authentic product language:** Avoid inflated promises, placeholder copy, and unsupported claims.
8. **Accessible by default:** Color, typography, focus, semantics, and touch targets are part of the design—not final polish.

---

## 2. Brand Expression

### Personality
- Capable
- Clear
- Reassuring
- Modern
- Human
- Operationally organized

### Visual Direction
- White and cool off-white surfaces.
- Deep blue as the primary brand and action color.
- Orange as a restrained accent for highlights, promotion, and selected emphasis.
- Dark ink for strong readable text.
- Soft neutral borders rather than heavy outlines.
- Medium rounded corners; avoid overly pill-shaped cards everywhere.
- Consistent line iconography.
- Service illustrations should be clean, editorial, and category-specific.

*Do not copy Urban Company's or NoBroker's exact layout, copy, color use, illustrations, photography, or trademarks. Learn from high-level interaction patterns such as service category discovery, visible starting prices, trust explanations, and clear booking actions.*

---

## 3. Design Tokens

### 3.1 Color Tokens

| Token | Value | Use |
|---|---|---|
| `brand-950` | `#102862` | Deep brand surface / high-emphasis |
| `brand-900` | `#143779` | Deep blue |
| `brand-800` | `#1746A2` | Primary brand |
| `brand-700` | `#2459BC` | Hover / strong emphasis |
| `brand-600` | `#326FD4` | Links / interactive blue |
| `brand-500` | `#4B86E8` | Selected accents/charts |
| `brand-100` | `#EAF1FF` | Soft blue surface |
| `brand-50` | `#F5F8FF` | Subtle blue surface |
| `accent-700` | `#C95B12` | Accessible orange text/action |
| `accent-600` | `#E66D1E` | Orange accent |
| `accent-500` | `#FF8A34` | Brand highlight |
| `accent-100` | `#FFF0E5` | Soft orange surface |
| `accent-50` | `#FFF8F2` | Very subtle orange surface |
| `ink-950` | `#172033` | Main text |
| `ink-700` | `#39445A` | Secondary text |
| `ink-500` | `#667085` | Muted text |
| `line-strong` | `#D0D5DD` | Strong border |
| `line` | `#E4E7EC` | Default border/divider |
| `surface` | `#FFFFFF` | Cards and panels |
| `canvas` | `#F5F7FB` | App background |
| `success` | `#16834A` | Success state |
| `success-bg` | `#EAF7EF` | Success surface |
| `warning` | `#A85B00` | Warning state |
| `warning-bg` | `#FFF5E5` | Warning surface |
| `danger` | `#C43232` | Destructive/error state |
| `danger-bg` | `#FDECEC` | Error surface |
| `info` | `#1769AA` | Informational state |
| `info-bg` | `#EAF4FC` | Informational surface |

#### Rules
- Use brand blue for primary actions and navigation selection.
- Use orange as an accent, not as a second competing primary color.
- Use semantic colors only for their corresponding states.
- Status badges must include text and maintain readable contrast.
- Avoid using `ink-500` for small text on colored surfaces unless contrast is verified.

---

### 3.2 Typography

Use Inter or Geist Sans consistently; do not load multiple competing families.

| Role | Desktop | Mobile | Weight | Line Height |
|---|---|---|---|---|
| Display/hero | 48–56px | 36–42px | 650–750 | 1.05–1.15 |
| Page title | 32px | 26–28px | 650–700 | 1.2 |
| Section title | 24px | 20–22px | 600–650 | 1.25 |
| Card title | 18px | 16–18px | 600 | 1.35 |
| Body large | 18px | 17px | 400 | 1.55 |
| Body | 16px | 15–16px | 400 | 1.5 |
| Label | 14px | 14px | 550–600 | 1.4 |
| Caption/metadata | 13px | 12–13px | 400–500 | 1.4 |
| Button | 15–16px | 15–16px | 600 | 1.2 |

---

### 3.3 Spacing Scale

Use a 4px base scale:
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-5`: 20px
- `space-6`: 24px
- `space-8`: 32px
- `space-10`: 40px
- `space-12`: 48px
- `space-16`: 64px
- `space-20`: 80px

#### Guidelines
- Mobile horizontal page padding: 16–20px.
- Tablet page padding: 24–32px.
- Desktop page padding: 32–48px depending on content.
- Standard card padding: 20–24px desktop; 16–20px mobile.
- Form label-to-control gap: 6–8px.
- Form field-to-field gap: 16–20px.
- Section-to-section gap: 28–40px.

---

### 3.4 Radius, Border, and Elevation

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 8px | Compact controls / badges |
| `radius-md` | 12px | Inputs and buttons |
| `radius-lg` | 16px | Standard cards |
| `radius-xl` | 20px | Hero panels/featured cards |
| `radius-full` | 999px | Pills and avatars only |
| `border-default` | 1px solid line | Inputs, card separators |
| `shadow-sm` | Subtle low elevation | Floating menus / popovers |
| `shadow-md` | Restrained elevation | Dialogs and elevated sheets |

---

### 3.5 Layout and Breakpoints

- **Small mobile:** 320–359px
- **Mobile:** 360–479px
- **Large mobile / small tablet:** 480–767px
- **Tablet:** 768–1023px
- **Desktop:** 1024–1279px
- **Wide desktop:** 1280px+

---

## 4. Iconography and Illustrations

### Icon Library
Use **Lucide React** (`lucide-react`) as the default interface icon set.

#### Recommended Icons:
- **Home:** `house`
- **Services:** `grid-2x2` or `layout-grid`
- **Search:** `search`
- **Booking/calendar:** `calendar-days`
- **Profile:** `user-round`
- **Notifications:** `bell`
- **Plumbing:** `droplet`
- **Electrical:** `zap`
- **AC:** `fan` or `wind`
- **Appliance:** `refrigerator`
- **Phone/device:** `smartphone`
- **Repair/tools:** `wrench`
- **Location:** `map-pin`
- **Price:** `indian-rupee`
- **Trust/verification:** `shield-check`
- **Help:** `circle-help`
- **Disputes:** `message-square-warning`
- **Assigned technician:** `user-check`
- **Status/history:** `history`
- **Close/back/forward:** `x`, `arrow-left`, `chevron-right`

---

## 5. Component Specifications

### 5.1 Buttons
- **Primary:** Brand blue background, white text. 48px minimum height (52–56px mobile CTA). 12px radius. Strong focus ring.
- **Secondary:** White or neutral surface, ink text, 1px border.
- **Tertiary:** Text-only or icon-plus-text action.
- **Destructive:** Semantic danger treatment with confirmation.

### 5.2 Inputs and Forms
- Label is always visible.
- Input height target: 48–52px.
- Helper text sits below the field.
- Error messages include concise corrections.

### 5.3 Cards
- Standard card: white surface, 1px line border, 16px radius.
- Card hierarchy: `title` → `key value/status` → `supporting details` → `action`.

### 5.4 Status Badges
- Compact, readable label with text.
- Semantic color mapping: success, warning, danger, info, neutral. Never rely on color alone.

---

## 6. Interaction & Accessibility Requirements

- Target **WCAG 2.2 AA**.
- Minimum touch target of 24px by WCAG (practical design target around 44px for primary mobile interactions).
- Motion transitions between 150–220ms; respect `prefers-reduced-motion`.