/**
 * Theme Toggle Module
 * Handles dark/light theme switching
 */

export class ThemeToggle {
    constructor() {
        this.toggleButton = document.getElementById('themeToggle');
        this.currentTheme = 'light';
        this.storageKey = 'preferred-theme';

        this.init();
    }

    /**
     * Initialize theme toggle functionality
     */
    init() {
        if (!this.toggleButton) {
            console.warn('Theme toggle button not found');
            return;
        }

        this.loadSavedTheme();
        this.setupEventListeners();
        this.updateToggleButton();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.toggleButton.addEventListener('click', this.toggleTheme.bind(this));

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener(this.handleSystemThemeChange.bind(this));
        }

        // Listen for storage changes (for cross-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.currentTheme = e.newValue || 'light';
                this.applyTheme();
                this.updateToggleButton();
            }
        });
    }

    /**
     * Load saved theme from localStorage
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(this.storageKey);
        
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            // Use system preference if available
            this.currentTheme = this.getSystemTheme();
        }

        this.applyTheme();
    }

    /**
     * Get system theme preference
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
        this.updateToggleButton();
        
        // Dispatch custom event for other components
        this.dispatchThemeChangeEvent();
    }

    /**
     * Apply theme to document
     */
    applyTheme() {
        const root = document.documentElement;
        
        if (this.currentTheme === 'dark') {
            root.classList.add('theme-dark');
            root.classList.remove('theme-light');
        } else {
            root.classList.add('theme-light');
            root.classList.remove('theme-dark');
        }

        // Update meta theme-color for mobile browsers
        this.updateThemeColor();
    }

    /**
     * Update theme-color meta tag
     */
    updateThemeColor() {
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.setAttribute('name', 'theme-color');
            document.head.appendChild(themeColorMeta);
        }

        const themeColor = this.currentTheme === 'dark' ? '#0f172a' : '#ffffff';
        themeColorMeta.setAttribute('content', themeColor);
    }

    /**
     * Save theme preference to localStorage
     */
    saveTheme() {
        try {
            localStorage.setItem(this.storageKey, this.currentTheme);
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }

    /**
     * Update toggle button appearance and accessibility
     */
    updateToggleButton() {
        if (!this.toggleButton) return;

        const isDark = this.currentTheme === 'dark';
        
        // Update button text/icon
        this.toggleButton.textContent = isDark ? '☀️' : '🌙';
        
        // Update accessibility attributes
        this.toggleButton.setAttribute('aria-label', 
            isDark ? 'Switch to light theme' : 'Switch to dark theme'
        );
        
        this.toggleButton.setAttribute('title', 
            isDark ? 'Switch to light theme' : 'Switch to dark theme'
        );

        // Update button state
        this.toggleButton.classList.toggle('theme-toggle--dark', isDark);
    }

    /**
     * Handle system theme changes
     */
    handleSystemThemeChange(e) {
        // Only respond to system changes if user hasn't set a preference
        const savedTheme = localStorage.getItem(this.storageKey);
        
        if (!savedTheme) {
            this.currentTheme = e.matches ? 'dark' : 'light';
            this.applyTheme();
            this.updateToggleButton();
            this.dispatchThemeChangeEvent();
        }
    }

    /**
     * Dispatch custom theme change event
     */
    dispatchThemeChangeEvent() {
        const event = new CustomEvent('themechange', {
            detail: {
                theme: this.currentTheme,
                previousTheme: this.currentTheme === 'light' ? 'dark' : 'light'
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Set theme programmatically
     */
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.warn('Invalid theme. Use "light" or "dark"');
            return;
        }

        this.currentTheme = theme;
        this.applyTheme();
        this.saveTheme();
        this.updateToggleButton();
        this.dispatchThemeChangeEvent();
    }

    /**
     * Reset to system theme
     */
    resetToSystemTheme() {
        localStorage.removeItem(this.storageKey);
        this.currentTheme = this.getSystemTheme();
        this.applyTheme();
        this.updateToggleButton();
        this.dispatchThemeChangeEvent();
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        if (this.toggleButton) {
            this.toggleButton.removeEventListener('click', this.toggleTheme);
        }

        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.removeListener(this.handleSystemThemeChange);
        }
    }
}