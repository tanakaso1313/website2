const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Enable CORS for GitHub Pages domain
  res.setHeader('Access-Control-Allow-Origin', '*');
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

    if (!productId || !priceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Stripe checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
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
