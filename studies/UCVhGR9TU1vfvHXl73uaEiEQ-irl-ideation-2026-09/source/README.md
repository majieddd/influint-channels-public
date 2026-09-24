# Rebuilding the Nizar study

The original 100 ideas remain in `../ideas-original-2026-09-10.json`. Editorial rows, selected reference metadata and source snapshots live here. The supplied PDF documents were used as guidance and are not republished.

With Python 3 and beautifulsoup4 installed, run `python build-data.py`, then `python build-site.py` from this directory. The first reads the selected channel catalogues in the repository, so later catalogue snapshots may change imported scores and coverage. The second builds the seven-section page and idea mappings from the JSON and current thumbnail manifest. CSS and JavaScript are maintained directly beside that JSON.

The selected JPEGs, WebP previews and exact generation prompts are listed in `../thumbnail-manifest.json`. The full download contains all 100 JPEGs and prompts. Built-in generation does not expose a named image model.

After changes, verify all original titles, three opening beats, separate shape/ingredient coverage, additive budget totals, source timestamps, responsive layouts, keyboard controls and image checksums. Commit the complete reviewed study first, then advance the content pin in `.github/scripts/persist-nizar-study.mjs` in a separate commit. That guard restores both missing assets and stale publisher-generated HTML before deployment. Do not invoke the older thumbnail-only integration script on this page.
