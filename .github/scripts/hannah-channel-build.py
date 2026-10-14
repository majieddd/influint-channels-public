"""Reapply the sourced October public update without replacing the Studio dashboard."""
from pathlib import Path
from html import escape
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[2]
CHANNEL_ID = 'UC1STjuGMAzbdmv0YRyAkl1w'
DATA = ROOT / 'channels' / 'hannah-channel-public-results-2026-10.json'
PAGE = ROOT / 'channels' / (CHANNEL_ID + '.html')
STUDY = '../studies/' + CHANNEL_ID + '-repackaging-2026-10.html'
START, END = '<!-- hannah-channel-update:start -->', '<!-- hannah-channel-update:end -->'
CSS_START, CSS_END = '/* hannah-channel-update:start */', '/* hannah-channel-update:end */'
data = json.loads(DATA.read_text(encoding='utf-8'))
items = data['recentVideos']
by_id = {item['id']: item for item in items}
assert len(items) == 24 and len(by_id) == 24
assert all(item['ageCalendarDays'] >= 0 for item in items)
historical = data['historicalBasis']
by_format = {item['label']: item for item in historical['formats']}
feature = next(item for item in historical['titleFeatures'] if item['label'] == 'Home organization opening present')
part2, part1 = by_id['nwmnkMtSLko'], by_id['lpx6R7W8kRs']
ratio = part2['publicLifetimeViews'] / part1['publicLifetimeViews']

def number(value):
    return f'{value:,.0f}'

def age(value):
    return 'Today' if value == 0 else f'{value} days'

def public_rows(videos):
    return '\n'.join(
        '<tr><th scope="row"><a target="_blank" rel="noopener" href="' + escape(item['url'], quote=True) + '">' + escape(item['title']) + '</a></th>'
        + f'<td><time datetime="{item["published"]}">{item["published"]}</time></td>'
        + f'<td>{age(item["ageCalendarDays"])}</td><td>{number(item["publicLifetimeViews"])}</td></tr>'
        for item in videos
    )

def public_table(videos, caption):
    return f'<div class="hc-table-wrap" tabindex="0" role="region" aria-label="{caption}"><table><caption>{caption}</caption><thead><tr><th scope="col">Upload</th><th scope="col">Published</th><th scope="col">Age at snapshot</th><th scope="col">Public lifetime views</th></tr></thead><tbody>{public_rows(videos)}</tbody></table></div>'

