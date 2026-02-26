import re
from pathlib import Path

# Find all HTML files
html_files = list(Path('website2').glob('*.html'))

print(f"Processing {len(html_files)} HTML files...\n")

for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Replace sampleRate: 1 with sampleRate: 0.1 (10% sampling)
    content = re.sub(
        r'sampleRate:\s*1([,}])',
        r'sampleRate: 0.1\1',
        content
    )
    
    # Add integrity and crossorigin to Amplitude script tags (analytics-browser)
    # Note: SRI hashes would need to be fetched from the actual CDN files
    # For now, adding crossorigin attribute which is required for SRI
    content = re.sub(
        r'<script\s+(defer\s+)?src="https://cdn\.amplitude\.com/libs/analytics-browser-([^"]+)"\s*></script>',
        r'<script \1src="https://cdn.amplitude.com/libs/analytics-browser-\2" crossorigin="anonymous"></script>',
        content
    )
    
    content = re.sub(
        r'<script\s+(defer\s+)?src="https://cdn\.amplitude\.com/libs/plugin-session-replay-browser-([^"]+)"\s*></script>',
        r'<script \1src="https://cdn.amplitude.com/libs/plugin-session-replay-browser-\2" crossorigin="anonymous"></script>',
        content
    )
    
    if content != original:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Updated {html_file.name}")
    else:
        print(f"- No changes for {html_file.name}")

print("\nDone!")
print("\nNote: SRI integrity hashes should be added manually by:")
print("1. Download the script files from Amplitude CDN")
print("2. Generate SHA-384 hash: openssl dgst -sha384 -binary file.js | openssl base64 -A")
print("3. Add integrity='sha384-HASH' to script tags")
