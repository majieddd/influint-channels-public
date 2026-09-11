import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = 'UCVhGR9TU1vfvHXl73uaEiEQ-irl-ideation-2026-09';
const studyDir = path.join(root, 'studies', slug);
const pagePath = path.join(root, 'studies', slug + '.html');
const manifest = JSON.parse(fs.readFileSync(path.join(studyDir, 'thumbnail-manifest.json'), 'utf8'));
const ideas = JSON.parse(fs.readFileSync(path.join(studyDir, 'ideas.json'), 'utf8')).ideas;
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let html = fs.readFileSync(pagePath, 'utf8');
if (manifest.items.length !== 100 || new Set(manifest.items.map(x => x.id)).size !== 100) throw new Error('Expected 100 unique thumbnail records');
for (const item of manifest.items) {
  const source = ideas.find(idea => idea.id === item.id);
  if (!source || source.title !== item.title) throw new Error('Idea/title mismatch: ' + item.id);
  for (const asset of [item.image, item.preview]) {
    const resolved = path.resolve(studyDir, asset);
    if (!resolved.startsWith(studyDir + path.sep) || !fs.existsSync(resolved)) throw new Error('Missing or invalid asset: ' + asset);
  }
  const image = slug + '/' + item.image;
  const preview = slug + '/' + item.preview;
  const version = item.sha256.slice(0, 12);
  const region = new RegExp('(<div class="idea" id="idea-' + item.id + '">\\s*<div class="idea-head">)[\\s\\S]*?(?=\\s*<div class="t">)');
  if (!region.test(html)) throw new Error('Cannot find idea card: ' + item.id);
  const block = '\n  <a class="thumb generated-thumb" href="' + image + '?v=' + version + '" data-thumbnail-id="' + item.id + '" aria-label="Enlarge thumbnail for ' + escape(item.title) + '">\n'
    + '    <img src="' + preview + '?v=' + version + '" width="640" height="360" loading="lazy" decoding="async" alt="' + escape(item.alt) + '">\n'
    + '  </a>\n  <div class="thumbnail-actions"><span>Concept #' + item.id + '</span><a href="' + image + '" download="' + path.basename(item.image) + '" aria-label="Download thumbnail for ' + escape(item.title) + '">Download JPG</a></div>';
  html = html.replace(region, (_, prefix) => prefix + block);
}
html = html.replace('The thumbnails are placeholders that carry the title text and a composition note;', 'Each idea has an AI-generated thumbnail concept;');
if (!html.includes('class="thumbnail-jump"')) html = html.replace('<div class="st-kicker">', '<p class="thumbnail-jump"><a href="#thumbnail-gallery">Browse the 100 thumbnails and download the set</a> · Added 2026-09-11</p>\n  <div class="st-kicker">');
html = html.replace("each cited upload is shown with its own packaging (thumbnail and title)", "each cited upload is shown with its original packaging (thumbnail and title)");
html = html.replace("the thumbnails shown on the cards are the uploads' own, stored beside this page.", "the evidence thumbnails under Why this idea are the uploads' own, stored beside this page. The 100 generated concept thumbnails were added on 2026-09-11 using the supplied thumbnail guides and the public intelligence snapshot.");
html = html.replace('Each concept card below carries a composition note written to that template.', 'The original thumbnail briefs used that template. The generated concepts below also apply the supplied thumbnail guides, varying the framework and expression to suit each idea.');
const banner = '<!-- generated-thumbnails:notice -->\n'
  + '<div class="thumbnail-intro" id="thumbnail-gallery"><p><strong>100 thumbnail concepts</strong><br>Click any thumbnail to enlarge it, or download the full set as 1280 × 720 JPEGs.</p>'
  + '<a class="thumbnail-control" href="' + slug + '/nizarisaqtirl-100-thumbnails.zip" download>Download all 100 (ZIP)</a>'
  + '<details><summary>About these concepts</summary><p>Created using <em>10 Rules of Thumbnails</em>, <em>16 Engaging Thumbnail Frameworks</em>, and this site’s <a href="../intelligence-system.html">intelligence system</a>: a clear subject, readable contrast, a meaningful unanswered question, and text that complements the title. These are creative concepts for proposed videos. Unreferenced supporting people are illustrative stand-ins; scenes and screen content are generated. They have not been tested with viewers.</p>'
  + '<p>Generated with the built-in image generator, which did not expose its model name. GPT Image 2.5 Flare could not be verified. The ZIP includes the selected prompts; <a href="' + slug + '/thumbnail-manifest.json">thumbnail metadata</a> records the chosen frameworks.</p></details></div>\n'
  + '<!-- /generated-thumbnails:notice -->';
if (html.includes('<!-- generated-thumbnails:notice -->')) html = html.replace(/<!-- generated-thumbnails:notice -->[\s\S]*?<!-- \/generated-thumbnails:notice -->/, banner);
else html = html.replace('<h2>One hundred ideas in ten families</h2>', '<h2>One hundred ideas in ten families</h2>\n' + banner);
const cssTag = '<link rel="stylesheet" href="' + slug + '/thumbnails.css">';
if (!html.includes(cssTag)) html = html.replace('</head>', cssTag + '\n</head>');
const viewer = '<!-- generated-thumbnails:viewer -->\n'
 + '<dialog class="thumbnail-viewer" aria-labelledby="thumbnail-title" aria-describedby="thumbnail-caption">'
 + '<div class="thumbnail-viewer-bar"><span id="thumbnail-position"></span><button type="button" class="thumbnail-control" data-close-thumbnail>Close</button></div>'
 + '<img class="thumbnail-large" width="1280" height="720" alt="">'
 + '<h2 id="thumbnail-title"></h2><p id="thumbnail-caption">AI-generated concept. Unreferenced supporting people are illustrative.</p>'
 + '<div class="thumbnail-viewer-bar"><button type="button" class="thumbnail-control" data-previous-thumbnail>Previous</button><button type="button" class="thumbnail-control" data-next-thumbnail>Next</button><a class="thumbnail-control" data-download-thumbnail download>Download JPG</a></div>'
 + '</dialog>\n<script src="' + slug + '/thumbnails.js" defer></script>\n<!-- /generated-thumbnails:viewer -->';
if (html.includes('<!-- generated-thumbnails:viewer -->')) html = html.replace(/<!-- generated-thumbnails:viewer -->[\s\S]*?<!-- \/generated-thumbnails:viewer -->/, viewer);
else html = html.replace('</body>', viewer + '\n</body>');
fs.writeFileSync(pagePath, html);
console.log('Applied 100 mapped thumbnail images without changing the original idea text or research.');
