import re
import os
from pathlib import Path

# Find all HTML files in website2 directory
website_dir = Path('website2')
html_files = list(website_dir.glob('*.html'))

print(f"Found {len(html_files)} HTML files to process")

for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Pattern 1: Replace inline amplitude init with hardcoded key
    # Matches: window.amplitude.init('746eec9391b45c0239325340cd3baadd', ...)
    content = re.sub(
        r"window\.amplitude\.init\(['\"]([a-f0-9]{32})['\"],",
        "window.amplitude.init(window.AMPLITUDE_API_KEY || '\\1',",
        content
    )
    
    # Pattern 2: Replace standalone amplitude.init
    # Matches: amplitude.init('d6ae733fdc47ac47f3ac0cb28e7f78bf', ...)
    content = re.sub(
        r"amplitude\.init\(['\"]([a-f0-9]{32})['\"],",
        "amplitude.init(window.AMPLITUDE_API_KEY || '\\1',",
        content
    )
    
    if content != original:
        # Add config.js script tag if not present
        if '<script src="config.js"></script>' not in content and 'config.js' not in content:
            # Insert before first <script> tag or before </head>
            if '<script' in content:
                content = content.replace('<script', '<script src="config.js"></script>\n    <script', 1)
            elif '</head>' in content:
                content = content.replace('</head>', '    <script src="config.js"></script>\n</head>')
        
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Updated {html_file.name}")
    else:
        print(f"- No changes needed for {html_file.name}")

print("\nDone! All HTML files processed.")
