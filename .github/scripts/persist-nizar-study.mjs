#!/usr/bin/env node
// The publisher rebuilds studies from its store. Preserve this complete revision,
// including stale generated HTML, from a reviewed immutable content snapshot.
// When editing this study, commit its content first, then advance this pin.
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';

const PIN=process.env.NIZAR_STUDY_PIN || 'bca1b69e8194bc670426d7b40458c3a87ee9255d';
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
const solo=read('solo-formats.json');
if(solo.formats.length!==5 || solo.video_count!==25 || solo.required_people!==1)throw Error('Solo format expansion incomplete');
const soloVideos=solo.formats.flatMap(f=>f.videos);
if(soloVideos.length!==25 || new Set(soloVideos.map(v=>v.id)).size!==25 || (html.match(/<article class="solo-video" /g)||[]).length!==25)throw Error('Expected 25 unique solo briefs');
for(const f of solo.formats){
 if(f.required_people!==1 || f.videos.length!==5)throw Error('Invalid solo format: '+f.id);
 for(const v of f.videos)if(v.required_people!==1 || v.intro.length!==3 || v.id<101 || v.id>125 || v.cost_low!==v.cost_lines.reduce((s,c)=>s+c[1],0) || v.cost_high!==v.cost_lines.reduce((s,c)=>s+c[2],0))throw Error('Invalid solo brief: '+v.id);
}
const soloThumbs=read('solo-thumbnail-manifest.json');
if(soloThumbs.items.length!==25 || soloThumbs.generated_count!==25 || new Set(soloThumbs.items.map(t=>t.idea_id)).size!==25)throw Error('Expected 25 generated solo thumbnails.');
const hashFile=file=>hash(readFileSync(stem+'/'+file));
for(const t of soloThumbs.items){
 const v=soloVideos.find(v=>v.id===t.idea_id),s=t.video_source;
 if(!v || t.title!==v.title || s.video_id!==v.video_source?.video_id || !/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]+$/.test(s.url) || !new Set(['generated']).has(t.render_status))throw Error('Invalid solo thumbnail/source mapping: '+t.idea_id);
 if(t.prompt_path!==v.thumbnail_plan.prompt || hashFile(t.prompt_path)!==t.prompt_sha256)throw Error('Solo prompt checksum mismatch: '+t.idea_id);
 if(t.generated_image!==v.thumbnail_plan.generated_image || !/^generated-thumbnails\/solo-(10[1-9]|1[12][0-9]|125)\.jpg$/.test(t.generated_image) || hashFile(t.generated_image)!==t.generated_image_sha256)throw Error('Solo generated image checksum mismatch: '+t.idea_id);
 if(t.preview_image!==v.thumbnail_plan.preview_image || !/^generated-thumbnails\/solo-(10[1-9]|1[12][0-9]|125)-preview\.webp$/.test(t.preview_image) || hashFile(t.preview_image)!==t.preview_image_sha256)throw Error('Solo WebP checksum mismatch: '+t.idea_id);
 const sourceThumb=s.thumbnail_path;
 if(sourceThumb!==`solo-reference-thumbnails/${s.video_id}.jpg` || hashFile(sourceThumb)!==s.thumbnail_sha256)throw Error('Solo source-video thumbnail checksum mismatch: '+t.idea_id);
 if(!html.includes(t.generated_image) || !html.includes(t.preview_image) || !html.includes(s.url))throw Error('Solo image or source link missing from the study page: '+t.idea_id);
}
if(new Set(soloThumbs.items.map(t=>t.video_source.video_id)).size!==25)throw Error('Solo reference videos are not unique.');
console.log(JSON.stringify({study:stem,pin:PIN,protectedFiles:entries.length,restoredFiles:changed.length,ideas:125,thumbnails:100,soloFormats:5,soloIdeas:25,soloGeneratedThumbnails:25,soloSourceVideos:25,chapters:7,retentionCases:28}));
