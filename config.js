// Client configuration with rotated publishable keys
// Note: Publishable keys are designed to be public-facing (standard practice)
window.APP_CONFIG = {
  STRIPE_PUBLISHABLE_KEY: 'pk_live_51RqS8cEcQzNRltK0oSUn2LZvYIt5SM9xE35bMuP9Vm4NJNd8sZrse42tdB8SKZuhiTMw9LzxXLvFwTsggo1ZBiLQ00BkpLs8q5',
  AMPLITUDE_API_KEY: '7e0626f8ecc288c139cd3fe27fe1ad81',
  VERCEL_API_URL: window.location.origin + '/api/create-checkout'
};

// Legacy compatibility
window.STRIPE_PUBLISHABLE_KEY = window.APP_CONFIG.STRIPE_PUBLISHABLE_KEY;
window.AMPLITUDE_API_KEY = window.APP_CONFIG.AMPLITUDE_API_KEY;
window.VERCEL_API_URL = window.APP_CONFIG.VERCEL_API_URL;
