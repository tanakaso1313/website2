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
                    // WIDER horizontal spread (6–94vw) with a small wobble
                    const base = seed(originalIndex);
                    const leftSpread = 6 + base * 88; // 6..94vw
                    const wobble = Math.sin(originalIndex * 1.7) * 6 + Math.cos(originalIndex * 2.3) * 4; // ± ~10
                    const mobileLeft = Math.max(2, Math.min(98, leftSpread + wobble));

                    // Start closer to the menu (reduce the big gap) and stagger upward gently
                    const startTop = -6; // vh, slightly above the gallery baseline
                    const step = 7 + seed(originalIndex + 7) * 4; // 7..11vh
                    let mobileTop = startTop - filteredIndex * step;

                    // tiny lane offsets so neighbors don't align
                    mobileTop -= (filteredIndex % 3) * 2; // 0, -2, -4vh

                    imageWrapper.style.left = `${mobileLeft}vw`;
                    imageWrapper.style.top  = `${mobileTop}vh`;
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

                // Optional: after image loads, nudge tall images a bit higher (no desktop impact)
                if (isMobile) {
                    img.addEventListener('load', () => {
                        if (img.naturalHeight > img.naturalWidth) {
                            const currentTop = parseFloat(imageWrapper.style.top); // in vh
                            imageWrapper.style.top = `${currentTop - 3}vh`;
                        }
                    });
                }

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
