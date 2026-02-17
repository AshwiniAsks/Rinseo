// ===== RINSEO MAIN APPLICATION LOGIC =====

// Global application state
window.RinseoApp = {
    cart: [],
    user: null,
    isAuthenticated: false,
    modalShown: false
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
function initializeApp() {
    console.log('🚀 Initializing Rinseo application...');
    
    loadUserSession();
    console.log('👤 User session loaded');
    
    loadCart();
    console.log('🛒 Cart loaded from localStorage:', RinseoApp.cart);
    
    initializeNavigation();
    console.log('🧭 Navigation initialized');
    
    initializeScrollTriggers();
    console.log('📜 Scroll triggers initialized');
    
    updateCartBadge();
    console.log('🏷️ Cart badge updated');
    
    console.log('✅ Rinseo application initialized successfully');
}

// Load user session from localStorage
function loadUserSession() {
    const savedSession = localStorage.getItem('rinseo_session');
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            RinseoApp.user = session.user;
            RinseoApp.isAuthenticated = session.isAuthenticated;
        } catch (error) {
            console.error('Error loading user session:', error);
            localStorage.removeItem('rinseo_session');
        }
    }
}

// Save user session to localStorage
function saveUserSession() {
    const session = {
        user: RinseoApp.user,
        isAuthenticated: RinseoApp.isAuthenticated
    };
    localStorage.setItem('rinseo_session', JSON.stringify(session));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('rinseo_cart');
    if (savedCart) {
        try {
            RinseoApp.cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error loading cart:', error);
            RinseoApp.cart = [];
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('rinseo_cart', JSON.stringify(RinseoApp.cart));
    updateCartBadge();
}

// Update cart badge count
function updateCartBadge() {
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        const itemCount = RinseoApp.cart.reduce((total, item) => total + item.quantity, 0);
        cartBadge.textContent = itemCount;
        
        if (itemCount > 0) {
            cartBadge.classList.add('show');
        } else {
            cartBadge.classList.remove('show');
        }
        
        // Add animation when count changes
        cartBadge.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartBadge.style.transform = 'scale(1)';
        }, 200);
    }
}

// Initialize navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    const navToggle = document.querySelector('.navbar-toggle');
    const navMenu = document.querySelector('.navbar-nav');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
    
    // Set active navigation link
    setActiveNavLink();
    
    // Update authentication buttons
    updateAuthButtons();
}

// Set active navigation link based on current page
function setActiveNavLink() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href');
        
        if (currentPage === '/' || currentPage === '/index.html') {
            if (linkPath === 'index.html' || linkPath === '/') {
                link.classList.add('active');
            }
        } else if (currentPage.includes(linkPath.replace('../', '').replace('.html', ''))) {
            link.classList.add('active');
        }
    });
}

// Update authentication buttons based on login state
function updateAuthButtons() {
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const userMenu = document.querySelector('.user-menu');
    
    if (RinseoApp.isAuthenticated && RinseoApp.user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'block';
            userMenu.textContent = RinseoApp.user.name;
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Initialize scroll-triggered events
function initializeScrollTriggers() {
    // Only on homepage
    if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname.endsWith('index.html')) {
        let scrollTriggered = false;
        const modalShownKey = 'rinseo_modal_shown_' + new Date().toDateString();
        
        // Check if modal was already shown today
        if (localStorage.getItem(modalShownKey)) {
            return;
        }
        
        // Check if user is already authenticated
        if (RinseoApp.isAuthenticated) {
            return;
        }
        
        window.addEventListener('scroll', function() {
            if (!scrollTriggered && window.scrollY > 800) {
                scrollTriggered = true;
                setTimeout(() => {
                    showAuthModal();
                    localStorage.setItem(modalShownKey, 'true');
                }, 1500);
            }
        });
    }
}

// Show authentication modal
function showAuthModal() {
    // Check if we're on homepage and RinseoAuth is available
    if (typeof window.RinseoAuth !== 'undefined' && window.RinseoAuth.showAuthModal) {
        window.RinseoAuth.showAuthModal('signup');
    } else {
        // Create a simple modal for scroll trigger
        createScrollTriggeredModal();
    }
}

// Create scroll-triggered modal
function createScrollTriggeredModal() {
    // Check if modal already exists
    if (document.getElementById('scrollModal')) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'scrollModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px;">
            <div class="modal-header">
                <h2 style="color: var(--navy-dark); margin: 0;">Join Rinseo Today!</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div style="text-align: center; padding: 1rem 0;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🌿</div>
                <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">
                    Get exclusive benefits, easy booking, and help save the planet with sustainable garment care.
                </p>
                <div style="display: flex; gap: 1rem; flex-direction: column;">
                    <a href="pages/auth.html" class="btn btn-primary btn-large" style="width: 100%;">Sign Up Now</a>
                    <a href="pages/laundry.html" class="btn btn-secondary" style="width: 100%;">Book Service</a>
                </div>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 1rem;">
                    Already have an account? <a href="pages/auth.html" style="color: var(--primary-green);">Login here</a>
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 100);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    });
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Utility function to format currency
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--primary-green)' : type === 'error' ? '#dc3545' : 'var(--navy-dark)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--shadow-light);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for notification animation
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
`;
document.head.appendChild(notificationStyles);

// Utility function for smooth scrolling
function smoothScrollTo(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Form validation utilities
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    // Indian phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Generic form validation
function validateForm(formElement) {
    const errors = [];
    const inputs = formElement.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        const value = input.value.trim();
        const fieldName = input.getAttribute('name') || input.getAttribute('id') || 'Field';
        
        // Required field validation
        if (!validateRequired(value)) {
            errors.push(`${fieldName} is required`);
            input.classList.add('error');
        } else {
            input.classList.remove('error');
            
            // Type-specific validation
            if (input.type === 'email' && !validateEmail(value)) {
                errors.push(`Please enter a valid email address`);
                input.classList.add('error');
            }
            
            if (input.type === 'tel' && !validatePhone(value)) {
                errors.push(`Please enter a valid phone number`);
                input.classList.add('error');
            }
        }
    });
    
    return errors;
}

// Loading state management
function setLoadingState(element, isLoading) {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
        const originalText = element.textContent;
        element.setAttribute('data-original-text', originalText);
        element.innerHTML = '<span class="spinner"></span> Loading...';
    } else {
        element.classList.remove('loading');
        element.disabled = false;
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
            element.textContent = originalText;
        }
    }
}

// Debounce utility for search and other frequent events
function debounce(func, wait) {
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

// Export functions for use in other modules
window.RinseoUtils = {
    formatCurrency,
    showNotification,
    smoothScrollTo,
    validateEmail,
    validatePhone,
    validateRequired,
    validateForm,
    setLoadingState,
    debounce,
    saveCart,
    updateCartBadge,
    saveUserSession,
    updateAuthButtons,
    showAuthModal
};