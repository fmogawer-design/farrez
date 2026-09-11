---
name: Farrez Sovereign Procurement
colors:
  surface: '#0b1325'
  surface-dim: '#0b1325'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e1f'
  surface-container-low: '#131b2d'
  surface-container: '#171f32'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3448'
  on-surface: '#dbe2fb'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dbe2fb'
  inverse-on-surface: '#283043'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb2b7'
  on-tertiary: '#67001b'
  tertiary-container: '#ff516a'
  on-tertiary-container: '#5b0017'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#0b1325'
  on-background: '#dbe2fb'
  surface-variant: '#2d3448'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  metric-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  metric-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-sm: 1rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses high-precision, forward-looking enterprise procurement tailored to the GCC market, anchored in Kuwait. It balances institutional fiscal discipline with the agility of advanced financial technology. The interface departs from dense, legacy ERP layouts in favor of an atmospheric, luminous workspace prioritizing cognitive clarity, speed, and executive decision-making.

The visual style blends **Atmospheric Dark-Mode Tech** with **Luminous Glassmorphism**. Deep navy and obsidian surfaces establish an architectural canvas, elevated by subtle light refraction, high-contrast numeric hierarchy, and focused neon electric blue focal points. The tone is authoritative, highly focused, and modern. Interface density is managed through expansive negative space, high-readability typographic contrasts, and distinct structural glass surfaces rather than dense nested borders.

## Colors

The palette relies on a tonal obsidian-to-sapphire foundation, punctuated by electric blue luminescence and precise semantic risk markers.

### Palette Architecture
- **Base Canvas:** `#070B14` (Deepest Void Navy) serves as the primary unlit canvas. Global views, application sidebars, and parent viewports originate here.
- **Layer 01 Surface:** `#0D1527` (Anchored Surface) provides foundational grouping for expansive sections, standard dashboards, and tabular view containers.
- **Layer 02 Glass & Cards:** `#131E36` with alpha blending (`rgba(19, 30, 54, 0.7)`) paired with `backdrop-filter: blur(16px)` provides depth for elevated comparison matrices, line-item cards, and analytics modules.
- **Layer 03 Interactive Floating:** `#1A284A` for popovers, elevated menus, drag-and-drop quote slots, and hover states.

### Primary Accents & Illumination
- **Electric Primary:** `#3B82F6` delivers vibrant interaction cues, primary action states, and active comparison highlights.
- **Primary Glow / Interactive Hover:** `#60A5FA` provides specular highlights, hover outlines, and glowing indicator blurs (`rgba(96, 165, 250, 0.25)`).
- **Primary Pressed / Deep Accent:** `#2563EB` handles active button presses and locked states.

### Semantic Triage & Procurement Signals
- **Favorable / Lowest Quote / Preferred Vendor:** Emerald (`#10B981`) paired with dark emerald containers (`rgba(16, 185, 129, 0.12)`).
- **Flagged Discrepancy / Review Required:** Amber (`#F59E0B`) with muted amber warning tinting (`rgba(245, 158, 11, 0.12)`).
- **Hidden Fees / Non-Compliant / High Risk:** Crimson (`#F43F5E`) used decisively for unexpected delivery surcharges, contract deviations, and budget overruns.

### Boundaries & Typography
- **Subtle Glass Border:** `rgba(59, 130, 246, 0.16)` on active elements; `rgba(255, 255, 255, 0.08)` on passive cards.
- **High-Contrast Text:** `#F8FAFC` for headline and numerical emphasis; `#94A3B8` for secondary labels, metadata, and unit notations.

## Typography

The typographic hierarchy is engineered to differentiate between narrative analytical context and high-density financial metrics. 

- **Primary Display & Numerics (`Plus Jakarta Sans`):** Selected for its modern geometric architecture, precise tabular lining figures, and structural balance. It is leveraged for dashboard KPIs, line-item totals, comparison headers, and KWD financial amounts. Numeric weights skew heavy (`700` and `800`) to guarantee legibility against dark layered surfaces.
- **Analytical Body & System Controls (`Inter`):** Applied across bid specifications, contractual metadata, compliance tags, table rows, and form interfaces. It delivers neutral legibility at sub-14px sizes without visual fatigue.
- **Financial Formatting Rule:** The currency denomination `KWD` must always be rendered in `label-sm` or `label-md` medium weight, visually subservient to the high-contrast metric itself (e.g., `4,250.000` in `metric-xl` white followed by `KWD` in `label-sm` muted slate).

## Layout & Spacing

The layout model uses a fluid-responsive system across a standard 12-column grid structure, prioritizing horizontal side-by-side bid comparisons and multi-metric analytics.

### Breakpoints & Responsive Behavior
- **Desktop (1280px and above):** 12 columns, `gutter-lg` (2rem / 32px), `margin-lg` (3rem / 48px). Quotation tables display 3 to 4 vendor proposals concurrently side-by-side with locked line-item descriptors on the left anchor.
- **Tablet / Small Laptop (768px – 1279px):** 8 columns, `gutter` (1.5rem / 24px), `margin` (2rem / 32px). Vendor comparison cards reflow into a scrollable horizontal carousel with sticky row labels.
- **Mobile (320px – 767px):** 4 columns, `gutter-sm` (1rem / 16px), `margin-sm` (1rem / 16px). Bids collapse into stacked card arrays featuring rapid swipe navigation between vendor profiles and high-level delta summaries.

### Structural Flow
Avoid cramped, edge-to-edge tables. Information density is achieved through logical internal micro-spacing:
- Padding inside cards and glass vessels defaults to `space-lg` (1.5rem / 24px) for desktop and `space-md` (1rem / 16px) for mobile.
- Form inputs, interactive pills, and table row heights maintain a minimum target height of 44px to 52px to ensure ergonomic selection on both touch displays and desktop pointers.

