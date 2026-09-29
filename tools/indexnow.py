#!/usr/bin/env python3
"""Tell Bing (and other IndexNow search engines) which sotanaka.com pages changed.

IndexNow re-crawls submitted pages within minutes instead of weeks. The key below is public by design:
the matching file https://sotanaka.com/<key>.txt proves the site owner sent the ping.

  python3 tools/indexnow.py            # submit every page in sitemap.xml, plus llms.txt
  python3 tools/indexnow.py /shop /bio # submit only these paths

Run it after a change is live on sotanaka.com, not before (Bing fetches the pages right away).
"""
import json, re, sys, urllib.request

KEY = '4c21395960cbf61eb1c45a178231a3b5'
HOST = 'sotanaka.com'

def main():
    if sys.argv[1:]:
        urls = ['https://' + HOST + (p if p.startswith('/') else '/' + p) for p in sys.argv[1:]]
    else:
        urls = re.findall(r'<loc>([^<]+)</loc>', open('sitemap.xml').read()) + ['https://' + HOST + '/llms.txt']
    live_key = urllib.request.urlopen(f'https://{HOST}/{KEY}.txt').read().decode().strip()
    if live_key != KEY:
        sys.exit(f'key file on {HOST} does not match: push {KEY}.txt first')
    body = json.dumps({'host': HOST, 'key': KEY, 'keyLocation': f'https://{HOST}/{KEY}.txt', 'urlList': urls}).encode()
    req = urllib.request.Request('https://api.indexnow.org/indexnow', data=body,
                                 headers={'Content-Type': 'application/json; charset=utf-8'})
    try:
        with urllib.request.urlopen(req) as r:
            print(f'IndexNow accepted {len(urls)} URLs: HTTP {r.status}')
    except urllib.error.HTTPError as e:
        sys.exit(f'IndexNow refused the submission: HTTP {e.code} {e.read().decode()[:300]}')

if __name__ == '__main__':
    main()
