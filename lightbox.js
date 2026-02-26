/**
 * Lightbox module for product image galleries
 * Handles image lightbox functionality with keyboard navigation
 */
(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', () => {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return; // Exit if no lightbox on this page
        
        const lightboxImg = document.getElementById('lightbox-img');
        const closeButton = document.querySelector('.close-button');
        const prevButton = document.querySelector('.prev-button');
        const nextButton = document.querySelector('.next-button');
        const imageTriggers = document.querySelectorAll('.lightbox-trigger');
        const images = Array.from(imageTriggers).map(img => img.src);
        let currentIndex;

        function showImage(index) {
            lightboxImg.src = images[index];
            currentIndex = index;
        }

        imageTriggers.forEach((trigger, index) => {
            trigger.addEventListener('click', () => {
                lightbox.classList.add('active');
                showImage(index);
            });
        });

        function closeLightbox() {
            lightbox.classList.remove('active');
        }

        function showPrevImage() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        }

        function showNextImage() {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }

        closeButton.addEventListener('click', closeLightbox);
        prevButton.addEventListener('click', showPrevImage);
        nextButton.addEventListener('click', showNextImage);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    showPrevImage();
                } else if (e.key === 'ArrowRight') {
                    showNextImage();
                } else if (e.key === 'Escape') {
                    closeLightbox();
                }
            }
        });
    });
})();
