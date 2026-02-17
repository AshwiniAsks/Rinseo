// ===== RINSEO SHOPPING CART FUNCTIONALITY =====

// Cart management functions
window.RinseoCart = {
    
    // Add item to cart
    addItem: function(productId, type, price, name, image, size = null) {
        const existingItemIndex = RinseoApp.cart.findIndex(item => 
            item.productId === productId && 
            item.type === type && 
            item.selectedSize === size
        );
        
        if (existingItemIndex > -1) {
            // Update quantity if item already exists
            RinseoApp.cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item
            const newItem = {
                productId: productId,
                type: type, // 'buy' or 'rent'
                quantity: 1,
                price: price,
                name: name,
                image: image,
                selectedSize: size
            };
            RinseoApp.cart.push(newItem);
        }
        
        saveCart();
        RinseoUtils.showNotification(`${name} added to cart`, 'success');
        
        return true;
    },
    
    // Remove item from cart
    removeItem: function(productId, type, size = null) {
        const itemIndex = RinseoApp.cart.findIndex(item => 
            item.productId === productId && 
            item.type === type && 
            item.selectedSize === size
        );
        
        if (itemIndex > -1) {
            const removedItem = RinseoApp.cart[itemIndex];
            RinseoApp.cart.splice(itemIndex, 1);
            saveCart();
            RinseoUtils.showNotification(`${removedItem.name} removed from cart`, 'info');
            return true;
        }
        
        return false;
    },
    
    // Update item quantity
    updateQuantity: function(productId, type, newQuantity, size = null) {
        const itemIndex = RinseoApp.cart.findIndex(item => 
            item.productId === productId && 
            item.type === type && 
            item.selectedSize === size
        );
        
        if (itemIndex > -1) {
            if (newQuantity <= 0) {
                return this.removeItem(productId, type, size);
            } else {
                const oldQuantity = RinseoApp.cart[itemIndex].quantity;
                RinseoApp.cart[itemIndex].quantity = newQuantity;
                saveCart();
                
                // Show feedback for quantity change
                const action = newQuantity > oldQuantity ? 'increased' : 'decreased';
                RinseoUtils.showNotification(`Quantity ${action} to ${newQuantity}`, 'success');
                
                return true;
            }
        }
        
        return false;
    },
    
    // Get cart total
    getTotal: function() {
        return RinseoApp.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    },
    
    // Get cart item count
    getItemCount: function() {
        return RinseoApp.cart.reduce((total, item) => total + item.quantity, 0);
    },
    
    // Clear entire cart
    clearCart: function() {
        RinseoApp.cart = [];
        saveCart();
        RinseoUtils.showNotification('Cart cleared', 'info');
    },
    
    // Get delivery fee
    getDeliveryFee: function() {
        const total = this.getTotal();
        // Free delivery for orders above ₹500
        return total >= 500 ? 0 : 50;
    },
    
    // Get final total including delivery
    getFinalTotal: function() {
        return this.getTotal() + this.getDeliveryFee();
    }
};

// Initialize cart functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Cart.js initializing...');
    
    // Ensure cart is loaded from localStorage
    loadCart();
    console.log('📦 Cart loaded:', RinseoApp.cart);
    
    initializeCartButtons();
    console.log('🔘 Cart buttons initialized');
    
    if (window.location.pathname.includes('cart.html')) {
        console.log('🛒 Cart page detected, rendering...');
        renderCartPage();
    }
    
    // Update cart badge on all pages
    updateCartBadge();
    console.log('🏷️ Cart badge updated');
});

// Initialize add to cart buttons
function initializeCartButtons() {
    // Buy buttons
    const buyButtons = document.querySelectorAll('.btn-buy');
    buyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            handleAddToCart(this, 'buy');
        });
    });
    
    // Rent buttons
    const rentButtons = document.querySelectorAll('.btn-rent');
    rentButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            handleAddToCart(this, 'rent');
        });
    });
    
    // Service booking buttons
    const serviceButtons = document.querySelectorAll('.btn-book-service');
    serviceButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            handleServiceBooking(this);
        });
    });
}

// Handle add to cart action
function handleAddToCart(button, type) {
    const productCard = button.closest('.product-card');
    if (!productCard) return;
    
    const productId = productCard.getAttribute('data-product-id');
    const productName = productCard.querySelector('.product-name')?.textContent;
    const productImage = productCard.querySelector('.product-image img')?.src;
    
    let price;
    if (type === 'buy') {
        price = parseFloat(productCard.getAttribute('data-buy-price'));
    } else {
        price = parseFloat(productCard.getAttribute('data-rent-price'));
    }
    
    // Check if size selection is required
    const sizeSelector = productCard.querySelector('.size-selector');
    let selectedSize = null;
    
    if (sizeSelector) {
        selectedSize = sizeSelector.value;
        if (!selectedSize) {
            RinseoUtils.showNotification('Please select a size', 'warning');
            return;
        }
    }
    
    // Add loading state
    RinseoUtils.setLoadingState(button, true);
    
    // Simulate API call delay
    setTimeout(() => {
        const success = RinseoCart.addItem(productId, type, price, productName, productImage, selectedSize);
        
        RinseoUtils.setLoadingState(button, false);
        
        if (success) {
            // Add visual feedback
            button.style.background = 'var(--primary-green)';
            button.textContent = 'Added!';
            
            setTimeout(() => {
                button.style.background = '';
                button.textContent = type === 'buy' ? 'Buy' : 'Rent';
            }, 2000);
        }
    }, 500);
}

