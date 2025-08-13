const express = require('express');
const app = express();
const stripe = require('stripe')('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');

app.use(express.static('.'));

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: 'Liminal Light S',
          },
          unit_amount: 55000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:8080/success.html',
    cancel_url: 'http://localhost:8080/cancel.html',
  });

  res.json({ id: session.id });
});

app.post('/create-checkout-session-vnsh', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: 'VNSH',
          },
          unit_amount: 105600,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:8080/success.html',
    cancel_url: 'http://localhost:8080/cancel.html',
  });

  res.json({ id: session.id });
});

app.listen(8080, () => console.log('Running on port 8080'));
