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

## Round 3 (2026-09-24): complete before/after review

- Eight collapsible evidence tiles retain the channel numbers at the top.
- All 23 videos have original and proposed thumbnail/title packages with the real channel avatar, Roboto video typography, recorded views, upload age and runtime.
- Added 23 individually generated 1280x720 concepts, prompts in packages.json, a checksum manifest, downloads, search and priority filters.
- All titles were reviewed against the original titles and images. Removed unsupported weather, prices, timing and survival claims. Corrected the tutorial/TEMU comparison, cabin/winter mismatch and Rain Forests weather classification. Separate priorities: eight test first, twelve next, three review format fit.
- Original data and research citations remain expandable. The previous report is archived with its superseded recommendations labeled.
- Concepts are AI reconstructions, not footage or tested outcomes. No predicted view counts are shown.
- Recovery checks every file individually, including partial folder loss; verifies mappings and image hashes; rebuilds an overwritten legacy page from the current structured inputs.

Validation: 23 complete pairs, 50 image/style/script URLs return HTTP 200 locally, all concepts are 1280x720, no missing internal links. Browser checks cover 375px, 768px and 1280px, all priority filters, search and reset, eight-tile expansion/collapse, keyboard activation, and no horizontal overflow. Measured visible text contrast minimum: 8.32:1.
