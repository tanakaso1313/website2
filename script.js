document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.querySelector('.gallery-container');
    const filterLinks = document.querySelectorAll('.category-nav a');

    if (galleryContainer) {
        // Detect if mobile for responsive images
        const isMobileDevice = window.innerWidth <= 768;
        const imageFolder = isMobileDevice ? '_2_mobile' : '_2';
        
        const works = [
            { src: `images/top${imageFolder}/8.Let a_top_result_result.webp`, monoSrc: `images/mono${imageFolder}/8.Let a_top_mono_result_result.webp`, href: 'let-a-colored-paper-swim-in-clouds.html', category: 'other', alt: 'Let a' },
            { src: `images/top${imageFolder}/7.Liminal Lamp_top_result_result.webp`, monoSrc: `images/mono${imageFolder}/7.Liminal Lamp_top_mono_result_result.webp`, href: 'liminal-lamp.html', category: 'light', alt: 'Liminal Lamp' },
            { src: `images/top${imageFolder}/6.Liminal Objects_top_result_result.webp`, monoSrc: `images/mono${imageFolder}/6.Liminal Objects_top_mono_result.webp`, href: 'liminal-objects.html', category: 'other', alt: 'Liminal Objects' },
            { src: `images/top${imageFolder}/5.Memento_top_result_result.webp`, monoSrc: `images/mono${imageFolder}/5.Memento_top_mono_result_result.webp`, href: 'memento.html', category: 'other', alt: 'Memento' },
            { src: `images/top${imageFolder}/4.Vnsh_top_result_result.webp`, monoSrc: `images/mono${imageFolder}/4.Vnsh_top_mono_result_result.webp`, href: 'vnsh.html', category: 'light', alt: 'Vnsh' },
            { src: `images/top${imageFolder}/3.LTI_top_result_result.webp`, monoSrc: `images/mono${imageFolder}/3.LTI_top_mono_result_result.webp`, href: 'lti.html', category: 'light', alt: 'LTI' },
            { src: `images/top${imageFolder}/2.ORI_top_result_result.webp`, monoSrc: `images/mono${imageFolder}/2.ORI_top_mono_result_result.webp`, href: 'ori.html', category: 'furniture', alt: 'ORI' },
            { src: `images/top${imageFolder}/1.transfer_top_result_result.webp`, monoSrc: `images/mono${imageFolder}/1.transfer_top_mono_result_result.webp`, href: 'transfer.html', category: 'other', alt: 'transfer' }
        ].map(work => ({ ...work, src: `${work.src}?v=${new Date().getTime()}`, monoSrc: `${work.monoSrc}?v=${new Date().getTime()}` }));

        // Deterministic random helper
        const seed = (n) => {
            const x = Math.sin(n * 12.9898) * 43758.5453;
            return x - Math.floor(x);
        };

        const renderGallery = (filter = 'all') => {
            // Clear gallery using safer method than innerHTML
            while (galleryContainer.firstChild) {
                galleryContainer.removeChild(galleryContainer.firstChild);
            }
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
                img.loading = 'lazy'; // Add native lazy loading

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

                // On mobile, a single click will navigate. On desktop, hover activates and click navigates.
                // The `<a>` tag handles the navigation, so no special click listener is needed for this behavior.
            });

            // Add footer after all images are rendered
            const footer = document.createElement('footer');
            const footerText = document.createElement('p');
            footerText.textContent = '© 2026 SOTANAKA. All rights reserved.';
            footer.appendChild(footerText);
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
                    // Navigate to dedicated category pages instead of filtering on homepage
                    const categoryPages = {
                        'furniture': '/furniture',
                        'light': '/light',
                        'other': '/other'
                    };
                    if (categoryPages[filter]) {
                        window.location.href = categoryPages[filter];
                    } else {
                        e.preventDefault();
                        applyFilter(filter);
                    }
                }
            });
        });
    }

    // Toggle functionality for collapsible navigation
    const toggleBtn = document.getElementById('toggle-btn');
    const subItems = document.getElementById('sub-items');
    const allLink = document.getElementById('all-link');
    
    if (toggleBtn && subItems) {
        // Disable transitions on page load
        subItems.classList.add('preload');
        
        // Restore state from localStorage on page load with validation
        const navExpandedRaw = localStorage.getItem('navExpanded');
        const navExpanded = navExpandedRaw === 'true';
        if (navExpanded && (navExpandedRaw === 'true' || navExpandedRaw === 'false')) {
            subItems.classList.add('expanded');
            toggleBtn.textContent = '−';
        }
        
        // Re-enable transitions after initial state is set
        setTimeout(() => {
            subItems.classList.remove('preload');
        }, 50);
        
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            subItems.classList.toggle('expanded');
            const isExpanded = subItems.classList.contains('expanded');
            toggleBtn.textContent = isExpanded ? '−' : '+';
            // Save state to localStorage (boolean converted to string)
            localStorage.setItem('navExpanded', String(isExpanded));
        });
        
        // Prevent the ALL link from navigating when clicking the toggle
        if (allLink) {
            allLink.addEventListener('click', (e) => {
                // Only allow navigation if NOT clicking the toggle button
                if (e.target === toggleBtn) {
                    e.preventDefault();
                }
            });
        }
    }

    // Stripe Checkout Integration
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    if (addToCartButtons.length > 0) {
        // Stripe is only needed for the dynamic checkout-session flow.
        // For direct Stripe Payment Links (https://buy.stripe.com/...), we can redirect without Stripe.js.
        let stripe = null;
        const getStripe = () => {
            if (stripe) return stripe;
            if (typeof Stripe !== 'function') {
                throw new Error('Stripe.js not loaded');
            }
            // Stripe publishable key should be set via config.js
            const publishableKey = window.STRIPE_PUBLISHABLE_KEY || window.APP_CONFIG?.STRIPE_PUBLISHABLE_KEY;
            if (!publishableKey) {
                throw new Error('Stripe publishable key not configured');
            }
            stripe = Stripe(publishableKey);
            return stripe;
        };

        const colorOptions = [
            // neutrals
            { label: 'White', swatch: 'rgb(243, 243, 243)' },
            { label: 'Grey', swatch: 'rgb(203, 203, 203)' },
            { label: 'Natural', swatch: 'rgb(110, 86, 58)' },
            { label: 'Olive Grey', swatch: 'rgb(67, 60, 34)' },
            { label: 'Light Khaki', swatch: 'rgb(211, 173, 132)' },
            // warm tones
            { label: 'Yellow', swatch: 'rgb(252, 235, 101)' },
            { label: 'Milk Orange', swatch: 'rgb(235, 170, 126)' },
            // greens
            { label: 'Green', swatch: 'rgb(94, 203, 118)' },
            { label: 'Neon Green', swatch: 'rgb(116, 251, 76)' },
            // blue
            { label: 'Blue', swatch: 'rgb(0, 0, 245)' },
            // accent
            { label: 'Neon Red', swatch: 'rgb(234, 51, 35)' }
        ];

        const updateSelectionSummary = (container) => {
            if (!container) return;
            const el = container.querySelector('[data-selection-summary]');
            if (!el) return;

            const size = (container.dataset && container.dataset.selectedSizeLabel) ? container.dataset.selectedSizeLabel : '';
            const selectedChip = container.querySelector('.color-chip.selected');
            const color = selectedChip ? (selectedChip.getAttribute('data-color') || '') : '';

            // Abbreviate sizes: Small -> S, Large -> L
            const sizeAbbr = size === 'Small' ? 'S' : (size === 'Large' ? 'L' : size);

            const parts = [];
            if (sizeAbbr) parts.push(sizeAbbr);
            if (color) parts.push(color);

            el.textContent = parts.length ? `Selected: ${parts.join(' · ')}` : '';
        };

        // Size selector support
        // 1) Dropdown variant (<select data-size-select>)
        document.querySelectorAll('[data-size-select]').forEach((select) => {
            const update = () => {
                const container = select.closest('.purchase-info') || select.parentElement;
                if (!container) return;

                const btn = container.querySelector('.add-to-cart');
                if (btn) {
                    btn.setAttribute('data-product-id', select.value);
                }

                const opt = select.selectedOptions && select.selectedOptions[0];
                if (opt) {
                    const sizeLabel = opt.getAttribute('data-size-label') || '';
                    if (sizeLabel) container.dataset.selectedSizeLabel = sizeLabel;
                }

                if (btn && opt) {
                    const href = opt.getAttribute('data-href') || '';
                    if (href) btn.setAttribute('href', href);
                }

                const priceEl = container.querySelector('[data-size-price]');
                if (priceEl && opt) {
                    const price = opt.getAttribute('data-price') || '';
                    if (price) priceEl.textContent = price;
                }
            };

            select.addEventListener('change', update);
            update();
        });

        // 2) Pill-button variant (<div data-size-selector> ... <button data-size-value=...>)
        document.querySelectorAll('[data-size-selector]').forEach((selector) => {
            const container = selector.closest('.purchase-info') || selector.parentElement;
            if (!container) return;

            const pills = selector.querySelectorAll('[data-size-value]');
            const btn = container.querySelector('.add-to-cart');
            const priceEl = container.querySelector('[data-size-price]');

                const apply = (pill) => {
                pills.forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');

                const productId = pill.getAttribute('data-size-value') || '';
                const sizeLabel = pill.getAttribute('data-size-label') || '';
                const price = pill.getAttribute('data-price') || '';
                const href = pill.getAttribute('data-href') || '';
                const priceId = pill.getAttribute('data-price-id') || '';

                // API mode (data-price-id): update price ID but keep base product ID
                if (priceId) {
                    if (btn) btn.setAttribute('data-price-id', priceId);
                } else {
                    // Legacy mode (data-href): update product ID and href
                    if (btn && productId) btn.setAttribute('data-product-id', productId);
                    if (btn && href) btn.setAttribute('href', href);
                }
                
                if (priceEl && price) priceEl.textContent = price;
                if (sizeLabel) container.dataset.selectedSizeLabel = sizeLabel;

                updateSelectionSummary(container);
            };

            pills.forEach((pill) => {
                pill.addEventListener('click', () => apply(pill));
            });

            const initiallySelected = selector.querySelector('.size-pill.selected') || pills[0];
            if (initiallySelected) apply(initiallySelected);
        });

        addToCartButtons.forEach(button => {
            const productId = button.getAttribute('data-product-id');

            // Inject custom color chips for LO_* and LO / * products, plus Liminal Lamp
            if (productId && (productId.startsWith('LO_') || productId.startsWith('LO /') || productId.toUpperCase().includes('LIMINAL LAMP'))) {
                const container = button.closest('.purchase-info') || button.parentElement;

                // Ensure we show a confirmation line on all LO_* pages (not just LO_HORSE)
                if (container && !container.querySelector('[data-selection-summary]')) {
                    const summary = document.createElement('p');
                    summary.className = 'selection-summary';
                    summary.setAttribute('data-selection-summary', '');
                    container.insertBefore(summary, button);
                }

                if (container && !container.querySelector('.color-chip')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'color-selector';

                    const label = document.createElement('label');
                    label.textContent = 'Color';

                    const chips = document.createElement('div');
                    chips.className = 'color-chips';

                    colorOptions.forEach(({ label: colorLabel, swatch }) => {
                        const chip = document.createElement('button');
                        chip.type = 'button';
                        chip.className = 'color-chip';
                        chip.setAttribute('data-color', colorLabel);
                        chip.style.backgroundColor = swatch;
                        chip.setAttribute('aria-label', colorLabel);
                        chip.title = colorLabel;
                        chip.textContent = '';

                        chip.addEventListener('click', () => {
                            chips.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
                            chip.classList.add('selected');
                            updateSelectionSummary(container);
                        });

                        chips.appendChild(chip);
                    });

                    wrapper.appendChild(label);
                    wrapper.appendChild(chips);

                    const firstPrice = container.querySelector('p');
                    container.insertBefore(wrapper, firstPrice || container.firstChild);
                    updateSelectionSummary(container);
                }
            }

            button.addEventListener('click', async (event) => {
                const productId = button.getAttribute('data-product-id');

                const container = button.closest('.purchase-info');
                const colorChips = container ? container.querySelectorAll('.color-chip') : null;
                let color = '';

                const sizeSelect = container ? container.querySelector('[data-size-select]') : null;
                let size = '';

                if (colorChips && colorChips.length > 0) {
                    const selectedChip = Array.from(colorChips).find(c => c.classList.contains('selected'));
                    color = selectedChip ? selectedChip.getAttribute('data-color') : '';
                    if (!color && productId && productId.startsWith('LO_')) {
                        alert('Please select a color.');
                        event.preventDefault();
                        return;
                    }
                }

                if (sizeSelect) {
                    const opt = sizeSelect.selectedOptions && sizeSelect.selectedOptions[0];
                    size = (opt && opt.getAttribute('data-size-label')) ? opt.getAttribute('data-size-label') : '';
                    if (!size) {
                        alert('Please select a size.');
                        event.preventDefault();
                        return;
                    }
                } else if (container && container.dataset && container.dataset.selectedSizeLabel) {
                    size = container.dataset.selectedSizeLabel;
                }

                // If this is a direct Stripe link, allow navigation and skip the dynamic fetch
                const href = button.getAttribute('href');
                if (href && href.startsWith('http')) {
                    if (color || size) {
                        event.preventDefault();
                        // Append selection as client_reference_id so it appears in Stripe dashboard
                        const refParts = [];
                        if (productId) refParts.push(productId);
                        if (size) refParts.push(size);
                        if (color) refParts.push(color);
                        const ref = refParts.join(' / ');
                        const separator = href.includes('?') ? '&' : '?';
                        window.location.href = `${href}${separator}client_reference_id=${encodeURIComponent(ref)}`;
                        return;
                    }
                    return;
                }

                event.preventDefault(); // Stop # jump for dynamic flow
                
                // Disable button to prevent double-clicks
                button.disabled = true;
                button.textContent = '...';
                
                try {
                    // NEW: Use Vercel API endpoint for dynamic checkout with metadata
                    const VERCEL_API_URL = window.VERCEL_API_URL || 'https://sotanaka-shop.vercel.app/api/create-checkout';
                    
                    // Get the price ID from the button's data attribute
                    const priceId = button.getAttribute('data-price-id');
                    if (!priceId) {
                        alert('Product configuration error. Please contact support.');
                        return;
                    }

                    const response = await fetch(VERCEL_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            productId, 
                            color, 
                            size,
                            priceId,
                            successUrl: `${window.location.origin}/success.html`,
                            cancelUrl: `${window.location.origin}/cancel.html`
                        })
                    });

                    const result = await response.json();

                    if (response.ok && result.url) {
                        // Validate that the URL is a Stripe checkout URL before redirecting
                        if (result.url.startsWith('https://checkout.stripe.com/')) {
                            window.location.href = result.url;
                        } else {
                            console.error('Invalid checkout URL:', result.url);
                            alert('Invalid checkout URL. Please contact support.');
                        }
                    } else {
                        console.error('API error:', result.error || result.message);
                        alert('Unable to process payment. Please try again.');
                    }
                } catch (error) {
                    console.error('Network error:', error);
                    alert('Payment error. Please try again.');
                } finally {
                    // Re-enable button
                    button.disabled = false;
                    button.textContent = 'Checkout';
                }
            });
        });
    }
});
