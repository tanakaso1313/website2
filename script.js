document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.querySelector('.gallery-container');
    const filterLinks = document.querySelectorAll('.category-nav a');

    // Handle filtering on the main gallery page
    if (galleryContainer) {
        const galleryLinks = document.querySelectorAll('.gallery-container a');
        let zIndexCounter = 10;

        const works = {
            'furniture': ['ORI'],
            'light': ['Liminal Lamp', 'Vnsh', 'LTI'],
            'other': ['transfer', 'Memento', 'Liminal Objects', 'Let a']
        };

        const worksMobile = {
            'furniture': ['ORI'],
            'light': ['LL', 'VNSH', 'LTI'],
            'other': ['LCSC', 'LO', 'MMNT', 'TRSF']
        };

        const applyFilter = (filter) => {
            galleryLinks.forEach(galleryLink => {
                const altText = galleryLink.querySelector('img').alt;
                if (filter === 'all' || !filter || (works[filter] && works[filter].includes(altText))) {
                    galleryLink.style.display = 'block';
                } else {
                    galleryLink.style.display = 'none';
                }
            });

            if (isMobile) {
                mobileWorkLinks.forEach(workLink => {
                    const workKey = workLink.dataset.work;
                    if (filter === 'all' || (worksMobile[filter] && worksMobile[filter].includes(workKey))) {
                        workLink.style.display = 'block';
                    } else {
                        workLink.style.display = 'none';
                    }
                });
            }
        };

        const isMobile = window.innerWidth <= 768;

        // Store original monochrome source for all images
        galleryLinks.forEach(link => {
            const img = link.querySelector('img');
            img.dataset.monoSrc = img.src;
        });

        galleryLinks.forEach(link => {
            const img = link.querySelector('img');
            const monoSrc = img.dataset.monoSrc;
            const colorSrc = img.dataset.colorSrc;

            if (!isMobile) {
                // Desktop hover logic
                link.addEventListener('mouseenter', () => {
                    img.src = colorSrc;
                    link.style.zIndex = zIndexCounter++;
                });

                link.addEventListener('mouseleave', () => {
                    img.src = monoSrc;
                });
            }
        });

        const mobileWorkLinks = document.querySelectorAll('.mobile-work-links a');
        if (isMobile && mobileWorkLinks.length > 0) {
            const workMap = {
                'LCSC': 'Let a',
                'LL': 'Liminal Lamp',
                'LO': 'Liminal Objects',
                'MMNT': 'Memento',
                'VNSH': 'Vnsh',
                'LTI': 'LTI',
                'ORI': 'ORI',
                'TRSF': 'transfer'
            };

            mobileWorkLinks.forEach(workLink => {
                workLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = workLink.href;
                });
            });

            let activeGalleryLink = null;
            let zIndexCounter = 10;

            galleryLinks.forEach(galleryLink => {
                galleryLink.addEventListener('click', (e) => {
                    e.preventDefault();

                    if (activeGalleryLink === galleryLink) {
                        // Second tap on the same image navigates
                        window.location.href = galleryLink.href;
                    } else {
                        // Tapped on a new image
                        if (activeGalleryLink) {
                            // Revert the previously active link to monochrome
                            const previousImg = activeGalleryLink.querySelector('img');
                            previousImg.src = previousImg.dataset.monoSrc;
                        }

                        // Activate the newly tapped link
                        const currentImg = galleryLink.querySelector('img');
                        currentImg.src = currentImg.dataset.colorSrc;
                        galleryLink.style.zIndex = zIndexCounter++;
                        activeGalleryLink = galleryLink;
                    }
                });
            });
        }

        // Check for filter in URL query params
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
                    // Update URL without reloading
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

    // Handle shop page logic
    const shopGrid = document.querySelector('.shop-grid');
    if (shopGrid) {
        fetch('products.json')
            .then(response => response.json())
            .then(products => {
                products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.classList.add('product-item');
                    productItem.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <p>${product.name}</p>
                        <p>${product.description}</p>
                        <p class="price">$${product.price.toFixed(2)}</p>
                    `;
                    shopGrid.appendChild(productItem);
                });
            });
    }
});

document.addEventListener('click', async (event) => {
    if (event.target.matches('.add-to-cart')) {
        const productId = event.target.dataset.productId;
        if (productId) {
            const stripe = Stripe('pk_live_51RqS8cEcQzNRltK0cc6T6Koxx5KhVTqJxsPEO56dmsr4W6zGhlMgcou55TjKUJGBlAzM0vQJyjuI41gzjEIebn9M00PIt8Mrd2');
            
            // Use Stripe Payment Links for GitHub Pages compatibility
            const paymentLinks = {
                'vnsh': 'https://buy.stripe.com/YOUR_VNSH_PAYMENT_LINK',
                'liminal-light-s': 'https://buy.stripe.com/YOUR_LIMINAL_PAYMENT_LINK'
            };
            
            if (paymentLinks[productId]) {
                window.location.href = paymentLinks[productId];
            } else {
                // Fallback to email
                const productName = document.querySelector('h2').textContent;
                const productPrice = document.querySelector('.purchase-info p').textContent;
                const subject = `Purchase Inquiry: ${productName}`;
                const body = `Hello,\n\nI would like to purchase the ${productName} (${productPrice}).\n\nPlease provide payment details.\n\nThank you!`;
                window.location.href = `mailto:info@sotanaka.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
        }
    }
});
