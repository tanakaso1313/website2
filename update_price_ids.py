#!/usr/bin/env python3
"""
Script to update all product HTML files with Stripe Price IDs
"""

import csv
import re
import os
from pathlib import Path

# Price ID mapping from the corrected CSV (line 2 onwards, most recent prices)
price_map = {
    'LO_20': 'price_1T1flVEcQzNRltK0yQiG7aZX',  # ¥33,000
    'LIMINAL LAMP S': 'price_1SvC2BEcQzNRltK0YfYIxscH',  # ¥66,000
    'LO_HORSE_L': 'price_1SlKX3EcQzNRltK0lTUSdxTK',  # ¥27,500
    'LO_HORSE_S': 'price_1SlKWcEcQzNRltK0Bi9GW64L',  # ¥20,900
    'LO_06': 'price_1SVu3XEcQzNRltK0doDGqweT',  # ¥20,900
    'LO_27': 'price_1SVme7EcQzNRltK0q5Ry3T4O',  # ¥40,700
    'LO_26': 'price_1SVmdnEcQzNRltK04AMEWA4i',  # ¥35,200
    'LO_25': 'price_1SVmdOEcQzNRltK0MtrUkQzz',  # ¥35,200
    'LO_24': 'price_1SVmcnEcQzNRltK0TU6d1xpc',  # ¥40,700
    'LO_23': 'price_1SVmcPEcQzNRltK0T1pRh1kt',  # ¥27,500
    'LO_22': 'price_1SVmc2EcQzNRltK0MC90bvD1',  # ¥38,500
    'LO_11': 'price_1SVmYEEcQzNRltK0jOcxsg4L',  # ¥30,800
    'LO_10': 'price_1SVmXtEcQzNRltK0dsh8BZtb',  # ¥23,100
    'LO_09': 'price_1SVmXPEcQzNRltK0QsEq7lUL',  # ¥25,300
    'LO_07': 'price_1SVmWLEcQzNRltK0m5RbuiD0',  # ¥23,100
    'LO_05': 'price_1SVmUsEcQzNRltK0qwk91vZQ',  # ¥20,900
    'LO_02': 'price_1SVmP2EcQzNRltK05KJowWeL',  # ¥11,000
    'VNSH': 'price_1SRanLEcQzNRltK0IPX6MFwN',  # ¥126,500
}

# Product ID to filename mapping
product_files = {
    'LO_02': 'lo-02.html',
    'LO_05': 'lo-05.html',
    'LO_06': 'lo-06.html',
    'LO_07': 'lo-07.html',
    'LO_09': 'lo-09.html',
    'LO_10': 'lo-10.html',
    'LO_11': 'lo-11.html',
    'LO_20': 'lo-20.html',
    'LO_22': 'lo-22.html',
    'LO_23': 'lo-23.html',
    'LO_24': 'lo-24.html',
    'LO_25': 'lo-25.html',
    'LO_26': 'lo-26.html',
    'LO_27': 'lo-27.html',
    'LO_HORSE': 'lo-horse.html',  # Has size variants
    'LIMINAL LAMP S': 'liminal-lamp-s_shop.html',
    'VNSH': 'vnsh_shop.html',
}

def update_html_file(filepath, product_id):
    """Update an HTML file with the price ID"""
    if not os.path.exists(filepath):
        print(f"[SKIP] File not found: {filepath}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # For LO_HORSE, handle size variants in <option> tags
    if product_id == 'LO_HORSE':
        # Update Small variant
        content = re.sub(
            r'(<option[^>]*data-size-value="LO_HORSE_S"[^>]*)(>)',
            rf'\1 data-price-id="{price_map["LO_HORSE_S"]}"\2',
            content
        )
        # Update Large variant
        content = re.sub(
            r'(<option[^>]*data-size-value="LO_HORSE_L"[^>]*)(>)',
            rf'\1 data-price-id="{price_map["LO_HORSE_L"]}"\2',
            content
        )
        # Also update the main checkout button href and add data-product-id
        content = re.sub(
            r'<a\s+href="https://buy\.stripe\.com/[^"]+"\s+class="add-to-cart"',
            f'<a href="#" class="add-to-cart" data-product-id="LO_HORSE"',
            content
        )
    else:
        # Regular products: replace Stripe link with # and add data-price-id
        price_id = price_map.get(product_id)
        if not price_id:
            print(f"[WARN] No price ID found for {product_id}")
            return False
        
        # Pattern 1: Update existing data-product-id button
        pattern1 = rf'(<a\s+href="[^"]*"\s+class="add-to-cart"\s+data-product-id="{re.escape(product_id)}")(>)'
        if re.search(pattern1, content):
            # Already has data-product-id, just add data-price-id if missing
            if 'data-price-id' not in content:
                content = re.sub(pattern1, rf'\1 data-price-id="{price_id}"\2', content)
                # Also update href to #
                content = re.sub(
                    rf'(<a\s+)href="https://buy\.stripe\.com/[^"]+"(\s+class="add-to-cart"\s+data-product-id="{re.escape(product_id)}")',
                    rf'\1href="#"\2',
                    content
                )
        else:
            # Pattern 2: Button with Stripe link but no data-product-id
            pattern2 = r'<a\s+href="https://buy\.stripe\.com/[^"]+"\s+class="add-to-cart"'
            if re.search(pattern2, content):
                content = re.sub(
                    pattern2,
                    f'<a href="#" class="add-to-cart" data-product-id="{product_id}" data-price-id="{price_id}"',
                    content
                )
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[UPDATED] {filepath}")
        return True
    else:
        print(f"[NO CHANGE] {filepath}")
        return False

if __name__ == '__main__':
    updated_count = 0
    for product_id, filename in product_files.items():
        filepath = Path(__file__).parent / filename
        if update_html_file(str(filepath), product_id):
            updated_count += 1
    
    print(f"\n✅ Updated {updated_count} files")
