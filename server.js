require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://js.stripe.com/v3/"],
            frameSrc: ["'self'", "https://js.stripe.com/"]
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
    const { productId } = req.body;
    const product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const unitAmount = parseInt(product.price.replace(/,/g, '').replace('JPY', ''));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'jpy',
                product_data: {
                    name: product.name,
                },
                unit_amount: unitAmount,
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/success.html`,
        cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
    });

    res.json({ id: session.id });
});

app.listen(8080, () => console.log('Running on port 8080'));
