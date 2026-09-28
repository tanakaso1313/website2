/**
 * Amplitude Analytics initialization module
 * Handles Amplitude SDK initialization (event tracking only — no session replay).
 */
/*
 * Visits that shouldn't count: local previews and test copies (anything not served
 * from sotanaka.com), crawlers that say so in their browser name, automated browsers,
 * and browsers switched off by the site owner. To switch a browser off, visit
 * https://sotanaka.com/?notrack=1 once; ?notrack=0 switches it back on.
 * Returns true when this visit should not be sent to Amplitude.
 */
window.SOTANAKA_BOT_PATTERN = /bot|crawl|spider|slurp|scrap|headless|preview|facebookexternalhit|embedly|bytespider|ahrefs|semrush|lighthouse|pingdom|uptime|monitor/i;
window.sotanakaTrackingOff = function () {
    var host = window.location.hostname;
    if (host !== 'sotanaka.com' && host !== 'www.sotanaka.com') return true;
    if (navigator.webdriver || window.SOTANAKA_BOT_PATTERN.test(navigator.userAgent || '')) return true;
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
        markEngagement();
    } else {
        // Retry after a short delay if the script hasn't loaded yet
        setTimeout(initAmplitude, 100);
    }
})();

/*
 * "Engaged": sent once per page the first time a visitor scrolls, taps, clicks, types,
 * or keeps the page open and visible for 10 seconds. Crawlers load pages without doing
 * any of that, so engaged visitors are the real audience in reports. Nothing else is
 * dropped: all visits are still recorded, this only marks the human ones.
 */
function markEngagement() {
    var sent = false, visibleMs = 0, lastTick = Date.now(), timer = null;
    var events = ['pointerdown', 'keydown', 'touchstart'];
    function send(how) {
        if (sent) return;
        sent = true;
        events.forEach(function (e) { window.removeEventListener(e, onAct, true); });
        window.removeEventListener('scroll', onScroll, true);
        clearInterval(timer);
        window.amplitude.track('Engaged', { how: how, page: window.location.pathname, seconds_on_page: Math.round(visibleMs / 1000) });
    }
    function onAct(e) { send(e.type === 'keydown' ? 'key' : 'tap_or_click'); }
    function onScroll() { if (window.scrollY > 80) send('scroll'); }
    events.forEach(function (e) { window.addEventListener(e, onAct, true); });
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    timer = setInterval(function () {
        var now = Date.now();
        if (document.visibilityState === 'visible') visibleMs += now - lastTick;
        lastTick = now;
        if (visibleMs >= 10000) send('stayed_10s');
    }, 1000);
}

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
