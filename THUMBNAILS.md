# Nizar IRL thumbnail publishing

The study has 100 generated thumbnail concepts, 1280 x 720 JPEG downloads, 640 x 360 WebP previews, and a ZIP containing all selected images and prompts.

The external site publisher removed this supplementary content during later full-site refreshes. The Pages workflow now restores missing thumbnail assets from verified commit 1996a74c363d637b43a12f2e673ade4eea33d897, reapplies the images to the latest study, and checks all 100 JPEG hashes and title mappings before deployment.

Existing nonempty assets are preserved. If an existing image no longer matches its manifest checksum or an idea title changes, deployment fails visibly instead of publishing an incorrect mapping. Update thumbnail-manifest.json together with intentional image changes.

The recovery runs in the Pages artifact, without rewriting Git history or replacing other pages. The workflow is kept in .github/workflows/pages.yml, which the external publisher has preserved.

To reapply the thumbnails locally:

    node scripts/apply-irl-thumbnails.mjs

The model identity was not exposed by the built-in generator. These are creative concepts for proposed videos, and unreferenced supporting people are illustrative. Both supplied guides and the public intelligence snapshot informed the images. No audience or CTR test was performed.
