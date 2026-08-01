---
name: The Chart Rail
colors:
  surface: '#f9faf6'
  surface-dim: '#d9dad7'
  surface-bright: '#f9faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f0'
  surface-container: '#edeeea'
  surface-container-high: '#e7e9e5'
  surface-container-highest: '#e2e3df'
  on-surface: '#1a1c1a'
  on-surface-variant: '#45474b'
  inverse-surface: '#2e312f'
  inverse-on-surface: '#f0f1ed'
  outline: '#76777b'
  outline-variant: '#c6c6cb'
  surface-tint: '#5c5e64'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#191c21'
  on-primary-container: '#81848a'
  inverse-primary: '#c4c6cd'
  secondary: '#076b5a'
  on-secondary: '#ffffff'
  secondary-container: '#a0f2dc'
  on-secondary-container: '#157160'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001452'
  on-tertiary-container: '#7080c5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e2e9'
  primary-fixed-dim: '#c4c6cd'
  on-primary-fixed: '#191c21'
  on-primary-fixed-variant: '#44474d'
  secondary-fixed: '#a0f2dc'
  secondary-fixed-dim: '#84d6c1'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#005143'
  tertiary-fixed: '#dde1ff'
  tertiary-fixed-dim: '#b7c4ff'
  on-tertiary-fixed: '#001452'
  on-tertiary-fixed-variant: '#314283'
  background: '#f9faf6'
  on-background: '#1a1c1a'
  surface-variant: '#e2e3df'
typography:
  display-lg:
    fontFamily: Instrument Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Instrument Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.5'
  body-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: IBM Plex Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.08em
  label-stamp:
    fontFamily: IBM Plex Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin: 24px
  row-height-compact: 32px
  row-height-std: 48px
---

## Brand & Style
The design system is a clinical, high-utility interface inspired by analog medical records, physical charts, and institutional precision. It prioritizes information density and legibility over modern "softness," evoking the reliability of a physical hospital ledger.

The aesthetic follows a **Modern-Industrial/Clinical** approach:
- **Analog Texture:** A palette of "paper-greys" and "charcoal inks" replaces standard digital white/black.
- **Precision Engineering:** Hairline borders and monospaced labels suggest a tool designed for accuracy.
- **Physical Metaphors:** UI elements utilize die-cut folder tabs, "ink stamps," and tactile layout divisions rather than digital depth.
- **Flat Geometry:** Absolutely no shadows or gradients are permitted; hierarchy is established through line weight, tonal shifting, and sharp structural containers.

## Colors
The palette is rooted in a clinical "Paper Grey" (#F2F3EF) background to reduce eye strain during long shifts. 

- **The Ink Layer:** Charcoal (#14171C) serves as the primary "ink," providing maximum contrast for medical data.
- **Ward Signifiers:** Use Teal, Indigo, and Rust/Amber specifically for ward classification and departmental wayfinding.
- **Status Indicators:** Alerts use high-chroma text on desaturated, tinted backgrounds to ensure noticeability without breaking the analog aesthetic.
- **Borders:** Hairline borders are the primary method of separation. Use #DBDED6 for standard grids and #C4C8BE for structural emphasis.

## Typography
The typographic hierarchy distinguishes between *Administrative/System* info and *Patient/Clinical* data.

- **Headlines (Instrument Sans):** Used for patient names, ward headers, and primary navigation titles.
- **Body (Work Sans):** Used for medical notes, descriptions, and lists. Its neutral, grounded nature ensures high readability.
- **Labels (IBM Plex Mono):** Used for technical metadata, timestamps, and "Stamp" badges. Always uppercase with expanded tracking to mimic typewriter or industrial labeling.
- **Scale:** Large display sizes must be reduced by 15-20% on mobile devices to maintain the "compact form" feel.

## Layout & Spacing
This design system utilizes a **Fixed Grid** model reminiscent of a physical medical chart.

- **Grid:** A 12-column grid for desktop with 16px gutters. For data-heavy views, columns may be subdivided into 4px increments.
- **The Nav Rail:** The primary navigation resides in a left-aligned vertical rail. Active items use a "die-cut folder tab" effect, where the active state visually joins the background of the main content area.
- **Dividers:** Section breaks are marked by a hairline border. For clinical sections (e.g., Vitals), include a small ECG "heartbeat" sparkline icon centered or left-aligned on the divider line.
- **Mobile:** Transition to a single-column layout with 16px margins. The Nav Rail collapses into a bottom "tab" bar or a simplified top-right menu.

## Elevation & Depth
Depth is created through **Tonal Stacking** rather than shadows.

- **Level 0 (Base):** #F2F3EF (The paper).
- **Level 1 (Cards/Containers):** #FFFFFF (The sheet). These are always flat with a 1px #DBDED6 border.
- **Active State:** Elements may appear "pressed" by switching from a white background to a faint grey (#F2F3EF) or by increasing the border weight to 1.5px.
- **Z-Index:** To show hierarchy, stack elements with 1px offsets or use contrasting border colors. No shadows are permitted under any circumstances.

## Shapes
Shapes are functional and rigid.

- **Corner Radius:** All primary containers, buttons, and inputs use a consistent 4px (Soft) radius to maintain a professional but slightly clinical feel.
- **The Stamp Badge:** A signature element used for status or tagging. It features a 1.5px border, a light tinted background, and a -2 degree rotation to simulate a hand-stamped mark.
- **Folder Tabs:** Navigation elements use a 4px radius only on the top-right and bottom-right corners (for horizontal tabs) or top-right/top-left (for vertical tabs).

## Components
- **Primary Buttons:** Solid Charcoal (#14171C) or Ward Teal (#0F6E5D). Text is centered, uppercase Mono, followed by a right arrow (→). Corners are 4px.
- **Stamp Badges:** Used for "ADMITTED," "DISCHARGED," or "URGENT." Monospaced text, 1.5px border, -2deg rotation.
- **Input Fields:** #FFFFFF background with a 1px #DBDED6 border. On focus, the border thickens to 1.5px and changes to #14171C. Labels always use `label-mono` style positioned above the field.
- **Lists:** Data rows are 48px high with a #DBDED6 bottom border. Hover state uses #F2F3EF.
- **Cards:** White background, 1px hairline border, no shadow. Headers within cards are separated by a hairline divider with the ECG sparkline motif.
- **Checkboxes/Radios:** Square (checkbox) or Diamond (radio), 1.5px stroke, no roundedness. Fill with #14171C when selected.