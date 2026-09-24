#!/usr/bin/env node
// The publisher rebuilds studies from its store. Preserve this complete revision,
// including stale generated HTML, from a reviewed immutable content snapshot.
// When editing this study, commit its content first, then advance this pin.
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';

const PIN=process.env.NIZAR_STUDY_PIN || 'c62714b57ffdc7ce51ab8e600ba26c1f48aa1813';
const stem='studies/UCVhGR9TU1vfvHXl73uaEiEQ-irl-ideation-2026-09';
const git=args=>execFileSync('git',['-c','core.autocrlf=false',...args],{stdio:['ignore','pipe','pipe'],maxBuffer:128*1024*1024});
const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const blob=bytes=>hash(Buffer.concat([Buffer.from('blob '+bytes.length+'\0'),bytes]),'sha1');
if(!/^[a-f0-9]{40}$/.test(PIN))throw Error('Set NIZAR_STUDY_PIN to the reviewed content commit.');
try{git(['cat-file','-e',PIN+'^{commit}'])}catch{git(['fetch','--no-tags','--depth=1','--filter=blob:none','origin',PIN])}
const entries=git(['ls-tree','-r','-z',PIN,'--',stem+'.html',stem]).toString().split('\0').filter(Boolean).map(line=>{
 const m=line.match(/^100644 blob ([a-f0-9]{40})\t(.+)$/);
 if(!m || !(m[2]===stem+'.html'||m[2].startsWith(stem+'/')) || m[2].split('/').includes('..'))throw Error('Unexpected protected path: '+line);
 return {oid:m[1],file:m[2]};
});
if(entries.length<210)throw Error('Content pin does not contain the complete study.');
const changed=entries.filter(e=>!existsSync(e.file)||blob(readFileSync(e.file))!==e.oid);
// Read raw Git blobs so Windows checkout newline conversion cannot alter the pin.
for(let i=0;i<changed.length;i+=100){
 const batch=changed.slice(i,i+100);
 const raw=execFileSync('git',['cat-file','--batch'],{input:batch.map(e=>e.oid).join('\n')+'\n',maxBuffer:128*1024*1024});
 let offset=0;
 for(const e of batch){
  const end=raw.indexOf(10,offset),header=raw.subarray(offset,end).toString().match(/^([a-f0-9]{40}) blob (\d+)$/);
  if(!header||header[1]!==e.oid)throw Error('Unexpected Git blob response');
  const size=Number(header[2]),bytes=raw.subarray(end+1,end+1+size);
  if(bytes.length!==size||blob(bytes)!==e.oid)throw Error('Incomplete Git blob: '+e.file);
  mkdirSync(dirname(e.file),{recursive:true});writeFileSync(e.file,bytes);offset=end+size+2;
 }
}
for(const e of entries)if(blob(readFileSync(e.file))!==e.oid)throw Error('Restore verification failed: '+e.file);
const read=name=>JSON.parse(readFileSync(stem+'/'+name,'utf8'));
const manifest=read('thumbnail-manifest.json'),ideas=read('ideas.json').ideas,data=read('strategy-data.json');
if(manifest.items.length!==100 || ideas.length!==100 || new Set(manifest.items.map(t=>t.id)).size!==100)throw Error('Expected 100 unique ideas and images.');
for(const t of manifest.items){
 const i=ideas.find(i=>i.id===t.id);
 if(!i || i.title!==t.title || i.thumbnail.sha256!==t.sha256 || i.intro.length!==3)throw Error('Invalid idea mapping: '+t.id);
 for(const key of ['image','preview'])if(!/^generated-thumbnails\/[a-z0-9-]+\.(jpg|webp)$/.test(t[key]))throw Error('Unexpected asset path');
 if(hash(readFileSync(stem+'/'+t.image))!==t.sha256)throw Error('JPEG checksum mismatch: '+t.id);
 if(t.preview_sha256 && hash(readFileSync(stem+'/'+t.preview))!==t.preview_sha256)throw Error('Preview checksum mismatch: '+t.id);
}
const html=readFileSync(stem+'.html','utf8');
const chapters=['ideation','packaging','creative','production','post-production','shorts-strategy','data-analysis'];
if(!html.includes('data-study-version="seven-sections-v1"') || (html.match(/<article class="idea" /g)||[]).length!==100)throw Error('Study revision or 100 cards missing');
let prior=-1;for(const id of chapters){const at=html.indexOf('<section id="'+id+'"');if(at<=prior)throw Error('Chapter missing or reordered: '+id);prior=at;}
if(data.retention.cases.length!==28 || data.shorts.sample.length!==96)throw Error('Research data incomplete');
console.log(JSON.stringify({study:stem,pin:PIN,protectedFiles:entries.length,restoredFiles:changed.length,ideas:100,chapters:7,retentionCases:28}));
