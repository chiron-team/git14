/**
 * Smooth Scroll Module
 * Handles smooth scrolling behavior for anchor links
 */

export class SmoothScroll {
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]');
        this.isScrolling = false;
        this.scrollOffset = 80; // Account for fixed header

        this.init();
    }

    /**
     * Initialize smooth scrolling
     */
    init() {
        if (this.links.length === 0) {
            console.warn('No anchor links found for smooth scrolling');
            return;
        }

        this.setupEventListeners();
        this.handleInitialHash();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.links.forEach(link => {
            link.addEventListener('click', this.handleLinkClick.bind(this));
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', this.handlePopState.bind(this));

        // Handle scroll end
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 100);
        }, { passive: true });
    }

    /**
     * Handle anchor link clicks
     */
    handleLinkClick(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');

        // Only handle same-page anchors
        if (!href || !href.startsWith('#') || href === '#') {
            return;
        }

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
            console.warn(`Target element not found: ${targetId}`);
            return;
        }

        event.preventDefault();
        this.scrollToElement(targetElement, href);
    }

    /**
     * Handle browser back/forward navigation
     */
    handlePopState() {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.getElementById(hash.substring(1));
            if (targetElement) {
                this.scrollToElement(targetElement, hash, false);
            }
        }
    }

    /**
     * Handle initial page load with hash
     */
    handleInitialHash() {
        const hash = window.location.hash;
        if (hash) {
            // Small delay to ensure page is fully loaded
            setTimeout(() => {
                const targetElement = document.getElementById(hash.substring(1));
                if (targetElement) {
                    this.scrollToElement(targetElement, hash, false);
                }
            }, 100);
        }
    }

    /**
     * Scroll to specific element
     */
    scrollToElement(element, hash, updateHistory = true) {
        if (this.isScrolling) {
            return;
        }

        this.isScrolling = true;

        // Calculate target position
        const elementTop = this.getElementTop(element);
        const targetPosition = Math.max(0, elementTop - this.scrollOffset);

        // Perform smooth scroll
        this.performSmoothScroll(targetPosition).then(() => {
            // Update URL if needed
            if (updateHistory && hash) {
                this.updateURL(hash);
            }

            // Focus the target element for accessibility
            this.focusElement(element);

            this.isScrolling = false;
        });
    }

    /**
     * Get element's top position relative to document
     */
    getElementTop(element) {
        let top = 0;
        let current = element;

        while (current) {
            top += current.offsetTop;
            current = current.offsetParent;
        }

        return top;
    }

    /**
     * Perform smooth scroll animation
     */
    performSmoothScroll(targetPosition) {
        return new Promise((resolve) => {
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = this.calculateDuration(Math.abs(distance));
            
            let start = null;

            const animateScroll = (timestamp) => {
                if (!start) start = timestamp;
                
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-in-out)
                const easeProgress = this.easeInOutCubic(progress);
                
                const currentPosition = startPosition + (distance * easeProgress);
                window.scrollTo(0, currentPosition);
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animateScroll);
        });
    }

    /**
     * Calculate scroll duration based on distance
     */
    calculateDuration(distance) {
        // Base duration with min/max limits
        const baseSpeed = 1; // pixels per ms
        const minDuration = 300;
        const maxDuration = 1000;
        
        const duration = distance / baseSpeed;
        return Math.min(Math.max(duration, minDuration), maxDuration);
    }

    /**
     * Easing function for smooth animation
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Update URL without triggering page jump
     */
    updateURL(hash) {
        if (history.pushState) {
            const url = window.location.pathname + window.location.search + hash;
            history.pushState(null, null, url);
        } else {
            // Fallback for older browsers
            window.location.hash = hash;
        }
    }

    /**
     * Focus element for accessibility
     */
    focusElement(element) {
        // Make element focusable if it isn't already
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '-1');
        }

        // Focus the element
        element.focus();

        // Remove tabindex after focusing to restore natural tab order
        if (element.getAttribute('tabindex') === '-1') {
            element.addEventListener('blur', () => {
                element.removeAttribute('tabindex');
            }, { once: true });
        }
    }

    /**
     * Set custom scroll offset
     */
    setScrollOffset(offset) {
        this.scrollOffset = offset;
    }

    /**
     * Get current scroll offset
     */
    getScrollOffset() {
        return this.scrollOffset;
    }

    /**
     * Scroll to top of page
     */
    scrollToTop() {
        this.performSmoothScroll(0).then(() => {
            this.updateURL('#');
        });
    }

    /**
     * Check if element is in viewport
     */
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= windowHeight &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Get currently visible section
     */
    getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        let currentSection = null;
        let maxVisibleHeight = 0;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
            
            if (visibleHeight > maxVisibleHeight && visibleHeight > 0) {
                maxVisibleHeight = visibleHeight;
                currentSection = section;
            }
        });

        return currentSection;
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        this.links.forEach(link => {
            link.removeEventListener('click', this.handleLinkClick);
        });

        window.removeEventListener('popstate', this.handlePopState);
    }
}