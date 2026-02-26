// Configuration loaded from server or environment
// This file should be generated server-side and never contain actual secrets
window.APP_CONFIG = {
  STRIPE_PUBLISHABLE_KEY: '', // Set via server
  AMPLITUDE_API_KEY: '', // Set via server
  VERCEL_API_URL: window.location.origin + '/api/create-checkout'
};

// Legacy compatibility
window.STRIPE_PUBLISHABLE_KEY = window.APP_CONFIG.STRIPE_PUBLISHABLE_KEY;
window.AMPLITUDE_API_KEY = window.APP_CONFIG.AMPLITUDE_API_KEY;
window.VERCEL_API_URL = window.APP_CONFIG.VERCEL_API_URL;