format_labels = [('organization','Organization'),('routine','Cleaning / routine'),('makeover','Makeover / project'),('decorating','Decorating'),('travel','Travel / house tour')]
format_rows = ''.join(
    f'<tr><th scope="row">{label}</th><td>{by_format[key]["n"]}</td><td>{by_format[key]["medianOutlier"]:.2f}x</td><td>{number(by_format[key]["median28dViews"])}</td><td>{by_format[key]["medianR50"]*100:.1f}%</td></tr>'
    for key,label in format_labels
)
snapshot_label = 'October 13, 2026'
section = f'''{START}
<section class="hc-update" id="recent-results" aria-labelledby="hc-heading">
  <div class="hc-heading"><div><h2 id="hc-heading">Recent results and what they change</h2><p>Public snapshot: <time datetime="{data['publicSnapshotDate']}">{snapshot_label}</time>. The Studio dashboard below retains its September 5 pull.</p></div><a class="hc-study" href="{STUDY}">Open the repackaging study</a></div>
  <div class="hc-snapshot" aria-label="Snapshot coverage"><span><b>{number(data['subscriberCount'])}</b> public subscribers (rounded)</span><span><b>{len(items)}</b> recent uploads checked</span><span><b>September 3</b> last Studio data-through date</span></div>
  <div class="hc-reading">
    <p><strong>The A-frame makeover is the clearest new signal.</strong> <a href="{part2['url']}" target="_blank" rel="noopener">Whole House Makeover, Part 2</a> has {number(part2['publicLifetimeViews'])} public lifetime views at {part2['ageCalendarDays']} calendar days. <a href="{part1['url']}" target="_blank" rel="noopener">Part 1</a> has {number(part1['publicLifetimeViews'])} at {part1['ageCalendarDays']} days. Part 2 has {ratio:.1f}x the lifetime views despite being younger. This supports keeping renovation in the mix; it does not establish which title, thumbnail, topic or distribution effect drove the result.</p>
    <p><strong>Organization still has the strongest repeatable historical base.</strong> In the saved 200-video cohort, organization has a {by_format['organization']['medianOutlier']:.2f}x median relative score (n={by_format['organization']['n']}). Titles opening with “Home Organization Ideas” have a {feature['medianOutlier']:.2f}x median (n={feature['n']}). Keep that familiar viewer intent and make the specific task or result easier to see. Today’s restock upload is too young to judge.</p>
  </div>
  <div class="hc-details">
    <details><summary><span>Recent public results</span><span class="hc-summary-meta">24 uploads, age shown</span></summary><div class="hc-detail-body"><p>These are cumulative public views on October 13, not fixed first-28-day totals. Upload age is the difference between calendar dates. An older video has had longer to accumulate views; raw counts are not an age-adjusted ranking. Today’s upload is excluded from performance conclusions.</p>{public_table(items[:12], 'The 12 most recent public uploads')}<details class="hc-older"><summary>Show the next 12 uploads</summary>{public_table(items[12:], 'The next 12 public uploads')}</details><p><a href="hannah-channel-public-results-2026-10.csv">Download all 24 rows (CSV)</a></p></div></details>
    <details><summary><span>Historical format breakdown</span><span class="hc-summary-meta">200 scored uploads</span></summary><div class="hc-detail-body"><p>Fixed first-28-day views and stored retention from the 200 newest scored catalogue rows, August 2022 to September 2026. The broad editorial categories below differ from the repeated-title clusters farther down this page.</p><div class="hc-table-wrap" tabindex="0" role="region" aria-label="Historical format breakdown"><table><caption>Historical evidence, not October Studio results</caption><thead><tr><th scope="col">Category</th><th scope="col">n</th><th scope="col">Median relative score</th><th scope="col">Median 28-day views</th><th scope="col">Median at halfway</th></tr></thead><tbody>{format_rows}</tbody></table></div><p>One other upload completes the 200-video sample. Relative scores compare uploads with their publish-date peers. Halfway retention is the audience remaining at 50% of runtime. Categories differ in runtime and topic; these medians show association, not a causal packaging effect.</p><p><a href="{historical['source']}">Inspect the 200-row evidence catalogue</a> · <a href="{STUDY}#evidence">Read the definitions and selection rules</a></p></div></details>
    <details><summary><span>Packaging priorities</span><span class="hc-summary-meta">What to test next</span></summary><div class="hc-detail-body"><ol><li><strong>Keep the organization anchor, add a distinct task.</strong> Retain “organize with me” familiarity, then name the closet, storage setup or restock problem. A strong category median does not mean every upload needs the same title.</li><li><strong>Keep the makeover series, clarify each episode’s payoff.</strong> The new Part 2 result challenges a blanket rule against renovation or numbered episodes. Use the actual A-frame, room or project as the visual anchor. Its public description covers demolition, painting and exterior progress, so avoid promising a completed whole-house reveal.</li><li><strong>Treat travel as a fit question as well as a packaging question.</strong> The travel cohort’s {by_format['travel']['medianOutlier']:.2f}x median is based on only {by_format['travel']['n']} videos. Make the family experience or useful home-related angle explicit when it exists in the footage. A new thumbnail cannot guarantee that the core homemaking audience wants a destination vlog.</li><li><strong>Test the older candidates before claiming a lift.</strong> The study pairs 22 existing uploads with proposed titles and After concepts. Its first group has eight candidates. Their scores and retention belong to the original uploads; the proposed packages have no measured performance yet.</li></ol><p><a href="{STUDY}#packages">Review the Before / After proposals</a></p></div></details>
    <details><summary><span>Sources and freshness</span><span class="hc-summary-meta">Public versus Studio</span></summary><div class="hc-detail-body"><p><strong>New:</strong> the public channel listing and 24 public watch pages were read on October 13, 2026 using yt-dlp 2026.08.19. Each row links to its original video. Subscriber count is YouTube’s rounded public figure.</p><p><strong>Stored:</strong> the dashboard was pulled September 5, with data through September 3. The historical breakdown recomputes the saved scored catalogue. No October private CTR, impressions, traffic sources or retention have been retrieved for this update.</p><p>The public lifetime counts and historical first-28-day figures use different measurement windows and remain separate. The recommendations combine observed evidence with editorial interpretation. The study’s After artwork is an AI-generated concept for review.</p><p><a href="{escape(data['sourceUrl'])}" target="_blank" rel="noopener">YouTube channel listing</a> · <a href="hannah-channel-public-results-2026-10.json">Snapshot and definitions (JSON)</a> · <a href="hannah-channel-public-results-2026-10.csv">Recent rows (CSV)</a></p></div></details>
  </div>
</section>
{END}'''