// Handle service booking
function handleServiceBooking(button) {
    const serviceCard = button.closest('.service-card, .pricing-row');
    if (!serviceCard) return;
    
    const serviceId = serviceCard.getAttribute('data-service-id');
    const serviceName = serviceCard.querySelector('.service-name')?.textContent;
    const servicePrice = parseFloat(serviceCard.getAttribute('data-price'));
    
    // Add loading state
    RinseoUtils.setLoadingState(button, true);
    
    setTimeout(() => {
        const success = RinseoCart.addItem(serviceId, 'service', servicePrice, serviceName, null);
        
        RinseoUtils.setLoadingState(button, false);
        
        if (success) {
            // Redirect to cart or show booking form
            if (confirm('Service added to cart. Would you like to view your cart?')) {
                window.location.href = 'pages/cart.html';
            }
        }
    }, 500);
}

// Render cart page
function renderCartPage() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const orderSummary = document.querySelector('.order-summary');
    const emptyCartContainer = document.querySelector('.empty-cart');
    const cartContent = document.querySelector('.cart-content');
    
    if (RinseoApp.cart.length === 0) {
        // Show empty cart state
        if (emptyCartContainer) emptyCartContainer.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }
    
    // Hide empty cart state and show cart content
    if (emptyCartContainer) emptyCartContainer.style.display = 'none';
    if (cartContent) cartContent.style.display = 'block';
    
    // Render cart items
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = RinseoApp.cart.map(item => createCartItemHTML(item)).join('');
        initializeCartItemControls();
    }
    
    // Render order summary
    if (orderSummary) {
        renderOrderSummary();
    }
}

// Create cart item HTML
function createCartItemHTML(item) {
    const typeLabel = item.type === 'buy' ? 'Purchase' : 
                     item.type === 'rent' ? 'Rental' : 'Service';
    
    const itemTotal = item.price * item.quantity;
    
    return `
        <div class="cart-item" data-product-id="${item.productId}" data-type="${item.type}" data-size="${item.selectedSize || ''}">
            ${item.image ? `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='../assets/images/products/placeholder.svg'">
                </div>
            ` : `
                <div class="cart-item-image">
                    <img src="../assets/images/products/placeholder.svg" alt="${item.name}">
                </div>
            `}
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-type">${typeLabel}${item.selectedSize ? ` - Size: ${item.selectedSize}` : ''}</div>
                <div class="cart-item-price">${RinseoUtils.formatCurrency(item.price)} each</div>
                ${item.quantity > 1 ? `<div class="cart-item-total">Total: ${RinseoUtils.formatCurrency(itemTotal)}</div>` : ''}
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn quantity-decrease" data-action="decrease" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" readonly>
                    <button class="quantity-btn quantity-increase" data-action="increase" ${item.quantity >= 10 ? 'disabled' : ''}>+</button>
                </div>
                <button class="remove-btn" data-action="remove" title="Remove item" aria-label="Remove ${item.name} from cart">🗑️</button>
            </div>
        </div>
    `;
}

// Initialize cart item controls
function initializeCartItemControls() {
    const cartItems = document.querySelectorAll('.cart-item');
    
    cartItems.forEach(item => {
        const productId = item.getAttribute('data-product-id');
        const type = item.getAttribute('data-type');
        const size = item.getAttribute('data-size') || null;
        
        const decreaseBtn = item.querySelector('.quantity-decrease');
        const increaseBtn = item.querySelector('.quantity-increase');
        const removeBtn = item.querySelector('.remove-btn');
        const quantityInput = item.querySelector('.quantity-input');
        
        // Decrease quantity
        decreaseBtn.addEventListener('click', function() {
            const currentQuantity = parseInt(quantityInput.value);
            if (currentQuantity > 1) {
                // Add loading state
                this.disabled = true;
                this.textContent = '...';
                
                setTimeout(() => {
                    RinseoCart.updateQuantity(productId, type, currentQuantity - 1, size);
                    renderCartPage();
                }, 200);
            }
        });
        
        // Increase quantity
        increaseBtn.addEventListener('click', function() {
            const currentQuantity = parseInt(quantityInput.value);
            if (currentQuantity < 10) {
                // Add loading state
                this.disabled = true;
                this.textContent = '...';
                
                setTimeout(() => {
                    RinseoCart.updateQuantity(productId, type, currentQuantity + 1, size);
                    renderCartPage();
                }, 200);
            }
        });
        
        // Remove item with confirmation
        removeBtn.addEventListener('click', function() {
            const itemName = item.querySelector('.cart-item-name').textContent;
            if (confirm(`Are you sure you want to remove "${itemName}" from your cart?`)) {
                // Add visual feedback before removal
                item.style.opacity = '0.5';
                item.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    RinseoCart.removeItem(productId, type, size);
                    renderCartPage();
                }, 200);
            }
        });
    });
}

