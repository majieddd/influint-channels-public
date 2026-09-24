import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const stem='UCDKQlnsHrUcrYH3B9v7XUAg-repackaging-2026-09';
const dir=`studies/${stem}`;
const data=JSON.parse(fs.readFileSync(`${dir}/packages.json`));
const manifest=JSON.parse(fs.readFileSync(`${dir}/thumbnail-manifest.json`));
const html=fs.readFileSync(`studies/${stem}.html`,'utf8');
assert.equal(data.items.length,23);
assert.equal(new Set(data.items.map(x=>x.id)).size,23);
assert.equal(manifest.items.length,23);
assert.equal(new Set(manifest.items.map(x=>x.sha256)).size,23);
assert.equal((html.match(/class="comparison"/g)||[]).length,23);
assert.equal((html.match(/class="package"/g)||[]).length,46);
assert.equal((html.match(/class="data-tile"/g)||[]).length,8);
assert(!/[\u2013\u2014]/.test(html),'No em or en dashes in rendered study');
for(const item of data.items){
  const m=manifest.items.find(x=>x.id===item.id);
  assert(m,`Missing manifest entry ${item.id}`);
  assert.equal(item.after,m.file);
  for(const filename of [item.before,item.after]){
    const resolved=path.resolve(dir,filename);
    assert(resolved.startsWith(path.resolve(dir)+path.sep),'Asset outside study');
    assert(fs.statSync(resolved).size>1000,`Empty asset ${filename}`);
    assert(html.includes(`${stem}/${filename}`),`Unreferenced asset ${filename}`);
  }
  assert.equal(createHash('sha256').update(fs.readFileSync(`${dir}/${m.file}`)).digest('hex'),m.sha256);
  assert.equal(m.width,1280);assert.equal(m.height,720);
  assert(html.includes(`id="video-${item.id}"`));
}
for(const file of ['study.css','study.js','channel-avatar.jpg','influint-mark.png','evidence.json','source-record.html','source-record.md'])assert(fs.statSync(`${dir}/${file}`).size>0);
const groups=Object.fromEntries(['first','next','review'].map(k=>[k,data.items.filter(x=>x.group===k).length]));
assert.deepEqual(groups,{first:8,next:12,review:3});
console.log('PASS: 23 mapped before/after pairs, 23 unique verified concept assets, eight evidence tiles, and 8/12/3 priorities.');
