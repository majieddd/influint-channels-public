---
version: alpha
name: Influint Study
description: Editorial telemetry on deep ink. Black ground, teal signal, Poppins, raised panel surfaces for evidence-dense analysis pages.
colors:
  primary: "#000000"
  secondary: "#8DD8D3"
  tertiary: "#5AD8A6"
  neutral: "#FFFFFF"
  panel: "#081C1C"
  panel-raised: "#0D2B2B"
  muted: "#8A9A9A"
  line: "rgba(141, 216, 211, 0.16)"
  positive: "#6FD39B"
  negative: "#FF6B6B"
  warning: "#F6C344"
typography:
  h1:
    fontFamily: Poppins
    fontSize: 60px
    fontWeight: 600
    lineHeight: "1"
    letterSpacing: "-0.01em"
  h2:
    fontFamily: Poppins
    fontSize: 34px
    fontWeight: 600
    lineHeight: "1.08"
    letterSpacing: "0.05em"
  h3:
    fontFamily: Poppins
    fontSize: 22px
    fontWeight: 600
    lineHeight: "1.15"
  body-md:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: 400
    lineHeight: "1.6"
  lede:
    fontFamily: Poppins
    fontSize: 19px
    fontWeight: 400
    lineHeight: "1.5"
  label-caps:
    fontFamily: Poppins
    fontSize: 11px
    fontWeight: 600
    letterSpacing: "0.1em"
rounded:
  sm: 4px
  md: 8px
  lg: 12px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  section-label:
    textColor: "{colors.secondary}"
  data-table:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.md}"
  switch-panel:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.md}"
    padding: 18px
  figure:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.muted}"
    rounded: "{rounded.lg}"
    padding: 12px
  callout:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.md}"
    padding: 16px
  divider:
    backgroundColor: "{colors.line}"
  status-good:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.positive}"
  status-bad:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.negative}"
  status-warn:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.warning}"
---

## Overview

Editorial telemetry on deep ink. The page reads like an instrument panel for
evidence: a black ground that disappears, teal signal reserved for structure
and headings, and raised panels that lift tables, figures and proposals one
step off the floor. Density is a feature here. This is a working analysis
document, not a marketing page, so hierarchy comes from type, spacing rhythm
and 1px hairlines rather than shadows or gradients.

## Colors

- **Primary (#000000):** Page ground. Pure black so panel surfaces and the
  teal signal separate cleanly.
- **Secondary (#8DD8D3):** The signal. Section headings, focus rings, the
  accent edge on switch panels. The only color allowed to shout.
- **Tertiary (#5AD8A6):** Positive states and live indicators, borrowed from
  the site's hot token.
- **Neutral (#FFFFFF):** Body text on black or panel grounds.
- **Panel (#081C1C) and Panel raised (#0D2B2B):** Two-step surface ladder.
  Tables sit on panel, figures and proposals on panel-raised, so evidence
  blocks read as objects placed on the floor.
- **Muted (#8A9A9A):** Captions, metadata, axis labels. Never body copy.
- **Line (rgba(141, 216, 211, 0.16)):** Every divider is a teal-tinted
  hairline, which keeps structure inside the palette even at 1px.
- **Positive (#6FD39B), Negative (#FF6B6B), Warning (#F6C344):** Callout
  edges and status meaning only. Never decoration.

## Typography

Poppins across the system. Hierarchy is carried by size and case, not by
family mixing: an uppercase display H1 (applied as clamp(34px, 6vw, 60px)
against the 60px token), sentence-scale H2 sections (applied as
clamp(24px, 3.4vw, 34px) against the 34px token), uppercase micro-labels at 11px with 0.1em tracking for eyebrows, table
headers and chips. Body sets at 16px with 1.6 line height and a 70ch measure;
the lede steps up to 19px. Letter spacing on H2 tightens to 0.05em because
uppercase at display size plus wide tracking reads as shouting. Numerals in
data columns use tabular figures and align right.

## Layout & Spacing

Single column, 1120px study container inside a 1240px wrap with 28px gutters.
Spacing runs on an 8 / 16 / 24 / 40 scale. Sections separate with 64px above
H2 and 18px below; paragraphs breathe 18px. Side-by-side comparisons use a
2-column 1fr 1fr grid with 26px gap. Text never exceeds 70ch.

## Elevation & Depth

Flat by design. Depth is the two-step panel ladder plus 1px hairlines. No
drop shadows: on a black ground shadows read as smudges. The only layering
device is sticky section sub-headers (H3) holding position while their
section scrolls beneath.

## Shapes

Rounded scale is 4 / 8 / 12: chips and badges at 4px, images and switch
panels at 8px, figure blocks and callouts at 12px. Callouts keep their left
edge square because the accent bar lives there.

## Components

- **section-label:** every H2 section heading, uppercase teal.
- **data-table:** panel ground, white text, hairline row dividers, raised
  header row, hover tint on rows, right-aligned tabular numerics.
- **switch-panel:** the proposal side of a before/after comparison. Raised
  ground, 8px radius, teal accent edge, padding 18px.
- **figure:** thumbnail evidence blocks. Raised ground, 12px radius, muted
  caption below the image.
- **callout:** warnings and caveats. Panel ground, 16px padding, 4px status
  edge on the left (positive, negative or hairline neutral).

## Do's and Don'ts

- DO keep every divider on the teal hairline token instead of grey.
- DO use tabular figures and right alignment for numeric table columns.
- DO reserve teal for headings, signal edges and focus: if everything is
  teal, nothing reads as signal.
- DON'T add drop shadows or gradients to panels on the black ground.
- DON'T let body copy exceed 70ch or captions drop below 12px.
- DON'T mix font families: Poppins only, hierarchy from size and case.
