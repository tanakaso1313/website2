/* Loads the 3D preview on an LO product page, only once the visitor scrolls near it
   (three.js is large, so pages stay light for people who never get that far).
   If 3D can't run here (no WebGL, library blocked), the box and its color notice are removed
   rather than left empty; the reason goes to the console. */
const box = document.querySelector('.lo3d');
if (box) {
    const notice = document.querySelector('.lo3d-colors');
    const fail = (err) => { console.error('3D preview could not load:', err); box.remove(); if (notice) notice.remove(); };
    const watch = () => new IntersectionObserver((entries, io) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        import('/lo3d-viewer.js?v=12').then(({ SHAPES, mount }) => {
            const shape = SHAPES[box.dataset.shape];
            if (!shape) throw new Error(`no 3D shape for ${box.dataset.shape}`);
            // the dimensions listed on this page (e.g. "W117 D117 H71 mm") label the 3D dimension lines
            const dd = [...document.querySelectorAll('.work-specs dt')].find((d) => d.textContent.trim() === 'Dimensions');
            const m = dd && dd.nextElementSibling ? dd.nextElementSibling.textContent.match(/W(\d+)\s*D(\d+)\s*H(\d+)/) : null;
            mount(box, shape, { room: 1.7, dims: m ? { W: +m[1], D: +m[2], H: +m[3] } : null });
            box.dataset.ready = '1';
        }).catch(fail);
    }, { rootMargin: '600px' }).observe(box);
    // Start watching only once the photos above it have loaded: before that the gallery is short,
    // the preview looks close to the screen, and three.js would download for every visitor.
    if (document.readyState === 'complete') watch(); else window.addEventListener('load', watch, { once: true });
}
