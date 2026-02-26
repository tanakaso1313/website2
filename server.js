delete require.cache[require.resolve('dotenv')];
require('dotenv').config({ override: true });
const express = require('express');
const helmet = require('helmet');
const app = express();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Allow local browsing even if Stripe isn't configured yet.
// (Checkout will return a clear error until STRIPE_SECRET_KEY is set.)
let stripe = null;
if (stripeSecretKey) {
    stripe = require('stripe')(stripeSecretKey);
} else {
    console.warn('[stripe] STRIPE_SECRET_KEY is not set. Checkout is disabled.');
}
const fs = require('fs');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://js.stripe.com/v3/", "https://cdn.amplitude.com/"],
            frameSrc: ["'self'", "https://js.stripe.com/"],
            connectSrc: ["'self'", "https://api.amplitude.com", "https://api2.amplitude.com"]
        }
    },
    strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    frameguard: {
        action: 'deny'
    },
    referrerPolicy: {
        policy: 'no-referrer'
    },
    permissionsPolicy: {
        policy: {
            geolocation: ["'none'"],
            midi: ["'none'"],
            microphone: ["'none'"],
            camera: ["'none'"],
            magnetometer: ["'none'"],
            gyroscope: ["'none'"],
            speaker: ["'none'"],
            fullscreen: ["'self'"],
            payment: ["'self'"]
        }
    }
}));
app.use(express.static('.'));
app.use(express.json());

const products = JSON.parse(fs.readFileSync('products.json', 'utf-8'));

app.post('/create-checkout-session', async (req, res) => {
    const { productId, color, size } = req.body;

    if (!stripe) {
        return res.status(500).json({
            error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY on the server.'
        });
    }

    const product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // Robust parse to support strings like "68,182JPY + tax" or "68,182 yen + tax"
    const unitAmount = parseInt(product.price.replace(/[^0-9]/g, ''), 10);

    const metadata = {};
    if (color) {
        metadata.color = color;
    }
    if (size) {
        metadata.size = size;
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        payment_intent_data: {
            metadata,
        },
        line_items: [{
            price_data: {
                currency: 'jpy',
                product_data: {
                    name: product.name,
                    metadata,
                },
                unit_amount: unitAmount,
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/success.html`,
        cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
        metadata,
    });

    res.json({ id: session.id });
});

app.listen(8080, () => console.log('Running on port 8080'));
