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

                const randomLeft = Math.random() * 20; // 0vw to 20vw
                const randomTop = Math.random() * 10 - 5; // -5vh to 5vh
                imageWrapper.style.left = `${randomLeft}vw`;
                imageWrapper.style.top = `${randomTop}vh`;
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