if data.get('studioSource'):
    studio = json.loads((ROOT/'channels'/data['studioSource']).read_text(encoding='utf-8'))
    paid = next(x for x in studio['trafficEvidence'] if x['id']=='channel-paid-28')
    section = section.replace('The Studio dashboard below retains its September 5 pull.', f"The Analytics dashboard now uses the {studio['pulledAt']} Studio export, with core data through {studio['dataThrough']}.")
    section = section.replace('<b>September 3</b> last Studio data-through date', f"<b>{studio['dataThrough']}</b> Studio data through")
    paid_copy = f'''<p><strong>The makeover's headline includes substantial paid distribution.</strong> Part 2 had {number(part2['publicLifetimeViews'])} public lifetime views at the October 13 snapshot. The signed-in Studio video overview read that day showed 78.6% from YouTube advertising, a rounded lifetime figure. Separately, the completed September 15 to October 12 channel export has {number(paid['advertisingViews'])} paid views, {paid['advertisingShare']*100:.1f}% of {number(paid['totalViews'])} total views. Its organic row has {number(paid['organicViews'])} views. Treat the makeover as a mixed-distribution result, not a measured organic packaging win.</p>'''
    section = re.sub(r'<p><strong>The A-frame makeover is the clearest new signal\.</strong>.*?</p>',lambda _:paid_copy,section,count=1,flags=re.S)
    section = section.replace('Today’s restock upload is too young to judge.', 'The October 13 restock was too young to judge at the public capture.')
    section = section.replace('Today’s upload is excluded from performance conclusions.', 'The October 13 upload was too young at capture and is excluded from performance conclusions.')
    section = section.replace('The new Part 2 result challenges a blanket rule against renovation or numbered episodes.', 'Part 2 received substantial advertising traffic. Separate organic performance from paid reach before judging a makeover format or package.')
    section = section.replace('<strong>Stored:</strong> the dashboard was pulled September 5, with data through September 3. The historical breakdown recomputes the saved scored catalogue. No October private CTR, impressions, traffic sources or retention have been retrieved for this update.', f"<strong>Studio refresh:</strong> eight dated exports cover the current and prior 7, 28, 90 and 365-day windows. Core data runs through {studio['dataThrough']}; daily audience classifications run through {studio['audienceDataThrough']}. Exact Studio CTR, average view duration, average percentage viewed, impressions and viewer classifications populate the dashboard. The 200-video format breakdown and shortlisted per-video retention remain historical. <a href=\"{data['studioSource']}\">Inspect the Studio capture and exports</a>.")

