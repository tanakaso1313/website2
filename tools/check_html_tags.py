#!/usr/bin/env python3
"""Fail loudly on an unclosed <meta ...> or <link ...> line in any page.

A missing ">" silently swallows the next tag: it hid the 404 page's stylesheet and the
noindex rule on the order pages for months. Run from the repo root before pushing:
python3 tools/check_html_tags.py        (add --fix to close them)
"""
import re, subprocess, sys

fix = '--fix' in sys.argv
bad = []
for f in subprocess.check_output(['git', 'ls-files', '*.html']).decode().split():
    lines = open(f, encoding='utf-8').read().split('\n')
    changed = False
    for i, line in enumerate(lines):
        s = line.rstrip()
        if re.match(r'\s*<(meta|link)\b', s) and not s.endswith('>'):
            # a tag continued on the next line is fine only if that line is not a new tag
            nxt = lines[i + 1].strip() if i + 1 < len(lines) else ''
            if nxt.startswith('<') or nxt == '':
                bad.append(f'{f}:{i + 1}: {s.strip()[:90]}')
                if fix:
                    lines[i] = s + '>'
                    changed = True
    if changed:
        open(f, 'w', encoding='utf-8').write('\n'.join(lines))
if bad and not fix:
    sys.exit('check_html_tags FAILED, unclosed tags:\n  ' + '\n  '.join(bad))
print(f'fixed {len(bad)} unclosed tags' if fix else 'no unclosed meta/link tags')
