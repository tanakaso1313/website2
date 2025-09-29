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
                    // MOBILE: single column, centered with auto margins
                    const GAP_VW = 2;   // vertical space between photos

                    // container flows naturally; no manual minHeight needed
                    galleryContainer.style.minHeight = '';
                    galleryContainer.style.position = 'relative';

                    // flow items in normal document order
                    imageWrapper.style.position = 'relative';
                    imageWrapper.style.left = '';
                    imageWrapper.style.top  = '';

                    // ensure stacking doesn't interfere with taps (flow order wins)
                    imageWrapper.style.zIndex = 'auto';

                    // center photos with auto margins - equal left/right margins
                    imageWrapper.style.width = '';  // clear any width, let CSS handle it
                    imageWrapper.style.marginLeft = 'auto';
                    imageWrapper.style.marginRight = 'auto';
                    imageWrapper.style.marginBottom = `${GAP_VW}vw`;
                    
                    // ensure display block for proper stacking
                    imageWrapper.style.display = 'block';
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
                    
                    console.log('Click detected:', { currentlyMobile, isActive, width: window.innerWidth, target: e.target });
                    
                    if (currentlyMobile) {
                        if (!isActive) {
                            // First tap: prevent navigation, activate image
                            console.log('MOBILE: Preventing navigation - first tap');
                            e.preventDefault();
                            e.stopPropagation();
                            
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
                            
                            console.log('MOBILE: Image activated for mobile - first tap done');
                            return false; // Extra prevention
                        } else {
                            console.log('MOBILE: Second tap - allowing navigation');
                            // Second tap: allow navigation (don't prevent default)
                        }
                    } else {
                        console.log('DESKTOP: Direct navigation');
                        // Desktop: direct navigation
                    }
                });
                
                // Add a method to reset this image's active state from other images
                link._resetActive = () => { isActive = false; };
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
