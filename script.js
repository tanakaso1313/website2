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

        const applyFilter = (filter) => {
            galleryLinks.forEach(galleryLink => {
                const altText = galleryLink.querySelector('img').alt;
                if (filter === 'all' || !filter || (works[filter] && works[filter].includes(altText))) {
                    galleryLink.style.display = 'block';
                } else {
                    galleryLink.style.display = 'none';
                }
            });
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
                    const workKey = workLink.dataset.work;
                    const workName = workMap[workKey];
                    
                    const targetGalleryLink = Array.from(galleryLinks).find(gl => gl.querySelector('img').alt === workName);

                    if (targetGalleryLink) {
                        if (targetGalleryLink.classList.contains('is-colored')) {
                            window.location.href = workLink.href;
                        } else {
                            galleryLinks.forEach(otherLink => {
                                otherLink.classList.remove('is-colored');
                                const otherImg = otherLink.querySelector('img');
                                otherImg.src = otherImg.dataset.monoSrc;
                            });

                            targetGalleryLink.classList.add('is-colored');
                            const targetImg = targetGalleryLink.querySelector('img');
                            targetImg.src = targetImg.dataset.colorSrc;
                            targetGalleryLink.style.zIndex = zIndexCounter++;
                        }
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
