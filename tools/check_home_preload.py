#!/usr/bin/env python3
"""Fail loudly if the homepage preload hints don't match the photo the homepage opens on.

landing.js sorts works.js newest year first (stable), so the first plate is the first
entry with the highest year. index.html preloads its halftone for phones and desktop.
When a newer work is added to works.js, this check fails until the preloads are updated.
Run from the repo root before pushing: python3 tools/check_home_preload.py
"""
import re, sys, os
from urllib.parse import quote

works = open('works.js', encoding='utf-8').read()
entries = []
for m in re.finditer(r"\{[^{}]*?year:\s*(\d+)[^{}]*?file:\s*'([^']+)'[^{}]*\}", works):
    suffix = re.search(r"monoSuffix:\s*'([^']+)'", m.group(0))
    entries.append((int(m.group(1)), m.group(2), suffix.group(1) if suffix else '_top_mono_result_result.webp'))
if not entries:
    sys.exit('check_home_preload: could not read any works from works.js')
top = max(e[0] for e in entries)
year, file, suffix = next(e for e in entries if e[0] == top)

html = open('index.html', encoding='utf-8').read()
problems = []
for folder, media in (('mono_2_mobile', '(max-width: 500px)'), ('mono_2', '(min-width: 501px)')):
    path = f'images/{folder}/{file}{suffix}'
    href = quote(path)
    if not os.path.exists(path):
        problems.append(f'missing file {path}')
    if not re.search(rf'<link rel="preload" as="image" href="{re.escape(href)}" media="{re.escape(media)}"', html):
        problems.append(f'index.html has no preload for {href} {media}')
if problems:
    sys.exit('check_home_preload FAILED (first homepage work is ' + file + '):\n  ' + '\n  '.join(problems))
print(f'homepage preload matches first work: {file}')
