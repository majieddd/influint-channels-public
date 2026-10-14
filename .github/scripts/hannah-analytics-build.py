"""Compile verified Studio captures into Hannah's existing Analytics dashboard.

Without --apply or --output, only the separately inspectable model is written.
"""
from pathlib import Path
from datetime import date, timedelta
from html import escape
import argparse
import copy
import csv
import json
import math
import re

ROOT = Path(__file__).resolve().parents[2]
CID = 'UC1STjuGMAzbdmv0YRyAkl1w'
ALIASES = {
    'views': 'views', 'watch time (hours)': 'watchHours', 'watch hours': 'watchHours',
    'subscribers': 'netSubscribers', 'net subscribers': 'netSubscribers',
    'impressions': 'impressions', 'impressions click-through rate (%)': 'ctr',
    'thumbnail impressions': 'impressions', 'thumbnail click-through rate (%)': 'ctr',
    'average view duration': 'avdSeconds', 'average percentage viewed (%)': 'avp',
    'returning viewers': 'returningViewers', 'new viewers': 'newViewers',
    'engaged views': 'engagedViews', 'estimated revenue (usd)': 'revenue',
    'estimated revenue': 'revenue',
}
DAILY_KEYS = {'date':'d', 'views':'v', 'watchHours':'h', 'netSubscribers':'s',
    'impressions':'i', 'ctr':'c', 'avdSeconds':'a', 'avp':'p',
    'returningViewers':'r', 'newViewers':'n', 'engagedViews':'e', 'revenue':'rev'}
TILES = [('views','Views','views a day'), ('watchHours','Watch time','hours a day'),
    ('netSubscribers','Net subscribers gained','net subscribers a day'),
    ('avdSeconds','Average view duration','average view duration by day'),
    ('impressions','Impressions','impressions a day')]
TILE_KEYS = {'views':'views','watchHours':'watch','netSubscribers':'subs','avdSeconds':'avd','impressions':'impr','revenue':'revenue'}

def number(value):
    if value is None or value == '':
        return None
    if isinstance(value, bool):
        raise ValueError('Boolean used where a measured numeric value was expected')
    value = float(value)
    if not math.isfinite(value):
        raise ValueError('Non-finite measured value')
    return int(value) if value.is_integer() else value

def duration(value):
    if value is None or value == '':
        return None
    if isinstance(value, str) and ':' in value:
        return sum(float(part) * 60**i for i,part in enumerate(reversed(value.split(':'))))
    return number(value)

def csv_value(value, key, header):
    if value is None or value.strip() in ['', '-', '—', '–', 'N/A']:
        return None
    value = value.strip().replace(',', '')
    if key == 'avdSeconds':
        return duration(value)
    percent = '%' in value or '(%)' in header
    value = value.replace('%','').replace('$','')
    result = number(value)
    return result / 100 if result is not None and percent else result

def metrics(values):
    return {key: (duration(value) if key == 'avdSeconds' else number(value)) for key,value in values.items()}

def fmt_count(value):
    return None if value is None else f'{value:,.0f}'

def fmt_duration(value):
    if value is None:
        return None
    seconds = round(value)
    return f'{seconds//3600}:{seconds//60%60:02}:{seconds%60:02}' if seconds >= 3600 else f'{seconds//60}:{seconds%60:02}'

def fmt_percent(value):
    return None if value is None else f'{value*100:.1f}%'

def display_value(key, value, supplied=None, currency='USD'):
    if supplied is not None:
        return str(supplied)
    if value is None:
        return None
    if key == 'watchHours':
        return f'{value:,.1f} hours'
    if key == 'avdSeconds':
        return fmt_duration(value)
    if key in ['ctr','avp']:
        return fmt_percent(value)
    if key == 'netSubscribers':
        return ('+' if value > 0 else '') + fmt_count(value)
    if key == 'revenue':
        return f'{currency} {value:,.2f}'
    return fmt_count(value)

def merge_value(existing, key, value, label):
    if value is None:
        return
    if key in existing and existing[key] is not None and not math.isclose(existing[key], value, rel_tol=1e-8, abs_tol=1e-8):
        raise ValueError(f'Conflicting {key} values for {label}: {existing[key]} / {value}')
    existing[key] = value

