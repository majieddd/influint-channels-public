// Restore Hannah's study and public-results section after daily publisher rebuilds.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const stem='UC1STjuGMAzbdmv0YRyAkl1w-repackaging-2026-10';
const pin=process.env.HANNAH_STUDY_PIN||'fa27e2282658d34816d5d38cfbf85bae1ddda576';
const git=args=>execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});
try{git(['cat-file','-e',pin]);}catch{git(['fetch','--no-tags','--depth=1','--filter=blob:none','origin',pin]);}
const paths=[`studies/${stem}.html`,`studies/${stem}.md`,`studies/${stem}`,'channels/UC1STjuGMAzbdmv0YRyAkl1w.html','.github/scripts/verify-hannah-study.mjs','.github/scripts/hannah-channel-build.py',...['public-results-2026-10.json','public-results-2026-10.csv','update-section.html','update.css','influint-mark.png','DESIGN.md'].map(x=>'channels/hannah-channel-'+x)];
const expected=git(['ls-tree','-r','--name-only',pin,'--',...paths]).trim().split('\n').filter(Boolean);
if(!expected.includes(`studies/${stem}/after/VJU_3Syqd3k.jpg`))throw new Error('Recovery pin must include all 22 concepts.');
let repaired=0;
for(const file of expected){if(fs.existsSync(file)&&fs.statSync(file).size>0)continue;git(['restore',`--source=${pin}`,'--worktree','--',file]);repaired++;}
const html=fs.readFileSync(`studies/${stem}.html`,'utf8');
if(!html.includes('class="data-tile"')||(html.match(/<article class="comparison"/g)||[]).length!==22){execFileSync(process.execPath,[`studies/${stem}/build.mjs`],{stdio:'inherit'});repaired++;}
execFileSync(process.execPath,['.github/scripts/verify-hannah-study.mjs','--complete'],{stdio:'inherit'});
execFileSync(process.platform==='win32'?'python':'python3',['.github/scripts/hannah-channel-build.py'],{stdio:'inherit'});
console.log(`Hannah recovery checked ${expected.length} files, repaired ${repaired}, and refreshed channel markers.`);
