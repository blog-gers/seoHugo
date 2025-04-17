/**
 * SEO PRO - Enhanced Lazy Loading Implementation
 * This script handles advanced lazy loading of images (internal and external) for better performance
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Initialize lazy loading
    initLazyLoading();
    
    // Re-check for new images that might be added to DOM dynamically
    document.addEventListener('DOMNodeInserted', function(event) {
        if (event.target && event.target.querySelectorAll) {
            const newLazyImages = event.target.querySelectorAll('.lazy-load');
            if (newLazyImages.length > 0) {
                initLazyLoadingForElements(newLazyImages);
            }
        }
    });
    
    // Main initialization function
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('.lazy-load:not(.lazy-processed)');
        initLazyLoadingForElements(lazyImages);
    }
    
    // Initialize lazy loading for specific elements
    function initLazyLoadingForElements(elements) {
        if (!elements || elements.length === 0) return;
        
        // Check for native lazy loading support
        const nativeLazyLoadSupport = 'loading' in HTMLImageElement.prototype;
        
        elements.forEach(function(img) {
            // Mark as processed to avoid duplicate processing
            img.classList.add('lazy-processed');
            
            // Check if image has a data-src attribute
            if (!img.dataset.src) return;
            
            // Default placeholder image (transparent pixel)
            if (!img.src) {
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
            }
            
            // Check if error handling is already set
            if (!img.dataset.errorHandled) {
                // Add error handling to replace broken images
                img.addEventListener('error', function() {
                    // Only replace if the error is on the actual image, not the placeholder
                    if (img.src !== 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E') {
                        img.src = '/img/image-not-found.svg';
                        img.classList.add('img-error');
                    }
                });
                img.dataset.errorHandled = 'true';
            }
            
            // Use native lazy loading if available
            if (nativeLazyLoadSupport) {
                img.loading = 'lazy';
                img.src = img.dataset.src;
                img.classList.add('lazy-loaded');
            }
        });
        
        // If native lazy loading is not supported, use IntersectionObserver
        if (!nativeLazyLoadSupport && 'IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('lazy-loaded');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px', // Load images 50px before they enter viewport
                threshold: 0.01 // Trigger when just 1% of the image is visible
            });
            
            elements.forEach(function(img) {
                if (!nativeLazyLoadSupport) {
                    imageObserver.observe(img);
                }
            });
        } 
        // Fallback for browsers without IntersectionObserver support
        else if (!nativeLazyLoadSupport) {
            lazyLoadFallback(elements);
        }
    }
    
    // Fallback method for older browsers
    function lazyLoadFallback(elements) {
        let lazyLoadThrottleTimeout;
        
        function lazyLoad() {
            if (lazyLoadThrottleTimeout) {
                clearTimeout(lazyLoadThrottleTimeout);
            }
            
            lazyLoadThrottleTimeout = setTimeout(function() {
                const scrollTop = window.pageYOffset;
                
                elements.forEach(function(img) {
                    if (img.offsetTop < (window.innerHeight + scrollTop + 200)) {
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('lazy-loaded');
                        }
                    }
                });
            }, 20);
        }
        
        document.addEventListener('scroll', lazyLoad);
        window.addEventListener('resize', lazyLoad);
        window.addEventListener('orientationChange', lazyLoad);
        
        // Initial load
        lazyLoad();
    }
    
    // Create image not found SVG for broken images
    function createImageNotFoundSVG() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('width', '200');
        svg.setAttribute('height', '150');
        svg.setAttribute('viewBox', '0 0 200 150');
        
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute('fill', '#f8f9fa');
        rect.setAttribute('width', '200');
        rect.setAttribute('height', '150');
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute('fill', '#6c757d');
        text.setAttribute('font-family', 'sans-serif');
        text.setAttribute('font-size', '16');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('x', '100');
        text.setAttribute('y', '80');
        text.textContent = 'Image not found';
        
        svg.appendChild(rect);
        svg.appendChild(text);
        
        return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.outerHTML);
    }
    
    // Fix for images that might be already in the viewport on load
    setTimeout(function() {
        window.dispatchEvent(new Event('scroll'));
    }, 200);
});