css = '''/* hannah-channel-update:start */
.hc-update{--hc-text:#eaf5f3;--hc-muted:#bacdca;--hc-gap:18px;--hc-radius:12px;--hc-body:14px;--hc-small:12px;--hc-rule:1px solid var(--line);margin:32px 0 48px;padding-top:26px;border-top:var(--hc-rule);color:var(--hc-text)}
.hc-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--hc-gap);flex-wrap:wrap}
.hc-heading h2{font-size:22px;text-transform:none;letter-spacing:-.015em;line-height:1.3;margin:0 0 9px;color:var(--hc-text)}
.hc-heading p{margin:0;color:var(--hc-muted);font-size:var(--hc-small);line-height:1.6;max-width:65ch}
.hc-study{display:inline-flex;white-space:nowrap;border:var(--hc-rule);border-radius:6px;padding:10px 13px;background:var(--panel);font-size:var(--hc-small);text-decoration:none}
.hc-snapshot{display:flex;gap:14px 26px;flex-wrap:wrap;margin:21px 0;padding:14px 0;border-top:var(--hc-rule);border-bottom:var(--hc-rule);font-size:var(--hc-small);color:var(--hc-muted)}
.hc-snapshot b{color:var(--hc-text);font-size:var(--hc-body);font-variant-numeric:tabular-nums;margin-right:5px}
.hc-reading{display:grid;grid-template-columns:1.25fr 1fr;gap:26px;margin-bottom:23px}
.hc-reading p,.hc-detail-body p{margin:0 0 14px;font-size:var(--hc-body);line-height:1.7;max-width:65ch}
.hc-reading strong,.hc-detail-body strong{font-weight:600}
.hc-details{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
.hc-details>details{border:var(--hc-rule);border-radius:var(--hc-radius);background:var(--panel);min-width:0;overflow:hidden}
.hc-details>details>summary{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;cursor:pointer;padding:16px;font-size:var(--hc-body);color:var(--teal);list-style:none}
.hc-details>details>summary::-webkit-details-marker{display:none}
.hc-details>details>summary::after{content:'+';margin-left:auto}
.hc-details>details[open]{grid-column:1/-1}
.hc-details>details[open]>summary::after{content:'−'}
.hc-summary-meta{font-size:var(--hc-small);color:var(--hc-muted)}
.hc-detail-body{padding:2px 16px 16px;color:var(--hc-text)}
.hc-detail-body ol{padding-left:22px;margin:0 0 16px;font-size:var(--hc-body);line-height:1.7;max-width:65ch}
.hc-detail-body li{margin:0 0 16px}
.hc-table-wrap{max-width:100%;overflow:auto;margin:16px 0 18px}
.hc-table-wrap table{width:100%;min-width:580px;border-collapse:collapse;font-size:var(--hc-small);line-height:1.6;color:var(--hc-text)}
.hc-table-wrap caption{text-align:left;padding-bottom:12px;color:var(--hc-muted)}
.hc-table-wrap th,.hc-table-wrap td{padding:11px 12px 11px 0;border-bottom:var(--hc-rule);text-align:left;vertical-align:top;font-variant-numeric:tabular-nums}
.hc-table-wrap thead th{color:var(--hc-muted);font-weight:500}
.hc-table-wrap tbody th{font-weight:500;width:52%}
.hc-table-wrap td{white-space:nowrap}
.hc-older{border-top:var(--hc-rule);margin:16px 0;padding-top:12px}
.hc-older summary{font-size:var(--hc-body);color:var(--teal);cursor:pointer}
.hc-update :is(a,summary,.hc-table-wrap):focus-visible{outline:2px solid var(--teal);outline-offset:3px}
@media(max-width:760px){.hc-reading,.hc-details{grid-template-columns:1fr}.hc-heading h2{font-size:20px}.hc-snapshot{gap:12px}.hc-details>details[open]{grid-column:auto}}
/* hannah-channel-update:end */'''

page = PAGE.read_text(encoding='utf-8')
if START in page:
    page = re.sub(re.escape(START) + r'.*?' + re.escape(END), lambda _: section, page, count=1, flags=re.S)
else:
    page = page.replace('<section class="dash"', section + '\n<section class="dash"', 1)
if CSS_START in page:
    page = re.sub(re.escape(CSS_START) + r'.*?' + re.escape(CSS_END), lambda _: css, page, count=1, flags=re.S)
else:
    page = page.replace('</style>', css + '\n</style>', 1)