def load_daily(source, source_path):
    rows = {}
    totals = []
    for row in source.get('daily', []):
        stamp = row['date']
        date.fromisoformat(stamp)
        dest = rows.setdefault(stamp, {})
        for key,value in row.items():
            if key != 'date' and key in DAILY_KEYS:
                merge_value(dest, key, duration(value) if key == 'avdSeconds' else number(value), stamp)
    for raw_spec in source.get('dailyCsvFiles', []):
        spec = {'path':raw_spec} if isinstance(raw_spec, str) else raw_spec
        path = Path(spec['path'])
        if not path.is_absolute():
            path = source_path.parent / path
        with path.open(encoding='utf-8-sig', newline='') as handle:
            reader = csv.DictReader(handle)
            for raw_row in reader:
                parsed = {}
                for header,value in raw_row.items():
                    if header is None:
                        continue
                    normalized = header.strip().lower()
                    key = ALIASES.get(normalized)
                    if key:
                        parsed[key] = csv_value(value, key, normalized)
                stamp = next((str(value).strip() for header,value in raw_row.items() if header and header.strip().lower() == 'date'), None)
                if any(str(value).strip().lower() == 'total' for value in raw_row.values()):
                    if spec.get('windowDays'):
                        totals.append({'days':spec['windowDays'], 'period':spec.get('period','current'), 'metrics':parsed, 'sourceRef':spec.get('sourceRef')})
                    continue
                if not stamp or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', stamp):
                    continue
                date.fromisoformat(stamp)
                dest = rows.setdefault(stamp, {})
                for key,value in parsed.items():
                    merge_value(dest, key, value, stamp)
    compiled = []
    for stamp in sorted(rows):
        row = {'d':stamp}
        for key,outkey in DAILY_KEYS.items():
            if key != 'date':
                row[outkey] = rows[stamp].get(key)
        # The historical fitted retention model is intentionally not recomputed.
        row['q'] = None
        if row['c'] is not None and not 0 <= row['c'] <= 1:
            raise ValueError(f'{stamp} CTR must be a fraction from 0 to 1')
        if row['p'] is not None and row['p'] < 0:
            raise ValueError(f'{stamp} average view percentage cannot be negative')
        compiled.append(row)
    return compiled, totals

def compare_text(key, current, prior, days, display, currency, approximate=False):
    if current is None or prior is None:
        return f'Prior {days}-day comparison not captured'
    prior_text = display_value(key, prior, display, currency)
    if prior == 0:
        return f'Prior {days} days: {prior_text}; percentage change unavailable from zero'
    change = (current-prior)/abs(prior)*100
    prefix = '+' if change > 0 else '−' if change < 0 else ''
    return f'{"About " if approximate else ""}{prefix}{abs(change):.1f}% vs prior {days} days ({prior_text})'

