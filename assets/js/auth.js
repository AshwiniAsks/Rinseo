// ===== RINSEO AUTHENTICATION FUNCTIONALITY =====

// Authentication management
window.RinseoAuth = {

    // Login user
    login: function (email, password) {
        return new Promise((resolve, reject) => {
            // Simulate API call
            setTimeout(() => {
                // Simple validation for demo
                if (email && password.length >= 6) {
                    const user = {
                        id: 'user_' + Date.now(),
                        name: email.split('@')[0],
                        email: email
                    };

                    RinseoApp.user = user;
                    RinseoApp.isAuthenticated = true;
                    RinseoUtils.saveUserSession();
                    RinseoUtils.updateAuthButtons();

                    resolve(user);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000);
        });
    },

    // Register user
    register: function (name, email, password) {
        return new Promise((resolve, reject) => {
            // Simulate API call
            setTimeout(() => {
                // Simple validation for demo
                if (name && RinseoUtils.validateEmail(email) && password.length >= 6) {
                    const user = {
                        id: 'user_' + Date.now(),
                        name: name,
                        email: email
                    };

                    RinseoApp.user = user;
                    RinseoApp.isAuthenticated = true;
                    RinseoUtils.saveUserSession();
                    RinseoUtils.updateAuthButtons();

                    resolve(user);
                } else {
                    reject(new Error('Please check your information and try again'));
                }
            }, 1000);
        });
    },

    // Logout user
    logout: function () {
        RinseoApp.user = null;
        RinseoApp.isAuthenticated = false;
        localStorage.removeItem('rinseo_session');
        RinseoUtils.updateAuthButtons();
        RinseoUtils.showNotification('Logged out successfully', 'info');

        // Redirect to home if on protected page
        if (window.location.pathname.includes('cart.html')) {
            window.location.href = '../index.html';
        }
    },

    // Check if user is authenticated
    isAuthenticated: function () {
        return RinseoApp.isAuthenticated && RinseoApp.user;
    },

    // Get current user
    getCurrentUser: function () {
        return RinseoApp.user;
    },

    // Show authentication modal (exposed for external use)
    showAuthModal: showAuthModal
};

// Initialize authentication functionality
document.addEventListener('DOMContentLoaded', function () {
    initializeAuthForms();
    initializeAuthButtons();

    // Initialize auth page if we're on it
    if (window.location.pathname.includes('auth.html')) {
        initializeAuthPage();
        initializeAuthTabs();
    }
});

// Initialize authentication forms
function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Initialize authentication buttons
function initializeAuthButtons() {
    // Login buttons
    const loginButtons = document.querySelectorAll('.login-btn, [data-modal="authModal"]');
    loginButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            if (RinseoApp.isAuthenticated) {
                // Show user menu or logout
                showUserMenu();
            } else {
                // Show login modal or redirect to auth page
                showAuthModal();
            }
        });
    });

    // Signup buttons
    const signupButtons = document.querySelectorAll('.signup-btn');
    signupButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            showAuthModal('signup');
        });
    });

    // Logout buttons
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            RinseoAuth.logout();
        });
    });
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    // Validate form
    const errors = RinseoUtils.validateForm(form);
    if (errors.length > 0) {
        showFormErrors(form, errors);
        return;
    }

    // Clear previous errors
    clearFormErrors(form);

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    RinseoUtils.setLoadingState(submitBtn, true);

    // Attempt login
    RinseoAuth.login(email, password)
        .then(user => {
            RinseoUtils.setLoadingState(submitBtn, false);
            RinseoUtils.showNotification(`Welcome back, ${user.name}!`, 'success');

            // Close modal if it exists
            RinseoComponents.closeModal();

            // Redirect or refresh page
            setTimeout(() => {
                if (window.location.pathname.includes('auth.html')) {
                    window.location.href = '../index.html';
                } else {
                    window.location.reload();
                }
            }, 1500);
        })
        .catch(error => {
            RinseoUtils.setLoadingState(submitBtn, false);
            RinseoUtils.showNotification(error.message, 'error');
        });
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    // Validate form
    const errors = RinseoUtils.validateForm(form);
    if (errors.length > 0) {
        showFormErrors(form, errors);
        return;
    }

    // Clear previous errors
    clearFormErrors(form);

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    RinseoUtils.setLoadingState(submitBtn, true);

    // Attempt registration
    RinseoAuth.register(name, email, password)
        .then(user => {
            RinseoUtils.setLoadingState(submitBtn, false);
            RinseoUtils.showNotification(`Welcome to Rinseo, ${user.name}!`, 'success');

            // Close modal if it exists
            RinseoComponents.closeModal();

            // Redirect or refresh page
            setTimeout(() => {
                if (window.location.pathname.includes('auth.html')) {
                    window.location.href = '../index.html';
                } else {
                    window.location.reload();
                }
            }, 1500);
        })
        .catch(error => {
            RinseoUtils.setLoadingState(submitBtn, false);
            RinseoUtils.showNotification(error.message, 'error');
        });
}

