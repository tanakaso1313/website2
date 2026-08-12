/* Landing page: works grouped by year, newest first.
   Resting image is the halftoned monochrome version; hover shows the clean colour photo. */
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('workGrid');
    if (!root || !window.SOTANAKA_WORKS) return;

    const works = window.SOTANAKA_WORKS;
    const years = [...new Set(works.map(w => w.year))].sort((a, b) => b - a);

    years.forEach(year => {
        const block = document.createElement('div');
        block.className = 'year-block';

        const label = document.createElement('div');
        label.className = 'year-label';
        label.textContent = year;
        block.appendChild(label);

        const grid = document.createElement('div');
        grid.className = 'year-works';

        works.filter(w => w.year === year).forEach(w => {
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

        block.appendChild(grid);
        root.appendChild(block);
    });
});
