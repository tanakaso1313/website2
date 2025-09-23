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

                // Fixed positions based on original work index to maintain consistent layout
                const originalIndex = works.findIndex(w => w.alt === work.alt);
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    // Wide horizontal distribution for mobile - similar to desktop but mobile-optimized
                    const img = imageWrapper.querySelector('img');
                    const isVertical = img && img.naturalHeight > img.naturalWidth;
                    
                    // Much wider horizontal distribution like desktop
                    const baseLeft = (originalIndex * 8) % 40 + 5; // 5-45vw wide range
                    const sinVariation = Math.sin(originalIndex * 1.9) * 15; // Stronger horizontal variation
                    const cosVariation = Math.cos(originalIndex * 2.4) * 10;
                    const mobileLeft = Math.max(0, Math.min(50, baseLeft + sinVariation + cosVariation + (originalIndex === 0 ? 15 : 0))); // Wide distribution, first image +15vw
                    
                    const verticalOffset = isVertical ? -8 : 0; // Vertical images positioned higher
                    
                    // Mobile vertical positioning with ultimate overlap
                    let mobileTop;
                    const baseVertical = -25; // Start position
                    
                    // Custom positioning for better overlap, especially last two images
                    if (originalIndex <= 5) {
                        mobileTop = baseVertical - (originalIndex * 15); // -15vh increments for first 6
                    } else if (originalIndex === 6) {
                        mobileTop = -105; // Index 6: tighter, higher position
                    } else if (originalIndex === 7) {
                        mobileTop = -110; // Index 7: slightly lower but still tight
                    } else {
                        mobileTop = baseVertical - (originalIndex * 15); // Fallback for additional images
                    }
                    mobileTop += verticalOffset; // Apply vertical image offset
                    
                    imageWrapper.style.left = `${mobileLeft}vw`;
                    imageWrapper.style.top = `${mobileTop}vh`;
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
