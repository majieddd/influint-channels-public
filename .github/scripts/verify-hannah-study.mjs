import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const stem='UC1STjuGMAzbdmv0YRyAkl1w-repackaging-2026-10';
const dir=path.join('studies',stem);
const data=JSON.parse(fs.readFileSync(path.join(dir,'packages.json')));
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'thumbnail-manifest.json')));
const html=fs.readFileSync(`studies/${stem}.html`,'utf8');
function check(ok,label){if(!ok)throw new Error(label);}
check(data.items.length===22&&new Set(data.items.map(x=>x.id)).size===22,'22 unique packages');
check((html.match(/class="data-tile"/g)||[]).length===8,'Eight evidence tiles');
check((html.match(/<article class="comparison"/g)||[]).length===22,'22 before/after pairs');
for(const [group,count] of Object.entries({first:8,next:11,review:3}))check(data.items.filter(x=>x.group===group).length===count,`Priority ${group}`);
check(manifest.readyCount===manifest.items.length,'Manifest ready count');
if(process.argv.includes('--complete'))check(manifest.readyCount===22,'All 22 After concepts');
for(const item of manifest.items){const b=fs.readFileSync(path.join(dir,item.file));check(crypto.createHash('sha256').update(b).digest('hex')===item.sha256,`Checksum ${item.id}`);check(item.width===1280&&item.height===720,`Dimensions ${item.id}`);}
for(const c of data.items){check(fs.existsSync(path.join(dir,c.before)),`Original ${c.id}`);check(c.proposedTitle&&c.contentEvidence&&c.guard,`Evidence ${c.id}`);}
for(const [,ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^(?:https?:|#)/.test(ref))continue;const file=ref.split('#')[0];check(fs.existsSync(path.resolve('studies',file)),`Local reference ${ref}`);}
check(!/[\u2013\u2014]/.test(html.replace(/<[^>]+>/g,'')),'No dash punctuation');
console.log(`Verified 22 pairs, 8 tiles, ${manifest.readyCount} checksum-matched concepts and all local references.`);
