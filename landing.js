/* Landing page: one grid of works, newest first.
   Resting image is the halftoned monochrome version; hover shows the clean colour photo. */
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('workGrid');
    if (!root || !window.SOTANAKA_WORKS) return;

    // Stable sort keeps works.js order within a year.
    const works = [...window.SOTANAKA_WORKS].sort((a, b) => b.year - a.year);

    const grid = document.createElement('div');
    grid.className = 'works-grid';

    works.forEach(w => {
        const link = document.createElement('a');
        link.className = 'work';
        link.href = w.href;

        const thumb = document.createElement('div');
        thumb.className = 'work-thumb';

        const img = document.createElement('img');
        img.src = window.workMono(w);
        img.alt = w.name;
        img.loading = 'lazy';
        img.decoding = 'async';

        link.addEventListener('mouseenter', () => { img.src = window.workSrc(w); });
        link.addEventListener('mouseleave', () => { img.src = window.workMono(w); });

        thumb.appendChild(img);

        const caption = document.createElement('div');
        caption.className = 'work-name';
        caption.textContent = `${w.name} / ${w.category}`;

        link.append(thumb, caption);
        grid.appendChild(link);
    });

    root.appendChild(grid);
});