// Render order summary
function renderOrderSummary() {
    const orderSummary = document.querySelector('.order-summary');
    if (!orderSummary) return;
    
    const subtotal = RinseoCart.getTotal();
    const deliveryFee = RinseoCart.getDeliveryFee();
    const total = RinseoCart.getFinalTotal();
    const itemCount = RinseoCart.getItemCount();
    
    orderSummary.innerHTML = `
        <h3>Order Summary</h3>
        <div class="summary-info">
            <div class="summary-item-count">${itemCount} item${itemCount !== 1 ? 's' : ''} in cart</div>
        </div>
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>${RinseoUtils.formatCurrency(subtotal)}</span>
        </div>
        <div class="summary-row">
            <span>Delivery:</span>
            <span>${deliveryFee === 0 ? 'Free' : RinseoUtils.formatCurrency(deliveryFee)}</span>
        </div>
        ${deliveryFee === 0 ? '<div class="free-delivery-note">🎉 Free delivery on orders above ₹500!</div>' : 
          subtotal >= 400 ? '<div class="almost-free-delivery">Add ₹' + (500 - subtotal) + ' more for free delivery!</div>' : ''}
        <div class="summary-row total">
            <span><strong>Total:</strong></span>
            <span><strong>${RinseoUtils.formatCurrency(total)}</strong></span>
        </div>
        <button class="btn btn-primary btn-large checkout-btn" style="width: 100%; margin-top: 1.5rem;">
            Proceed to Checkout
        </button>
        <div class="secure-checkout">
            <span>🔒 Secure checkout</span>
        </div>
    `;
    
    // Initialize checkout button
    const checkoutBtn = orderSummary.querySelector('.checkout-btn');
    checkoutBtn.addEventListener('click', function() {
        handleCheckout();
    });
}

// Handle checkout process
function handleCheckout() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    if (!RinseoApp.isAuthenticated) {
        RinseoUtils.showNotification('Please login to proceed with checkout', 'warning');
        
        // Show login prompt with better UX
        const confirmLogin = confirm('You need to login to proceed with checkout. Would you like to go to the login page now?');
        if (confirmLogin) {
            window.location.href = 'auth.html';
        }
        return;
    }
    
    if (RinseoApp.cart.length === 0) {
        RinseoUtils.showNotification('Your cart is empty', 'warning');
        return;
    }
    
    // Add loading state to checkout button
    RinseoUtils.setLoadingState(checkoutBtn, true);
    
    // Simulate checkout process with order summary
    const orderSummary = {
        items: RinseoApp.cart.length,
        subtotal: RinseoCart.getTotal(),
        delivery: RinseoCart.getDeliveryFee(),
        total: RinseoCart.getFinalTotal(),
        orderNumber: 'RIN' + Date.now().toString().slice(-6)
    };
    
    RinseoUtils.showNotification('Processing your order...', 'info');
    
    // Simulate API call delay
    setTimeout(() => {
        RinseoUtils.setLoadingState(checkoutBtn, false);
        
        // Show order confirmation
        const confirmationMessage = `
            Order Confirmation
            
            Order #: ${orderSummary.orderNumber}
            Items: ${orderSummary.items}
            Total: ${RinseoUtils.formatCurrency(orderSummary.total)}
            
            Thank you for choosing Rinseo! 
            You will receive a confirmation email shortly.
            
            In a real application, this would redirect to a payment gateway.
        `;
        
        alert(confirmationMessage);
        
        // Clear cart after successful checkout simulation
        RinseoCart.clearCart();
        renderCartPage();
        
    }, 2000);
}

// Add styles for cart-specific elements
const cartStyles = document.createElement('style');
cartStyles.textContent = `
    .free-delivery-note {
        background: var(--background-soft);
        color: var(--primary-green);
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        text-align: center;
        margin: 0.5rem 0;
        font-weight: 500;
    }
    
    .cart-item {
        transition: all 0.2s ease;
    }
    
    .cart-item:hover {
        background: var(--background-soft);
    }
    
    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .quantity-btn {
        width: 32px;
        height: 32px;
        border: 1px solid var(--border-light);
        background: var(--background-white);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .quantity-btn:hover {
        border-color: var(--primary-green);
        color: var(--primary-green);
    }
    
    .quantity-input {
        width: 60px;
        text-align: center;
        border: 1px solid var(--border-light);
        border-radius: 4px;
        padding: 0.25rem;
        font-weight: 500;
    }
`;
document.head.appendChild(cartStyles);