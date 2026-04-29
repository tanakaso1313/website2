# TODO - sotanaka.com

## Stripe Setup & Branding

### 1. Add Custom Logo to Stripe Receipt Emails
- [ ] Log in to Stripe Dashboard: https://dashboard.stripe.com
- [ ] Go to Settings → Branding
- [ ] Upload brand logo/icon (recommended: square image, at least 128×128px, PNG or JPG)
- [ ] Customize brand color and email footer (optional)
- [ ] Test by sending a test receipt email

### 2. Set Up Custom Domain for Stripe Checkout
- [ ] In Stripe Dashboard → Settings → Branding
- [ ] Configure custom domain: `checkout.sotanaka.com`
- [ ] Copy the CNAME record details from Stripe
- [ ] Add CNAME record in GoDaddy:
  - Name: `checkout`
  - Value: (from Stripe, e.g., `hosted-checkout.stripe.com`)
  - TTL: default (1 hour)
- [ ] Wait for DNS propagation (15-60 minutes)
- [ ] Verify activation in Stripe Dashboard
- [ ] Test checkout flow to confirm custom domain is working

---

## Benefits of Custom Domain:
- ✨ Customers stay on sotanaka.com during checkout (no redirect to stripe.com)
- ✨ More professional appearance
- ✨ Higher trust and potentially better conversion rates
- ✨ Seamless branding throughout purchase journey
