/**
 * Amplitude Analytics initialization module
 * Handles Amplitude SDK initialization (event tracking only — no session replay).
 */
(function initAmplitude() {
    'use strict';

    // Check if Amplitude is loaded
    if (typeof window.amplitude !== 'undefined') {
        // Initialize Amplitude with API key from config.js
        window.amplitude.init(
            window.AMPLITUDE_API_KEY,
            {"autocapture": {"elementInteractions": true}}
        );
    } else {
        // Retry after a short delay if the script hasn't loaded yet
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
