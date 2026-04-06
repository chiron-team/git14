/**
 * Contact Form Module
 * Handles form validation and submission
 */

export class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitButton = null;
        this.isSubmitting = false;

        this.init();
    }

    /**
     * Initialize contact form functionality
     */
    init() {
        if (!this.form) {
            console.warn('Contact form not found');
            return;
        }

        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.setupEventListeners();
        this.setupValidation();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    /**
     * Set up form validation
     */
    setupValidation() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            // Add aria-required attribute
            input.setAttribute('aria-required', 'true');
            
            // Create error message container
            const errorContainer = document.createElement('div');
            errorContainer.className = 'form__error';
            errorContainer.setAttribute('role', 'alert');
            errorContainer.setAttribute('aria-live', 'polite');
            input.parentNode.appendChild(errorContainer);
        });
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        event.preventDefault();

        if (this.isSubmitting) {
            return;
        }

        // Validate all fields
        if (!this.validateForm()) {
            return;
        }

        this.isSubmitting = true;
        this.setSubmitButtonLoading(true);

        try {
            // Get form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);

            // Simulate API call (replace with actual endpoint)
            await this.submitFormData(data);

            // Show success message
            this.showSuccessMessage();

            // Reset form
            this.form.reset();

        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage('Failed to send message. Please try again.');
        } finally {
            this.isSubmitting = false;
            this.setSubmitButtonLoading(false);
        }
    }

    /**
     * Validate entire form
     */
    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Validate individual field
     */
    validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const name = input.name;
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        this.clearFieldError(input);

        // Required field validation
        if (input.hasAttribute('required') && !value) {
            errorMessage = `${this.getFieldLabel(input)} is required.`;
            isValid = false;
        }
        // Email validation
        else if (type === 'email' && value && !this.isValidEmail(value)) {
            errorMessage = 'Please enter a valid email address.';
            isValid = false;
        }
        // Name validation
        else if (name === 'name' && value && value.length < 2) {
            errorMessage = 'Name must be at least 2 characters long.';
            isValid = false;
        }
        // Message validation
        else if (name === 'message' && value && value.length < 10) {
            errorMessage = 'Message must be at least 10 characters long.';
            isValid = false;
        }

        if (!isValid) {
            this.showFieldError(input, errorMessage);
        }

        return isValid;
    }

    /**
     * Show field error
     */
    showFieldError(input, message) {
        const errorContainer = input.parentNode.querySelector('.form__error');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }

        input.classList.add('form__input--error');
        input.setAttribute('aria-describedby', `${input.name}-error`);
    }

    /**
     * Clear field error
     */
    clearFieldError(input) {
        const errorContainer = input.parentNode.querySelector('.form__error');
        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.style.display = 'none';
        }

        input.classList.remove('form__input--error');
        input.removeAttribute('aria-describedby');
    }

    /**
     * Get field label text
     */
    getFieldLabel(input) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        return label ? label.textContent.replace('*', '').trim() : input.name;
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Set submit button loading state
     */
    setSubmitButtonLoading(isLoading) {
        if (!this.submitButton) return;

        if (isLoading) {
            const originalText = this.submitButton.getAttribute('data-original-text');
            if (!originalText) {
                this.submitButton.setAttribute('data-original-text', this.submitButton.textContent);
            }
            
            this.submitButton.textContent = 'Sending...';
            this.submitButton.disabled = true;
            this.submitButton.classList.add('btn--loading');
        } else {
            const originalText = this.submitButton.getAttribute('data-original-text');
            if (originalText) {
                this.submitButton.textContent = originalText;
            }
            
            this.submitButton.disabled = false;
            this.submitButton.classList.remove('btn--loading');
        }
    }

    /**
     * Submit form data to server
     */
    async submitFormData(data) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In a real application, you would make an API call here
        console.log('Form data submitted:', data);

        // Example API call:
        /*
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to submit form');
        }

        return response.json();
        */
    }

    /**
     * Show success message
     */
    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'form__message form__message--success';
        message.textContent = 'Thank you! Your message has been sent successfully.';
        message.setAttribute('role', 'alert');
        message.setAttribute('aria-live', 'polite');

        // Insert after form
        this.form.parentNode.insertBefore(message, this.form.nextSibling);

        // Remove after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);

        // Scroll to message
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Show error message
     */
    showErrorMessage(text) {
        const message = document.createElement('div');
        message.className = 'form__message form__message--error';
        message.textContent = text;
        message.setAttribute('role', 'alert');
        message.setAttribute('aria-live', 'assertive');

        // Insert after form
        this.form.parentNode.insertBefore(message, this.form.nextSibling);

        // Remove after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        if (this.form) {
            this.form.removeEventListener('submit', this.handleSubmit);
        }
    }
}