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
                    // More organic mobile positioning with special handling
                    let mobileLeft, mobileTop;
                    
                    if (originalIndex >= 6) {
                        // Special positioning for last two images
                        mobileLeft = originalIndex === 6 ? 25 : 35;
                        mobileTop = originalIndex === 6 ? -2 : 1;
                    } else if (originalIndex === 5) {
                        // Special positioning for LTI to keep closer to other light items
                        mobileLeft = 20;
                        mobileTop = -15;
                    } else {
                        // Organic positioning for first 5 images
                        const baseLeft = (originalIndex * 7) % 25;
                        const sinVariation = Math.sin(originalIndex * 2.3) * 15;
                        const cosVariation = Math.cos(originalIndex * 1.7) * 10;
                        mobileLeft = (baseLeft + sinVariation + cosVariation) % 30 + 15;
                        mobileTop = Math.sin(originalIndex * 1.1) * 6 + Math.cos(originalIndex * 0.8) * 3;
                    }
                    
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