def compile_window(raw, source, daily):
    raw = copy.deepcopy(raw)
    days = int(raw['days'])
    first,last = date.fromisoformat(raw['from']),date.fromisoformat(raw['to'])
    if first > last:
        raise ValueError('Window starts after it ends')
    range_days = (last-first).days+1
    prior = raw.get('prior', {})
    prior_first = prior.get('from') or (first-timedelta(days=range_days)).isoformat()
    prior_last = prior.get('to') or (first-timedelta(days=1)).isoformat()
    if (date.fromisoformat(prior_last)-date.fromisoformat(prior_first)).days+1 != range_days:
        raise ValueError(f'{days}-day current and prior date ranges have different lengths')
    current = metrics(raw.get('metrics', {}))
    previous = metrics(prior.get('metrics', {}))
    if current.get('views') is None:
        raise ValueError(f'{days}-day current views must be captured before publication')
    if current.get('ctr') is not None and not 0 <= current['ctr'] <= 1:
        raise ValueError('CTR must be a fraction from 0 to 1')
    if current.get('avp') is not None and current['avp'] < 0:
        raise ValueError('Average view percentage cannot be negative')
    scope = raw.get('scope') or source['scope']
    display = raw.get('display', {})
    prior_display = prior.get('display', {})
    currency = raw.get('currency', 'USD')
    relevant = [row for row in daily if raw['from'] <= row['d'] <= raw['to']]
    tile_specs = TILES + ([('revenue','Estimated revenue','estimated revenue a day')] if 'revenue' in current else [])
    tiles = []
    for key,name,unit in tile_specs:
        approximated = raw.get('precision', {}).get(key) == 'rounded' or prior.get('precision', {}).get(key) == 'rounded'
        tiles.append({'key':TILE_KEYS[key], 'name':name, 'sub':'All channel content' if scope.startswith('All channel content') else scope,
            'value':display_value(key,current.get(key),display.get(key),currency),
            'compare':compare_text(key,current.get(key),previous.get(key),range_days,prior_display.get(key),currency,approximated),
            'spark':[row.get(DAILY_KEYS[key]) for row in relevant], 'unit':unit,
            'trend':[], 'trendNote':'Only the captured daily export is used; older trend rates are not reused.'})
    impressions,views,engaged = current.get('impressions'),current.get('views'),current.get('engagedViews')
    funnel = []
    for key,label,value in [('impr','Impressions',impressions),('views','Views',views),('engaged','Engaged views',engaged)]:
        funnel.append({'key':key,'label':label,'value':value,'text':fmt_count(value) or 'not captured',
            'share': (value/impressions if value is not None and impressions else None)})
    click = {'headline':fmt_percent(current.get('ctr')),'sub':"click-through, Studio's own figure",'funnel':funnel,
        'note':f'Captured Studio figures for {raw["from"]} to {raw["to"]}, {scope}. Views can include traffic without a counted impression, including advertising. Views divided by impressions is not CTR. Missing engaged-view data is withheld.'}
    watch_lines = [display_value('watchHours',current.get('watchHours')) or 'Watch time not captured',
        f'{fmt_duration(current.get("avdSeconds")) or "AVD not captured"} average view duration; {fmt_percent(current.get("avp")) or "AVP not captured"} of each video watched']
    watch = {'headline':fmt_percent(current.get('avp')),'sub':'average view percentage, captured in Studio',
        'averageViewPercentage':fmt_percent(current.get('avp')),'lines':watch_lines,'score':None,'compare':[],
        'note':f'Average view duration and percentage are captured separately for {raw["from"]} to {raw["to"]}. The earlier cross-channel fitted retention score has not been refreshed and is not presented as an October measurement.'}
    audience = raw.get('audience', {})
    returning,new = audience.get('returningViewers'),audience.get('newViewers')
    regular,casual = audience.get('regularViewers'),audience.get('casualViewers')
    basis = audience.get('basis', 'viewers')
    if returning is None and regular is not None and casual is not None and basis == 'viewers':
        returning = regular+casual
    classified = returning+new if returning is not None and new is not None else None
    share = returning/classified if classified else None
    segments = []
    if regular is not None and casual is not None and new is not None:
        segment_total = regular+casual+new
        if segment_total:
            for label,value in [('Regular',regular),('Casual',casual),('New',new)]:
                segments.append({'label':label,'share':value/segment_total,'text':f'{value/segment_total*100:.1f}% · {fmt_count(value)}'})
    replay = {'headline':fmt_percent(share),'sub':'of classified viewers returned','lines':[
        f'{fmt_count(returning) or "Not captured"} returning; {fmt_count(new) or "not captured"} new',
        f'{display_value("netSubscribers",current.get("netSubscribers")) or "Not captured"} net subscribers over {range_days} days'],
        'segments':segments,'segmentsBasis':basis,'sourceDays':audience.get('sourceDays'),
        'note':audience.get('note') or f'Viewer counts use the captured audience window ({audience.get("from",raw["from"])} to {audience.get("to",raw["to"])}). They are not sums of daily unique viewers. An unavailable fresh split is withheld.'}
    mismatch = []
    for key in ['views','watchHours','impressions','netSubscribers']:
        values = [row.get(DAILY_KEYS[key]) for row in relevant]
        if len(values) == range_days and all(value is not None for value in values) and current.get(key) is not None:
            tolerance = .11*range_days if key == 'watchHours' else 1
            if abs(sum(values)-current[key]) > tolerance:
                mismatch.append({'metric':key,'windowTotal':current[key],'dailySum':sum(values)})
    return {'days':days,'label':raw.get('label') or ('Last year' if days==365 else f'{days} days'),
        'from':raw['from'],'to':raw['to'],'rangeDays':range_days,'scope':scope,
        'prior':{'from':prior_first,'to':prior_last,'metrics':previous},'metrics':current,
        'sourceRef':raw.get('sourceRef'),'dailyMismatch':mismatch or None,
        'tiles':tiles,'click':click,'watch':watch,'replay':replay}

