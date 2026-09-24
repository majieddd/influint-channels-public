import json,re,statistics,datetime,shutil
from pathlib import Path
from bs4 import BeautifulSoup
BASE=Path(__file__).resolve().parent; REPO=BASE.parents[2]
SLUG='UCVhGR9TU1vfvHXl73uaEiEQ-irl-ideation-2026-09'; ASSET=REPO/'studies'/SLUG
def read(p):return json.loads(p.read_text(encoding='utf8'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
original=read(ASSET/'ideas-original-2026-09-10.json')
pool={e['video_id']:{**e,'source_kind':'original study','snapshot':'2026-09-10'} for e in read(BASE/'research/evidence-pool.json')}
channels={'UCCbsKLn-kAJR6b_dXtfJj2Q':'Cash Marco','UCgmU4jG1sSkpqfZ7h9_gDWA':'Nico Polo','UCVhGR9TU1vfvHXl73uaEiEQ':'Nizarisaqt','UCvEtdkmA1aR9Tt7iXIiQXbw':'MoreNizarisaqt','UCaQk0pF6pxjOe2_gSHQbiMw':'Kat','UCoYsNzzRP22LD2SR_J539KQ':'KFoltyn','UCCOS1615-iFu1IklsIhRI8A':'Lana Rae'}
adjacent={'UC6-bcpbLEBasvGEhD0VudjA':'ProjectSupreme Vlogs','UCbp9MyKCTEww4CxEzc_Tp0Q':'Stokes Twins','UCJmEIoi4fH50MWPNANc4AJg':'Caylus IRL','UCNGiT6OlFTQz9Fppa1tNZ3Q':'Jessica Bravura','UCwIWAbIeu0xI0ReKWOcw3eg':'Unspeakable','UCXg4rJUbDP1IP3TmZ9KDpJg':'Brianna'}
channels.update(adjacent)
for cid,name in channels.items():
 soup=BeautifulSoup((REPO/'channels'/(cid+'.html')).read_text(encoding='utf8'),'html.parser')
 lede=soup.select_one('.lede');lede_text=lede.get_text(' ',strip=True).lower() if lede else ''
 public_basis='source-reported lifetime-view lift; nearby-upload baseline' if 'nearest neighb' in lede_text else 'source-reported lifetime-view lift; recent-catalogue baseline per source notes'
 for el in soup.select('#wall .v'):
  im=el.select_one('img');t=el.select_one('.t')
  if not im or not t:continue
  m=re.search(r'/vi/([^/]+)/',im.get('src',''))
  if not m:continue
  vid=m[1];score=el.get('data-out');views=el.get('data-views');published=el.get('data-pub')
  if score in ['null','None','NaN']:score=None
  pool[vid]={'video_id':vid,'title':t.get_text(' ',strip=True),'channel':name,'channel_id':cid,'url':'https://www.youtube.com/watch?v='+vid,'thumbnail':im['src'],'lift':float(score) if score else None,'views_lifetime':int(float(views)) if views and cid!='UCvEtdkmA1aR9Tt7iXIiQXbw' else None,'source_views':int(float(views)) if views else None,'published':datetime.datetime.fromtimestamp(int(published)/1000,datetime.timezone.utc).date().isoformat() if published else 'Not recorded','basis':'first-28-day views / nearby-upload median' if cid=='UCvEtdkmA1aR9Tt7iXIiQXbw' else public_basis,'source_kind':'channel catalogue','snapshot':'2026-09-24 repository snapshot','source_page':'../channels/'+cid+'.html'}
for e in pool.values():
 e['relevance']='Adjacent IRL challenge audience; transfer to Niz is untested.' if e.get('channel_id') in adjacent else 'Core gaming/creator reference set.'
write(BASE/'research/expanded-evidence-pool.json',list(pool.values()))

# Queries are deliberately literal: a related ingredient is not proof of an exact title shape.
shape_rules=[([1,94],r'day in (?:my|the) life'),([2,5,6,7,49],r'\bi met\b.*real life'),([3],r'(apartment|house|room|setup).{0,18}tour'),([4],r'(read|reading).{0,24}(mean|hate).{0,15}comment'),([8],r'who knows.{0,25}better'),([9],r'never have i ever'),([10],r'more likely'),([11,14,15,18,20,39,89,96],r'(in real life|real.life)'),([12],r'would you rather.*tower'),([13],r'(vs|versus).*real.life'),([16],r'guess.*countr'),([17,46,76],r'\bguess\b'),([19,87],r'hide.{0,7}seek'),([21,23,25],r'eating only'),([22,29,55],r'(every ?time|if).{0,30}(die|lose)'),([24],r'blind.{0,12}deaf.{0,12}mute'),([26],r'(cooking|pancake art).*challenge'),([27],r'bean.?boozled'),([28],r'spiciest.{0,12}sourest'),([30],r'(cooking|food).{0,25}vs|vs.{0,25}(food|cooking)'),([31],r'liv(?:e|ing|ed).*(car|tesla|porsche)'),([32],r'sleepover'),([33],r'control.{0,25}(life|me)'),([34],r'saying yes'),([35],r'(speak|speaking).*language|speaking only'),([36,64,67,69,97],r'\$[\d,]+\s*vs\.?\s*\$'),([37],r'(hours|day) without'),([38],r'(hid|hiding) in.*(room|house)'),([40],r'buying.*one colou?r'),([41,60],r'(surpris|built).*(setup|dream|fan|crush)'),([42],r'(rates?|rating).*(video|thumbnail)'),([43,93],r'teaching.*(play|arabic)'),([44],r'(vs\.?|against).*(brother|sibling)'),([45,88],r'prank|trolling'),([47],r'(giving|gave).*credit card'),([48],r'(runs?.*channel|became.*assistant)'),([50,51],r'reacting to'),([52],r'(viewers|subscriber).*(rooms|setups)'),([53],r'vidcon|recognized in public'),([54,59],r'(testing|challeng).*(kids|subscribers|fans)'),([56,63],r'unboxing|open.*squish'),([57],r'(hired|hiring).*editor'),([58],r'googles himself'),([61],r'(banned|cursed).*amazon'),([62],r'every.*(youtuber|creator).*product'),([65],r'spending'),([66],r'how much.*(make|money)'),([68],r'(testing|magic|viral).*products?|gadgets'),([70],r'fake.*real|knockoff'),([71],r'whisper challenge'),([72],r'spelling bee'),([73],r'wrong box'),([74],r'(laugh.*lose|try not to laugh)'),([75],r'truth or dare|dares'),([77],r'boys vs girls'),([78],r'(rating|ranking).*lookalikes|avatars'),([79],r'pain comparison'),([80],r'crush|girlfriend'),([81],r'3\s*am|evil mm2'),([82],r'home alone'),([83],r'overnight'),([84],r'escape'),([85],r'(test|tested).*myth'),([86],r'(darkness|stopped blinking)'),([90],r'recreat.*real life'),([91],r'(flying|went|travel).*japan|flying.*morocco'),([92,99],r'(trying|tried|ate|eating).*every.*(countr|candy|food)|countr.*food'),([95],r'(games|players).*every countr'),([98],r'family.*tournament|eid'),([100],r'first job|high school|before youtube')]
ingredient_rules=[([1,3,48,66,94,100],r'day in.*life|setup|first job|high school|make.*money|assistant'),([2,8,10,27,32,39,71,73,75,79,80,83,93],r'(rex|friend|shady|crush|zoey)'),([4,42,45,47,49,55,78,98],r'brother|family|mean comment|hate comment|expose'),([5],r'(cash|nico)'),([6],r'lana'),([7],r'foltyn'),([9,53,54,57,59,76,77,95],r'youtuber|creator|subscriber|fans|vidcon|guess|met.*real life'),([11,19,20,22,37,43,65,81,84,85,87,88,90],r'mm2|murder mystery|locust'),([12,17,46],r'guess|would you rather|simon says'),([13,21,23,24,25,26,28,29,30,44,56,61,62,63,68,70,92,99],r'food|candy|cooking|snack|mukbang|squish|amazon|product|toy|gum|bean booz'),([14],r'obby|escape'),([15],r'steal a brainrot'),([16],r'countr|flag'),([18],r'animal hospital'),([31,96],r'tesla|porsche|car\b|road trip|dusty|lamborghini'),([33,34],r'control|saying yes'),([35],r'language|arabic|countr'),([36,97],r'hotel|first class|economy'),([38],r'prank|brother|hide|hiding'),([40,41,52,60,64],r'setup|rooms|one color|pc\b'),([50,51,58,74],r'reacting|tiktok|laugh|googles'),([67],r'avatar|dress to impress'),([69],r'surpris|gift|credit card'),([72],r'brainrot|spelling'),([82,86],r'home alone|3am|dark|scary|horror'),([89],r'night.?shift|shawarma'),([91],r'countr|japan|morocco')]
def regex_for(id,rules):return next((r for ids,r in rules if id in ids),r'(?!)')
def select(pattern,limit=4):
 matches=[e for e in pool.values() if re.search(pattern,e['title'],re.I)]
 matches.sort(key=lambda e:(e['lift'] or 0),reverse=True)
 chosen=[];seen=set()
 for e in matches:
  if e['channel'] not in seen:chosen.append(e);seen.add(e['channel'])
  if len(chosen)>=limit:break
 if len(chosen)<limit:
  for e in matches:
   if e not in chosen:chosen.append(e)
   if len(chosen)>=limit:break
 return chosen

# Incremental cash, USD planning allowances. All line items are additive.
profiles={
 'home':{'name':'Home, family and creator routine','days':'0.5–1 shoot day','crew':'Niz + family/guest already local','lines':[['Food / local errands',20,60],['Specific props or prints',0,40]],'value':'Character development and repeatable access; low spend leaves room to test many hooks.'},
 'party':{'name':'Crew games and quizzes','days':'0.5 shoot day; batch 2 episodes','crew':'Niz + 2–4 local guests','lines':[['Food / local transport',40,100],['Cards, boxes or game materials',20,100],['Agreed prize / forfeits',0,100]],'value':'Several self-contained rounds create both a full episode and Shorts.'},
 'food':{'name':'Food comparisons and constraints','days':'1 shoot day; some formats span 24h','crew':'Niz + brother or local guest','lines':[['Food / small tasting portions',60,200],['Delivery / local transport',20,70],['Extra ingredients / replacement attempt',10,50]],'value':'Visible reactions and a ranking board supply repeated payoffs without a location change.'},
 'build':{'name':'Backyard games and physical recreations','days':'1 prep day + 1 shoot day','crew':'Niz + 2–4 players; one helper','lines':[['Reusable set materials',100,350],['Harmless game props',50,150],['Food / local transport',50,100],['Helper allowance',100,250]],'value':'One reusable playing space supports multiple formats and Shorts.'},
 'meet-local':{'name':'Local creator collaboration','days':'0.5–1 shoot day','crew':'Niz + collaborator; no assumed appearance fee','lines':[['Local transport',30,100],['Food / activity',50,180],['Challenge materials',20,80]],'value':'Introduces a familiar creator through a concrete shared activity.'},
 'domestic':{'name':'Domestic meetup or convention trip','days':'2 nights / 3 days; 2 travelers','crew':'Niz + one production companion; one shared room','lines':[['2 return flights at $250–600',500,1200],['Shared room: 2 nights at $140–250',280,500],['Ground transport',100,250],['2 people: meals for 3 days',180,300],['Event passes / activity access',200,500]],'value':'Batch a meetup episode, a challenge and several Shorts to spread fixed travel cost.'},
 'overnight':{'name':'Local overnight or parked-car challenge','days':'1 night / 24h elapsed','crew':'Niz + one local guest/helper','lines':[['Food / supplies',50,120],['Site or parking allowance',0,100],['Local travel',20,70]],'value':'Time passing creates natural chapters; only retain changes that affect the challenge.'},
 'hotel':{'name':'Budget-versus-premium hotel comparison','days':'2 stays; 2 travelers locally','crew':'Niz + companion','lines':[['Budget stay allowance; $1 title requires a documented subsidy',100,250],['Premium stay matching the advertised $10,000',10000,10000],['Transport / meals',100,300]],'value':'Matched tests make the contrast visible. A lower-cost pilot can use a $700–2,000 premium room, but must change the title and thumbnail to the actual paid prices.'},
 'setup':{'name':'Gaming setup upgrade or gift','days':'0.5 prep + 1 shoot day','crew':'Niz + recipient','lines':[['Actual gift / parts allowance',500,1500],['Delivery / local transport',30,100],['Installation consumables',20,60]],'value':'The before-and-after and recipient payoff carry the episode; choose parts around a specific need.'},
 'product':{'name':'Products, gadgets, toys or cosplay','days':'0.5 prep + 1 shoot day','crew':'Niz + optional local guest','lines':[['Scoped product basket',150,500],['Shipping / travel',25,100],['Testing consumables',20,80]],'value':'Order a small, deliberate range with different testable claims; a large pile alone is not a story.'},
 'prize':{'name':'$1,000 house competition','days':'1 prep + 1 shoot day','crew':'Niz + 3–5 local players','lines':[['Actual advertised prize',1000,1000],['Props / set resets',50,150],['Food / transport',75,200]],'value':'A clear contest and actual payout make the stakes understandable.'},
 'location':{'name':'Vet, shop or booked escape-room access','days':'1 coordinated shoot day','crew':'Niz + location staff / one companion','lines':[['Access / activity / thank-you allowance',100,400],['Local transport',30,100],['Food / cleaning / task materials',30,100]],'value':'A real task and a professional correcting Niz create the progression; confirm filming access before scheduling.'},
 'editor':{'name':'Paid subscriber editing challenge','days':'0.5 filming day + edit turnaround','crew':'Niz + paid editor','lines':[['Editor fee for scoped trial',150,400],['Licensed assets / agreed extras',0,50]],'value':'The before-and-after is the reveal; use the same source footage for a fair comparison.'},
 'morocco':{'name':'Morocco identity trip','days':'5 nights / 6 days; 2 travelers','crew':'Niz + one companion; assumed US departure, one room','lines':[['2 return flights at $800–1,400',1600,2800],['Shared room: 5 nights at $70–150',350,750],['Ground transport / local guide',250,600],['2 people: meals for 6 days',240,480],['Activities / access',100,300]],'value':'Build the trip around specific personal stories and film several distinct episodes; fares depend on origin and dates.'},
 'road':{'name':'Budget-car road trip','days':'2 days / 1 night; 2 travelers','crew':'Niz + companion; inspected roadworthy car','lines':[['Advertised vehicle purchase',500,500],['Inspection / registration / repair reserve',500,1500],['Fuel / roadside contingency',150,300],['Hotel / food',200,400]],'value':'The purchase price is only one line item; set an actual viable route and reserve for repairs.'},
 'flight':{'name':'Economy versus premium flight','days':'2 travelers / 2 nights; same destination','crew':'Niz + companion; compare clearly specified cabin products','lines':[['Economy return fare allowance',300,700],['Premium return fare allowance',1200,4000],['Shared room: 2 nights',280,500],['Ground transport / meals',250,500],['Meetup / activity',100,300]],'value':'Only book premium travel if the cabin comparison is the story; a meetup alone rarely needs it.'},
 'premium':{'name':'Explicit $1,000 product / gift comparison','days':'0.5 prep + 1 shoot day','crew':'Niz + brother','lines':[['Premium side actual spend',1000,1000],['Budget side ($1–100 per final concept)',1,100],['Delivery / consumables',30,100]],'value':'Use real receipts and consistent tasks; disclose borrowed items and revise the title if spend differs.'}
}
profile_assign={'party':[8,9,10,17,20,27,46,59,71,72,73,74,75,76,77,78,79,80,95,98],'food':[13,16,21,22,23,24,25,26,28,29,30,44,92,99],'build':[11,14,15,90],'meet-local':[2,5,6,7,54],'domestic':[53],'overnight':[31,32,33,34,35,37,38,39,45,81,82,85,86,88,93],'hotel':[36],'setup':[41,52,60],'product':[40,56,61,62,63,65,68,70],'prize':[19,87],'location':[18,83,84,89],'editor':[57],'morocco':[91],'road':[96],'flight':[97],'premium':[47,64,67,69]}
for key,p in profiles.items():p.update({'id':key,'low':sum(r[1] for r in p['lines']),'high':sum(r[2] for r in p['lines'])})
editorial={}
for line in (BASE/'idea-editorial.tsv').read_text(encoding='utf8').splitlines():
 n,summary,shape,ingredients,a,b,c=line.split('|');editorial[int(n)]={'summary':summary,'title_shape':shape,'ingredients':ingredients,'intro':[a,b,c]}
plans={p['id']:p for p in read(BASE/'image-plan.json')}
ideas=[]
for old in original['ideas']:
 i={**old,**editorial[old['id']]};i['evidence']=list({e['video_id']:e for e in old['evidence']}.values())
 specific_ingredients={13:r'mukbang',21:r'sour|candy',22:r'mm2.*(eat|snack)|food',23:r'one colou?r',24:r'cooking|pancake',25:r'gas station|fast food|drive thru',26:r'cooking|pancake',27:r'bean.?booz|candy',28:r'spic|sour',29:r'countr.*food|food.*countr',30:r'cooking|countr.*food',44:r'soccer|brother|sour candy',56:r'toy|squish|unbox',61:r'amazon',62:r'youtuber.*product',63:r'toy|squish|unbox',68:r'gadgets|magic products|amazon',70:r'merch|product',92:r'candy|countr.*food',99:r'mcdonald|fast food|countr.*food',67:r'avatar|cosplay|dress to impress',98:r'family|brother',94:r'ramadan|fasting|day in.*life',100:r'first job|high school|before youtube'}
 specific_shapes={14:r'i built|building.*(obby|course)',15:r'brainrot.*real life|real life.*brainrot',18:r'animal hospital.*real life',20:r'simon says',39:r'surviving.*nights|overnight',89:r'working.*night.?shift|work.*shawarma',96:r'road trip|dusty trip',11:r'(mm2|murder mystery).*real life|minecraft school',90:r'recreat|reacting.*mm2 clips'}
 i['shape_evidence']=select(specific_shapes.get(i['id'],regex_for(i['id'],shape_rules)));i['ingredient_evidence']=select(specific_ingredients.get(i['id'],regex_for(i['id'],ingredient_rules)))
 i['shape_scope']='Related format family; the exact proposed adaptation has not been tested.'
 i['ingredient_scope']='Evidence for individual ingredients, not the full combination or all named cast.'
 i['coverage']={k:len({e['channel'] for e in i[k+'_evidence'] if (e['lift'] or 0)>=2}) for k in ['shape','ingredient']}
 i['production_profile']=next((k for k,ids in profile_assign.items() if i['id'] in ids),'home')
 i['reference']={k:v for k,v in plans[i['id']].items() if k!='reference'}
 i['reference'].pop('reference',None)
 i['spend_note']=('Specific trader fee / item price is not established; obtain terms before budgeting.' if i['id']==65 else 'Any guest travel is additional; use the domestic-trip budget if they are not already local.' if i['id'] in [2,5,6,7,54,95] else 'Importing food differs from traveling for it; add the relevant trip budget if filming abroad.' if i['id'] in [92,99] else '')
 ideas.append(i)

# Retain measured curve points, annotations and source links. Proposed edit is separately authored.
cases=read(BASE/'research/retention-cases.json')
edits={'pDlG2tmh0LY':{233:'Test removing the scream transition and show the choice result before the next matchup.',380:'Keep the solve visually legible; test a short pause on the completed puzzle.',405:'Try another concise, decisive verdict early, but check that it earns the same response.',411:'Cut the scenery aside and move directly from the verdict into the next question.'},'HCxlYaQT700':{545:'Review this full question-to-answer transition; preserve the answer and remove repeated explanation.'},'eu_7OyP4dd4':{461:'Test moving the like/subscribe interruption after the next meaningful payoff.'},'ceLlgiGLyYw':{629:'Condense the shop/menu sequence to the purchase and its visible consequence.',955:'Replace a grind admission with a short progress jump and a new target.'},'olRuWh8AFWM':{409:'Show the unlocked result clearly before introducing the next objective.',416:'Tighten the post-unlock transition without removing the reward itself.'}}
for v in cases:
 v['source_page']='../channels/UCvEtdkmA1aR9Tt7iXIiQXbw/'+v['videoId']+'.html'
 v['sample_seconds']=round(v['durationSec']/100,2)
 for m in v['moments']:
  m['proposed_edit']=edits.get(v['videoId'],{}).get(m['sec'], 'Review the surrounding setup and payoff; test keeping the result visible and shortening the reset.' if m['kind']=='peak' else 'Inspect the surrounding 15 seconds for a spent question, repetition or unclear action; test one shorter transition.')
  m.pop('source_detail',None)
  for key in ['what','annotation','proposed_edit']:
   if isinstance(m.get(key),str):m[key]=m[key].replace('—',': ')
cases.sort(key=lambda v:(v['videoId']!='pDlG2tmh0LY',-v['pub']))

shorts=read(BASE/'research/shorts-summary.json')
for s in shorts:
 m=re.search(r', ([\d.]+) (thousand|million) views',s['label']);s['views_rounded']=float(m[1])*(1e6 if m[2]=='million' else 1e3) if m else None
 s['title']=s['metadata']['primaryText']['content'];s.pop('metadata',None)
 s['url']='https://www.youtube.com/shorts/'+s['id']
medians={c:statistics.median(s['views_rounded'] for s in shorts if s['channel']==c and s['views_rounded']) for c in set(s['channel'] for s in shorts)}
for s in shorts:s['visible_sample_ratio']=round(s['views_rounded']/medians[s['channel']],2) if s['views_rounded'] else None
short_formats=[
 {'name':'Game mechanic performed in real life','ids':['dMLupx0vcXk','eYc967cAI5M','FTsIilUEwpw'],'hook':'Show the recognizable game action in a real room before explaining it.','niz':'One Steal a Brainrot raid in the brother’s room; the guard turns around at the worst time.','production':'$20–100 incremental; 1–2 people, 30–60 minutes, one recognizable prop.','beats':'0–2s: recognizable action. 2–12s: the real-world obstacle. 12–25s: outcome and a visual callback.','ideas':[15,90]},
 {'name':'Creator contest with a single measurable result','ids':['oD7jYbeRAio','3MYrVkdHKno'],'hook':'Put both contestants and the scoring device in the first frame.','niz':'Niz versus brother: one penalty kick each, one visible score.','production':'$0–60 if already together; 2–3 people, 20–40 minutes. Venue access is extra.','beats':'0–2s: question and contestants. 2–15s: attempts. 15–25s: result and reaction.','ideas':[44,77]},
 {'name':'Recognizable game food, real taste test','ids':['JOk5Yl4oQt4'],'hook':'Match the food to its game reference before the first bite.','niz':'One Roblox food beside its real version, then brother guesses which tastes better.','production':'$10–40 per food; 1–2 people, 20–30 minutes; batch on a food-episode day.','beats':'0–2s: matched pair. 2–10s: first bite. 10–20s: verdict and mismatch.','ideas':[13,21,29]},
 {'name':'One question viewers can answer first','ids':['QVXbQZQ3xuU','L3VrTPAMznw','_PXKVA7vFIU'],'hook':'Present two choices or a clue immediately and allow a short answer window.','niz':'Guess the country from one real snack; reveal the flag only after both brothers commit.','production':'$0–25; 1–2 people, 10–20 minutes per clip; use existing quiz materials.','beats':'0–2s: question. 2–8s: guess window. 8–18s: answer plus a specific reaction.','ideas':[12,16,46,76]},
 {'name':'Online friend becomes an in-person reveal','ids':['YW5_mXL3TPo'],'hook':'Show the familiar voice or avatar immediately before the real person enters.','niz':'Rex finishes a familiar line, then the door opens to the first shared real-life frame.','production':'$0–30 incremental when together; 10–20 minutes. Travel uses the full meetup budget.','beats':'0–3s: recognition clue. 3–12s: approach. 12–25s: meeting and one shared action.','ideas':[2,5,6,7]},
 {'name':'Physical character transformation / recurring sketch','ids':['JngDkN_8JsU','HgKxc-TXCis','YuwYzHH-VMA'],'hook':'Make the character recognizable with one costume silhouette and one action.','niz':'A budget MM2 avatar costume tries to perform its game behavior in the kitchen.','production':'$30–150 one-time costume; $0–20 for later clips; 1–3 people, 1–2 hours.','beats':'0–2s: character cue. 2–15s: ordinary problem. 15–30s: character-specific punchline.','ideas':[67,89,90]},
 {'name':'A single unexpected gameplay payoff','ids':['ePIT1bUgIR8','GnPGD5lu77M','5-NUM7EQ1SY'],'hook':'Show the valuable target or looming failure before the action lands.','niz':'Use an earned twist from the long video, with enough setup to make it understandable alone.','production':'$0 extra shoot spend using existing footage; allow 30–60 minutes editing per clip.','beats':'0–2s: target. 2–12s: complication. 12–25s: decisive result; no unrelated outro.','ideas':[15,81,89]}
]
for f in short_formats:f['examples']=[next(s for s in shorts if s['id']==id) for id in f.pop('ids')]
data={'version':'seven-sections-v1','updated':'2026-09-24','ideas':ideas,'evidence_pool':list(pool.values()),'profiles':profiles,'retention':{'channel':'MoreNizarisaqt','pulled':'2026-09-05','data_through':'2026-09-03','total_curves':475,'cases':cases},'shorts':{'observed':'2026-09-24','sample_size':len(shorts),'sample_medians':medians,'formats':short_formats,'sample':shorts},'coverage':{'shape_two_channels':sum(i['coverage']['shape']>=2 for i in ideas),'ingredients_two_channels':sum(i['coverage']['ingredient']>=2 for i in ideas),'both':sum(min(i['coverage'].values())>=2 for i in ideas)}}
write(ASSET/'strategy-data.json',data);write(BASE/'strategy-data.json',data)
write(ASSET/'ideas-original-2026-09-10.json',original)
print(json.dumps({'ideas':len(ideas),'evidence':len(pool),'coverage':data['coverage'],'shorts':medians,'retention':len(cases)}))
