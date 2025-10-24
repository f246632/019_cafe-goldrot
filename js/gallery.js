/**
 * Café Goldrot - Gallery & Lightbox
 * Handles photo gallery interactions and lightbox functionality
 */

(function() {
    'use strict';

    // ===================================
    // Gallery Configuration
    // ===================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');

    let currentImageIndex = 0;
    const images = Array.from(galleryItems).map(item => {
        const img = item.querySelector('img');
        return {
            src: img.src,
            alt: img.alt
        };
    });

    // ===================================
    // Gallery Item Click Handlers
    // ===================================
    galleryItems.forEach((item, index) => {
        // Click handler
        item.addEventListener('click', () => {
            openLightbox(index);
        });

        // Keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View image ${index + 1} in lightbox`);

        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });

        // Add hover effect animation
        const overlay = item.querySelector('.gallery-overlay');
        if (overlay) {
            item.addEventListener('mouseenter', () => {
                overlay.style.transition = 'opacity 0.3s ease';
            });
        }
    });

    // ===================================
    // Lightbox Functions
    // ===================================
    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Focus management for accessibility
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling

        // Return focus to the gallery item that was clicked
        if (galleryItems[currentImageIndex]) {
            galleryItems[currentImageIndex].focus();
        }
    }

    function showPreviousImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateLightboxImage();
    }

    function updateLightboxImage() {
        if (images[currentImageIndex]) {
            const image = images[currentImageIndex];

            // Fade out
            lightboxImage.style.opacity = '0';

            // Update image after fade
            setTimeout(() => {
                lightboxImage.src = image.src;
                lightboxImage.alt = image.alt;
                updateCounter();

                // Fade in
                lightboxImage.style.opacity = '1';
            }, 150);
        }
    }

    function updateCounter() {
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
        }
    }

    // ===================================
    // Event Listeners
    // ===================================

    // Close button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Previous button
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            showPreviousImage();
        });
    }

    // Next button
    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextImage();
        });
    }

    // Click outside image to close
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // ===================================
    // Keyboard Navigation
    // ===================================
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });

    // ===================================
    // Touch/Swipe Support for Mobile
    // ===================================
    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - show next
                showNextImage();
            } else {
                // Swipe right - show previous
                showPreviousImage();
            }
        }
    }

    // ===================================
    // Image Preloading
    // ===================================
    function preloadImages() {
        images.forEach(image => {
            const img = new Image();
            img.src = image.src;
        });
    }

    // Preload images after page load for better performance
    if (window.addEventListener) {
        window.addEventListener('load', () => {
            // Delay preloading to not interfere with initial page load
            setTimeout(preloadImages, 1000);
        });
    }

    // ===================================
    // Gallery Animations on Scroll
    // ===================================
    const galleryObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation for gallery items
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 50);

                galleryObserver.unobserve(entry.target);
            }
        });
    }, galleryObserverOptions);

    // Set initial state and observe
    galleryItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        galleryObserver.observe(item);
    });

    // ===================================
    // Image Loading State
    // ===================================
    lightboxImage.addEventListener('load', () => {
        lightboxImage.style.transition = 'opacity 0.3s ease';
    });

    lightboxImage.addEventListener('error', () => {
        console.error('Failed to load image:', lightboxImage.src);
        lightboxImage.alt = 'Bild konnte nicht geladen werden';
    });

    // ===================================
    // Accessibility Enhancements
    // ===================================

    // Add ARIA labels
    if (lightbox) {
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Bildergalerie Lightbox');
    }

    if (lightboxClose) {
        lightboxClose.setAttribute('aria-label', 'Lightbox schließen');
    }

    if (lightboxPrev) {
        lightboxPrev.setAttribute('aria-label', 'Vorheriges Bild');
    }

    if (lightboxNext) {
        lightboxNext.setAttribute('aria-label', 'Nächstes Bild');
    }

    // Trap focus within lightbox when open
    const focusableElements = [lightboxClose, lightboxPrev, lightboxNext].filter(el => el);

    if (lightbox && focusableElements.length > 0) {
        lightbox.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && lightbox.classList.contains('active')) {
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    // ===================================
    // Console Info
    // ===================================
    console.log(`Gallery initialized with ${images.length} images`);

})();
