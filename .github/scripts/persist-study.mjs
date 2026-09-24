#!/usr/bin/env node
// Deploy-time persistence for the Sam Bananas repackaging study.
// The daily publisher sweep rebuilds channels/ and studies/ from the store,
// wiping manual analysis content. This script runs in .github/workflows/pages.yml
// AFTER checkout, BEFORE upload-pages-artifact, and:
//   1. copies the study HTML/MD from a pinned commit if the sweep removed them
//   2. re-inserts the Studies section + Analyses entry into the channel page
// Marker-guarded and idempotent: running it twice is a no-op.
// House gate: no em dash or en dash in any inserted text.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";

const CHANNEL_ID = "UCDKQlnsHrUcrYH3B9v7XUAg";
const PIN = process.env.SAMBANANAS_STUDY_PIN || "51cfd314b9b61b3d0b7c394576f5fc32f2b52289";
const STUDY_STEM = `${CHANNEL_ID}-repackaging-2026-09`;
const STUDY_FILES = [`studies/${STUDY_STEM}.html`, `studies/${STUDY_STEM}.md`, `studies/${STUDY_STEM}`];
const MARK_STUDIES = `studies:sambananas-repackaging-2026-09`;
const MARK_ANALYSES = `analyses:sambananas-repackaging-2026-09`;

const STUDIES_SECTION = `<h2>Studies</h2>
<p class="legend">Written deep dives: what the numbers say, what the package says, and what to change.</p>
<div class="st-list"><a class="st-list-item" href="../studies/${STUDY_STEM}.html"><span class="st-list-title">Sam Bananas Repackaging Analysis</span><span class="st-list-kicker">Camping with Sam Bananas \u00b7 188 uploads, Nov 2020 to Sep 2026 \u00b7 public data only \u00b7 analysed 24 Sep 2026 \u00b7 23 shortlisted uploads, each with the Studio pull that would confirm it</span><span class="st-list-date">Updated 2026-09-24</span></a></div>
<!-- ${MARK_STUDIES} -->`;

const ANALYSES_BLOCK = `<div class="outs"><div class="out">
  <div class="top"><span class="tool">Deep dive (agent)</span><span class="when">2026-09-24 &middot; 188 videos</span>
  <span class="links"><a href="../studies/${STUDY_STEM}.html">Repackaging doc</a> &middot;
  <a href="../studies/${STUDY_STEM}.md">Markdown source</a></span></div>
  <ul>
    <li>Weather in the title is the channel's spine: RAIN-titled uploads sit at 1.64x median against 0.73x for uploads with no weather word (n=63 vs 90, whole catalogue).</li>
    <li>TEMU is the strongest single word on the channel (6 titles, 3.17x median) but rests on a sample of 6.</li>
    <li>Two packages of the same place disagree: Wendy's camp ran 3.58x and 0.38x 203 days apart; the Appalachian week ran 1.54x (TEMU package) against 0.56x (plain 3 Days package) sixteen days apart.</li>
    <li>Dog in the title runs 0.53x against 1.04x without, same median publish year (2024); guest/collab named runs 0.67x (n=34).</li>
    <li>Under-25-minute uploads are the weakest runtime band (0.49x, n=32); nothing is punished for being long.</li>
    <li>The rhythm action reproduces on the recent 40 (1.30x on rhythm vs 0.97x off) but not on the full 188 (0.99x vs 0.98x).</li>
    <li>23 uploads screen into the repackage shortlist with at least one public proxy for strong content and weak package; ranked and diagnosed in the study.</li>
  </ul>
  <div class="warn">&#9888; Public channels basis: lifetime views against time-neighbours, not first-28-day windows. 0 retention curves on this channel, so retention and engaged views are unmeasured; the proxies need one Studio pull of 6+ curves to confirm.</div>
</div></div>
<!-- ${MARK_ANALYSES} -->`;

function git(args) { return execFileSync("git", args, { stdio: ["ignore", "pipe", "pipe"] }).toString(); }

// Restore anything the publisher sweep removed, from the pinned commit.
// Same pattern as the Nizar step above: fetch the pin only if the shallow
// checkout does not carry it, then restore straight from that tree.
let pinFetched = false;
function restoreFromPin(rel) {
  if (existsSync(rel) && !(fs_statIsDir(rel) && fs_readdirLen(rel) === 0)) return "present";
  try {
    if (!pinFetched) {
      try { git(["cat-file", "-e", PIN]); }
      catch { git(["fetch", "--no-tags", "--depth=1", "--filter=blob:none", "origin", PIN]); }
      pinFetched = true;
    }
    git(["restore", "--source=" + PIN, "--worktree", "--", rel]);
    return existsSync(rel) ? "restored from " + PIN : "MISSING after restore";
  } catch (e) {
    const detail = String(e.stderr || e.message).split("\n").filter(Boolean).pop() || e.message;
    return "MISSING, restore failed: " + detail;
  }
}
function fs_statIsDir(p) { try { return statSync(p).isDirectory(); } catch { return false; } }
function fs_readdirLen(p) { try { return readdirSync(p).length; } catch { return 0; } }

// 1. study files (html, md source, thumbnail folder)
for (const f of STUDY_FILES) {
  console.log(`${f}: ${restoreFromPin(f)}`);
}

const stillMissing = STUDY_FILES.filter(f => !existsSync(f) || (fs_statIsDir(f) && fs_readdirLen(f) === 0));
if (stillMissing.length) {
  console.error("FATAL, study content missing and could not be restored: " + stillMissing.join(", "));
  process.exit(1);
}

// 2. channel page markers
const page = `channels/${CHANNEL_ID}.html`;
if (!existsSync(page)) {
  console.error(`${page} missing, cannot patch`);
  process.exit(1);
}
let html = readFileSync(page, "utf8");
const before = html;
if (!html.includes(MARK_STUDIES)) {
  const idx = html.indexOf("<h2>Analyses</h2>");
  if (idx === -1) { console.error("anchor <h2>Analyses</h2> not found"); process.exit(1); }
  html = html.slice(0, idx) + STUDIES_SECTION + "\n\n" + html.slice(idx);
  console.log("studies section inserted");
}
if (!html.includes(MARK_ANALYSES)) {
  const empty = '<p class="empty">No tool outputs recorded yet.</p>';
  if (html.includes(empty)) {
    html = html.replace(empty, ANALYSES_BLOCK);
    console.log("analyses entry replaced empty state");
  } else {
    const idx = html.indexOf("<h2>Analyses</h2>");
    if (idx === -1) { console.error("anchor <h2>Analyses</h2> not found (analyses)"); process.exit(1); }
    // this page uses no <section> wrappers: insert straight after the h2
    const after = idx + "<h2>Analyses</h2>".length;
    let close = html.indexOf("</section>", after);
    const nextH2 = html.indexOf("<h2>", after);
    if (close === -1 || (nextH2 !== -1 && nextH2 < close)) close = after;
    html = html.slice(0, close) + "\n" + ANALYSES_BLOCK + html.slice(close);
    console.log("analyses entry appended");
  }
}
if (/[\u2014\u2013]/.test(STUDIES_SECTION + ANALYSES_BLOCK)) {
  console.error("GATE FAIL: em/en dash in inserted text"); process.exit(1);
}
if (html !== before) writeFileSync(page, html);
console.log("channel page ok");
