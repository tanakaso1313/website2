const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// --- Shipping rates (Japan Post EMS) ---
// Live Stripe shipping_rate IDs; override per-mode via env if ever needed.
const SHIP = {
  JP_FREE: process.env.SHIP_JP_FREE || 'shr_1TgBFdEcQzNRltK0bGC85vOY',
  ASIA_1:  process.env.SHIP_ASIA_1  || 'shr_1TgBFdEcQzNRltK0E91Xqxl1',
  ASIA_15: process.env.SHIP_ASIA_15 || 'shr_1TgBFdEcQzNRltK0BC8YYJBJ',
  EU_1:    process.env.SHIP_EU_1    || 'shr_1TgBFeEcQzNRltK0pPpEO99J',
  EU_15:   process.env.SHIP_EU_15   || 'shr_1TgBFeEcQzNRltK0XQiKdM6V',
  AMAF_1:  process.env.SHIP_AMAF_1  || 'shr_1TgBFeEcQzNRltK0ahd2ejsi',
  AMAF_15: process.env.SHIP_AMAF_15 || 'shr_1TgBFeEcQzNRltK0WKsjKVR0',
};

// --- Product catalog: server-side source of truth ---
// Keys are the data-product-id values the shop pages send.
//   name   : display label shown in the Stripe submit message (pretty, not the raw key).
//   prices : the ONLY price IDs allowed for this product (variants included).
//   band   : EMS volumetric weight band, hand-assigned from the packed-box volume
//            (box L x W x H cm / 5000): '1.0' bills up to 1.0kg EMS, '1.5' up to 1.5kg.
//            When adding a product, set its band from its packed box size.
//   jpOnly : ship to Japan only (large / high-value pieces).
// Any productId not listed here, or any price not in its `prices`, is rejected.
// This blocks price-swapping, the Japan-only bypass, tampering, and
// discontinued products being bought via direct link (they aren't listed).
const PRODUCTS = {
  'LO / 01':        { name: 'LO / 01',        prices: ['price_1Tg9jJEcQzNRltK0LVYhUP9Y'], band: '1.0' },
  'LO / 02':        { name: 'LO / 02',        prices: ['price_1Tg9jwEcQzNRltK0lbf6q7ww'], band: '1.0' },
  'LO / 03':        { name: 'LO / 03',        prices: ['price_1Tg9kfEcQzNRltK0cVsG7ijI'], band: '1.0' },
  'LO / 04':        { name: 'LO / 04',        prices: ['price_1Tg9t4EcQzNRltK0yBzsZk7c'], band: '1.0' },
  'LO / 05':        { name: 'LO / 05',        prices: ['price_1Tg9mgEcQzNRltK0GT9qPqns'], band: '1.5' },
  'LO / 06':        { name: 'LO / 06',        prices: ['price_1TgA1QEcQzNRltK0ls5ZWMvU'], band: '1.5' },
  'LO / 07':        { name: 'LO / 07',        prices: ['price_1TgA1QEcQzNRltK0N8PcDhrB'], band: '1.5' },
  'LO / 23':        { name: 'LO / 23',        prices: ['price_1SVmcPEcQzNRltK0T1pRh1kt'], band: '1.5' },
  'LO_HORSE':       { name: 'LO Horse',       prices: ['price_1SlKWcEcQzNRltK0Bi9GW64L', 'price_1SlKX3EcQzNRltK0lTUSdxTK'], band: '1.5' },
  'VNSH':           { name: 'VNSH',           prices: ['price_1SRanLEcQzNRltK0IPX6MFwN'], jpOnly: true },
  'LIMINAL LAMP S': { name: 'Liminal Lamp S', prices: ['price_1SvC2BEcQzNRltK0YfYIxscH'], jpOnly: true },
};

// --- Shipping regions (buyer picks one on the product page) ---
// Each region maps to its Stripe-supported destination countries
// (Georgia/Russia/Cuba + suspended states excluded) and the shipping rate
// applied for that region + the product's weight band.
const REGIONS = {
  japan: {
    countries: ['JP'],
    rate: () => SHIP.JP_FREE,
  },
  asia: {
    countries: ['CN','KR','TW','HK','MO','SG','MY','TH','VN','ID','PH','IN','LK','BD','NP','PK','KH','LA','MM','BN','BT','MV','MN'],
    rate: (band) => (band === '1.5' ? SHIP.ASIA_15 : SHIP.ASIA_1),
  },
  eu: {
    countries: ['AU','NZ','FJ','NC','PG','SB','CK','CA','MX','PM','AE','SA','QA','KW','OM','BH','JO','IL','LB','TR','IS','IE','GB','GG','JE','FR','DE','IT','ES','PT','NL','BE','LU','CH','AT','DK','NO','SE','FI','PL','CZ','SK','HU','RO','BG','GR','HR','SI','EE','LV','LT','MT','CY','AD','MC','SM','LI','MK','AZ'],
    rate: (band) => (band === '1.5' ? SHIP.EU_15 : SHIP.EU_1),
  },
  amaf: {
    countries: ['US','PR','GU','ZA','EG','MA','TN','DZ','KE','NG','GH','SN','CI','TG','UG','ET','GA','DJ','RW','ZW','MU','RE','BR','AR','CL','PE','CO','VE','EC','PY','UY','PA','CR','HN','SV','JM','TT','BB','GF','GP','MQ'],
    rate: (band) => (band === '1.5' ? SHIP.AMAF_15 : SHIP.AMAF_1),
  },
};

