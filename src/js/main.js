/**
 * Main JavaScript Entry Point
 * Testing2 Prod - Production Ready Boilerplate
 */

// Import modules
import { Navigation } from './modules/navigation.js';
import { ContactForm } from './modules/contact-form.js';
import { SmoothScroll } from './modules/smooth-scroll.js';
import { ThemeToggle } from './modules/theme-toggle.js';
import { debounce, throttle } from './utils/helpers.js';

/**
 * Main App Class
 * Handles application initialization and coordination between modules
 */
class App {
    constructor() {
        this.modules = {};
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
            // Show loading state if needed
            this.showLoadingState();

            // Initialize core modules
            await this.initializeModules();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize components
            this.initializeComponents();

            // Mark as initialized
            this.isInitialized = true;

            // Hide loading state
            this.hideLoadingState();

            console.log('✅ App initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize all modules
     */
    async initializeModules() {
        // Initialize navigation
        this.modules.navigation = new Navigation();
        
        // Initialize contact form
        this.modules.contactForm = new ContactForm();
        
        // Initialize smooth scroll
        this.modules.smoothScroll = new SmoothScroll();
        
        // Initialize theme toggle (if element exists)
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            this.modules.themeToggle = new ThemeToggle();
        }
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Window resize handler
        const handleResize = debounce(() => {
            this.handleWindowResize();
        }, 250);

        window.addEventListener('resize', handleResize);

        // Scroll handler for header behavior
        const handleScroll = throttle(() => {
            this.handleWindowScroll();
        }, 16);

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    /**
     * Initialize interactive components
     */
    initializeComponents() {
        // Get Started button functionality
        const getStartedBtn = document.getElementById('getStartedBtn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', this.handleGetStarted.bind(this));
        }

        // Add animation observers
        this.setupIntersectionObservers();

        // Initialize any tooltips or modals
        this.initializeUIComponents();
    }

    /**
     * Handle Get Started button click
     */
    handleGetStarted() {
        // Scroll to contact section or show welcome modal
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Track interaction
        this.trackEvent('get_started_clicked');
    }

    /**
     * Set up intersection observers for animations
     */
    setupIntersectionObservers() {
        if (!window.IntersectionObserver) {
            console.warn('IntersectionObserver not supported');
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that should animate in
        const animateElements = document.querySelectorAll('.about__card, .feature, .hero__content');
        animateElements.forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Initialize UI components like tooltips, modals, etc.
     */
    initializeUIComponents() {
        // Add loading states to buttons
        this.addButtonLoadingStates();

        // Initialize any custom UI components
        this.initializeCustomComponents();
    }

    /**
     * Add loading states to form submit buttons
     */
    addButtonLoadingStates() {
        const submitButtons = document.querySelectorAll('button[type="submit"]');
        submitButtons.forEach(button => {
            const originalText = button.textContent;
            button.setAttribute('data-original-text', originalText);
        });
    }

    /**
     * Initialize custom components
     */
    initializeCustomComponents() {
        // Add any custom component initialization here
        console.log('Custom components initialized');
    }

    /**
     * Handle window resize events
     */
    handleWindowResize() {
        // Update any size-dependent calculations
        if (this.modules.navigation) {
            this.modules.navigation.handleResize();
        }
    }

    /**
     * Handle window scroll events
     */
    handleWindowScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('.header');

        if (header) {
            if (scrollTop > 100) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }
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
        // Handle Escape key
        if (event.key === 'Escape') {
            // Close any open modals or dropdowns
            this.closeAllOverlays();
        }

        // Handle Enter key on custom interactive elements
        if (event.key === 'Enter') {
            const target = event.target;
            if (target.hasAttribute('data-keyboard-interactive')) {
                target.click();
            }
        }
    }

    /**
     * Close all overlays (modals, dropdowns, etc.)
     */
    closeAllOverlays() {
        // Implementation for closing overlays
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
        
        // Show user-friendly error message
        this.showErrorMessage('Something went wrong. Please refresh the page.');
    }

    /**
     * Show error message to user
     */
    showErrorMessage(message) {
        // Create a simple error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        document.body.appendChild(errorDiv);

        // Remove after 5 seconds
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
        // In production, you might send this to Google Analytics, etc.
        console.log('Event tracked:', eventName, data);
        
        // Example: gtag('event', eventName, data);
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clean up event listeners and modules
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });

        this.modules = {};
        this.isInitialized = false;
    }
}

// Initialize app when DOM is ready
const app = new App();

// Initialize when DOM content is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });
} else {
    // DOM is already loaded
    app.init();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    app.destroy();
});

// Export for potential use in other scripts
window.App = app;

// Service Worker registration (if available)
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}