// Show authentication modal
function showAuthModal(defaultTab = 'login') {
    // Check if modal exists, if not create it
    let authModal = document.getElementById('authModal');

    if (!authModal) {
        authModal = createAuthModal();
        document.body.appendChild(authModal);
    }

    // Set active tab
    const loginTab = authModal.querySelector('[href="#login"]');
    const signupTab = authModal.querySelector('[href="#signup"]');
    const loginContent = authModal.querySelector('#login');
    const signupContent = authModal.querySelector('#signup');

    if (defaultTab === 'signup') {
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
        loginContent.classList.remove('active');
        signupContent.classList.add('active');
    } else {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginContent.classList.add('active');
        signupContent.classList.remove('active');
    }

    // Show modal
    RinseoComponents.openModal('authModal');
}

// Create authentication modal
function createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px;">
            <div class="modal-header">
                <button class="modal-close">&times;</button>
            </div>
            
            <div class="auth-header">
                <div class="auth-logo-container">
                    <img src="assets/images/logo/rinseo-logo.svg" alt="Rinseo Logo" class="auth-logo-img" style="height: 50px;">
                </div>
                <h2 class="auth-title" style="font-size: 1.75rem; margin-bottom: 0.5rem;">Welcome to Rinseo</h2>
                <p class="auth-tagline">Artisan Garment Renewal</p>
            </div>
            
            <div class="auth-tabs">
                <button class="auth-tab active" data-tab="login">Login</button>
                <button class="auth-tab" data-tab="signup">Sign Up</button>
            </div>
            
            <div id="loginTab" class="auth-tab-content active">
                <form id="modalLoginForm" class="auth-form">
                    <div class="form-group">
                        <label class="form-label" for="modalLoginEmail">Email</label>
                        <input type="email" id="modalLoginEmail" name="email" class="form-input" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="modalLoginPassword">Password</label>
                        <input type="password" id="modalLoginPassword" name="password" class="form-input" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn btn-primary auth-submit-btn">Login</button>
                    <div class="auth-links">
                        <a href="#" class="forgot-password">Forgot password?</a>
                    </div>
                </form>
            </div>
            
            <div id="signupTab" class="auth-tab-content">
                <form id="modalSignupForm" class="auth-form">
                    <div class="form-group">
                        <label class="form-label" for="modalSignupName">Full Name</label>
                        <input type="text" id="modalSignupName" name="name" class="form-input" placeholder="John Doe" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="modalSignupEmail">Email</label>
                        <input type="email" id="modalSignupEmail" name="email" class="form-input" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="modalSignupPassword">Password</label>
                        <input type="password" id="modalSignupPassword" name="password" class="form-input" placeholder="••••••••" required minlength="6">
                    </div>
                    <button type="submit" class="btn btn-primary auth-submit-btn">Create Account</button>
                    <div class="auth-terms">
                        <p>By signing up, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a></p>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Initialize modal functionality
    setTimeout(() => {
        initializeModalAuthForms();
        initializeModalAuthTabs();
    }, 100);

    return modal;
}

