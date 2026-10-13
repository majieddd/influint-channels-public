# Hannah channel results update

This is a targeted addition to the existing Influint channel dashboard, not a new page direction. Keep the original Poppins typography, dark panels, teal accent, channel portrait, dashboard and video wall. Use the real Influint mark preserved with the repackaging study.

Design variance: 2. Motion intensity: 1. Visual density: 6.

The new section uses the existing `--panel`, `--teal` and `--line` tokens. Scoped text tokens are `--hc-text: #eaf5f3` and `--hc-muted: #bacdca`. No animation is introduced. Native details keep evidence collapsed until requested. Open tables scroll within their own region on narrow screens.

Data boundaries: October 13 public lifetime totals are separate from fixed first-28-day catalogue views and the September 5 Studio pull. Store exact dates and counts with source video URLs. Never infer current CTR or retention from public views.

Recovery: `.github/scripts/hannah-channel-build.py` reads `hannah-channel-public-results-2026-10.json` and reapplies marked HTML/CSS while retaining the rest of a newly generated channel dashboard. The generated fragment and stylesheet are saved separately for inspection. The old missing dot-grid asset is disabled and the broken logo reference uses the preserved genuine mark.

Verification: the local October update has zero new em dashes, no page overflow at 375, 768 and 1280 widths, and the full rendered page returned zero measured contrast failures. Legacy dashboard copy and styling still contain preexisting em dashes, pure black/white and transition-all rules; these are outside this targeted data update.
