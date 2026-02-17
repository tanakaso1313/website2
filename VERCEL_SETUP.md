# Vercel Setup Guide

## Overview
This project uses Vercel serverless functions to handle Stripe checkout sessions with proper metadata capture for product variants (color, size).

## Prerequisites
1. Vercel account (free tier works)
2. Stripe account with API keys

## Setup Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Install Dependencies
```bash
cd website2
npm install
```

### 3. Configure Stripe Keys
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your Stripe keys to `.env`:
   - Get keys from: https://dashboard.stripe.com/apikeys
   - Use test keys for development
   - Use live keys for production

### 4. Test Locally
```bash
vercel dev
```
This will start a local development server that simulates Vercel's serverless environment.

### 5. Deploy to Vercel
```bash
vercel
```
Follow the prompts to link to your Vercel project.

### 6. Add Environment Variables to Vercel
In the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

### 7. Update Your Website
After deployment, update `script.js` to use your Vercel API URL:
```javascript
const VERCEL_API_URL = 'https://your-project.vercel.app/api/create-checkout';
```

## API Endpoint

### POST /api/create-checkout
Creates a Stripe checkout session with metadata.

**Request Body:**
```json
{
  "productId": "LO_06",
  "color": "Green",
  "size": "Large",
  "priceId": "price_1234567890",
  "successUrl": "https://sotanaka.com/success",
  "cancelUrl": "https://sotanaka.com/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

## How It Works

1. User selects product variant (color/size) on the website
2. Frontend calls `/api/create-checkout` with product details
3. Vercel serverless function creates Stripe checkout session with metadata
4. Metadata is stored in both the checkout session AND payment intent
5. User completes payment on Stripe's hosted checkout page
6. Metadata appears in Stripe dashboard for the order

## Benefits
- ✅ Color and size selections captured in Stripe metadata
- ✅ Works with GitHub Pages static hosting
- ✅ No need to maintain a separate backend server
- ✅ Free tier supports most small shops
- ✅ Automatic HTTPS and global CDN

## Troubleshooting

### API returns 500 error
- Check Vercel function logs in dashboard
- Verify Stripe API keys are set correctly
- Ensure `STRIPE_SECRET_KEY` starts with `sk_`

### CORS errors
- The API allows all origins (`*`)
- If you need to restrict, update `Access-Control-Allow-Origin` in `api/create-checkout.js`

### Metadata not showing in Stripe
- Check that both `metadata` and `payment_intent_data.metadata` are set
- Verify the API call includes color/size in request body