// Initialize modal auth forms
function initializeModalAuthForms() {
    const loginForm = document.getElementById('modalLoginForm');
    const signupForm = document.getElementById('modalSignupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Initialize modal auth tabs
function initializeModalAuthTabs() {
    const tabs = document.querySelectorAll('#authModal .auth-tab');
    const tabContents = document.querySelectorAll('#authModal .auth-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Show corresponding content
            const targetContent = document.getElementById(targetTab + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Initialize auth page (standalone auth page)
function initializeAuthPage() {
    // Add back to home link functionality
    const backLink = document.querySelector('.back-link');
    if (backLink) {
        backLink.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = '../index.html';
        });
    }
}

// Initialize auth tabs
function initializeAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const tabContents = document.querySelectorAll('.auth-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Show corresponding content
            const targetContent = document.getElementById(targetTab + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Show user menu (when logged in)
function showUserMenu() {
    const userMenuHTML = `
        <div class="user-menu-dropdown">
            <div class="user-info">
                <strong>${RinseoApp.user.name}</strong>
                <small>${RinseoApp.user.email}</small>
            </div>
            <hr>
            <a href="pages/cart.html" class="menu-item">My Cart</a>
            <a href="#" class="menu-item">My Orders</a>
            <a href="#" class="menu-item">Profile Settings</a>
            <hr>
            <a href="#" class="menu-item logout-btn">Logout</a>
        </div>
    `;

    // This would typically be implemented as a dropdown menu
    // For now, just show logout option
    if (confirm(`Hello ${RinseoApp.user.name}! Would you like to logout?`)) {
        RinseoAuth.logout();
    }
}

// Show form errors
function showFormErrors(form, errors) {
    // Clear previous errors
    clearFormErrors(form);

    // Show first error as notification
    if (errors.length > 0) {
        RinseoUtils.showNotification(errors[0], 'error');
    }

    // Add error class to form
    form.classList.add('has-errors');
}

// Clear form errors
function clearFormErrors(form) {
    form.classList.remove('has-errors');
    const errorInputs = form.querySelectorAll('.form-input.error');
    errorInputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Forgot password functionality
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('forgot-password')) {
        e.preventDefault();
        const email = prompt('Please enter your email address:');
        if (email && RinseoUtils.validateEmail(email)) {
            RinseoUtils.showNotification('Password reset link sent to your email', 'success');
        } else if (email) {
            RinseoUtils.showNotification('Please enter a valid email address', 'error');
        }
    }
});

// Add auth-specific styles
const authStyles = document.createElement('style');
authStyles.textContent = `
    .auth-logo {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--navy-dark);
        text-align: center;
    }
    
    .auth-tagline {
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 2rem;
    }
    
    .forgot-password {
        color: var(--primary-green);
        text-decoration: none;
        font-size: 0.875rem;
    }
    
    .forgot-password:hover {
        text-decoration: underline;
    }
    
    .terms-text {
        font-size: 0.875rem;
        color: var(--text-secondary);
        text-align: center;
        margin-top: 1rem;
        line-height: 1.4;
    }
    
    .terms-text a {
        color: var(--primary-green);
        text-decoration: none;
    }
    
    .terms-text a:hover {
        text-decoration: underline;
    }
    
    .form-input.error {
        border-color: #dc3545;
        box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1);
    }
    
    .user-menu-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: var(--background-white);
        border: 1px solid var(--border-light);
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--shadow-light);
        min-width: 200px;
        z-index: 1000;
    }
    
    .user-info {
        padding: 1rem;
        text-align: center;
    }
    
    .user-info strong {
        display: block;
        color: var(--navy-dark);
        margin-bottom: 0.25rem;
    }
    
    .user-info small {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }
    
    .menu-item {
        display: block;
        padding: 0.75rem 1rem;
        color: var(--navy-dark);
        text-decoration: none;
        transition: background-color 0.2s ease;
    }
    
    .menu-item:hover {
        background: var(--background-soft);
        color: var(--primary-green);
    }
    
    .user-menu-dropdown hr {
        margin: 0;
        border: none;
        border-top: 1px solid var(--border-light);
    }
`;
document.head.appendChild(authStyles);