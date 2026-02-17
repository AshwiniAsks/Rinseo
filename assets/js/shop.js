// ===== RINSEO SHOP FUNCTIONALITY =====

let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';

// Initialize shop page functionality
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('shop.html')) {
        console.log('🏪 Shop page detected, initializing...');

        // Debug: Check if required objects are available
        console.log('🔍 Checking dependencies:');
        console.log('  - RinseoApp:', !!window.RinseoApp);
        console.log('  - RinseoCart:', !!window.RinseoCart);
        console.log('  - RinseoUtils:', !!window.RinseoUtils);

        if (window.RinseoApp) {
            console.log('  - Cart array:', window.RinseoApp.cart);
        }

        initializeShopPage();

        // Process any pending cart items after login
        setTimeout(() => {
            processPendingCartItem();
        }, 1000);
    }
});

function initializeShopPage() {
    preloadImages();
    loadProducts();
    initializeFilters();
    initializeSearch();
}

// Load products from JSON
async function loadProducts() {
    try {
        console.log('🔄 Starting to load products...');
        showLoadingState(true);

        // Try to fetch from JSON first
        const response = await fetch('../data/products.json');
        console.log('📡 Fetch response:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Products loaded:', data.products.length, 'products');
        console.log('📋 First product:', data.products[0]);

        allProducts = data.products;
        filteredProducts = [...allProducts];

        console.log('🎯 About to render products...');
        renderProducts();
        showLoadingState(false);

    } catch (error) {
        console.error('❌ Error loading products:', error);
        console.log('🔄 Falling back to inline product data...');

        // Fallback to inline data for CORS issues
        loadInlineProducts();
    }
}

// Fallback function with inline product data
function loadInlineProducts() {
    try {
        const inlineData = {
            "products": [
                {
                    "id": "vintage-denim-jacket",
                    "name": "Vintage Denim Jacket",
                    "category": "casual",
                    "images": ["assets/images/products/vintage-denim-jacket.jpg"],
                    "buyPrice": 2999,
                    "rentPrice": 999,
                    "condition": "excellent",
                    "description": "Classic vintage denim jacket with unique detailing",
                    "sizes": ["S", "M", "L", "XL"],
                    "available": true
                },
                {
                    "id": "classic-white-shirt",
                    "name": "Classic White Shirt",
                    "category": "formal",
                    "images": ["assets/images/products/classic-white-shirt.jpg"],
                    "buyPrice": 1499,
                    "rentPrice": 499,
                    "condition": "like-new",
                    "description": "Crisp white shirt perfect for professional settings",
                    "sizes": ["S", "M", "L", "XL", "XXL"],
                    "available": true
                },
                {
                    "id": "ethnic-kurta-set",
                    "name": "Ethnic Kurta Set",
                    "category": "ethnic",
                    "images": ["assets/images/products/ethnic-kurta-set.jpg"],
                    "buyPrice": 2499,
                    "rentPrice": 799,
                    "condition": "excellent",
                    "description": "Traditional kurta set for festive occasions",
                    "sizes": ["S", "M", "L", "XL", "XXL"],
                    "available": true
                },
                {
                    "id": "designer-dress",
                    "name": "Designer Dress",
                    "category": "formal",
                    "images": ["assets/images/products/designer-dress.jpg"],
                    "buyPrice": 3999,
                    "rentPrice": 1299,
                    "condition": "excellent",
                    "description": "Elegant designer dress for special events",
                    "sizes": ["XS", "S", "M", "L", "XL"],
                    "available": true
                },
                {
                    "id": "casual-tshirt",
                    "name": "Casual T-Shirt",
                    "category": "casual",
                    "images": ["assets/images/products/casual-tshirt.jpg"],
                    "buyPrice": 799,
                    "rentPrice": 299,
                    "condition": "excellent",
                    "description": "Comfortable casual t-shirt for everyday wear",
                    "sizes": ["S", "M", "L", "XL", "XXL"],
                    "available": true
                },
                {
                    "id": "formal-blazer",
                    "name": "Formal Blazer",
                    "category": "formal",
                    "images": ["assets/images/products/formal-blazer.jpg"],
                    "buyPrice": 4999,
                    "rentPrice": 1599,
                    "condition": "excellent",
                    "description": "Professional blazer for business meetings",
                    "sizes": ["S", "M", "L", "XL"],
                    "available": true
                }
            ]
        };

        console.log('📦 Inline products loaded:', inlineData.products.length, 'products');

        allProducts = inlineData.products;
        filteredProducts = [...allProducts];

        renderProducts();
        showLoadingState(false);

    } catch (error) {
        console.error('❌ Even inline fallback failed:', error);
        showLoadingState(false);
        showNoResults(true);
    }
}

