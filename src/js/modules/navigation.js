/**
 * Navigation Module
 * Handles mobile menu toggle and navigation interactions
 */

export class Navigation {
    constructor() {
        this.nav = document.querySelector('.nav');
        this.navToggle = document.querySelector('.nav__toggle');
        this.navMenu = document.querySelector('.nav__menu');
        this.navLinks = document.querySelectorAll('.nav__link');
        this.isMenuOpen = false;

        this.init();
    }

    /**
     * Initialize navigation functionality
     */
    init() {
        if (!this.nav) {
            console.warn('Navigation element not found');
            return;
        }

        this.setupEventListeners();
        this.setupActiveLink();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Mobile menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', this.toggleMenu.bind(this));
        }

        // Close menu when clicking on a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', this.closeMenu.bind(this));
        });

        // Close menu when clicking outside
        document.addEventListener('click', e => {
            if (this.isMenuOpen && !this.nav.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
                this.navToggle.focus();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isMenuOpen) {
                this.closeMenu();
            }
        });
    }

    /**
     * Set up active link highlighting based on scroll position
     */
    setupActiveLink() {
        const sections = document.querySelectorAll('section[id]');

        if (sections.length === 0) {
            return;
        }

        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-80px 0px -80px 0px'
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                const navLink = document.querySelector(`a[href="#${id}"]`);

                if (entry.isIntersecting) {
                    // Remove active class from all links
                    this.navLinks.forEach(link => {
                        link.classList.remove('nav__link--active');
                    });

                    // Add active class to current link
                    if (navLink) {
                        navLink.classList.add('nav__link--active');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Set up smooth scrolling for navigation links
     */
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');

            if (href && href.startsWith('#')) {
                link.addEventListener('click', e => {
                    e.preventDefault();

                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        const headerHeight = this.nav.offsetHeight;
                        const targetPosition = targetElement.offsetTop - headerHeight - 20;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });

                        // Update URL without jumping
                        history.pushState(null, null, href);
                    }
                });
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMenu() {
        this.isMenuOpen = true;
        this.navToggle.classList.add('nav__toggle--active');
        this.navMenu.classList.add('nav__menu--open');
        this.nav.classList.add('nav--menu-open');

        // Animate toggle lines
        this.animateToggleLines(true);

        // Focus management
        this.navMenu.setAttribute('aria-expanded', 'true');

        // Focus first menu item
        const firstLink = this.navMenu.querySelector('.nav__link');
        if (firstLink) {
            firstLink.focus();
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close mobile menu
     */
    closeMenu() {
        this.isMenuOpen = false;
        this.navToggle.classList.remove('nav__toggle--active');
        this.navMenu.classList.remove('nav__menu--open');
        this.nav.classList.remove('nav--menu-open');

        // Animate toggle lines
        this.animateToggleLines(false);

        // Focus management
        this.navMenu.setAttribute('aria-expanded', 'false');

        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Animate hamburger menu lines
     */
    animateToggleLines(isOpen) {
        const lines = this.navToggle.querySelectorAll('.nav__toggle-line');

        if (lines.length !== 3) return;

        if (isOpen) {
            lines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            lines[0].style.transform = '';
            lines[1].style.opacity = '';
            lines[2].style.transform = '';
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMenu();
        }
    }

    /**
     * Get current active section
     */
    getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const scrollPosition = window.pageYOffset + this.nav.offsetHeight + 50;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        return currentSection;
    }

    /**
     * Update active navigation link
     */
    updateActiveLink(activeId) {
        this.navLinks.forEach(link => {
            link.classList.remove('nav__link--active');

            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
                link.classList.add('nav__link--active');
            }
        });
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        // Remove event listeners if needed
        if (this.navToggle) {
            this.navToggle.removeEventListener('click', this.toggleMenu);
        }

        this.navLinks.forEach(link => {
            link.removeEventListener('click', this.closeMenu);
        });
    }
}
