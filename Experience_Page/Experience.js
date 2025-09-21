/**
 * Experience Page JavaScript
 * Handles all interactive functionality for the Skye Suites Experience page
 */

// Experience Page Controller
class ExperienceController {
    constructor() {
        this.modals = new Map();
        this.dropdowns = new Map();
        this.init();
    }

    /**
     * Initialize all functionality when DOM is loaded
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupComponents();
                this.bindEvents();
            });
        } else {
            this.setupComponents();
            this.bindEvents();
        }
    }

    /**
     * Setup Bootstrap components
     */
    setupComponents() {
        this.initializeModals();
        this.initializeDropdowns();
        this.setupParallaxEffect();
    }

    /**
     * Initialize all modals
     */
    initializeModals() {
        const modalElements = document.querySelectorAll('.modal');
        modalElements.forEach(modalElement => {
            const modal = new bootstrap.Modal(modalElement);
            this.modals.set(modalElement.id, modal);
        });
    }

    /**
     * Initialize all dropdowns
     */
    initializeDropdowns() {
        const dropdownElements = document.querySelectorAll('.dropdown-toggle');
        dropdownElements.forEach(dropdownElement => {
            const dropdown = new bootstrap.Dropdown(dropdownElement);
            this.dropdowns.set(dropdownElement.id || dropdownElement.className, dropdown);
        });
    }

    /**
     * Setup parallax scrolling effect
     */
    setupParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.experience-parallax__image');
        
        if (parallaxElements.length > 0) {
            // Check if user prefers reduced motion
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            if (!prefersReducedMotion) {
                this.bindParallaxScroll(parallaxElements);
            }
        }
    }

    /**
     * Bind parallax scroll event
     */
    bindParallaxScroll(elements) {
        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            
            elements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translate3d(0, ${rate}px, 0)`;
            });
            
            ticking = false;
        };

        const requestParallaxUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        this.bindBookingFormEvents();
        this.bindNewsletterEvents();
        this.bindCardInteractions();
        this.bindNavigationEvents();
    }

    /**
     * Handle booking form submission
     */
    bindBookingFormEvents() {
        const bookingForm = document.querySelector('.experience-booking-modal__body form');
        const submitButton = document.querySelector('.experience-booking-modal__submit-btn');
        
        if (bookingForm && submitButton) {
            // Form submission via submit button
            submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleBookingSubmission(bookingForm);
            });

            // Form submission via enter key
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBookingSubmission(bookingForm);
            });

            // Real-time form validation
            const inputs = bookingForm.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }
    }

    /**
     * Handle booking form submission
     */
    handleBookingSubmission(form) {
        if (this.validateBookingForm(form)) {
            const formData = this.collectFormData(form);
            this.submitBookingForm(formData);
        }
    }

    /**
     * Validate entire booking form
     */
    validateBookingForm(form) {
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Custom validation for date range
        const checkinInput = form.querySelector('input[type="datetime-local"]:first-of-type');
        const checkoutInput = form.querySelector('input[type="datetime-local"]:last-of-type');
        
        if (checkinInput?.value && checkoutInput?.value) {
            const checkinDate = new Date(checkinInput.value);
            const checkoutDate = new Date(checkoutInput.value);
            
            if (checkoutDate <= checkinDate) {
                this.showFieldError(checkoutInput, 'Check-out date must be after check-in date');
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Validate individual form field
     */
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'This field is required';
            isValid = false;
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
        }

        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                errorMessage = 'Please enter a valid phone number';
                isValid = false;
            }
        }

        // Date validation
        if (field.type === 'datetime-local' && value) {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                errorMessage = 'Please select a future date';
                isValid = false;
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    /**
     * Collect form data
     */
    collectFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        // Get all form inputs
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.name || input.id) {
                const key = input.name || input.id;
                data[key] = input.value;
            }
        });

        return data;
    }

    /**
     * Submit booking form
     */
    submitBookingForm(formData) {
        // Show loading state
        const submitButton = document.querySelector('.experience-booking-modal__submit-btn');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'SUBMITTING...';
        submitButton.disabled = true;

        // Simulate API call (replace with actual API endpoint)
        setTimeout(() => {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;

            // Show success message
            this.showNotification('Booking request submitted successfully!', 'success');
            
            // Hide modal
            const bookingModal = this.modals.get('bookingModal');
            if (bookingModal) {
                bookingModal.hide();
            }

            // Reset form
            const form = document.querySelector('.experience-booking-modal__body form');
            if (form) {
                form.reset();
            }
        }, 2000);
    }

    /**
     * Handle newsletter subscription
     */
    bindNewsletterEvents() {
        const newsletterForm = document.querySelector('.experience-footer__form');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmission(newsletterForm);
            });
        }
    }

    /**
     * Handle newsletter form submission
     */
    handleNewsletterSubmission(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (!email) {
            this.showNotification('Please enter your email address', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Subscribing...';
        submitButton.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;

            // Show success message
            this.showNotification('Thank you for subscribing to our newsletter!', 'success');
            
            // Reset form
            form.reset();
        }, 1500);
    }

    /**
     * Bind card interaction events
     */
    bindCardInteractions() {
        const cards = document.querySelectorAll('.experience-card');
        
        cards.forEach(card => {
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });

            // Add keyboard accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    /**
     * Bind navigation events
     */
    bindNavigationEvents() {
        // Smooth scrolling for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href !== '#' && !href.includes('Modal')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            const dropdownMenus = document.querySelectorAll('.dropdown-menu.show');
            dropdownMenus.forEach(menu => {
                if (!menu.contains(e.target) && !menu.previousElementSibling?.contains(e.target)) {
                    const dropdown = bootstrap.Dropdown.getInstance(menu.previousElementSibling);
                    if (dropdown) {
                        dropdown.hide();
                    }
                }
            });
        });
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.experience-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `experience-notification experience-notification--${type}`;
        notification.innerHTML = `
            <div class="experience-notification__content">
                <span class="experience-notification__message">${message}</span>
                <button class="experience-notification__close" type="button" aria-label="Close">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 15px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close button functionality
        const closeButton = notification.querySelector('.experience-notification__close');
        closeButton.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                this.hideNotification(notification);
            }
        }, 5000);
    }

    /**
     * Hide notification
     */
    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Utility method to debounce function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Utility method to throttle function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the Experience Controller
const experienceController = new ExperienceController();