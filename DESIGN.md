# Thumbnail integration design contract

Scope: the generated thumbnail preview, download controls and image viewer added to the existing IRL study. The study's established typography, charts, research layout and background remain authoritative.

DESIGN_VARIANCE: 2/10
MOTION_INTENSITY: 1/10 (no added animation)
VISUAL_DENSITY: 7/10

Use the existing Poppins face and teal accent. New surfaces use --panel (#081c1c) and --panel-raised (#0d2b2b). New copy uses --thumb-text (#dfeeec) or --thumb-muted (#b7cdca); controls use --teal (#8dd8d3). Radius is 12px for images and the viewer, 6px for controls. Type is 12.5px for metadata, 14px for controls and explanatory text, and 20px for the viewer title.

The image is the whole thumbnail: do not cover it with projection badges, composition notes or extra headlines. Keep concept numbers and download controls below the image. Preserve 16:9 at every size. Keep original evidence packaging separate under Why this idea.

Use one .thumbnail-control primitive, native links for fallback/full-size images, and a native dialog for enlarged viewing. Keep visible keyboard focus, Escape to close and focus return. No added movement or hover scaling.

This bounded integration does not restyle the inherited page. Its existing black/white tokens, dotted ground, research colors and mobile navigation wrapping are pre-existing design choices, outside the new component's scope.
