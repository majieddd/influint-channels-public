# Updating the Nizar IRL thumbnails

The study is static HTML deployed by .github/workflows/pages.yml on pushes to main. There is no site build step.

The 100 final thumbnail records live in studies/UCVhGR9TU1vfvHXl73uaEiEQ-irl-ideation-2026-09/thumbnail-manifest.json. The same records are attached as thumbnail metadata in ideas.json; original idea fields remain intact. JPEG files are 1280 x 720, WebP previews 640 x 360. The ZIP contains all JPEGs and the selected generation prompts.

After the external study emitter regenerates this page, run:

    node scripts/apply-irl-thumbnails.mjs

The script reapplies images by idea ID, checks title correspondence and asset existence, and retains the generated concept notice and image viewer. It is idempotent. Do not delete generated-thumbnails/, thumbnail-manifest.json, thumbnails.css, thumbnails.js or the ZIP during an external refresh.

The thumbnails are AI-generated creative concepts for proposed videos. Supporting people without verified photo references are illustrative. The image tool did not expose its model, so GPT Image 2.5 Flare cannot be certified. Guidance came from the two user-supplied thumbnail PDFs and the public intelligence snapshot; no new CTR or audience test was performed.
