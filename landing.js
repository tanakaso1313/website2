/* Landing page: one centred column, newest to oldest, that loops: after the oldest work the
   newest comes round again, in both directions, so there is no start or end. Photos stay one
   size throughout; nothing changes as they pass the middle of the screen.
   Every photo sits in the same 2:3 frame at the same width (set in the page CSS), so every box has
   its final size before the image loads; the loop depends on the column's height never shifting. */
const COPIES = 7;      // the middle copy is the real one; the others give the loop room to wrap unseen
const REAL = Math.floor(COPIES / 2);
const SETTLE_MS = 150; // quiet time after the last scroll before the loop re-centres

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('workGrid');
    if (!root || !window.SOTANAKA_WORKS) return;

    // Newest first; stable sort keeps works.js order within a year.
    const works = [...window.SOTANAKA_WORKS].sort((a, b) => b.year - a.year);

    const column = document.createElement('div');
    column.className = 'column';

    for (let copy = 0; copy < COPIES; copy++) {
        const isReal = copy === REAL;
        works.forEach(w => {
            const link = document.createElement('a');
            link.className = 'plate';
            link.href = w.href;
            if (!isReal) {
                // Repeats are for the eye only: skip them for screen readers and the Tab key.
                link.setAttribute('aria-hidden', 'true');
                link.tabIndex = -1;
            }

            const img = document.createElement('img');
            img.src = window.workMono(w);
            img.alt = isReal ? w.name : '';
            img.decoding = 'async';
            link.addEventListener('mouseenter', () => { img.src = window.workSrc(w); });
            link.addEventListener('mouseleave', () => { img.src = window.workMono(w); });

            const caption = document.createElement('div');
            caption.className = 'plate-name';
            caption.textContent = w.name;

            link.append(img, caption);
            column.appendChild(link);
        });
    }

    root.appendChild(column);

    const plates = [...column.querySelectorAll('.plate')];
    const n = works.length;
    // Distance from one copy to the next: scrolling exactly this far shows the same picture.
    const period = () => plates[n].offsetTop - plates[0].offsetTop;
    const columnTop = () => column.getBoundingClientRect().top + window.scrollY;
    const realTop = () => columnTop() + plates[REAL * n].offsetTop;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    // Open on the real copy, with the newest work just below the top edge.
    window.scrollTo(0, realTop() - window.innerHeight * 0.08);

    // Move the view back to the real copy by whole periods; the frame is identical either side.
    // Doing this mid-flick would stop a phone's momentum scroll dead, so it waits until the page
    // is at rest and no finger is down. The extra copies give a long flick room to run first.
    const recentre = () => {
        const p = period();
        const offset = window.scrollY - (realTop() - window.innerHeight * 0.5);
        const k = Math.round(offset / p);
        if (k !== 0) window.scrollTo(0, window.scrollY - k * p);
    };
    const nearEdge = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        return window.scrollY < window.innerHeight || window.scrollY > max - window.innerHeight;
    };

    let touching = false;
    let settleTimer = null;
    const settle = () => {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => { if (!touching) recentre(); }, SETTLE_MS);
    };
    window.addEventListener('scroll', () => {
        // Last resort: an extremely long fling reached the end of the extra copies.
        if (nearEdge() && !touching) recentre();
        else settle();
    }, { passive: true });
    window.addEventListener('touchstart', () => { touching = true; clearTimeout(settleTimer); }, { passive: true });
    window.addEventListener('touchend', () => { touching = false; settle(); }, { passive: true });
    window.addEventListener('touchcancel', () => { touching = false; settle(); }, { passive: true });
    window.addEventListener('resize', settle);
});
