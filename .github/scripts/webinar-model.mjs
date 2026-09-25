// All study figures are computed from a frozen, already-published snapshot.
export const median = values => {
  const a=values.filter(Number.isFinite).sort((a,b)=>a-b);
  if(!a.length)return null;
  const m=Math.floor(a.length/2);
  return a.length%2 ? a[m] : Math.round((a[m-1]+a[m])*500000)/1000000;
};
export const definitions = [
  ['gryphi-buy','Gryphi','Build & buy','build\\s*(?:&|and|\\+)\\s*buy'],
  ['gryphi-family','Gryphi','Family homes','family home'],
  ['gryphi-apartment','Gryphi','Apartments','apartment'],
  ['gryphi-tiny','Gryphi','Tiny houses / homes','tiny (?:house|home)'],
  ['gryphi-trailer','Gryphi','Trailer reactions','trailer.*reaction|reaction.*trailer'],
  ['gryphi-small','Gryphi','Small Spaces','small spaces'],
  ['gonz-family','Gonz','Complete family histories','complete history.*family'],
  ['gonz-compilation','Gonz','Lore compilations','lore compilation'],
  ['gonz-lore','Gonz','Complete lore','complete lore'],
  ['nard-howto','Nardvillain','How-to videos','how to'],
  ['nard-ranking','Nardvillain','Rankings','ranking'],
  ['nard-buy','Nardvillain','Should you buy?','should you buy'],
  ['nard-challenge','Nardvillain','Timed build challenges','minute build challenge'],
  ['spring-buy','SpringSims','Build & buy','build\\s*(?:&|and|\\+)\\s*buy'],
  ['spring-howto','SpringSims','How-to videos','how to'],
  ['spring-trailer','SpringSims','Trailer reactions','trailer.*reaction|reaction.*trailer'],
];
const summarize = videos => ({n:videos.length,scored:videos.filter(v=>Number.isFinite(v.score)).length,median:median(videos.map(v=>v.score)),medianViews:median(videos.map(v=>v.views))});
export function buildModel(data){
  const groups=definitions.map(([id,channel,label,pattern])=>{
    const c=data.channels.find(c=>c.name===channel);
    if(!c)throw Error('Missing channel: '+channel);
    const matches=v=>new RegExp(pattern,'i').test(v.title);
    const all=c.videos.filter(matches);
    const recent=c.videos.toSorted((a,b)=>b.published.localeCompare(a.published)).slice(0,40).filter(matches);
    const year=c.videos.filter(v=>v.published>='2025-09-25' && v.published<=data.asOf).filter(matches);
    return {id,channel,label,pattern,all:summarize(all),recent:summarize(recent),year:summarize(year),members:all.map(v=>v.id),examples:all.filter(v=>Number.isFinite(v.score)).toSorted((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,3)};
  });
  const readings = id => {
    const c=data.claims.find(c=>c.id===id), rows=c.latestIndependentReadings;
    return {id,standing:c.standing,n:rows.length,held:rows.filter(r=>r.held).length,rows};
  };
  return {asOf:data.asOf,totalVideos:data.channels.reduce((n,c)=>n+c.videos.length,0),questions:data.questions.length,groups,sponsor:readings('b7150b575c17'),titleLength:readings('ee66537ecd72'),channels:data.channels.map(c=>({name:c.name,id:c.id,count:c.videos.length,updated:c.updated,from:c.videos.map(v=>v.published).sort()[0],to:c.videos.map(v=>v.published).sort().at(-1),recentMedian:median(c.videos.toSorted((a,b)=>b.published.localeCompare(a.published)).slice(0,40).map(v=>v.score))}))};
}
