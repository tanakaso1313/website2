#!/usr/bin/env python3
"""Fail loudly when bio.html's two press lists disagree.

The press section exists twice: the list people read, and a copy inside the page's
structured data that Google and AI tools read. Nothing else keeps them in step, so adding
a piece to one and forgetting the other is silent, and the machine-readable copy is the
one nobody looks at. Run from the repo root before pushing:
python3 tools/check_press_list.py
"""
import html, json, re, sys

page = open('bio.html', encoding='utf-8').read()

section = re.search(r'<h2>Press</h2>(.*?)<h2>', page, re.S)
if not section:
    sys.exit('check_press_list FAILED: no <h2>Press</h2> section in bio.html')

visible = []
for row in re.finditer(
        r'<div class="cv-item"><span>(\d{4})</span>'
        r'<span class="cv-item-description"><a href="([^"]+)"[^>]*>(.*?)</a>',
        section.group(1), re.S):
    year, url, label = row.group(1), row.group(2), html.unescape(row.group(3)).strip()
    if ', ' not in label:
        sys.exit(f'check_press_list FAILED: no ", publisher" in visible entry: {label[:70]}')
    title, publisher = label.rsplit(', ', 1)
    visible.append({'year': year, 'url': url, 'title': title, 'publisher': publisher})

if not visible:
    sys.exit('check_press_list FAILED: press section found but no entries parsed')

marked = None
for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page, re.S):
    try:
        data = json.loads(block)
    except json.JSONDecodeError as e:
        sys.exit(f'check_press_list FAILED: structured data does not parse: {e}')
    nodes = data.get('@graph', []) if isinstance(data, dict) else data
    for node in nodes if isinstance(nodes, list) else []:
        if isinstance(node, dict) and 'subjectOf' in node:
            marked = [{'year': str(a.get('datePublished', ''))[:4],
                       'url': a.get('url', ''),
                       'title': html.unescape(a.get('headline', '')),
                       'publisher': (a.get('publisher') or {}).get('name', '')}
                      for a in node['subjectOf']]
if marked is None:
    sys.exit('check_press_list FAILED: no subjectOf list in bio.html structured data')

problems = []
if len(visible) != len(marked):
    problems.append(f'{len(visible)} entries on the page, {len(marked)} in the structured data')

for i, (v, m) in enumerate(zip(visible, marked), 1):
    for field in ('url', 'title', 'publisher', 'year'):
        if v[field] != m[field]:
            problems.append(f'entry {i} {field}: page has "{v[field]}", '
                            f'structured data has "{m[field]}"')

only_page = [v['url'] for v in visible if v['url'] not in {m['url'] for m in marked}]
only_data = [m['url'] for m in marked if m['url'] not in {v['url'] for v in visible}]
problems += [f'on the page but not in the structured data: {u}' for u in only_page]
problems += [f'in the structured data but not on the page: {u}' for u in only_data]

if problems:
    sys.exit('check_press_list FAILED, bio.html press lists disagree:\n  '
             + '\n  '.join(problems))
print(f'bio.html press lists agree, {len(visible)} entries')