def compile_source(source_path):
    source = json.loads(source_path.read_text(encoding='utf-8-sig'))
    if not source.get('confirmed'):
        raise ValueError('Source is an unconfirmed template, not captured Studio evidence')
    if source.get('channelId') != CID:
        raise ValueError('Unexpected channel identity')
    if not source.get('scope') or 'Set this' in source['scope']:
        raise ValueError('The actual Studio content filter must be recorded')
    date.fromisoformat(source['pulledAt'])
    date.fromisoformat(source['dataThrough'])
    daily,totals = load_daily(source, source_path)
    windows = copy.deepcopy(source['windows'])
    for total in totals:
        raw = next(window for window in windows if window['days'] == total['days'])
        target = raw if total['period'] == 'current' else raw.setdefault('prior', {})
        existing = target.setdefault('metrics', {})
        for key,value in total['metrics'].items():
            if target.get('precision',{}).get(key) == 'rounded':
                existing[key] = value
                target['precision'].pop(key)
            elif value is not None:
                merge_value(existing, key, value, f'{total["days"]} days {total["period"]}')
    if sorted(window['days'] for window in windows) != [7,28,90,365]:
        raise ValueError('Capture must explicitly include the 7, 28, 90 and 365-day windows')
    compiled = [compile_window(raw,source,daily) for raw in windows]
    return {'channelId':CID,'channel':source.get('channel',"Hannah's Happy Home"),
        'pulledAt':source['pulledAt'],'capturedAtUtc':source.get('capturedAtUtc'),'dataThrough':source['dataThrough'],
        'dailyDays':len(daily),'defaultDays':source.get('defaultDays',28),'windows':compiled,'daily':daily,
        'trend':[],'uploads':source.get('uploads',[]),'niche':'homemaking','baseline':None,
        'scope':source['scope'],'sources':source.get('sources',[]),
        'trafficEvidence':source.get('trafficEvidence',[]),
        'measurementNote':'Fresh Studio capture. No public lifetime counts or stale September metrics substitute for missing current values.'}

