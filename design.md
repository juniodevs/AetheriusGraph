---
version: "alpha"
name: "Gothic"
description: "Estilo Gótico com arcos pontiagudos, entalhes intrincados e aura sombria misteriosa. Ideal para merchandising de bandas, logótipos provocadores e moda dark."
colors:
  primary: "#0B0B0B"
  secondary: "#8B0000"
  tertiary: "#5A5A5A"
  neutral: "#E8E0D0"
  surface: "#2D0A3E"
  accent: "#0D1B2A"
typography:
  h1:
    fontFamily: UnifrakturMaguntia
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: UnifrakturMaguntia
    fontSize: 1rem
    fontWeight: 400
spacing:
  sm: 2.0rem
  md: 4.0rem
  lg: 8.0rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    padding: 12px
---

## Overview

Estilo Gótico com arcos pontiagudos, entalhes intrincados e aura sombria misteriosa. Ideal para merchandising de bandas, logótipos provocadores e moda dark. O estilo Gótico (séc. XII-XVI) é marcado por arcos pontiagudos, vitrais e entalhes intrincados das catedrais medievais. Revivido em subculturas modernas, varia do grandioso ao misterioso.

- Density: 5/10 — Balanced
- Variance: 4/10 — Moderate
- Motion: 4/10 — Subtle

- **Style:** Dark, Pointed Arches, Intricate, Mysterious
- **Keywords:** Gothic, dark, pointed arches, intricate carvings, mysterious, dramatic, grandeur, scary, medieval, cathedral, gargoyle
- **Era:** 12th-16th Century Gothic to Modern Gothic Revival
- **Light/Dark:** ✗ Not Recommended / ✓ Full

## Colors

- **Obsidian Black** (#0B0B0B) — Dark surface, primary background
- **Blood Red** (#8B0000) — Error states, destructive actions
- **Stone Grey** (#5A5A5A) — Secondary text, borders, muted elements
- **Bone White** (#E8E0D0) — Light surface, card backgrounds
- **Deep Purple** (#2D0A3E) — Accent color, emphasis elements
- **Midnight Blue** (#0D1B2A) — Deep contrast surface
- **Tarnished Gold** (#8B7355) — Premium accent, decorative highlights
- **Moss Green** (#4A5A3A) — Success states, positive indicators

## Typography

- **Display / Hero:** UnifrakturMaguntia — Weight 700, tight tracking, used for headline impact
- **Accent:** Cinzel — Used for decorative or emphasis text
- **Body:** UnifrakturMaguntia — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** UnifrakturMaguntia — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem

## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).

## Elevation & Depth

Pointed arch shapes via clip-path, intricate SVG tracery patterns, cathedral window-inspired section frames, dark gradient backgrounds with fog effect, gargoyle/ornament SVG decorations, eerie glow effects on hover, slow dramatic transitions (600ms)

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.

## Shapes

Base corner radius: 8px. See rounded tokens in front matter for the full scale.

## Components

- **Primary Button:** Subtly rounded (0.5rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Subtly rounded (0.5rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.

## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure white (#FFFFFF) backgrounds — use off-white or dark surfaces
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Dark mysterious color palette
- Do Pointed arch shapes
- Do Intricate SVG tracery patterns
- Do Cathedral window-inspired frames
- Do Gothic/blackletter typography
- Do Eerie glow effects
- Do Dark fog gradient backgrounds
- Do Responsive with maintained mystery

## Use Case

Merchandising de bandas, Logótipos provocadores, Branding vintage dark, Moda gótica