// Full EMS country list (union of all regions). Used as a fallback when no region
// is supplied (e.g. an older cached front end) so checkout never hard-fails.
const ALL_COUNTRIES = ['JP', ...REGIONS.asia.countries, ...REGIONS.eu.countries, ...REGIONS.amaf.countries];

// Resolve shipping option(s) + allowed countries for a product + chosen region.
// - Japan-only products always ship domestic (ignore any client region).
// - A valid region -> single rate for that region, address locked to it.
// - Missing/invalid region (old cached front end) -> show all options, self-select
//   (graceful fallback so checkout never breaks during front-end cache propagation).
function shippingFor(product, region) {
  if (product.jpOnly) {
    return { region: 'japan', allowed: ['JP'], options: [{ shipping_rate: SHIP.JP_FREE }] };
  }
  const def = region && REGIONS[region];
  if (def) {
    return { region, allowed: def.countries, options: [{ shipping_rate: def.rate(product.band) }] };
  }
  const heavy = product.band === '1.5';
  return {
    region: 'all',
    allowed: ALL_COUNTRIES,
    options: [
      { shipping_rate: SHIP.JP_FREE },
      { shipping_rate: heavy ? SHIP.ASIA_15 : SHIP.ASIA_1 },
      { shipping_rate: heavy ? SHIP.EU_15   : SHIP.EU_1 },
      { shipping_rate: heavy ? SHIP.AMAF_15 : SHIP.AMAF_1 },
    ],
  };
}

module.exports = async (req, res) => {
  // Restrict CORS to configured origins
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'https://sotanaka.com')
    .split(',').map(o => o.trim()).filter(Boolean);
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { productId, color, size, priceId, successUrl, cancelUrl, region } = req.body;

    // Validate product + price against the server-side catalog.
    // Never trust the client's product/price pairing.
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'Invalid product' });
    }
    const product = PRODUCTS[productId];
    if (!product) {
      return res.status(400).json({ error: 'This product is not available for purchase.' });
    }
    if (!priceId || typeof priceId !== 'string' || !product.prices.includes(priceId)) {
      return res.status(400).json({ error: 'Invalid price for this product.' });
    }

    // Exact-origin URL validation (no prefix matching -> blocks sotanaka.com.evil.com)
    const validateUrl = (url) => {
      if (!url) return false;
      try {
        const u = new URL(url);
        if (u.protocol !== 'https:') return false;
        return allowedOrigins.some(o => {
          try { return new URL(o).origin === u.origin; } catch { return false; }
        });
      } catch {
        return false;
      }
    };
    if (successUrl && !validateUrl(successUrl)) {
      return res.status(400).json({ error: 'Invalid success URL' });
    }
    if (cancelUrl && !validateUrl(cancelUrl)) {
      return res.status(400).json({ error: 'Invalid cancel URL' });
    }

    if (color && (typeof color !== 'string' || color.length > 50)) {
      return res.status(400).json({ error: 'Invalid color' });
    }
    if (size && (typeof size !== 'string' || size.length > 50)) {
      return res.status(400).json({ error: 'Invalid size' });
    }

    // Optional variant label for the Stripe submit message
    const nameParts = [];
    if (size) nameParts.push(size);
    if (color) nameParts.push(color);
    const nameSuffix = nameParts.length > 0 ? ` (${nameParts.join(', ')})` : '';

    // Shipping derived from the trusted catalog entry + the region the buyer chose
    // (falls back to all options if no region supplied; never hard-fails).
    const shipping = shippingFor(product, region);

    // Checkout messaging: duties notice (international destinations only) + optional variant label.
    // Domestic Japan skips the import-duties notice (irrelevant for domestic buyers).
    const customText = {};
    if (shipping.region !== 'japan') {
      customText.shipping_address = {
        message: 'Import duties and taxes are not included and are the responsibility of the recipient.',
      };
    }
    if (nameSuffix) {
      customText.submit = { message: `${product.name}${nameSuffix}` };
    }

    // Trusted base for redirect fallbacks (never derive from the Origin header)
    const SITE = allowedOrigins[0] || 'https://sotanaka.com';

    const session = await stripe.checkout.sessions.create({
      // payment_method_types omitted: Stripe auto-shows the methods enabled in the
      // Dashboard (card, Apple Pay, Google Pay, Link, etc.) for better conversion.
      line_items: [
        { price: priceId, quantity: 1, adjustable_quantity: { enabled: false } },
      ],
      ...(Object.keys(customText).length && { custom_text: customText }),
      mode: 'payment',
      success_url: successUrl || `${SITE}/success.html`,
      cancel_url: cancelUrl || `${SITE}/cancel.html`,
      metadata: {
        product_id: productId,
        color: color || '',
        size: size || '',
        ship_band: product.jpOnly ? 'jp_only' : product.band,
        ship_region: shipping.region,
      },
      payment_intent_data: {
        metadata: {
          product_id: productId,
          color: color || '',
          size: size || '',
        },
      },
      billing_address_collection: 'required',
      // Address locked to the chosen region; single rate for that region + band
      shipping_address_collection: { allowed_countries: shipping.allowed },
      shipping_options: shipping.options,
      automatic_tax: { enabled: true },
      allow_promotion_codes: false,
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    // Log full error server-side; return a generic message (no internal detail leak)
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
