# Stripe Price ID Configuration

## What Are Price IDs?

Stripe Price IDs uniquely identify each product variant in your Stripe account. They look like `price_1234567890abcdef`.

## How to Find Your Price IDs

1. Log into your Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Products** in the sidebar
3. Click on a product (e.g., "LO_06")
4. Under "Pricing", you'll see the Price ID for that product
5. Copy the Price ID (starts with `price_`)

## How to Add Price IDs to Your Shop Pages

Each product page needs a `data-price-id` attribute on the checkout button.

### Example: LO_06

**Before:**
```html
<a href="https://buy.stripe.com/..." class="add-to-cart" data-product-id="LO_06">Checkout</a>
```

**After:**
```html
<a href="#" class="add-to-cart" data-product-id="LO_06" data-price-id="price_XXXXXXXXXXXXX">Checkout</a>
```

**Key changes:**
1. Change `href` from the Stripe Payment Link to `#` (we now use the API)
2. Add `data-price-id="price_XXXXXXXXXXXXX"` with the actual Stripe Price ID

## Product Page Checklist

Here's what needs to be updated for each product that uses dynamic checkout:

### LO Series Products
- [ ] lo-01.html
- [ ] lo-02.html
- [ ] lo-03.html
- [ ] lo-04.html
- [ ] lo-05.html
- [x] lo-06.html (EXAMPLE BELOW)
- [ ] lo-07.html
- [ ] lo-08.html
- [ ] lo-09.html
- [ ] lo-10.html
- [ ] lo-11.html
- [ ] lo-12.html
- [ ] lo-13.html
- [ ] lo-15.html
- [ ] lo-17.html
- [ ] lo-18.html
- [ ] lo-19.html
- [ ] lo-20.html
- [ ] lo-22.html
- [ ] lo-23.html
- [ ] lo-24.html
- [ ] lo-25.html
- [ ] lo-26.html
- [ ] lo-27.html
- [ ] lo-horse.html (has size variants - see note below)

### Other Shop Products
- [ ] liminal-lamp-s_shop.html
- [ ] vnsh_shop.html

## Products with Size Variants

For products like `LO_HORSE` that have multiple size options, you need:

1. A Price ID for each size variant in Stripe
2. Add `data-href="#"` and `data-price-id="price_XXX"` to each size option

**Example for LO_HORSE (size selector):**

```html
<select data-size-select>
  <option 
    data-size-value="LO_HORSE_S" 
    data-size-label="Small" 
    data-price="¥20,900 (tax included)"
    data-href="#"
    data-price-id="price_SMALL_VARIANT_ID"
  >Small (¥20,900)</option>
  <option 
    data-size-value="LO_HORSE_L" 
    data-size-label="Large" 
    data-price="¥27,500 (tax included)"
    data-href="#"
    data-price-id="price_LARGE_VARIANT_ID"
  >Large (¥27,500)</option>
</select>
```

The script will automatically pick up the price ID from the selected option.

## Testing Without Vercel Deployed

Before Vercel is deployed, the checkout button will show an error. This is expected.

Once you:
1. Add all price IDs to the HTML pages
2. Deploy to Vercel
3. Set `window.VERCEL_API_URL` in the HTML or update `script.js` with your Vercel URL

Then the integration will work end-to-end.

## Quick Migration Script

If you want to update all pages at once, you can use a find-and-replace pattern:

**Find:** `href="https://buy.stripe.com/([^"]+)" class="add-to-cart" data-product-id="([^"]+)"`

**Replace:** `href="#" class="add-to-cart" data-product-id="$2" data-price-id="NEEDS_PRICE_ID"`

Then manually replace each `NEEDS_PRICE_ID` with the actual Price ID from Stripe.
