---
name: Mission Critical Command
colors:
  surface: '#f2fbff'
  surface-dim: '#d1dce1'
  surface-bright: '#f2fbff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eaf5fb'
  surface-container: '#e4f0f5'
  surface-container-high: '#dfeaf0'
  surface-container-highest: '#d9e4ea'
  on-surface: '#131d21'
  on-surface-variant: '#424938'
  inverse-surface: '#273236'
  inverse-on-surface: '#e7f2f8'
  outline: '#737a67'
  outline-variant: '#c2c9b3'
  surface-tint: '#3f6900'
  primary: '#3f6900'
  on-primary: '#ffffff'
  primary-container: '#88c241'
  on-primary-container: '#2d4c00'
  inverse-primary: '#9cd854'
  secondary: '#49626d'
  on-secondary: '#ffffff'
  secondary-container: '#c9e4f1'
  on-secondary-container: '#4d6671'
  tertiary: '#006973'
  on-tertiary: '#ffffff'
  tertiary-container: '#2dc3d4'
  on-tertiary-container: '#004c54'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b7f56d'
  primary-fixed-dim: '#9cd854'
  on-primary-fixed: '#102000'
  on-primary-fixed-variant: '#2f4f00'
  secondary-fixed: '#cce7f3'
  secondary-fixed-dim: '#b0cbd7'
  on-secondary-fixed: '#031f28'
  on-secondary-fixed-variant: '#314a55'
  tertiary-fixed: '#92f1ff'
  tertiary-fixed-dim: '#4dd8ea'
  on-tertiary-fixed: '#001f23'
  on-tertiary-fixed-variant: '#004f57'
  background: '#f2fbff'
  on-background: '#131d21'
  surface-variant: '#d9e4ea'
typography:
  h1:
    fontFamily: Nunito
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Nunito
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Nunito
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Nunito
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Nunito
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Nunito
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.06em
  button:
    fontFamily: Nunito
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin-page: 24px
---

## Brand & Style
The brand personality is authoritative, vigilant, and precise. As an Emergency Operations Centre (EOC) platform, the interface must evoke a sense of absolute reliability and immediate clarity. The design style follows a **Corporate Modern** aesthetic with a "Command Center" edge—prioritizing functional density over decorative whitespace. 

The visual language balances the organic friendliness of the brand green with a rigid, structured layout that signals institutional stability. Every element is designed to reduce cognitive load during high-pressure scenarios, ensuring that critical data points are processed at a glance.

## Colors
The color strategy employs a high-contrast logic to differentiate between navigation, content, and action. 

- **Navigation & Structure:** The Dark Teal (`#233c46`) anchors the interface, providing a deep, stable environment for primary navigation.
- **Action & Primary Brand:** The Brand Green (`#88c241`) is reserved for primary actions and brand presence, ensuring high visibility against both dark and light surfaces.
- **Surface Contrast:** White content cards are placed against a Slate Gray (`#acb0b1`) background to create a distinct physical separation of modules.
- **Status Communication:** Status colors are saturated and distinct to prevent ambiguity in emergency alerts. Success, Warning, and Danger colors follow standard conventions but are tuned for high accessibility.

## Typography
This design system utilizes **Nunito** across all levels to maintain a cohesive voice. To counteract the font's natural roundness and ensure it feels "mission-critical," we utilize tight letter spacing on headings and strict weight usage.

- **Headings:** Use weight `700` in Darkest Teal (`#273238`) for maximum hierarchy.
- **Body Text:** Use weight `400` in Slate Gray (`#6f7a7f`) for readability.
- **Micro-copy & Metadata:** Use weight `700` and uppercase styling for labels and table headers to create a "technical" dashboard feel.
- **Data Points:** In EOC contexts, use weight `600` for numerical data to ensure prominence.

## Layout & Spacing
The layout follows a **Fluid Grid** philosophy optimized for data-dense enterprise dashboards. 

- **Grid:** A 12-column grid system with a 20px gutter ensures horizontal alignment across varied widget sizes.
- **Rhythm:** An 8px spacing scale (with a 4px half-step for micro-adjustments) governs all margins and padding. 
- **Density:** Components are designed with a "Compact" default state. Padding within cards should remain at `16px` (md) to maximize the information displayed on a single screen without sacrificing legibility.
- **Sidebar:** The navigation occupies a fixed 240px width to provide a consistent anchor, while the content area scales to fill the viewport.

## Elevation & Depth
In this design system, depth is conveyed through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows. This maintains a "clean" and "built" feel suitable for professional software.

- **Level 0 (Background):** The Page Background (`#acb0b1`) sits at the lowest level.
- **Level 1 (Cards/Surface):** White surfaces (`#ffffff`) sit on the background with a 1px border (`#d1d5d6`) to define edges.
- **Level 2 (Dropdowns/Modals):** These elements use a subtle, crisp ambient shadow (0px 4px 12px rgba(35, 60, 70, 0.1)) and a 1px solid border to signify they are floating above the work surface.
- **Focus States:** High-contrast focus rings use the primary Brand Green to guide the user's attention.

## Shapes
The shape language is **Soft (Level 1)**, utilizing a `0.25rem` (4px) base radius for standard components like buttons, input fields, and small cards. 

- **Standard Elements:** 4px radius. This keeps the interface feeling "sharp" and professional while removing the harshness of 0px corners.
- **Large Containers:** Dashboard widgets and main content panels use a slightly larger `0.5rem` (8px) radius to distinguish structural sections from interactive components.
- **Interactive Indicators:** Elements like status pills or toggle tracks may use a fully rounded "pill" shape to contrast against the otherwise rectilinear grid.

## Components
Consistent component styling ensures the EOC interface is intuitive under stress.

- **Buttons:** 
  - *Primary:* Solid Brand Green (`#88c241`) with white text. No gradients.
  - *Secondary:* Dark Teal (`#233c46`) outline with Dark Teal text.
  - *Destructive:* Solid Danger Red (`#f83f37`).
- **Status Chips:** High-contrast backgrounds (using status colors at 15% opacity) with bold, dark text of the same hue. This ensures status is recognizable via both color and text.
- **Input Fields:** White backgrounds with 1px Slate Gray borders. On focus, the border transitions to Brand Green with a 2px stroke. Labels are always positioned above the field in `label-caps` style.
- **Data Tables:** High-density rows with 1px horizontal dividers. Zebra striping is not used; instead, hover states use a light gray highlight to help eye-tracking.
- **Cards:** White surfaces with a standardized 24px header area. Headers should use the Darkest Teal (`#273238`) for titles.
- **Additional Components:** The system includes *Incident Badges*, *Real-time Alert Toasts*, and *Map Overlay Controls* which follow the same contrast and shape logic.