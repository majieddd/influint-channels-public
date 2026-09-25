#!/usr/bin/env node
// Source and builder live under .github, which the daily publisher preserves.
// Rebuild the study and restore its entry points before every Pages deployment.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildModel} from './webinar-model.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const data=JSON.parse(readFileSync(resolve(root,'.github/studies/webinar-2026-09/evidence.json'),'utf8'));
const model=buildModel(data);
const template=readFileSync(resolve(root,'.github/studies/webinar-2026-09/template.html'),'utf8');
const out='studies/webinar-questions-2026-09.html';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>n.toLocaleString('en-US');
const fmt=n=>n===null?'Not observed':n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+'×';
const group=id=>model.groups.find(g=>g.id===id);
const sourceLink=name=>{const c=data.channels.find(c=>c.name===name);return `<a href="../${c.source}">${esc(name)}</a>`;};
function question(i){const q=data.questions[i];return `<details class="original"><summary>Original question · ${esc(q.channel)} · sheet row ${q.row}</summary><blockquote>${esc(q.question)}</blockquote><a href="${esc(data.sheetUrl)}">Open the source sheet</a></details>`;}
function table(ids){return `<div class="table-wrap"><table class="comparison"><caption>Median published outlier score by title family. 1.00× is the upload’s local channel baseline.</caption><thead><tr><th scope="col">Channel / title family</th><th scope="col">Median score</th><th scope="col">Matching uploads</th></tr></thead><tbody>${ids.map(id=>{const g=group(id),v=g.year;return `<tr data-group="${g.id}"><th scope="row">${sourceLink(g.channel)}<span>${esc(g.label)}</span></th><td class="score">${fmt(v.median)}</td><td class="sample">${v.n===0?'No matches':num(v.n)+(v.n<5?' · small sample':'')}</td></tr>`;}).join('')}</tbody></table></div>`;}
function examples(ids){return `<div class="examples">${ids.map(id=>{
const {channel}=group(id),v=group(id).examples[0];return `<article class="example"><a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener"><img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy" width="320" height="180"><h4>${esc(v.title)}</h4></a><p>${esc(channel)} · ${v.published}</p><p><strong>${fmt(v.score)}</strong> · ${num(v.views)} lifetime views</p><small>Highest scored match in the stored catalogue; selected by code. This illustrates the upper end, not a typical result.</small></article>`;}).join('')}</div>`;}
const gonz=data.channels.find(c=>c.name==='Gonz');
const paralives=gonz.videos.filter(v=>/paralives/i.test(v.title)).toSorted((a,b)=>b.score-a.score)[0];
const values={
 DATE:data.asOf,QUESTION_COUNT:model.questions,TOTAL_VIDEOS:num(model.totalVideos),CHANNEL_COUNT:data.channels.length,
 Q1:question(0),Q2:question(1),Q3:question(2),Q4:question(3),Q5:question(4),
 GRYPHI_TABLE:table(['gryphi-buy','gryphi-family','gryphi-tiny','gryphi-apartment','gryphi-trailer','gryphi-small']),
 GONZ_TABLE:table(['gonz-family','gonz-lore','gonz-compilation']),
 NARD_TABLE:table(['nard-howto','nard-buy','nard-challenge']),
 PEER_TABLE:table(['spring-buy','spring-howto','spring-trailer']),
 GRYPHI_EXAMPLES:examples(['gryphi-buy','gryphi-family']),
 NARD_EXAMPLES:examples(['nard-howto']),
 GRYPHI_BUY_YEAR:fmt(group('gryphi-buy').year.median),GRYPHI_BUY_N:group('gryphi-buy').year.n,
 GRYPHI_FAMILY_YEAR:fmt(group('gryphi-family').year.median),GRYPHI_FAMILY_N:group('gryphi-family').year.n,
 GRYPHI_SMALL:fmt(group('gryphi-small').all.median),GRYPHI_SMALL_N:group('gryphi-small').all.n,
 GONZ_FAMILY:fmt(group('gonz-family').all.median),GONZ_FAMILY_N:group('gonz-family').all.n,
 PARALIVES_TITLE:esc(paralives.title),PARALIVES_SCORE:fmt(paralives.score),PARALIVES_VIEWS:num(paralives.views),PARALIVES_ID:paralives.id,
 NARD_HOWTO:fmt(group('nard-howto').all.median),NARD_HOWTO_N:group('nard-howto').all.n,NARD_RECENT:fmt(group('nard-howto').recent.median),NARD_RECENT_N:group('nard-howto').recent.n,
 SPONSOR_HELD:model.sponsor.held,SPONSOR_N:model.sponsor.n,TITLE_HELD:model.titleLength.held,TITLE_N:model.titleLength.n,
 TITLE_DOTS:model.titleLength.rows.map(r=>`<span class="dot ${r.held?'held':'outside'}" title="${r.held?'Within':'Outside'} the practical-effect threshold">${r.held?'✓':'×'}</span>`).join(''),
 SPONSOR_DOTS:model.sponsor.rows.map(r=>`<span class="dot ${r.held?'held':'outside'}" title="${r.held?'Predicted direction held':'Did not hold'}">${r.held?'✓':'×'}</span>`).join(''),
 COVERAGE:model.channels.map(c=>`<tr><th scope="row">${sourceLink(c.name)}</th><td>${num(c.count)}</td><td>${c.from} to ${c.to}</td><td>${c.updated}</td></tr>`).join(''),
 CLAIMS:data.claims.map(c=>`<li><a href="../${c.page}">${esc(c.standing)} · <code>${c.id}</code></a><p>${esc(c.id==='ee66537ecd72'?'Title-length practical-effect test. This study uses the latest independent-channel plot, not the older counts in the claim sentence.':c.id==='b7150b575c17'?'Sponsor-callout test. The published caveat says the result cannot be separated from chance; flagged moments are selected on the outcome.':c.headline)}</p></li>`).join(''),
 COMMIT:data.publicCommit,
 MODEL_JSON:JSON.stringify(model).replace(/</g,'\\u003c'),
 SHEET_URL:esc(data.sheetUrl),
};
let html=template.replace(/\{\{([A-Z0-9_]+)\}\}/g,(_,key)=>{
 if(!(key in values))throw Error('Unknown template field '+key);
 return String(values[key]);
});
if(/\{\{[A-Z0-9_]+\}\}/.test(html))throw Error('Unrendered field');
mkdirSync(resolve(root,'studies'),{recursive:true});
writeFileSync(resolve(root,out),html);
writeFileSync(resolve(root,'studies/webinar-questions-2026-09-data.json'),JSON.stringify({source:data,results:model},null,2)+'\n');

