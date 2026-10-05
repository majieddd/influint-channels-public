"""Shared visible layout for original and solo episode cards."""
import html


def card_open(*, idea_id, title, family, summary, intro, image, preview,
              checksum, budget_url, budget_label, css_class='idea',
              attributes='', heading=3):
    h = lambda value: html.escape(str(value), quote=True)
    beats = ''.join(
        f'<li><b>{label}</b><span>{h(beat)}</span></li>'
        for label, beat in zip(['0 (First Frame)–5s', '5s–15s', '15s–30s'], intro)
    )
    return f'''<article class="{css_class}" id="idea-{idea_id}" {attributes}>
 <a class="thumb generated-thumb" data-thumbnail-id="{idea_id}" href="{h(image)}?v={checksum[:12]}" aria-label="Enlarge thumbnail for {h(title)}"><img src="{h(preview)}?v={checksum[:12]}" width="640" height="360" loading="lazy" alt="Niz thumbnail concept: {h(title)}"></a>
 <div class="idea-body"><div class="eyebrow">{idea_id:03} / {h(family)}</div><h{heading}>{h(title)}</h{heading}><p class="idea-summary">{h(summary)}</p><ol class="intro">{beats}</ol>
 <div class="idea-meta"><a href="{h(budget_url)}">{h(budget_label)}</a><a href="{h(image)}" download>Download JPG</a></div>'''
