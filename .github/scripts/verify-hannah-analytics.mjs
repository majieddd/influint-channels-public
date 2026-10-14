import fs from 'node:fs';
import crypto from 'node:crypto';
const cid='UC1STjuGMAzbdmv0YRyAkl1w';
const source=JSON.parse(fs.readFileSync('channels/hannah-analytics-source-2026-10.json'));
const model=JSON.parse(fs.readFileSync('channels/hannah-analytics-dashboard.json'));
const html=fs.readFileSync(`channels/${cid}.html`,'utf8');
const page=JSON.parse(html.match(/window\.__DASH__=(.*?);?<\/script>/s)[1].replace(/;$/,''));
function check(ok,n){if(!ok)throw new Error(n);}
check(source.confirmed&&model.channelId===cid,'Confirmed Studio source and channel');
check(source.pulledAt==='2026-10-13'&&source.dataThrough==='2026-10-12','Exact capture and data-through dates');
check(model.daily.length===730&&new Set(model.daily.map(x=>x.d)).size===730,'730 unique daily rows');
check(model.daily.every(x=>x.i!=null&&x.c!=null&&x.p!=null&&x.q==null),'Measured dimensions without stale fitted scores');
for(const [days,views] of [[7,408345],[28,1322867],[90,2734769],[365,8406026]]){const w=model.windows.find(x=>x.days===days);check(w?.metrics.views===views&&w.prior.metrics.views>0,`Captured ${days}-day totals and comparison`);check(w.dailyMismatch===null,`Daily sums ${days}`);}
const newer=[page.dataThrough,page.pulledAt].join('|')>[model.dataThrough,model.pulledAt].join('|');
check((process.argv.includes('--allow-newer')&&newer)||page.dataThrough===model.dataThrough,'Current or newer embedded dashboard');
if(!newer){check(page.daily.length===730&&page.windows.find(x=>x.days===28).metrics.ctr===0.0529,'Embedded fresh model');check(html.includes('hannah-analytics-overlay.js'),'Interactive overlay');}
for(const s of source.sources){if(!s.file)continue;const p='channels/'+s.file;check(fs.existsSync(p),`Export ${p}`);if(s.sha256)check(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')===s.sha256,`Export checksum ${p}`);}
const traffic=source.trafficEvidence.find(x=>x.id==='channel-paid-28');check(traffic.advertisingViews===426479&&traffic.organicViews===896369&&traffic.unclassifiedViews===19,'Measured paid/organic breakdown');
check(html.includes('78.6% from YouTube advertising')&&!html.includes('The A-frame makeover is the clearest new signal'),'Paid distribution correction');
check(html.includes('data-hannah-repackaging="2026-10"'),'Repackaging cross-link preserved');
console.log('Verified four current/prior Studio windows, 730 daily dates, exact CSV checksums, paid-traffic context and embedded dashboard.');
