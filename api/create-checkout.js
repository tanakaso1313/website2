const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Restrict CORS to specific allowed origins
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'https://sotanaka.com').split(',');
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, color, size, priceId, successUrl, cancelUrl } = req.body;

    // Input validation
    if (!productId || typeof productId !== 'string' || productId.length > 100) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    if (!priceId || typeof priceId !== 'string' || !priceId.startsWith('price_')) {
      return res.status(400).json({ error: 'Invalid price ID' });
    }
    
    // Validate URLs to prevent open redirect
    const validateUrl = (url, fieldName) => {
      if (!url) return false;
      try {
        const parsed = new URL(url);
        // Only allow https and same origin
        return parsed.protocol === 'https:' && allowedOrigins.some(o => url.startsWith(o));
      } catch {
        return false;
      }
    };
    
    if (successUrl && !validateUrl(successUrl, 'successUrl')) {
      return res.status(400).json({ error: 'Invalid success URL' });
    }
    
    if (cancelUrl && !validateUrl(cancelUrl, 'cancelUrl')) {
      return res.status(400).json({ error: 'Invalid cancel URL' });
    }
    
    // Validate optional color and size
    if (color && (typeof color !== 'string' || color.length > 50)) {
      return res.status(400).json({ error: 'Invalid color' });
    }
    
    if (size && (typeof size !== 'string' || size.length > 50)) {
      return res.status(400).json({ error: 'Invalid size' });
    }

    // Build product name suffix from color/size if provided
    const nameParts = [];
    if (size) nameParts.push(size);
    if (color) nameParts.push(color);
    const nameSuffix = nameParts.length > 0 ? ` (${nameParts.join(', ')})` : '';

    // Create Stripe checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
          adjustable_quantity: {
            enabled: false,
          },
        },
      ],
      // Add product name customization
      ...(nameSuffix && {
        custom_text: {
          submit: {
            message: `${productId}${nameSuffix}`,
          },
        },
      }),
      mode: 'payment',
      success_url: successUrl || `${req.headers.origin}/success`,
      cancel_url: cancelUrl || `${req.headers.origin}/cancel`,
      metadata: {
        product_id: productId,
        color: color || '',
        size: size || '',
      },
      // Also store in payment intent metadata
      payment_intent_data: {
        metadata: {
          product_id: productId,
          color: color || '',
          size: size || '',
        },
      },
      // Capture customer details
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['JP', 'US', 'CA', 'GB', 'AU'],
      },
      // Enable automatic tax
      automatic_tax: {
        enabled: true,
      },
      // Disable promotion codes
      allow_promotion_codes: false,
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
};
