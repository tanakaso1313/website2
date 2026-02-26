/**
 * Amplitude Analytics initialization module
 * Handles Amplitude SDK initialization with session replay
 */
(function initAmplitude() {
    'use strict';
    
    // Check if Amplitude libraries are loaded
    if (typeof window.amplitude !== 'undefined' && typeof window.sessionReplay !== 'undefined') {
        // Add session replay plugin with 10% sample rate
        window.amplitude.add(window.sessionReplay.plugin({sampleRate: 0.1}));
        
        // Initialize Amplitude with API key from config.js or fallback
        window.amplitude.init(
            window.AMPLITUDE_API_KEY || '746eec9391b45c0239325340cd3baadd',
            {"autocapture": {"elementInteractions": true}}
        );
    } else {
        // Retry after a short delay if scripts haven't loaded yet
        setTimeout(initAmplitude, 100);
    }
})();

/**
 * Helper function for pages to track custom events
 * Usage: window.trackPageView('Project Viewed', { project_name: 'Example', ... });
 */
window.trackPageView = function(eventName, properties) {
    if (typeof window.amplitude !== 'undefined') {
        if (document.readyState === 'complete') {
            window.amplitude.track(eventName, properties);
        } else {
            window.addEventListener('load', function() {
                window.amplitude.track(eventName, properties);
            });
        }
    }
};
