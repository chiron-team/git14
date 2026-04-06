/**
 * Main JavaScript Entry Point
 * Luma Store - Minimalist E-commerce Home View
 */

import { Navigation } from './modules/navigation.js';
import { ContactForm } from './modules/contact-form.js';
import { SmoothScroll } from './modules/smooth-scroll.js';
import { ThemeToggle } from './modules/theme-toggle.js';
import { debounce, throttle } from './utils/helpers.js';

/**
 * Main App Class
 * Handles application initialization and shared UI interactions
 */
class App {
    constructor() {
        this.modules = {};
        this.elements = {};
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) {
            console.warn('App is already initialized');
            return;
        }

        try {
            this.showLoadingState();
            document.documentElement.classList.add('js-enabled');

            await this.initializeModules();
            this.cacheElements();
            this.setupEventListeners();
            this.initializeComponents();

            this.isInitialized = true;
            this.hideLoadingState();

            console.log('✅ App initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.hideLoadingState();
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize all modules
     */
    async initializeModules() {
        this.modules.navigation = new Navigation();
        this.modules.contactForm = new ContactForm();
        this.modules.smoothScroll = new SmoothScroll();

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            this.modules.themeToggle = new ThemeToggle();
        }
    }

    /**
     * Cache frequently used elements
     */
    cacheElements() {
        this.elements.header = document.querySelector('.header');
        this.elements.searchForm = document.getElementById('storeSearchForm');
        this.elements.searchInput = document.getElementById('productSearch');
        this.elements.searchStatus = document.getElementById('searchStatus');
        this.elements.emptyState = document.getElementById('productEmptyState');
        this.elements.productCards = Array.from(document.querySelectorAll('.product-card'));
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        const handleResize = debounce(() => {
            this.handleWindowResize();
        }, 250);

        const handleScroll = throttle(() => {
            this.handleWindowScroll();
        }, 16);

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, { passive: true });

        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        document.addEventListener('keydown', event => {
            this.handleKeyboardNavigation(event);
        });
    }

    /**
     * Initialize interactive components
     */
    initializeComponents() {
        this.setupProductSearch();
        this.setupIntersectionObservers();
        this.initializeUIComponents();
        this.handleWindowScroll();
    }

    /**
     * Set up product search interactions
     */
    setupProductSearch() {
        const { searchForm, searchInput, searchStatus, emptyState, productCards } = this.elements;

        if (!searchForm || !searchInput || !searchStatus || productCards.length === 0) {
            return;
        }

        const runSearch = query => {
            const normalizedQuery = query.trim().toLowerCase();
            let visibleCount = 0;

            productCards.forEach(card => {
                const title = card.querySelector('.product-card__title')?.textContent || '';
                const category = card.querySelector('.product-card__category')?.textContent || '';
                const searchSource = card.dataset.search || '';
                const searchableText = `${searchSource} ${title} ${category}`.toLowerCase();
                const isMatch = normalizedQuery === '' || searchableText.includes(normalizedQuery);

                card.classList.toggle('product-card--hidden', !isMatch);
                card.hidden = !isMatch;
                card.setAttribute('aria-hidden', String(!isMatch));

                if (isMatch) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount > 0;
            }

            if (normalizedQuery === '') {
                searchStatus.textContent = `Showing ${visibleCount} curated products.`;
            } else if (visibleCount > 0) {
                searchStatus.textContent = `Found ${visibleCount} product${visibleCount === 1 ? '' : 's'} for “${query.trim()}”.`;
            } else {
                searchStatus.textContent = `No products found for “${query.trim()}”.`;
            }
        };

        const debouncedSearch = debounce(() => {
            runSearch(searchInput.value);
        }, 150);

        searchInput.addEventListener('input', debouncedSearch);

        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            runSearch(searchInput.value);
            this.trackEvent('product_search', {
                query: searchInput.value.trim()
            });
        });

        runSearch(searchInput.value);
    }

    /**
     * Set up intersection observers for entrance animations
     */
    setupIntersectionObservers() {
        const animateElements = document.querySelectorAll('[data-animate]');

        if (animateElements.length === 0) {
            return;
        }

        if (!window.IntersectionObserver) {
            animateElements.forEach(element => {
                element.classList.add('animate-in');
            });
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -40px 0px'
            }
        );

        animateElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Initialize UI helpers
     */
    initializeUIComponents() {
        this.addButtonLoadingStates();
        this.initializeCustomComponents();
    }

    /**
     * Add loading state support to submit buttons
     */
    addButtonLoadingStates() {
        const submitButtons = document.querySelectorAll('button[type="submit"]');
        submitButtons.forEach(button => {
            if (!button.hasAttribute('data-original-text')) {
                button.setAttribute('data-original-text', button.textContent.trim());
            }
        });
    }

    /**
     * Initialize custom components
     */
    initializeCustomComponents() {
        console.log('Custom components initialized');
    }

    /**
     * Handle window resize events
     */
    handleWindowResize() {
        if (this.modules.navigation) {
            this.modules.navigation.handleResize();
        }
    }

    /**
     * Handle window scroll events
     */
    handleWindowScroll() {
        const { header } = this.elements;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (header) {
            header.classList.toggle('header--scrolled', scrollTop > 24);
        }
    }

    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('Page hidden');
        } else {
            console.log('Page visible');
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(event) {
        if (event.key === 'Escape') {
            this.closeAllOverlays();
        }

        if (event.key === 'Enter') {
            const { target } = event;
            if (target instanceof HTMLElement && target.hasAttribute('data-keyboard-interactive')) {
                target.click();
            }
        }
    }

    /**
     * Close overlays or menus
     */
    closeAllOverlays() {
        console.log('All overlays closed');
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        document.body.classList.add('loading');
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        document.body.classList.remove('loading');
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('App initialization failed:', error);
        this.showErrorMessage('Something went wrong. Please refresh the page.');
    }

    /**
     * Show error message to user
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = [
            'position: fixed',
            'top: 20px',
            'right: 20px',
            'background: #171717',
            'color: #ffffff',
            'padding: 1rem 1.25rem',
            'border-radius: 1rem',
            'z-index: 10000',
            'box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18)'
        ].join(';');

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    /**
     * Track events for analytics
     */
    trackEvent(eventName, data = {}) {
        console.log('Event tracked:', eventName, data);
    }

    /**
     * Clean up resources
     */
    destroy() {
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });

        this.modules = {};
        this.isInitialized = false;
    }
}

const app = new App();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });
} else {
    app.init();
}

window.addEventListener('beforeunload', () => {
    app.destroy();
});

window.App = app;

if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed:', registrationError);
            });
    });
}
