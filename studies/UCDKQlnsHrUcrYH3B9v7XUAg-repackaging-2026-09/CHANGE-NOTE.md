# Change note: UCDKQlnsHrUcrYH3B9v7XUAg-repackaging-2026-09

Owner note for this study folder. Every file shipped here and what it carries.

## Round 1 (2026-09-24, commits 79cf7c4b on influint-channels-public)

- `UCDKQlnsHrUcrYH3B9v7XUAg-repackaging-2026-09.html` - published study page: 23 repackage candidates, thumbnail
  diagnosis, cohort check, intelligence citations, plan sections.
- `UCDKQlnsHrUcrYH3B9v7XUAg-repackaging-2026-09.md` - markdown source of the same content (one data structure,
  both renderers).
- `CHANGE-NOTE.md` - this file.
- 27 `<videoid>.jpg` thumbnails - candidate screenshots referenced by the
  page, pulled from i.ytimg.com.

## Round 2 (2026-09-24, same day)

- `UCDKQlnsHrUcrYH3B9v7XUAg-repackaging-2026-09.html` / `UCDKQlnsHrUcrYH3B9v7XUAg-repackaging-2026-09.md` - added two sections the owner asked for:
  "Which videos need a packaging switch" (all 23 ranked with original vs
  proposed title columns) and "Example: original versus switched package"
  (three worked side-by-side examples: thumbnail as shipped, score, switch
  the title to, rebuild the thumbnail as).
- `DESIGN.md` - Google design.md token spec (name Influint Study) governing
  the page's visual layer: colors, typography, rounded scale, spacing,
  components. Linted with `npx @google/design.md designmd lint` (0 errors,
  0 warnings).
- Page CSS updated to the DESIGN.md token layer: section rhythm 64/18,
  body line-height 1.6, tightened H2 tracking, raised table headers,
  numeric columns right-aligned with tabular figures, sticky H3
  sub-headers, 12px figures, 8px switch panels with teal accent edge,
  focus-visible outlines.

All files are restored at deploy time from the pinned commit recorded in
`.github/scripts/persist-study.mjs`, so the daily publisher sweep does not
remove them.