def integrate(page, model):
    # Preserve existing upload-date markers when the new metric pull has no catalogue.
    if not model.get('uploads'):
        archived = re.search(r'<script>window\.__DASH__=(.*?);?</script>',page,re.S)
        if archived:
            existing = json.loads(archived.group(1).rstrip(';'))
            model = copy.deepcopy(model)
            model['uploads'] = existing.get('uploads',[])
    serialized = json.dumps(model,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c').replace('>','\\u003e')
    pattern = r'(<script>window\.__DASH__=).*?(</script>)'
    page,count = re.subn(pattern,lambda match:match[1]+serialized+';'+match[2],page,count=1,flags=re.S)
    if count != 1:
        raise ValueError('The expected __DASH__ data script is absent')
    page = re.sub(r'(<div class="dash-through">).*?(</div>)',lambda match:match[1]+'<i></i>Data through '+escape(model['dataThrough'])+' · Studio pull '+escape(model['pulledAt'])+match[2],page,count=1,flags=re.S)
    footer = f'Captured Studio figures, {model["scope"]}, pulled {model["pulledAt"]}; data through {model["dataThrough"]}. Current and prior date ranges are shown for the selected window. Missing fresh metrics are withheld. The prior-period chart uses only captured daily data.'
    page = re.sub(r'(<p class="dash-foot">).*?(</p>)',lambda match:match[1]+escape(footer)+match[2],page,count=1,flags=re.S)
    # Update the static default as well, so the page never initially shows September numbers.
    default = next(w for w in model['windows'] if w['days'] == model['defaultDays'])
    page = page.replace('Videos (long-form) · indexed to the earliest period = 100', 'All channel content, including paid traffic · indexed to the first available day = 100')
    tiles = ''.join('<div class="dt" data-tile="'+t['key']+'"><div class="dt-k">'+escape(t['name'])+'</div><div class="dt-s">'+escape(t['sub'])+'</div><div class="dt-v">'+escape(t['value'] or 'not captured')+'</div><div class="dt-c">'+escape(t['compare'])+'</div><svg class="dt-spark" viewBox="0 0 220 44" preserveAspectRatio="none" aria-hidden="true"></svg></div>' for t in default['tiles'])
    start = page.index('<div class="dash-tiles" id="dash-tiles">')
    stop = page.index('<p class="dash-tiles-note"',start)
    page = page[:start]+'<div class="dash-tiles" id="dash-tiles">'+tiles+'</div>\n  '+page[stop:]
    start = page.index('<div class="dash-depts">')
    stop = page.index('<div class="dept-panel"',start)
    departments=[]
    for key,label in [('click','Clickability'),('watch','Watchability'),('replay','Replayability')]:
        item=default[key]
        lines=''.join('<div class="dept-l">'+escape(line)+'</div>' for line in item.get('lines',[]))
        departments.append(f'<div class="dept" data-dept="{key}" role="button" tabindex="0" aria-expanded="false" aria-controls="dept-panel"><div class="dept-k"><i></i>{label}<span class="chev">&#8250;</span></div><div class="dept-face"><div class="dept-v">{escape(item["headline"] or "not captured")}</div><div class="dept-s">{escape(item["sub"])}</div>{lines}</div><span class="dept-more">Over time</span></div>')
    page=page[:start]+'<div class="dash-depts">'+''.join(departments)+'</div>\n  '+page[stop:]
    source_block='<details class="hannah-analytics-sources"><summary>Studio sources and data dates</summary><p>Studio exported on '+escape(model['pulledAt'])+'. Core metrics report through '+escape(model['dataThrough'])+'; daily audience classifications report through October 10. Later classifications remain gaps. All four windows and their matching prior periods use Studio aggregate totals. Daily charts use the two complete yearly exports; minor differences between separately generated reports are preserved.</p><p><a href="hannah-analytics-source-2026-10.json">Capture and provenance</a> · <a href="hannah-analytics-dashboard.json">Dashboard data</a> · <a href="hannah-analytics-2026-10/organic-paid-28.csv">Organic and paid traffic</a></p><ul>'+''.join('<li><a href="'+escape(s['file'])+'">'+escape(s['label'])+'</a></li>' for s in model['sources'] if s.get('file') and s['id']!='organic-paid-28')+'</ul></details>'
    if '<!-- hannah-analytics-sources:start -->' in page:
        page=re.sub(r'<!-- hannah-analytics-sources:start -->.*?<!-- hannah-analytics-sources:end -->',lambda _:'<!-- hannah-analytics-sources:start -->'+source_block+'<!-- hannah-analytics-sources:end -->',page,count=1,flags=re.S)
    else:
        page=page.replace('<p class="dash-foot">','<!-- hannah-analytics-sources:start -->'+source_block+'<!-- hannah-analytics-sources:end -->\n<p class="dash-foot">',1)
    overlay = '<!-- hannah-analytics-overlay:start -->\n<script src="hannah-analytics-overlay.js"></script>\n<!-- hannah-analytics-overlay:end -->'
    if '<!-- hannah-analytics-overlay:start -->' in page:
        page = re.sub(r'<!-- hannah-analytics-overlay:start -->.*?<!-- hannah-analytics-overlay:end -->',lambda _:overlay,page,count=1,flags=re.S)
    else:
        candidates = list(re.finditer(r'<script[^>]*>.*?</script>',page,re.S))
        renderer = next(match for match in candidates if 'var M = window.__DASH__' in match.group())
        page = page[:renderer.end()]+'\n'+overlay+page[renderer.end():]
    if 'href="hannah-analytics-overlay.css"' not in page:
        page = page.replace('</head>','<link rel="stylesheet" href="hannah-analytics-overlay.css">\n</head>',1)
    return page

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source',type=Path,default=ROOT/'channels/hannah-analytics-source-2026-10.json')
    parser.add_argument('--page',type=Path,default=ROOT/'channels'/f'{CID}.html')
    parser.add_argument('--model',type=Path,default=ROOT/'channels/hannah-analytics-dashboard.json')
    parser.add_argument('--output',type=Path)
    parser.add_argument('--apply',action='store_true')
    args = parser.parse_args()
    model = compile_source(args.source.resolve())
    args.model.parent.mkdir(parents=True,exist_ok=True)
    args.model.write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if args.output or args.apply:
        destination = args.output or args.page
        destination.parent.mkdir(parents=True,exist_ok=True)
        destination.write_text(integrate(args.page.read_text(encoding='utf-8'),model),encoding='utf-8')
        print(f'Wrote dashboard HTML: {destination}')
    print(f'Compiled {len(model["windows"])} windows and {model["dailyDays"]} captured daily rows; through {model["dataThrough"]}.')

if __name__ == '__main__':
    main()