// Initialize filter functionality
function initializeFilters() {
    const categoryDropdown = document.getElementById('categoryDropdown');

    if (categoryDropdown) {
        categoryDropdown.addEventListener('change', function () {
            currentCategory = this.value;
            filterProducts();
        });
    }
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('productSearch');

    if (searchInput) {
        // Check if RinseoUtils.debounce exists, otherwise use a simple debounce
        const debounceFunc = (window.RinseoUtils && window.RinseoUtils.debounce) ?
            window.RinseoUtils.debounce :
            function (func, wait) {
                let timeout;
                return function (...args) {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => func.apply(this, args), wait);
                };
            };

        const searchHandler = debounceFunc(function (e) {
            const query = e.target.value.toLowerCase().trim();
            filterProducts(query);
        }, 300);

        searchInput.addEventListener('input', searchHandler);
    }
}

// Filter products based on category and search
function filterProducts(searchQuery = '') {
    filteredProducts = allProducts.filter(product => {
        // Category filter
        const categoryMatch = currentCategory === 'all' || product.category === currentCategory;

        // Search filter
        const searchMatch = searchQuery === '' ||
            product.name.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery) ||
            product.category.toLowerCase().includes(searchQuery);

        return categoryMatch && searchMatch;
    });

    renderProducts();
}

// Render products grid
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    console.log('🎨 Rendering products, grid element found:', !!productsGrid);
    console.log('📊 Filtered products count:', filteredProducts.length);

    if (!productsGrid) {
        console.error('❌ Products grid element not found!');
        return;
    }

    if (filteredProducts.length === 0) {
        console.log('⚠️ No products to display');
        productsGrid.innerHTML = '';
        showNoResults(true);
        return;
    }

    showNoResults(false);

    const productCards = filteredProducts.map(product => createProductCard(product)).join('');
    console.log('🏗️ Generated HTML length:', productCards.length, 'characters');

    productsGrid.innerHTML = productCards;
    console.log('✅ Products HTML inserted into grid');

    // Initialize product interactions
    initializeProductCards();
    console.log('🎮 Product interactions initialized');
}

