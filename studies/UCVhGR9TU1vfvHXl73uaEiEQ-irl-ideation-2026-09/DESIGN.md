# Nizar IRL study visual contract

Targeted revision of the existing creator playbook, requested 4 October 2026. Use a simple YouTube-style browsing interface: dark neutral ground, light text, red selection and focus, Roboto, and large 16:9 thumbnails. Retain Influint ownership and the seven research chapters. This is a creator study, so no YouTube logo or implied affiliation is added. Brand reference: https://brand.youtube/.

DESIGN_VARIANCE: 2/10
MOTION_INTENSITY: 1/10
VISUAL_DENSITY: 6/10

## Tokens

`strategy.css` owns all color, spacing, type and radius tokens. Ground `#0f0f0f`, cards `#181818`, raised controls `#272727`, text `#f1f1f1`, secondary text `#aaa`, accent `#ff0033`. Use red only for selection, focus, opening-beat rules and source-tagged drop markers. Evidence states use explicit text, without extra accent colors. Retention peaks use outlined circles; drops use filled squares. No gradients, glows or decorative animation.

Type: Roboto, with Arial as an intentional fallback. Sizes: 12, 14, 16, 20, 28, 36px. Space: 4, 8, 12, 16, 20, 24, 32, 40, 48px. Radius: 4, 8, 12px maximum. Interactive controls have a 44px minimum target. Navigation stays on one horizontally scrollable row.

## Shared cards

`source/idea_cards.py` renders the visible structure for all 125 ideas. Reach for it for any future idea additions. The original `.idea` and solo `.solo-video` classes use the same CSS rules. Each card starts with a full-width thumbnail, then ID/family, title, one-sentence summary, three visible opening beats, and budget/download links. The three beats are 0 (First Frame) to 5s, 5s to 15s, and 15s to 30s.

Every card has the same native disclosures: “Why this Idea” explains the title shape plus ingredients and shows the evidence; “Thumbnail: source → Niz” pairs the real source with the generated adaptation. Solo cards add “Solo shoot and payoff” for blocking, payoff and incremental expenses. Shoot time and people appear at the bottom. Keep all 25 solo ideas Niz-only.

All 125 cards belong to one `#ideas-grid` catalogue with shared search, family/evidence filters and pagination. There are no separate solo thumbnail sections. The five Niz-only formats appear alongside the original ten families in the family filter. All 125 thumbnails share one dialog with previous/next navigation, keyboard arrows, Escape, focus return and JPG download, plus one bulk ZIP. Deep links reveal the appropriate gallery page for any idea. Existing solo-format links select the corresponding family within the shared gallery.

## Verification

Check image mappings and file checksums for all 125 ideas. Verify both card types, visible intro beats, comparison links, download links, filter/pagination, direct links, modal navigation, retention controls and keyboard focus in the browser. Verify 375, 768 and 1280px widths, contrast and absence of page overflow. Preserve measured evidence, its source dates, gaps and limitations.