const marker='webinar-questions-2026-09';
function patchPage(file,make){
 const path=resolve(root,file),before=readFileSync(path,'utf8');
 const clean=before.replace(new RegExp(`<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->\\n?`,'g'),'');
 const after=make(clean);
 if(after===clean)throw Error('Study insertion point missing: '+file);
 writeFileSync(path,after);
}
const marked=s=>`<!-- ${marker}:start -->${s}<!-- ${marker}:end -->\n`;
patchPage('index.html',s=>s.replace(/(<li>\s*<a href="reports\/views-change\.html">[\s\S]*?<\/li>)/,
 '$1'+marked(`\n<li><a href="${out}">New study: the webinar questions</a> — ${model.questions} answers on Sims content, niche expansion, sponsors, algorithm beliefs and Shorts to long-form. Based on ${num(model.totalVideos)} public uploads, with limits and next tests. <small>25 September 2026</small></li>`)));
patchPage('intelligence.html',s=>s.replace(/(<h2[^>]*>How far the evidence reaches<\/h2>)/,
 marked(`<aside aria-label="New study" style="background:var(--panel);border:1px solid var(--teal);border-radius:12px;padding:24px;margin:24px 0;max-width:100%"><p style="font-size:12px;color:var(--teal);letter-spacing:.12em;text-transform:uppercase;margin:0 0 8px">New study · 25 September 2026</p><a href="${out}" style="font-size:clamp(20px,3vw,28px);font-weight:600;line-height:1.3">The webinar questions</a><p style="color:var(--grey);max-width:70ch">${model.questions} answers on Sims content, niche expansion, sponsor retention, algorithm beliefs and Shorts to long-form, grounded in the Intelligence record.</p><a href="${out}">Read the study →</a></aside>`)+'$1'));
console.log(JSON.stringify({study:out,questions:model.questions,publicVideos:model.totalVideos,entryPoints:['index.html','intelligence.html']}));