// Create product card HTML
function createProductCard(product) {
    const conditionColors = {
        'excellent': 'var(--primary-green)',
        'like-new': 'var(--primary-blue)',
        'good': '#ffc107'
    };

    // Ensure proper image path handling
    const imagePath = product.images[0];
    let imageUrl;

    // Handle different path scenarios
    if (imagePath.startsWith('assets/')) {
        imageUrl = `../${imagePath}`;
    } else if (imagePath.startsWith('../')) {
        imageUrl = imagePath;
    } else {
        imageUrl = `../assets/images/products/${imagePath}`;
    }

    console.log(`🖼️ Product: ${product.name}, Image path: ${imagePath} → ${imageUrl}`);

    return `
        <div class="product-card" 
             data-product-id="${product.id}" 
             data-category="${product.category}"
             data-buy-price="${product.buyPrice}"
             data-rent-price="${product.rentPrice}">
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${product.name}" class="product-image" 
                     loading="lazy"
                     onerror="handleImageError(this)"
                     onload="handleImageLoad(this)">
                <div class="condition-tag ${product.condition.replace('-', '-')}">
                    ${product.condition === 'like-new' ? 'New' : product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                </div>
                <button class="wishlist-btn" title="Add to wishlist">
                    ♡
                </button>
            </div>
            
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                
                <div class="product-pricing">
                    <div class="price-main">₹${product.buyPrice.toLocaleString()}</div>
                    <div class="price-secondary">or rent for ₹${product.rentPrice.toLocaleString()}</div>
                </div>
                
                <div class="product-actions">
                    <button class="btn-buy" data-action="buy" data-price="${product.buyPrice}" data-product-name="${product.name}">
                        Buy
                    </button>
                    <button class="btn-rent" data-action="rent" data-price="${product.rentPrice}" data-product-name="${product.name}">
                        Rent
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Initialize product card interactions
function initializeProductCards() {
    // Buy buttons
    const buyButtons = document.querySelectorAll('.btn-buy');
    buyButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            handleProductAction(this, 'buy');
        });
    });

    // Rent buttons
    const rentButtons = document.querySelectorAll('.btn-rent');
    rentButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            handleProductAction(this, 'rent');
        });
    });

    // Wishlist buttons
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            handleWishlist(this);
        });
    });
}

// Handle product buy/rent action
function handleProductAction(button, action) {
    const productCard = button.closest('.product-card');
    if (!productCard) return;

    const productId = productCard.getAttribute('data-product-id');
    const product = allProducts.find(p => p.id === productId);

    if (!product) return;

    const price = parseFloat(button.getAttribute('data-price'));
    const productName = product.name;
    const productImage = product.images[0];

    // Show size selection if product has sizes
    if (product.sizes && product.sizes.length > 1) {
        showSizeSelection(product, action, price, productName, productImage);
    } else {
        addToCart(productId, action, price, productName, productImage, product.sizes[0] || null);
    }
}

// Show size selection modal
function showSizeSelection(product, action, price, productName, productImage) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Select Size</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div style="padding: 1rem;">
                <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                    ${productName} - ${action === 'buy' ? 'Buy' : 'Rent'} for ₹${price.toLocaleString()}
                </p>
                <div class="size-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 0.5rem; margin-bottom: 1.5rem;">
                    ${product.sizes.map(size => `
                        <button class="size-btn" data-size="${size}" style="
                            padding: 0.75rem;
                            border: 2px solid var(--border-light);
                            background: var(--background-white);
                            border-radius: 8px;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        ">${size}</button>
                    `).join('')}
                </div>
                <button class="btn btn-primary" id="confirmSize" style="width: 100%;" disabled>
                    Add to Cart
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    let selectedSize = null;

    // Size selection
    const sizeButtons = modal.querySelectorAll('.size-btn');
    const confirmButton = modal.querySelector('#confirmSize');

    sizeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            sizeButtons.forEach(b => {
                b.style.borderColor = 'var(--border-light)';
                b.style.background = 'var(--background-white)';
            });

            this.style.borderColor = 'var(--primary-green)';
            this.style.background = 'var(--background-soft)';

            selectedSize = this.getAttribute('data-size');
            confirmButton.disabled = false;
        });
    });

    // Confirm selection
    confirmButton.addEventListener('click', function () {
        if (selectedSize) {
            addToCart(product.id, action, price, productName, productImage, selectedSize);
            modal.remove();
        }
    });

    // Close modal
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => modal.remove());

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Show modal
    setTimeout(() => modal.classList.add('active'), 100);
}

// Add product to cart
function addToCart(productId, type, price, name, image, size) {
    console.log('🛒 Adding to cart:', { productId, type, price, name, image, size });

    // Check if required objects exist
    if (!window.RinseoCart) {
        console.error('❌ RinseoCart not found!');
        alert('Cart functionality not available. Please refresh the page.');
        return;
    }

    if (!window.RinseoUtils) {
        console.error('❌ RinseoUtils not found!');
        alert('Utility functions not available. Please refresh the page.');
        return;
    }

    if (!window.RinseoApp) {
        console.error('❌ RinseoApp not found!');
        alert('App not initialized. Please refresh the page.');
        return;
    }

    // Check if user is authenticated - if not, prompt for login/signup
    if (!RinseoApp.isAuthenticated) {
        showLoginPrompt(productId, type, price, name, image, size);
        return;
    }

    try {
        const success = RinseoCart.addItem(productId, type, price, name, image, size);
        console.log('✅ Cart add result:', success);

        if (success) {
            // Visual feedback
            RinseoUtils.showNotification(`${name} added to cart!`, 'success');

            // Update button temporarily
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                const button = productCard.querySelector(`[data-action="${type}"]`);
                if (button) {
                    const originalText = button.textContent;
                    button.textContent = 'Added!';
                    button.style.background = 'var(--primary-green)';

                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.background = '';
                    }, 2000);
                }
            }

            console.log('🛒 Current cart:', RinseoApp.cart);
        }
    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        alert('Failed to add item to cart: ' + error.message);
    }
}

// Show login prompt when user tries to add to cart without being authenticated
function showLoginPrompt(productId, type, price, name, image, size) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px;">
            <div class="modal-header">
                <h3 style="color: var(--navy-dark); margin: 0;">Login Required</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div style="padding: 2rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
                <p style="margin-bottom: 1.5rem; color: var(--text-secondary); font-size: 1.125rem;">
                    Please login or create an account to add items to your cart and enjoy a personalized shopping experience.
                </p>
                <div style="background: var(--background-soft); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="margin: 0; color: var(--navy-dark); font-weight: 600;">
                        ${name} - ${type === 'buy' ? 'Buy' : 'Rent'} for ₹${price.toLocaleString()}
                    </p>
                    <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.875rem;">
                        This item will be saved for you after login
                    </p>
                </div>
                <div style="display: flex; gap: 1rem; flex-direction: column;">
                    <button class="btn btn-primary btn-large login-action" style="width: 100%;">
                        Login to Add to Cart
                    </button>
                    <button class="btn btn-secondary signup-action" style="width: 100%;">
                        Create Account
                    </button>
                </div>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 1rem;">
                    Continue browsing without an account? <button class="continue-browsing" style="background: none; border: none; color: var(--primary-green); cursor: pointer; text-decoration: underline;">Continue as guest</button>
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 100);

    // Store the item details for after login
    sessionStorage.setItem('pendingCartItem', JSON.stringify({
        productId, type, price, name, image, size
    }));

    // Login action
    const loginBtn = modal.querySelector('.login-action');
    loginBtn.addEventListener('click', () => {
        modal.remove();
        window.location.href = 'auth.html?mode=login&redirect=shop';
    });

    // Signup action
    const signupBtn = modal.querySelector('.signup-action');
    signupBtn.addEventListener('click', () => {
        modal.remove();
        window.location.href = 'auth.html?mode=signup&redirect=shop';
    });

    // Continue browsing
    const continueBtn = modal.querySelector('.continue-browsing');
    continueBtn.addEventListener('click', () => {
        modal.remove();
        RinseoUtils.showNotification('You can browse products as a guest, but login is required to add items to cart', 'info');
    });

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

// Check for pending cart item after login (call this after successful login)
function processPendingCartItem() {
    const pendingItem = sessionStorage.getItem('pendingCartItem');
    if (pendingItem && RinseoApp.isAuthenticated) {
        try {
            const item = JSON.parse(pendingItem);
            sessionStorage.removeItem('pendingCartItem');

            // Add the item to cart
            const success = RinseoCart.addItem(item.productId, item.type, item.price, item.name, item.image, item.size);
            if (success) {
                RinseoUtils.showNotification(`Welcome back! ${item.name} has been added to your cart.`, 'success');
            }
        } catch (error) {
            console.error('Error processing pending cart item:', error);
            sessionStorage.removeItem('pendingCartItem');
        }
    }
}

// Handle wishlist functionality
function handleWishlist(button) {
    const isWishlisted = button.textContent === '♥';

    if (isWishlisted) {
        button.textContent = '♡';
        button.style.background = 'rgba(255, 255, 255, 0.9)';
        button.style.color = '';
        RinseoUtils.showNotification('Removed from wishlist', 'info');
    } else {
        button.textContent = '♥';
        button.style.background = 'var(--primary-green)';
        button.style.color = 'white';
        RinseoUtils.showNotification('Added to wishlist', 'success');
    }
}

// Show/hide loading state
function showLoadingState(show) {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.style.display = show ? 'block' : 'none';
    }
}

// Show/hide no results message
function showNoResults(show) {
    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.style.display = show ? 'block' : 'none';
    }
}

// Handle image loading errors
function handleImageError(img) {
    console.log('Image failed to load:', img.src);
    img.src = '../assets/images/products/placeholder.svg';
    img.alt = 'Product image not available';

    // Add error class for styling
    img.classList.add('image-error');
}

// Handle successful image loading
function handleImageLoad(img) {
    img.classList.add('image-loaded');

    // Remove any loading placeholder
    const container = img.closest('.product-image-container');
    if (container) {
        container.classList.add('loaded');
    }
}

// Preload critical images
function preloadImages() {
    const criticalImages = [
        '../assets/images/products/placeholder.svg'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Test function to simulate login (for development/testing)
window.simulateLogin = function () {
    RinseoApp.isAuthenticated = true;
    RinseoApp.user = {
        name: 'Test User',
        email: 'test@example.com'
    };

    // Save session
    if (window.RinseoUtils && RinseoUtils.saveUserSession) {
        RinseoUtils.saveUserSession();
    }

    // Update auth buttons
    if (window.RinseoUtils && RinseoUtils.updateAuthButtons) {
        RinseoUtils.updateAuthButtons();
    }

    console.log('✅ Simulated login successful');
    RinseoUtils.showNotification('Logged in successfully! You can now add items to cart.', 'success');

    // Process any pending cart items
    processPendingCartItem();
};

// Test function to simulate logout (for development/testing)
window.simulateLogout = function () {
    RinseoApp.isAuthenticated = false;
    RinseoApp.user = null;

    // Clear session
    localStorage.removeItem('rinseo_session');

    // Update auth buttons
    if (window.RinseoUtils && RinseoUtils.updateAuthButtons) {
        RinseoUtils.updateAuthButtons();
    }

    console.log('✅ Simulated logout successful');
    RinseoUtils.showNotification('Logged out successfully.', 'info');
};