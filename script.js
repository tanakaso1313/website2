document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.querySelector('.gallery-container');
    const filterLinks = document.querySelectorAll('.category-nav a');

    if (galleryContainer) {
        const works = [
            { src: 'images/top_2/8.Let a_top_result_result.webp', monoSrc: 'images/mono_2/8.Let a_top_mono_result_result.webp', href: 'let-a-colored-paper-swim-in-clouds.html', category: 'other', alt: 'Let a' },
            { src: 'images/top_2/7.Liminal Lamp_top_result_result.webp', monoSrc: 'images/mono_2/7.Liminal Lamp_top_mono_result_result.webp', href: 'liminal-lamp.html', category: 'light', alt: 'Liminal Lamp' },
            { src: 'images/top_2/6.Liminal Objects_top_result_result.webp', monoSrc: 'images/mono_2/6.Liminal Objects_top_mono_result.webp', href: 'liminal-objects.html', category: 'other', alt: 'Liminal Objects' },
            { src: 'images/top_2/5.Memento_top_result_result.webp', monoSrc: 'images/mono_2/5.Memento_top_mono_result_result.webp', href: 'memento.html', category: 'other', alt: 'Memento' },
            { src: 'images/top_2/4.Vnsh_top_result_result.webp', monoSrc: 'images/mono_2/4.Vnsh_top_mono_result_result.webp', href: 'vnsh.html', category: 'light', alt: 'Vnsh' },
            { src: 'images/top_2/3.LTI_top_result_result.webp', monoSrc: 'images/mono_2/3.LTI_top_mono_result_result.webp', href: 'lti.html', category: 'light', alt: 'LTI' },
            { src: 'images/top_2/2.ORI_top_result_result.webp', monoSrc: 'images/mono_2/2.ORI_top_mono_result_result.webp', href: 'ori.html', category: 'furniture', alt: 'ORI' },
            { src: 'images/top_2/1.transfer_top_result_result.webp', monoSrc: 'images/mono_2/1.transfer_top_mono_result_result.webp', href: 'transfer.html', category: 'other', alt: 'transfer' }
        ].map(work => ({ ...work, src: `${work.src}?v=${new Date().getTime()}`, monoSrc: `${work.monoSrc}?v=${new Date().getTime()}` }));

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
                    // MOBILE: completely clear all styles, let CSS flexbox handle everything
                    galleryContainer.style.minHeight = '';
                    galleryContainer.style.position = '';

                    // clear all positioning - let CSS handle it
                    imageWrapper.style.position = '';
                    imageWrapper.style.left = '';
                    imageWrapper.style.top = '';
                    imageWrapper.style.zIndex = '';
                    imageWrapper.style.width = '';
                    imageWrapper.style.marginLeft = '';
                    imageWrapper.style.marginRight = '';
                    imageWrapper.style.marginBottom = '';
                    imageWrapper.style.display = '';
                } else {
                    // Desktop: keep your existing behavior
                    const baseLeft = (originalIndex * 3.2) % 25;
                    const sinVariation = Math.sin(originalIndex * 1.7) * 12;
                    const cosVariation = Math.cos(originalIndex * 2.1) * 8;
                    const desktopLeft = (baseLeft + sinVariation + cosVariation) % 30;
                    const desktopTop = -12;
                    imageWrapper.style.left = `${desktopLeft}vw`;
                    imageWrapper.style.top  = `${desktopTop}vh`;

                    // sensible starting z for desktop (will be raised on hover) - reverse order so first items appear on top
                    imageWrapper.style.zIndex = 10 + (works.length - originalIndex);
                }

                const link = document.createElement('a');
                link.href = work.href;

                const img = document.createElement('img');
                img.src = work.monoSrc;
                img.alt = work.alt;

                link.appendChild(img);
                imageWrapper.appendChild(link);
                galleryContainer.appendChild(imageWrapper);

                // Desktop hover behavior - when activating (hover/tap), bring to front
                imageWrapper.addEventListener('mouseenter', () => {
                    document.querySelectorAll('.image-wrapper').forEach(iw => iw.classList.remove('active'));
                    imageWrapper.classList.add('active');
                    maxZIndex++;
                    imageWrapper.style.zIndex = maxZIndex;
                    img.src = work.src;
                });

                imageWrapper.addEventListener('mouseleave', () => {
                    img.src = work.monoSrc;
                });

                // Mobile touch behavior - two taps like desktop (always add for all images)
                let isActive = false;
                
                link.addEventListener('click', (e) => {
                    // Check if we're on mobile at click time
                    const currentlyMobile = window.innerWidth <= 768;
                    
                    if (!currentlyMobile) {
                        // Desktop: direct navigation
                        return;
                    }
                    
                    if (!isActive) {
                        // First tap: prevent navigation, activate image
                        e.preventDefault();
                        
                        // Reset all other images to inactive
                        document.querySelectorAll('.image-wrapper').forEach(iw => {
                            iw.classList.remove('active');
                            const iwImg = iw.querySelector('img');
                            const iwWork = works.find(w => w.alt === iwImg.alt);
                            if (iwWork) iwImg.src = iwWork.monoSrc;
                        });
                        
                        // Reset all other images' isActive state by finding their closure variables
                        document.querySelectorAll('.image-wrapper a').forEach(otherLink => {
                            if (otherLink !== link && otherLink._resetActive) {
                                otherLink._resetActive();
                            }
                        });
                        
                        // Activate this image
                        imageWrapper.classList.add('active');
                        maxZIndex++;
                        imageWrapper.style.zIndex = maxZIndex;
                        img.src = work.src;
                        isActive = true;
                    }
                    // On second tap, isActive is true, so default navigation occurs
                });
                
                // Add a method to reset this image's active state from other images
                link._resetActive = () => { isActive = false; };
            });

            // Add footer after all images are rendered
            const footer = document.createElement('footer');
            footer.innerHTML = '<p>&copy; 2025 SOTANAKA. All rights reserved.</p>';
            galleryContainer.appendChild(footer);

            // Mobile scroll-based color change
            const handleScroll = () => {
                if (window.innerWidth > 768) return;

                const viewportCenter = window.innerHeight / 2;

                document.querySelectorAll('.image-wrapper').forEach(iw => {
                    const img = iw.querySelector('img');
                    const work = works.find(w => w.alt === img.alt);
                    if (!work) return;

                    const rect = iw.getBoundingClientRect();
                    const imageCenter = rect.top + rect.height / 2;

                    if (Math.abs(imageCenter - viewportCenter) < rect.height / 2) {
                        img.src = work.src;
                    } else {
                        img.src = work.monoSrc;
                    }
                });
            };

            window.addEventListener('scroll', handleScroll);
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
