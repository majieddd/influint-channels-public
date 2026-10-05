import html,json
from idea_cards import card_open

def solo_sections(asset,slug,render_references=None):
 d=json.loads((asset/'solo-formats.json').read_text(encoding='utf8'))
 thumbnails={t['idea_id']:t for t in json.loads((asset/'solo-thumbnail-manifest.json').read_text(encoding='utf8'))['items']}
 H=lambda x:html.escape(str(x),quote=True)
 money=lambda n:'$'+f'{n:,}'
 def references(items):
  if render_references:return render_references(items)
  if not items:return '<p class="fine gap">No direct ingredient match was found in the stored catalogue. This remains an editorial experiment.</p>'
  rows=[]
  for e in items:
   score=e.get('lift')
   label=f'{score:.2f}× · '+('Outlier ≥2×' if score>=2 else 'Below 2× outlier threshold') if score is not None else 'Unscored reference'
   rows.append(f'<li><a href="{H(e["url"])}" target="_blank" rel="noopener">{H(e["title"])}</a><small>{H(e["channel"])} · {label}<br>{H(e["basis"])}</small></li>')
  return '<ul class="solo-evidence">'+''.join(rows)+'</ul>'
 intro=''
 for f in d['formats']:
  for v in f['videos']:
   costs=''.join(f'<li>{H(label)}: {money(lo)}–{money(hi)}</li>' for label,lo,hi in v['cost_lines'])
   src=v.get('video_source',{})
   plan=v.get('thumbnail_plan',{})
   source_thumb=src.get('thumbnail_path')
   generated_thumb=plan.get('generated_image')
   if not generated_thumb or not plan.get('preview_image') or not src or not source_thumb:
    raise ValueError(f'Idea {v["id"]} needs a generated thumbnail, preview and source video before publication')
   image=f'{slug}/{generated_thumb}';preview=f'{slug}/{plan["preview_image"]}'
   checksum=thumbnails[v['id']]['generated_image_sha256']
   source_href=H(src['url'])
   source_card=f'<div class="compare-pair"><figure><a href="{source_href}" target="_blank" rel="noopener"><img loading="lazy" width="320" height="180" src="{slug}/{H(source_thumb)}" alt="Original thumbnail for {H(src["title"])} by {H(src["channel"])}"></a><figcaption><a href="{source_href}" target="_blank" rel="noopener">{H(src["channel"])}: {H(src["title"])}</a></figcaption></figure><figure><img loading="lazy" width="320" height="180" src="{H(preview)}" alt="Niz adaptation"><figcaption>Niz adaptation · concept #{v["id"]}</figcaption></figure></div>'
   def coverage(items,axis):
    count=len({e['channel'] for e in items if (e.get('lift') or 0)>=2})
    return f'<span class="badge {"good" if count>=2 else "gap"}">{axis}: {count} channel{"s" if count!=1 else ""} with ≥2× examples</span>'
   covered=len({e['channel'] for e in f['evidence'] if (e.get('lift') or 0)>=2})>=2 and len({e['channel'] for e in v['ingredient_evidence'] if (e.get('lift') or 0)>=2})>=2
   search=(v['title']+' '+v['ingredients']+' '+v['title_shape']+' niz only solo self filmed').lower()
   attributes=f'data-required-people="1" data-family="{H(f["name"])}" data-search="{H(search)}" data-covered="{str(covered).lower()}"'
   opening=card_open(idea_id=v['id'],title=v['title'],family=f['name'],summary=v['summary'],intro=v['intro'],image=image,preview=preview,checksum=checksum,budget_url='#solo-cost-'+f['id'],budget_label=money(v['cost_low'])+'–'+money(v['cost_high'])+' incremental cash',css_class='solo-video',attributes=attributes,heading=3)
   intro+=opening+f'<details class="why"><summary>Why this Idea</summary><div class="equation"><span>Title shape</span><b>{H(v["title_shape"])}</b><span>+ Content ingredients</span><b>{H(v["ingredients"])}</b><span>= Proposed title</span><b>{H(v["title"])}</b></div><p class="fine">The ingredients are combined with this shape as a creative hypothesis. The exact Niz episode has not been tested.</p><h4>Title-shape evidence</h4>{coverage(f["evidence"],"Shape")}<p class="fine">{H(f["evidence_scope"])}</p>{references(f["evidence"])}<h4>Content-ingredient evidence</h4>{coverage(v["ingredient_evidence"],"Ingredient")}<p class="fine">{H(v["ingredient_scope"])}</p>{references(v["ingredient_evidence"])}</details><details class="comparison"><summary>Thumbnail: source → Niz</summary>{source_card}<p>{H(src["relevance"])}</p><p><b>Thumbnail direction:</b> {H(v["thumbnail_brief"])}</p><p class="fine">Source checked {H(src["source_checked"])}. Preserve the framing and visual hierarchy; Niz performs the proposed episode alone.</p></details><details class="solo-brief"><summary>Solo shoot and payoff</summary><p><b>Film it alone:</b> {H(v["solo_blocking"])}</p><p><b>Final payoff:</b> {H(v["payoff"])}</p><p><b>Series structure:</b> {H(f["retention_engine"])}</p><p><b>Editing rule:</b> {H(f["edit_rule"])}</p><h5>Incremental spend</h5><ul>{costs}</ul><p class="fine">USD planning allowances; see the <a href="#solo-production">shared solo cost assumptions</a>.</p><a class="fine" href="#idea-{v["id"]}">Link to idea #{v["id"]}</a></details><p class="fine">{H(v["shoot_time"])} · Niz only · self-filmed</p></div></article>'
 creative='<div class="solo-addendum" id="solo-creative"><h3>Five formats that work with Niz alone</h3><p>For these proposed series, an object, rule, timer or personal target supplies the tension. Each has five fully outlined episodes in Ideation.</p><div class="table-scroll"><table><thead><tr><th>Format</th><th>Episode structure</th><th>Editing decision</th></tr></thead><tbody>'+''.join(f'<tr><th><a href="#solo-{f["id"]}">{H(f["name"])}</a></th><td>{H(f["episode_arc"])}</td><td>{H(f["edit_rule"])}</td></tr>' for f in d['formats'])+'</tbody></table></div><p><b>Solo coverage:</b> Record the real attempt from a fixed wide angle, then film your own close-ups and a short explanation of what changed. Keep the result visible without needing a reaction from someone else.</p></div>'
 production='<div class="solo-addendum" id="solo-production"><h3>Solo production: five repeatable home shoots</h3><p>'+H(d['cost_basis'])+'</p><div class="two-grid">'
 for f in d['formats']:
  lo=min(v['cost_low'] for v in f['videos']);hi=max(v['cost_high'] for v in f['videos'])
  production+=f'<article class="cost-card" id="solo-cost-{f["id"]}"><h4>{H(f["name"])}</h4><div class="price">{money(lo)}–{money(hi)} per episode</div><p class="fine">Niz only · home or desk · no travel or location hire</p><p>{H(f["solo_method"])}</p><p><b>What the spend buys:</b> '+H({'tabletop-tests':'A testable object or visible failure, with replacements for repeat attempts.','miniature-builds':'A physical transformation and a finished prop that can be reused in future episodes.','game-rule-days':'A readable rule board and visible progress; most of the story uses items already owned.','budget-bench':'Two real products and a fair side-by-side comparison, with prices supported by receipts.','noob-to-skill':'One reusable practice object and a measurable personal learning story.'}[f['id']])+f'</p><p><b>Shorts from the shoot:</b> One standalone failed attempt → correction → final result. Finish the answer inside the Short.</p><p class="fine">Episode budgets: '+', '.join(f'<a href="#idea-{v["id"]}">#{v["id"]}: {money(v["cost_low"])}–{money(v["cost_high"])}</a>' for v in f['videos'])+'</p></article>'
 production+='</div></div>'
 data=f'<div class="solo-addendum"><h3>Solo expansion: scope and evidence</h3><p>25 video briefs, numbered 101–125, across five formats, included in the main 125-idea gallery. Every proposal specifies one person: Niz. Each has one linked source video and its actual thumbnail. Those examples inform premise and composition only; they do not validate the exact new combination or require their cast. All 25 Niz adaptation thumbnails are generated as 16:9 concept art using the available built-in image generator; the model identity is unverified and GPT Image 2.5 Flare was not confirmed. No CTR claims are made.</p><p>{H(d["evidence_basis"])}</p><p>Four format families include broad shape references from two different channels at or above 2×. The learning family does not meet that threshold. Ingredient matches and gaps are shown per episode; a shared title ingredient does not establish the result of the proposed combination.</p><a href="{slug}/solo-formats.json" download>Download all 25 solo video briefs</a> · <a href="{slug}/solo-thumbnail-manifest.json" download>Download thumbnail/source manifest</a></div>'
 return intro,creative,production,data