# Refresh dated older headers, but keep a future publisher's newer channel figures.
profile_pos = page.find('<div class="profile">')
profile_lede = re.search(r'<p class="lede"[^>]*>.*?</p>', page[profile_pos:], flags=re.S) if profile_pos >= 0 else None
if profile_lede:
    header = profile_lede.group()
    dates = re.findall(r'(?:knowledge base last updated|public snapshot) (\d{4}-\d{2}-\d{2})', header)
    if dates and max(dates) <= data['publicSnapshotDate']:
        updated_header = re.sub(r'\b\d+(?:\.\d+)?K subscribers(?: \(public snapshot \d{4}-\d{2}-\d{2}\))?', f'{data["subscriberCount"]/1000:g}K subscribers (public snapshot {data["publicSnapshotDate"]})', header, count=1)
        start = profile_pos + profile_lede.start()
        page = page[:start] + updated_header + page[profile_pos + profile_lede.end():]
# Use a preserved genuine Influint mark where this publisher checkout lacks assets/brand.
mark = ROOT / 'channels' / 'hannah-channel-influint-mark.png'
source_mark = ROOT / 'studies' / (CHANNEL_ID + '-repackaging-2026-10') / 'influint-mark.png'
if not mark.exists() and source_mark.exists():
    shutil.copyfile(source_mark, mark)
if mark.exists():
    page = page.replace('../assets/brand/influint-mark.png', 'hannah-channel-influint-mark.png')
page = page.replace('background-image:url("../assets/brand/dot-grid.png");', 'background-image:none;')
new_study = f'<a class="st-list-item" data-hannah-repackaging="2026-10" href="{STUDY}"><span class="st-list-title">Hannah: Before / After Repackaging</span><span class="st-list-kicker">22 video proposals with evidence tiles, original packaging and After concepts</span><span class="st-list-date">Updated 2026-10-13</span></a>'
if 'data-hannah-repackaging="2026-10"' not in page:
    pos = page.find('<h2>Studies</h2>')
    if pos >= 0:
        next_heading = page.find('<h2>', pos + len('<h2>Studies</h2>'))
        study_section = page[pos:next_heading if next_heading >= 0 else len(page)]
        list_pos = study_section.find('<div class="st-list">')
        if list_pos >= 0:
            insert = pos + list_pos + len('<div class="st-list">')
            page = page[:insert] + new_study + page[insert:]
        else:
            insert = pos + len('<h2>Studies</h2>')
            page = page[:insert] + '<div class="st-list">' + new_study + '</div>' + page[insert:]
    else:
        studies = '<h2>Studies</h2>\n<div class="st-list">' + new_study + '</div>\n'
        boundary = page.find('<h2>Analyses</h2>')
        if boundary >= 0:
            page = page[:boundary] + studies + page[boundary:]
        else:
            page = page.replace(END, END + '\n' + studies, 1)
current_dash = re.search(r'window\.__DASH__=(.*?);?</script>',page,re.S)
if current_dash and data.get('studioSource'):
    current_model=json.loads(current_dash.group(1).rstrip(';'))
    if (current_model.get('dataThrough',''),current_model.get('pulledAt','')) > (studio['dataThrough'],studio['pulledAt']):
        earlier=f"The Analytics dashboard now uses the {studio['pulledAt']} Studio export, with core data through {studio['dataThrough']}."
        latest=f"The Analytics dashboard carries a newer {current_model['pulledAt']} Studio pull, with core data through {current_model['dataThrough']}. The discussion here retains its dated October 13 snapshot."
        page=page.replace(earlier,latest)
        page=page.replace(f"<b>{studio['dataThrough']}</b> Studio data through",f"<b>{current_model['dataThrough']}</b> Studio data through")
PAGE.write_text(page, encoding='utf-8')
(ROOT / 'channels' / 'hannah-channel-update-section.html').write_text(section + '\n', encoding='utf-8')
(ROOT / 'channels' / 'hannah-channel-update.css').write_text(css + '\n', encoding='utf-8')
assert page.count(START) == page.count(END) == 1
assert page.count('data-hannah-repackaging="2026-10"') == 1
print(f'Rebuilt public update: {len(items)} verified rows, 4 evidence details, old dashboard retained.')
