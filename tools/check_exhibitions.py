#!/usr/bin/env python3
"""Fail loudly when bio.html's two records of an exhibition disagree.

Exhibitions are written twice on the bio page: the forthcoming list people read, and the
structured data search engines read. The homepage's "now showing" line reads the structured
copy, so a date corrected in the prose and not in the structured data would leave the homepage
announcing the wrong dates while the bio page looked right. Run from the repo root before pushing:
python3 tools/check_exhibitions.py
"""
import html, json, re, sys

MONTHS = {m: i + 1 for i, m in enumerate(
    ['January', 'February', 'March', 'April', 'May', 'June',
     'July', 'August', 'September', 'October', 'November', 'December'])}

page = open('bio.html', encoding='utf-8').read()

section = re.search(r'Forthcoming exhibitions(.*?)Past exhibitions', page, re.S)
if not section:
    sys.exit('check_exhibitions FAILED: no forthcoming exhibitions section in bio.html')

visible = []
for when, body in re.findall(
        r'<div class="cv-item"><span>(.*?)</span><span class="cv-item-description">(.*?)</span>',
        section.group(1), re.S):
    when = html.unescape(re.sub(r'<[^>]+>', '', when)).strip()
    body = html.unescape(re.sub(r'<[^>]+>', '', body)).strip()
    # "October 9-November 8, 2026" carries real dates; a bare year does not
    span = re.match(r'([A-Z][a-z]+) (\d{1,2})\s*[\u2013\u2014-]\s*([A-Z][a-z]+) (\d{1,2}), (\d{4})$', when)
    parts = [p.strip() for p in body.split(',')]
    if len(parts) < 2:
        sys.exit(f'check_exhibitions FAILED: cannot read venue and city from "{body[:60]}"')
    entry = {'venue': parts[0], 'city': parts[1], 'label': when}
    if span:
        m1, d1, m2, d2, year = span.groups()
        if m1 not in MONTHS or m2 not in MONTHS:
            sys.exit(f'check_exhibitions FAILED: unknown month in "{when}"')
        entry['start'] = f'{year}-{MONTHS[m1]:02d}-{int(d1):02d}'
        entry['end'] = f'{year}-{MONTHS[m2]:02d}-{int(d2):02d}'
    visible.append(entry)

if not visible:
    sys.exit('check_exhibitions FAILED: forthcoming section found but no entries parsed')

marked = []
for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page, re.S):
    try:
        data = json.loads(block)
    except json.JSONDecodeError as e:
        sys.exit(f'check_exhibitions FAILED: structured data does not parse: {e}')
    nodes = data.get('@graph', []) if isinstance(data, dict) else (
        data if isinstance(data, list) else [data])
    for node in nodes:
        if not isinstance(node, dict) or node.get('@type') != 'ExhibitionEvent':
            continue
        place = node.get('location') or {}
        marked.append({'venue': place.get('name'),
                       'city': (place.get('address') or {}).get('addressLocality'),
                       'start': node.get('startDate'), 'end': node.get('endDate')})

problems = []
dated = [v for v in visible if 'start' in v]

for v in dated:
    match = [m for m in marked if m['venue'] == v['venue']]
    if not match:
        problems.append(f'"{v["venue"]}" is listed as {v["label"]} but has no structured data, '
                        f'so the homepage will not know it is on')
        continue
    m = match[0]
    for field in ('start', 'end'):
        if v[field] != m.get(field):
            problems.append(f'{v["venue"]} {field}: the list says {v[field]}, '
                            f'the structured data says {m.get(field)}')
    if v['city'] != m.get('city'):
        problems.append(f'{v["venue"]} city: the list says "{v["city"]}", '
                        f'the structured data says "{m.get("city")}"')

for m in marked:
    if not any(v['venue'] == m['venue'] for v in dated):
        problems.append(f'"{m["venue"]}" has structured data but no dated entry in the list, '
                        f'so the homepage may announce an exhibition the bio page does not show')

for m in marked:
    if not m.get('start') or not m.get('end'):
        problems.append(f'"{m["venue"]}" structured data is missing a start or end date')

if problems:
    sys.exit('check_exhibitions FAILED, bio.html disagrees with itself:\n  ' + '\n  '.join(problems))

undated = [v['venue'] for v in visible if 'start' not in v]
note = f' ({len(undated)} with a year only, not announced: {", ".join(undated)})' if undated else ''
print(f'bio.html exhibitions agree, {len(dated)} dated{note}')