## Elevation & Depth

Visual hierarchy is maintained through luminous glassmorphism, physical depth stacking, and selective electric blue glows, avoiding heavy black drop shadows.

### Surface Tiers
1. **Canvas (Ground 0):** Pure `#070B14`. Non-elevated, non-reactive backdrop.
2. **Structural Enclosures (Level 1):** Solid `#0D1527` with a razor-thin border of `rgba(255, 255, 255, 0.05)`. Used for major dashboard columns, static specification lists, and background grid tracks.
3. **Glass Cards & Panels (Level 2):** Semi-transparent `#131E36` at 75% opacity combined with `backdrop-filter: blur(20px)`. Outlined with a top-lit gradient border (`rgba(255, 255, 255, 0.12)` descending to `rgba(255, 255, 255, 0.02)`).
4. **Floating Modals, Drawers & Popovers (Level 3):** `#1A284A` at 90% opacity, back-blurred, elevated with a deep ambient shadow: `0 20px 40px -15px rgba(0, 0, 0, 0.7)`.
5. **Interactive & Best-Value Nodes (Level 4 - Luminescent):** Elevated vendor cards (such as "Recommended Quotation") receive an ambient glow: `0 0 24px -4px rgba(59, 130, 246, 0.22)` paired with an active stroke of `rgba(59, 130, 246, 0.45)`.

## Shapes

The shape vocabulary rejects sharp, boxed industrial geometry in favor of organic, generous contours that feel modern and human.

- **Standard Base Radii (0.5rem / 8px):** Reserved exclusively for small internal elements: tags, status badges, secondary icon containers, and nested pills.
- **Intermediate Control Radii (`rounded-lg`, 1rem / 16px):** Form fields, action buttons, search bars, and dropdown menus.
- **Card & Surface Radii (`rounded-xl`, 1.5rem / 24px):** Vendor bid sheets, comparison containers, analytics charts, and modal surfaces.
- **Pill Maximum Radii (`rounded-full`):** Segmented filter toggles, live auction countdown chips, and quick-filter category chips.

## Components

### Buttons
- **Primary Action:** Solid electric blue (`#3B82F6`) background, white text (`label-lg`), `rounded-lg` (16px). Subtle upper-edge highlight, soft ambient shadow (`0 8px 16px -4px rgba(59, 130, 246, 0.4)`). Hover shifts background to `#60A5FA` with an expanded glow.
- **Secondary / Glass Button:** Background `rgba(26, 40, 74, 0.6)`, 1px border `rgba(59, 130, 246, 0.25)`, text `#F8FAFC`. On hover, the border brightens to `rgba(96, 165, 250, 0.6)` with a faint background wash.
- **Destructive / Risk Button:** Background `rgba(244, 63, 94, 0.12)`, text `#F43F5E`, border `rgba(244, 63, 94, 0.3)`.

### Cards & Comparison Sheets
- Standard quotation cards are styled with Level 2 glass, generous padding (`space-lg`), and `rounded-xl` corners.
- **The "Best Value / Optimal Bid" Variant:** Uses a persistent edge highlight `rgba(59, 130, 246, 0.4)`, an anchored top badge ("Farrez Recommendation"), and an ambient electric aura.
- **Metric Grids inside Cards:** Financial values are rendered in `metric-md` or `metric-xl`, vertically stacked over micro-labels in uppercase `label-sm` (`#94A3B8`).

### Input Fields & Selectors
- Background: `rgba(13, 21, 39, 0.8)`.
- Border: 1.5px solid `rgba(255, 255, 255, 0.1)`. Border radius: 16px (`rounded-lg`).
- Focus state: Border transitions to `#3B82F6` accompanied by an ambient ring blur (`0 0 0 3px rgba(59, 130, 246, 0.2)`).
- Input labels rest above the input in `label-md` (`#94A3B8`). Placeholder text uses `#475569`.

### Chips & Semantic Badges
- **Structure:** Pill-shaped (`rounded-full`), height 28px, horizontal padding 12px.
- **Lowest Outlier / Under-Budget:** Background `rgba(16, 185, 129, 0.12)`, border `rgba(16, 185, 129, 0.25)`, text `#10B981` (`label-sm`).
- **Hidden Cost / Surcharge Warning:** Background `rgba(244, 63, 94, 0.12)`, border `rgba(244, 63, 94, 0.25)`, text `#F43F5E` (`label-sm`).
- **Pending Evaluation:** Background `rgba(245, 158, 11, 0.12)`, border `rgba(245, 158, 11, 0.25)`, text `#F59E0B` (`label-sm`).

### Checkboxes & Radio Controls
- Base: 20px squares/circles, `rounded-sm` or fully circular, filled with `#0D1527` and bordered by `rgba(255, 255, 255, 0.2)`.
- Checked State: Animated fill of `#3B82F6` with an inner white checkmark or dot, radiating a soft 6px electric blue shadow.

### Comparison Matrix & Tabular Data
- Headers: Sticky glass header (`#0D1527` with 90% opacity), text in `label-md` `#94A3B8`.
- Rows: No rigid opaque internal lines. Delimit with soft 1px separators (`rgba(255, 255, 255, 0.04)`).
- Hover State: Entire row highlights with `rgba(59, 130, 246, 0.05)` to maintain tracking across wide monitors.

### Specialized Procurement Components
- **KWD Currency Metric Lockup:** Numeric value rendered with `font-variant-numeric: tabular-nums`, with ISO code `KWD` set as an uneditable, styled trailing or leading tag.
- **Quotation Variance Delta:** A specialized micro-component that displays percentage difference against the median bid (e.g., `-12.4% vs Median`), colored in green or crimson depending on financial impact.