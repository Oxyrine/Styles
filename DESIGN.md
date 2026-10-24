---
name: Earshot
description: A record-store listening station for a split-second song game.
colors:
  bg: "#f5f3ed"
  panel: "#eae8e0"
  line: "#d2d1c7"
  text: "#20221f"
  muted: "#62645d"
  accent: "#f5b7c5"
  accent-ink: "#20221f"
  good: "#24603f"
  bad: "#a42e39"
  mix: "#20221f"
typography:
  display:
    fontFamily: "Space, Arial, sans-serif"
    fontSize: "clamp(55px, 6.7vw, 96px)"
    fontWeight: 700
    lineHeight: 0.99
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Space, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Space, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Space, Arial, sans-serif"
    fontSize: "14px"
rounded:
  square: "0"
  circle: "50%"
spacing:
  tight: "8px"
  control: "16px"
  group: "24px"
  section: "36px"
  wide: "48px"
components:
  button-primary:
    backgroundColor: "{colors.text}"
    textColor: "{colors.bg}"
    rounded: "{rounded.square}"
    padding: "14px 22px"
  button-ghost:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    padding: "12px 18px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.square}"
    padding: "15px 16px"
  track:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    padding: "20px 18px"
  play:
    backgroundColor: "{colors.text}"
    textColor: "{colors.accent}"
    rounded: "{rounded.circle}"
    width: "104px"
    height: "104px"
---

# Design System: Earshot

## Overview

**Creative North Star: "The Record-Store Listening Station"**

Earshot feels like browsing records, choosing a rotation, and testing a familiar sound. Warm paper, label pink, dark ink, and self-hosted Space Grotesk carry the identity. Flat surfaces and clear controls keep the listening task immediate.

This document records the durable visual system extracted from the implementation. The current home page's split hero, featured Mixer vinyl, track catalogue, and artist entry are a surface strategy; future screens may rearrange those elements while retaining the visual language.

**Key Characteristics:**

- Flat pink and ink with warm paper surfaces.
- Square controls paired with circular audio objects.
- Compact labels and generous, direct headings.
- Visible feedback for focus, playback, loading, and scoring.

## Colors

### Primary

- **Label Pink** (`accent`): feature areas, the player, current round, and score surface.
- **Label Ink** (`accent-ink`): readable foreground on pink.

### Neutral

- **Warm Paper** (`bg`): page and field background; reversed text on ink controls.
- **Sleeve Paper** (`panel`): track rows, secondary actions, round rows, and reveals.
- **Paper Edge** (`line`): input borders and artwork fallback.
- **Record Ink** (`text`, with `mix` as an existing alias): main text and primary controls.
- **Sleeve Note** (`muted`): supporting text and unopened ladder steps.

Success and error use `good` and `bad` alongside written feedback. Their meanings must remain understandable without color. One-off hover, vinyl groove, progress-track, and error-surface colors remain local implementation details.

## Typography

The CSS family `Space` loads Space Grotesk WOFF2 files at weights 400, 500, and 700 from `fonts/`; Arial and sans-serif are fallbacks. Use this single family throughout.

Display type is heavy and tightly spaced, with short line lengths. Body copy stays regular and readable. Labels use sentence case; scores and duration steps use tabular numerals. The frontmatter records desktop roles, while the stylesheet owns responsive overrides: the display becomes `clamp(48px, 12vw, 76px)` on narrow screens. Lead copy is 17px with a 1.6 line height on desktop and 16px on mobile.

## Layout

Shared header, main, and footer containers cap at 1440px. Horizontal insets step from 56px to 28px at 1000px and 18px at 650px. Game and results views cap at 860px. The home page uses a two-column feature and catalogue, then collapses to one column at 650px; the Mixer becomes a compact horizontal composition there. The artist area stacks at the same breakpoint. These compositions describe the implemented home surface rather than a required template for every screen.

Use compact gaps within controls and larger spacing between sections. Preserve field flexibility with `min-width: 0`; allow long revealed titles to wrap. Mobile round rows omit the genre word while retaining difficulty and results.

## Elevation & Depth

Surfaces have no shadows. Tonal contrast, spacing, and clear bounds establish hierarchy. The record uses concentric SVG circles; these are artwork geometry rather than surface elevation. Hover feedback uses a subtle surface change or a small directional movement.

## Shapes

Buttons, fields, track rows, and panels have square corners. Circles identify sound objects: vinyl, play control, loading spinner, and playback pulse. Fields have a thin border; most panels rely on a filled surface. Do not add borders or radii merely to make every region look like a card.

## Components

### Actions and navigation

Primary actions use ink with warm-paper text and a minimum height of 48px. Secondary actions use sleeve paper and a minimum height of 44px. Disabled actions are 45% opaque. Pointer hover darkens primary actions; active buttons scale to 98%. Navigation uses simple text links and a Tracks return action during play. The skip link appears on keyboard focus.

### Fields

Inputs use warm paper, a paper-edge border, square corners, and a minimum height of 54px. Focus uses an ink outline. Song suggestions use an ink listbox directly below the guess field, with pink active rows and separate title and artist lines. The input retains focus; arrow keys navigate, Enter selects, and Escape dismisses. Pointer selection fills the field without submitting. Keep explicit labels visible.

The suggestion panel enters over 180ms with a small upward offset; its six rows stagger by 20ms, capped at 100ms. Keyboard navigation and reduced-motion preferences suppress those animations. Suggestions search the bundled catalogue first and supplement it with live iTunes results; failed live requests retain local matches and manual guessing.

### Track rows and Mixer

Each catalogue row is one button containing a title, difficulty, supporting text, and arrow. The last row spans the desktop grid. The Mixer uses an ink surface, pink action strip, and SVG vinyl. Its record rotates on fine-pointer hover. This signature belongs to the current featured Mixer, rather than becoming a mandatory icon for every action.

### Player, rounds, and reveal

The pink player centers a circular ink play button and a thin progress bar. Seven duration cells show the current attempt in ink; past misses are struck through. The current round row is pink with ink text. Reveals show actual album artwork, title, artist, preview controls, and the Apple Music link. Success and error text accompany the result colors. On load failure, the spinner stops and Retry remains available while guessing controls stay disabled.

### Focus and motion

Interactive elements use a 3px ink focus outline with a 5px offset; fields use their own 2px outline. Mixer focus uses a pink inset outline. The programmatically focused main region suppresses its own visible outline. Standard button transitions run for 160ms; the record hover runs for 650ms. Reduced motion removes animations and transitions and disables smooth scrolling.

## Do's and Don'ts

### Do:

- Do use the existing color roles and self-hosted Space Grotesk.
- Do pair state colors with words or an explicit visual state.
- Do preserve keyboard focus and reduced-motion behavior.
- Do keep actual music metadata and gameplay feedback readable at mobile widths.

### Don'ts:

- Don't replace flat surfaces with decorative shadows or gradients.
- Don't turn every control into a rounded pill.
- Don't promote the current hero composition into a rule for every screen.
- Don't describe implementation tradeoffs as user-pinned constraints.
