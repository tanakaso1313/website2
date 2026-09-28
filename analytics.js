/**
 * Amplitude Analytics initialization module
 * Handles Amplitude SDK initialization (event tracking only — no session replay).
 */
/*
 * Visits that shouldn't count: local previews and test copies (anything not served
 * from sotanaka.com), and browsers switched off by the site owner. To switch a browser
 * off, visit https://sotanaka.com/?notrack=1 once; ?notrack=0 switches it back on.
 * Returns true when this visit should not be sent to Amplitude.
 */
window.sotanakaTrackingOff = function () {
    var host = window.location.hostname;
    if (host !== 'sotanaka.com' && host !== 'www.sotanaka.com') return true;
    var flag = new URLSearchParams(window.location.search).get('notrack');
    try {
        if (flag === '1') {
            localStorage.setItem('sotanaka_notrack', '1');
            alert('Tracking is now off for this browser. Visit sotanaka.com/?notrack=0 to turn it back on.');
        } else if (flag === '0') {
            localStorage.removeItem('sotanaka_notrack');
            alert('Tracking is back on for this browser.');
        }
        return localStorage.getItem('sotanaka_notrack') === '1';
    } catch (e) {
        // Storage blocked (e.g. private mode): honour the link for this page only.
        return flag === '1';
    }
};

(function initAmplitude() {
    'use strict';

    // Check if Amplitude is loaded
    if (typeof window.amplitude !== 'undefined') {
        // Initialize Amplitude with API key from config.js; optOut drops every event,
        // including page-level track() calls, without breaking them.
        window.amplitude.init(
            window.AMPLITUDE_API_KEY,
            {"autocapture": {"elementInteractions": true}, "optOut": window.sotanakaTrackingOff()}
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
