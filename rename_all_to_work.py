import re
import os

def rename_all_to_work(file_path):
    """Rename ALL to WORK in navigation while preserving structure."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Pattern 1: >ALL <span class="toggle-btn"
    content = re.sub(
        r'>ALL <span class="toggle-btn"',
        r'>WORK <span class="toggle-btn"',
        content
    )
    
    # Pattern 2: In case there are variations like >ALL< without space before span
    content = re.sub(
        r'>ALL<span class="toggle-btn"',
        r'>WORK<span class="toggle-btn"',
        content
    )
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Find all HTML files
html_files = [f for f in os.listdir('.') if f.endswith('.html')]

updated_count = 0
for html_file in sorted(html_files):
    if rename_all_to_work(html_file):
        updated_count += 1
        print(f"✓ Updated: {html_file}")
    else:
        print(f"  No changes: {html_file}")

print(f"\n{updated_count}/{len(html_files)} files updated")
