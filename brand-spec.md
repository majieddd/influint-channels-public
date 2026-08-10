# Influint · Brand Spec

> Collected 2026-08-10 by extracting the real V3 audit-deck template
> (`SLIDES_TEMPLATE_ID`) via the Slides API — masters, layouts and theme.
> Nothing here is invented; every value came out of the deck the clients
> already receive.
> Asset completeness: **complete** for this surface (mark + texture + palette).

## 🎯 Core assets

### Logo
- Mark: `assets/brand/influint-mark.png` (279×312, transparent)
  — the teal play-triangle, lifted from the template layout element
  `g346d0a5975e_0_432` and knocked out of its white field.
- Usage: top-left lockup in the site header, and the favicon.
- Do not: recolour it, stretch it, or add a stroke. It carries a green→teal
  gradient that must stay intact.

### Background texture
- `assets/brand/dot-grid.png` (1056×808, white dots on transparent) — the
  signature dotted grid behind every deck slide. Tiled at low opacity.

## 🎨 Supporting

### Palette (from the template's theme + measured fills)
- `--ink-black: #000000` — page background (354 uses across masters/layouts)
- `--panel: #081c1c` — card background, the deck's darkest teal panel
- `--panel-raised: #0d2b2b` — hover / raised card
- `--teal: #8dd8d3` — the brand accent (theme LIGHT2/TEXT2); headings, links
- `--teal-deep: #0b6374` — theme ACCENT1; table headers, borders
- `--teal-mid: #599191` — theme ACCENT3; muted accent
- `--white: #ffffff` — primary text
- `--grey: #666666` — secondary text
- Data-only colours (already used in the charts, reused for consistency):
  `#ff6b6b` drop / `#5ad8a6` rewind / views ramp red→green
- Banned: purple gradients, and any hue not listed here.

### Type
- Display + body: `Poppins` (the deck's typeface, via Google Fonts) with a
  system-ui fallback stack.
- Mono (data/timestamps): `ui-monospace, SFMono-Regular, Menlo, monospace`.

### Signature details
- The dot grid at ~0.35 opacity, plus a single soft teal radial glow behind the
  header — both taken from the deck's own slide background, so a page and a
  slide read as the same object.

### Mood
- Analytical, dark, calm, evidence-first, premium.
