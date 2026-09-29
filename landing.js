/* Landing page: one centred column, newest to oldest, that loops: after the oldest work the
   newest comes round again, in both directions, so there is no start or end. Photos stay one
   size throughout; nothing changes as they pass the middle of the screen.
   Every photo sits in the same 2:3 frame at the same width (set in the page CSS), so every box has
   its final size before the image loads; the loop depends on the column's height never shifting. */
const COPIES = 7;      // the middle copy is the real one; the others give the loop room to wrap unseen
const REAL = Math.floor(COPIES / 2);
const SETTLE_MS = 150; // quiet time after the last scroll before the loop re-centres
// Phones and tablets cannot hover, so instead of hover the photo nearest the middle of the screen turns to colour.
const TOUCH = window.matchMedia('(hover: none)').matches;

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
            if (w.meta) {
                // Extra caption lines (the archive uses them for date and venue).
                const meta = document.createElement('div');
                meta.className = 'plate-meta';
                w.meta.forEach((line, i) => { if (i) meta.appendChild(document.createElement('br')); meta.appendChild(document.createTextNode(line)); });
                link.appendChild(meta);
            }
            if (TOUCH) {
                // Colour layer over the halftone, faded in while this work is in the middle of the screen.
                const colour = document.createElement('img');
                colour.className = 'colour';
                colour.src = window.workSrc(w);
                colour.alt = '';
                colour.loading = 'lazy';
                colour.decoding = 'async';
                link.insertBefore(colour, caption);
            }
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
    const restAt = () => realTop() - window.innerHeight * 0.08;
    // Opening spin (homepage only: it names the work to start from). The column starts that far down
    // and glides back up to the newest work in SPIN_MS. Skipped for visitors who ask for reduced motion.
    const spinFrom = works.findIndex(w => w.name === window.SOTANAKA_SPIN_FROM);
    const SPIN_MS = 1800;
    if (window.SOTANAKA_SPIN_FROM && spinFrom < 0) {
        console.warn('Opening spin skipped: no work named "' + window.SOTANAKA_SPIN_FROM + '" in works.js');
    }
    let spinning = false;
    if (spinFrom > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const end = restAt();
        const start = end + (plates[spinFrom].offsetTop - plates[0].offsetTop);
        const ease = t => 0.5 - Math.cos(Math.PI * t) / 2;
        let t0 = null;
        spinning = true;
        window.scrollTo(0, start);
        // Any touch, wheel, key or click hands control straight back to the visitor.
        const stop = () => { spinning = false; };
        ['touchstart', 'wheel', 'keydown', 'mousedown'].forEach(e => window.addEventListener(e, stop, { once: true, passive: true }));
        const step = now => {
            if (!spinning) return;
            if (t0 === null) t0 = now;
            const t = Math.min(1, (now - t0) / SPIN_MS);
            window.scrollTo(0, start + (end - start) * ease(t));
            if (t < 1) requestAnimationFrame(step); else spinning = false;
        };
        requestAnimationFrame(step);
    } else {
        window.scrollTo(0, restAt());
    }

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
        settleTimer = setTimeout(() => { if (!touching && !spinning) recentre(); }, SETTLE_MS);
    };
    window.addEventListener('scroll', () => {
        // Last resort: an extremely long fling reached the end of the extra copies.
        if (nearEdge() && !touching && !spinning) recentre();
        else settle();
    }, { passive: true });
    window.addEventListener('touchstart', () => { touching = true; clearTimeout(settleTimer); }, { passive: true });
    window.addEventListener('touchend', () => { touching = false; settle(); }, { passive: true });
    window.addEventListener('touchcancel', () => { touching = false; settle(); }, { passive: true });
    window.addEventListener('resize', settle);

    if (TOUCH) {
        // Colour goes on every copy of the centred work, not just the one on screen, so when the loop
        // re-centres by whole periods the photo that lands in the middle is already in colour: no flash.
        let current = -1;
        let queued = false;
        const colourCentre = () => {
            queued = false;
            const mid = window.innerHeight / 2;
            let best = 0, bestDist = Infinity;
            plates.forEach((p, i) => {
                const r = p.getBoundingClientRect();
                if (r.bottom < 0 || r.top > window.innerHeight) return;
                const d = Math.abs((r.top + r.bottom) / 2 - mid);
                if (d < bestDist) { bestDist = d; best = i; }
            });
            const work = best % n;
            if (work === current) return;
            current = work;
            plates.forEach((p, i) => p.classList.toggle('in-colour', i % n === work));
        };
        const queue = () => { if (!queued) { queued = true; requestAnimationFrame(colourCentre); } };
        window.addEventListener('scroll', queue, { passive: true });
        window.addEventListener('resize', queue);
        colourCentre();
    }
});
