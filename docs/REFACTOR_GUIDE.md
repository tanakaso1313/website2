# Code Duplication Refactor Guide

This guide explains how to apply the analytics and lightbox refactoring to all remaining HTML pages.

## What Was Done

We've extracted two major pieces of duplicated code into shared modules:

### 1. `analytics.js` - Amplitude Analytics Initialization
- **Location**: `website2/analytics.js`
- **Purpose**: Centralized Amplitude SDK initialization with session replay
- **Benefit**: Eliminates ~30 lines of duplicated code per page

### 2. `lightbox.js` - Image Lightbox Functionality  
- **Location**: `website2/lightbox.js`
- **Purpose**: Product image gallery lightbox with keyboard navigation
- **Benefit**: Eliminates ~60 lines of duplicated code per page with lightbox

## Pages Already Updated

✅ **index.html** - Uses analytics.js  
✅ **liminal-lamp.html** - Uses both analytics.js and lightbox.js  
✅ **vnsh_shop.html** - Uses both analytics.js and lightbox.js

## How to Update Remaining Pages

### For ALL Pages (Analytics Refactor)

**FIND and REMOVE:**
```html
<script>window.amplitude.add(window.sessionReplay.plugin({sampleRate: 0.1}));window.amplitude.init(window.AMPLITUDE_API_KEY || '746eec9391b45c0239325340cd3baadd', {"autocapture":{"elementInteractions":true}});</script>
```

Or the longer version:
```html
<script>
(function initAmplitude() {
    if (typeof window.amplitude !== 'undefined' && typeof window.sessionReplay !== 'undefined') {
        window.amplitude.add(window.sessionReplay.plugin({sampleRate: 0.1}));
        window.amplitude.init(window.AMPLITUDE_API_KEY || '746eec9391b45c0239325340cd3baadd', {"autocapture":{"elementInteractions":true}});
        // ... tracking code ...
    } else {
        setTimeout(initAmplitude, 100);
    }
})();
</script>
```

**REPLACE WITH:**
```html
<!-- Amplitude Analytics -->
<script defer src="analytics.js"></script>
```

**If the page has custom tracking** (like `amplitude.track('Project Viewed', {...})`):  
Keep the custom tracking but simplify it:
```html
<script>
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.amplitude !== 'undefined') {
        window.amplitude.track('Project Viewed', {
            project_name: 'Your Project Name',
            // ... other properties
        });
    }
});
</script>
```

Or use the helper function:
```html
<script>
window.trackPageView('Project Viewed', {
    project_name: 'Your Project Name',
    // ... other properties
});
</script>
```

### For Pages with Lightbox (Product/Work Pages)

**FIND and REMOVE:**
```html
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeButton = document.querySelector('.close-button');
        // ... 50+ lines of lightbox code ...
    });
</script>
```

**REPLACE WITH:**
```html
<!-- Lightbox functionality -->
<script src="lightbox.js"></script>
```

**Note**: The lightbox HTML markup stays the same:
```html
<div id="lightbox" class="lightbox">
    <span class="close-button">&times;</span>
    <img src="images/icons/prev-arrow.svg" class="prev-button">
    <img class="lightbox-content" id="lightbox-img">
    <img src="images/icons/next-arrow.svg" class="next-button">
</div>
```

## Pages That Need Updating

Based on the search results, these pages have the navigation toggle markup and likely need the analytics refactor:

### Product/Work Pages (need both analytics.js + lightbox.js):
- liminal-objects.html
- lo-*.html (lo-02, lo-05, lo-06, lo-07, lo-09, lo-10, lo-11, lo-20, lo-22, lo-23, lo-24, lo-25, lo-26, lo-27, lo-horse)
- liminal-lamp-s_shop.html (if it exists)
- vnsh.html (non-shop version)
- ori.html
- transfer.html
- lti.html
- memento.html
- cya.html
- let-a-colored-paper-swim-in-clouds.html

### Other Pages (need analytics.js only):
- furniture.html
- light.html  
- other.html
- shop.html
- bio.html
- archive.html
- contact.html
- search.html
- policies.html
- success.html
- cancel.html
- 404.html

## Additional Notes

### Navigation Toggle Duplication
Some pages (like liminal-lamp.html) had inline navigation toggle code even though it's already in `script.js`/`script.min.js`. When refactoring:

**REMOVE** this inline script:
```html
<script>
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggle-btn');
    const subItems = document.getElementById('sub-items');
    // ... toggle logic ...
});
</script>
```

**ENSURE** the page loads `script.min.js`:
```html
<script src="script.min.js"></script>
```

### Defer vs Regular Loading
The Amplitude CDN scripts should use `defer` to avoid blocking page rendering:
```html
<script defer src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz" crossorigin="anonymous"></script>
<script defer src="https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.8.0-min.js.gz" crossorigin="anonymous"></script>
```

## Impact Summary

**Before refactor:**
- ~40 pages with duplicated analytics init (~30 lines each) = ~1,200 lines
- ~15 pages with duplicated lightbox code (~60 lines each) = ~900 lines  
- **Total duplication: ~2,100 lines**

**After refactor:**
- 2 shared modules (~100 lines total)
- Each page just includes `<script src="...">`
- **Savings: ~2,000 lines** and much easier maintenance

## Testing

After updating each page, test:
1. Analytics: Open browser console and verify no Amplitude errors
2. Lightbox (if applicable): Click product images and verify lightbox opens/closes and keyboard nav works
3. Navigation toggle: Click "WORK +" to verify the submenu expands/collapses
