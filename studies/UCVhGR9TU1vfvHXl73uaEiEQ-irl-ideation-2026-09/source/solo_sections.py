import html,json

def solo_sections(asset,slug):
 d=json.loads((asset/'solo-formats.json').read_text(encoding='utf8'))
 H=lambda x:html.escape(str(x),quote=True)
 money=lambda n:'$'+f'{n:,}'
 def references(items):
  if not items:return '<p class="fine gap">No direct ingredient match was found in the stored catalogue. This remains an editorial experiment.</p>'
  rows=[]
  for e in items:
   score=e.get('lift')
   label=f'{score:.2f}× · '+('Outlier ≥2×' if score>=2 else 'Below 2× outlier threshold') if score is not None else 'Unscored reference'
   rows.append(f'<li><a href="{H(e["url"])}" target="_blank" rel="noopener">{H(e["title"])}</a><small>{H(e["channel"])} · {label}<br>{H(e["basis"])}</small></li>')
  return '<ul class="solo-evidence">'+''.join(rows)+'</ul>'
 intro='<div id="solo-formats" class="solo-expansion"><div class="section-head"><div><span class="eyebrow">New / 25 videos · 5 repeatable formats</span><h3>Made for Niz to film alone</h3></div><p>One performer. One camera operator. Both Niz.</p></div><p>'+H(d['production_rule'])+'</p><p class="fine">Every new idea is paired with the actual thumbnail from a directly linked source video and a composition note for Niz. Source creators are visual references only; every proposed shoot stays solo. The original 100-image gallery remains below.</p><nav class="solo-nav" aria-label="Solo formats">'+''.join(f'<a href="#solo-{f["id"]}">{n+1:02} · {H(f["name"])}</a>' for n,f in enumerate(d['formats']))+'</nav><p><a href="#original-ideas">Jump to the original 100 ideas and thumbnails ↓</a></p>'
 for n,f in enumerate(d['formats']):
  intro+=f'<article class="solo-format" id="solo-{f["id"]}" data-solo-format="{f["id"]}"><div class="solo-format-heading"><span class="eyebrow">Solo format {n+1:02} / 5 videos</span><h3>{H(f["name"])}</h3><p>{H(f["promise"])}</p><p class="solo-meta"><span class="badge">Niz only · self-filmed</span><a href="#solo-cost-{f["id"]}">Production plan ↗</a></p></div><details class="solo-format-notes"><summary>Why this format + how to film it</summary><p><b>Title shape:</b> {H(f["title_shape"])}</p><p><b>Retention structure:</b> {H(f["retention_engine"])}</p><p><b>Solo setup:</b> {H(f["solo_method"])}</p><p><b>Editing rule:</b> {H(f["edit_rule"])}</p><p class="fine">{H(f["evidence_scope"])}</p>{references(f["evidence"])}</details><div class="solo-videos">'
  for v in f['videos']:
   beats=''.join(f'<li><b>{label}</b><span>{H(beat)}</span></li>' for label,beat in zip(['0 (First Frame)–5s','5s–15s','15s–30s'],v['intro']))
   costs=''.join(f'<li>{H(label)}: {money(lo)}–{money(hi)}</li>' for label,lo,hi in v['cost_lines'])
   src=v.get('video_source',{})
   plan=v.get('thumbnail_plan',{})
   source_thumb=src.get('thumbnail_path')
   generated_thumb=plan.get('generated_image')
   if generated_thumb:
    preview_thumb=plan.get('preview_image')
    preview_source=f'<source type="image/webp" srcset="{slug}/{H(preview_thumb)}">' if preview_thumb else ''
    niz_visual=f'<a class="solo-thumb-image" href="{slug}/{H(generated_thumb)}" target="_blank" rel="noopener"><picture>{preview_source}<img loading="lazy" width="1280" height="720" src="{slug}/{H(generated_thumb)}" alt="Niz thumbnail concept for idea {v["id"]}: {H(v["title"])}"></picture></a>'
    niz_caption='Niz adaptation'
   else:
    prompt_href=f'{slug}/{H(plan.get("prompt", ""))}'
    niz_visual=f'<div class="solo-thumb-pending"><span>Image render pending</span><b>{H(v["thumbnail_brief"])}</b><a href="{prompt_href}" download>Download the Niz composition prompt</a></div>'
    niz_caption='Niz solo adaptation · not yet rendered'
   if src:
    source_href=H(src.get('url', '#'))
    source_visual=f'<a class="solo-thumb-image" href="{source_href}" target="_blank" rel="noopener"><img loading="lazy" src="{slug}/{H(source_thumb)}" alt="Original thumbnail for {H(src.get("title", "source video"))} by {H(src.get("channel", "source channel"))}"></a>' if source_thumb else ''
    source_card=f'<div class="solo-thumb-pair"><figure><figcaption>Actual source video</figcaption>{source_visual}<p><a href="{source_href}" target="_blank" rel="noopener">{H(src.get("title", "Watch source video"))}</a><small>{H(src.get("channel", ""))} · checked {H(src.get("source_checked", ""))}</small><small>{H(src.get("relevance", ""))}</small></p></figure><figure><figcaption>{H(niz_caption)}</figcaption>{niz_visual}</figure></div>'
   else:
    source_card='<p class="fine gap">Source video not yet attached.</p>'
   intro+=f'<article class="solo-video" id="idea-{v["id"]}" data-required-people="1"><span class="eyebrow">Idea {v["id"]} · Niz only</span><h4>{H(v["title"])}</h4><p class="idea-summary">{H(v["summary"])}</p>{source_card}<p class="solo-meta"><b>{money(v["cost_low"])}–{money(v["cost_high"])} incremental cash</b><span>{H(v["shoot_time"])}</span></p><details class="solo-brief"><summary>Opening, solo shoot and payoff</summary><ol class="intro">{beats}</ol><p><b>Film it alone:</b> {H(v["solo_blocking"])}</p><p><b>Final payoff:</b> {H(v["payoff"])}</p><h5>Why this idea</h5><div class="equation"><span>Title shape</span><b>{H(v["title_shape"])}</b><span>+ Content ingredients</span><b>{H(v["ingredients"])}</b><span>= Proposed title</span><b>{H(v["title"])}</b></div><p class="fine">Broad title-shape references are in this format’s notes above. {H(v["ingredient_scope"])}</p>{references(v["ingredient_evidence"])}<h5>Incremental spend</h5><ul>{costs}</ul><p class="fine">USD planning allowances; see the <a href="#solo-production">shared solo cost assumptions</a>.</p><p><b>Thumbnail direction:</b> {H(v["thumbnail_brief"])}</p><a class="fine" href="#idea-{v["id"]}">Link to idea #{v["id"]}</a></details></article>'
  intro+='</div></article>'
 intro+='</div>'
 creative='<div class="solo-addendum" id="solo-creative"><h3>Five formats that work with Niz alone</h3><p>For these proposed series, an object, rule, timer or personal target supplies the tension. Each has five fully outlined episodes in Ideation.</p><div class="table-scroll"><table><thead><tr><th>Format</th><th>Episode structure</th><th>Editing decision</th></tr></thead><tbody>'+''.join(f'<tr><th><a href="#solo-{f["id"]}">{H(f["name"])}</a></th><td>{H(f["episode_arc"])}</td><td>{H(f["edit_rule"])}</td></tr>' for f in d['formats'])+'</tbody></table></div><p><b>Solo coverage:</b> Record the real attempt from a fixed wide angle, then film your own close-ups and a short explanation of what changed. Keep the result visible without needing a reaction from someone else.</p></div>'
 production='<div class="solo-addendum" id="solo-production"><h3>Solo production: five repeatable home shoots</h3><p>'+H(d['cost_basis'])+'</p><div class="two-grid">'
 for f in d['formats']:
  lo=min(v['cost_low'] for v in f['videos']);hi=max(v['cost_high'] for v in f['videos'])
  production+=f'<article class="cost-card" id="solo-cost-{f["id"]}"><h4>{H(f["name"])}</h4><div class="price">{money(lo)}–{money(hi)} per episode</div><p class="fine">Niz only · home or desk · no travel or location hire</p><p>{H(f["solo_method"])}</p><p><b>What the spend buys:</b> '+H({'tabletop-tests':'A testable object or visible failure, with replacements for repeat attempts.','miniature-builds':'A physical transformation and a finished prop that can be reused in future episodes.','game-rule-days':'A readable rule board and visible progress; most of the story uses items already owned.','budget-bench':'Two real products and a fair side-by-side comparison, with prices supported by receipts.','noob-to-skill':'One reusable practice object and a measurable personal learning story.'}[f['id']])+f'</p><p><b>Shorts from the shoot:</b> One standalone failed attempt → correction → final result. Finish the answer inside the Short.</p><p class="fine">Episode budgets: '+', '.join(f'<a href="#idea-{v["id"]}">#{v["id"]}: {money(v["cost_low"])}–{money(v["cost_high"])}</a>' for v in f['videos'])+'</p></article>'
 production+='</div></div>'
 data=f'<div class="solo-addendum"><h3>Solo expansion: scope and evidence</h3><p>25 additional video briefs, numbered 101–125, across five formats. Every proposal specifies one person: Niz. Each has one linked source video and its actual thumbnail. Those examples inform premise and composition only; they do not validate the exact new combination or require their cast. All 25 Niz adaptation thumbnails are generated as 16:9 concept art using the available built-in image generator; the model identity is unverified and GPT Image 2.5 Flare was not confirmed. No CTR claims are made.</p><p>{H(d["evidence_basis"])}</p><p>Four format families include broad shape references from two different channels at or above 2×. The learning family does not meet that threshold. Ingredient matches and gaps are shown per episode; a shared title ingredient does not establish the result of the proposed combination.</p><a href="{slug}/solo-formats.json" download>Download all 25 solo video briefs</a> · <a href="{slug}/solo-thumbnail-manifest.json" download>Download thumbnail/source manifest</a></div>'
 return intro,creative,production,data
