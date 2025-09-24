document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.querySelector('.gallery-container');
    const filterLinks = document.querySelectorAll('.category-nav a');

    if (galleryContainer) {
        const works = [
            { src: 'images/top/8.Let a_top_result_result.webp', monoSrc: 'images/mono/8.Let a_top_mono_result_result.webp', href: 'let-a-colored-paper-swim-in-clouds.html', category: 'other', alt: 'Let a' },
            { src: 'images/top/7.Liminal Lamp_top_result_result.webp', monoSrc: 'images/mono/7.Liminal Lamp_top_mono_result_result.webp', href: 'liminal-lamp.html', category: 'light', alt: 'Liminal Lamp' },
            { src: 'images/top/6.Liminal Objects_top_result_result.webp', monoSrc: 'images/mono/6.Liminal Objects_top_mono_result.webp', href: 'liminal-objects.html', category: 'other', alt: 'Liminal Objects' },
            { src: 'images/top/5.Memento_top_result_result.webp', monoSrc: 'images/mono/5.Memento_top_mono_result_result.webp', href: 'memento.html', category: 'other', alt: 'Memento' },
            { src: 'images/top/4.Vnsh_top_result_result.webp', monoSrc: 'images/mono/4.Vnsh_top_mono_result_result.webp', href: 'vnsh.html', category: 'light', alt: 'Vnsh' },
            { src: 'images/top/3.LTI_top_result_result.webp', monoSrc: 'images/mono/3.LTI_top_mono_result_result.webp', href: 'lti.html', category: 'light', alt: 'LTI' },
            { src: 'images/top/2.ORI_top_result_result.webp', monoSrc: 'images/mono/2.ORI_top_mono_result_result.webp', href: 'ori.html', category: 'furniture', alt: 'ORI' },
            { src: 'images/top/1.transfer_top_result_result.webp', monoSrc: 'images/mono/1.transfer_top_mono_result_result.webp', href: 'transfer.html', category: 'other', alt: 'transfer' }
        ];

        // Deterministic random helper
        const seed = (n) => {
            const x = Math.sin(n * 12.9898) * 43758.5453;
            return x - Math.floor(x);
        };

        const renderGallery = (filter = 'all') => {
            galleryContainer.innerHTML = '';
            const filteredWorks = filter === 'all' ? works : works.filter(w => w.category === filter);
            let maxZIndex = filteredWorks.length;

            filteredWorks.forEach((work, index) => {
                const imageWrapper = document.createElement('div');
                imageWrapper.classList.add('image-wrapper');
                if (work.alt === 'Let a') {
                    imageWrapper.classList.add('let-a-size');
                }

                // Use both original index (for desktop consistency) and filtered index (for mobile positioning)
                const originalIndex = works.findIndex(w => w.alt === work.alt);
                const filteredIndex = index; // Current position in filtered results
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    // measure how far the menu extends so we never overlap it
                    const nav = document.querySelector('.category-nav');
                    const logo = document.querySelector('.site-title, .logo, h1'); // adapt selector if needed
                    const menuBottomPx = Math.max(
                        nav ? nav.getBoundingClientRect().bottom : 0,
                        logo ? logo.getBoundingClientRect().bottom : 0
                    );
                    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                    const startTop = (menuBottomPx / vh) * 100; // first image starts directly below menu

                    // safe sizing for mobile
                    const IMAGE_W_VW = 70;     // all images same width on mobile
                    const GUTTER_VW   = 6;     // left/right safe margin
                    const MAX_LEFT    = 100 - IMAGE_W_VW - GUTTER_VW; // ensures no horizontal scroll

                    // tight vertical spacing between items
                    const STEP_TOP_VH = 7;     // smaller = tighter stack

                    // alternating small left shifts to reveal each image edge; always clamped in safe range
                    const zigzag = (filteredIndex % 3) * 5;    // 0, 5, 10vw
                    const baseLeft = 12 + zigzag;              // start near the left, reveal to the right
                    const left = Math.min(Math.max(baseLeft, GUTTER_VW), MAX_LEFT);

                    const top = startTop + filteredIndex * STEP_TOP_VH;

                    imageWrapper.style.left = `${left}vw`;
                    imageWrapper.style.top  = `${top}vh`;
                    imageWrapper.style.zIndex = 100 + filteredIndex;

                    // keep the container tall enough so the last item isn't cut off
                    if (filteredIndex === filteredWorks.length - 1) {
                        const approxHeightVh = top + 60; // ~image height + footer room
                        galleryContainer.style.minHeight = `${approxHeightVh}vh`;
                    }
                } else {
                    // All images align with SOTANAKA baseline
                    const baseLeft = (originalIndex * 3.2) % 25;
                    const sinVariation = Math.sin(originalIndex * 1.7) * 12;
                    const cosVariation = Math.cos(originalIndex * 2.1) * 8;
                    const desktopLeft = (baseLeft + sinVariation + cosVariation) % 30;
                    const desktopTop = -12; // All images align with SOTANAKA height, moved up
                    
                    imageWrapper.style.left = `${desktopLeft}vw`;
                    imageWrapper.style.top = `${desktopTop}vh`;
                }
                imageWrapper.style.zIndex = filteredWorks.length - index;

                const link = document.createElement('a');
                link.href = work.href;

                const img = document.createElement('img');
                img.src = work.monoSrc;
                img.alt = work.alt;

                link.appendChild(img);
                imageWrapper.appendChild(link);
                galleryContainer.appendChild(imageWrapper);

                imageWrapper.addEventListener('mouseenter', () => {
                    document.querySelectorAll('.image-wrapper').forEach(iw => {
                        iw.classList.remove('active');
                    });
                    imageWrapper.classList.add('active');
                    maxZIndex++;
                    imageWrapper.style.zIndex = maxZIndex;
                    img.src = work.src;
                });

                imageWrapper.addEventListener('mouseleave', () => {
                    img.src = work.monoSrc;
                });
            });

            // Add footer after all images are rendered
            const footer = document.createElement('footer');
            footer.innerHTML = '<p>&copy; 2025 SOTANAKA. All rights reserved.</p>';
            galleryContainer.appendChild(footer);
        };

        const applyFilter = (filter) => {
            renderGallery(filter);
        };

        const urlParams = new URLSearchParams(window.location.search);
        const filterFromUrl = urlParams.get('filter');
        if (filterFromUrl) {
            applyFilter(filterFromUrl);
        } else {
            applyFilter('all');
        }

        filterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                if (filter) {
                    e.preventDefault();
                    applyFilter(filter);
                    history.pushState(null, '', `index.html?filter=${filter}`);
                }
            });
        });
    }

    // Update category links on all pages to point to index.html with filter
    filterLinks.forEach(link => {
        const filter = link.dataset.filter;
        if (filter) {
            link.href = `index.html?filter=${filter}`;
        }
    });
});
