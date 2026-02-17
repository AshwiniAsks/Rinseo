// ===== RINSEO REUSABLE COMPONENTS =====

// Component initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeComponents();
});

function initializeComponents() {
    initializeTabs();
    initializeModals();
    initializeRadioGroups();
    initializeSearchComponents();
}

// Tab Component
function initializeTabs() {
    const tabContainers = document.querySelectorAll('.tabs');
    
    tabContainers.forEach(container => {
        const tabLinks = container.querySelectorAll('.tab-link');
        const tabContents = container.parentElement.querySelectorAll('.tab-content');
        
        tabLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                
                // Remove active class from all tabs and contents
                tabLinks.forEach(l => l.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                this.classList.add('active');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    });
}

// Modal Component
function initializeModals() {
    // Modal trigger buttons
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modalCloses = document.querySelectorAll('.modal-close, .modal-overlay');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });
    
    modalCloses.forEach(close => {
        close.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input in modal
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal() {
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Radio Group Component
function initializeRadioGroups() {
    const radioGroups = document.querySelectorAll('.radio-group');
    
    radioGroups.forEach(group => {
        const radioItems = group.querySelectorAll('.radio-item');
        
        radioItems.forEach(item => {
            item.addEventListener('click', function() {
                const input = this.querySelector('.radio-input');
                const groupName = input.getAttribute('name');
                
                // Clear all radio inputs in the same group
                const allInputsInGroup = group.querySelectorAll(`input[name="${groupName}"]`);
                allInputsInGroup.forEach(inp => {
                    inp.checked = false;
                    inp.parentElement.classList.remove('selected');
                });
                
                // Select clicked radio
                input.checked = true;
                this.classList.add('selected');
                
                // Trigger change event
                input.dispatchEvent(new Event('change'));
            });
        });
    });
}

// Search Component
function initializeSearchComponents() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        const searchHandler = RinseoUtils.debounce(function(e) {
            const query = e.target.value.toLowerCase().trim();
            handleSearch(query, input);
        }, 300);
        
        input.addEventListener('input', searchHandler);
    });
}

function handleSearch(query, inputElement) {
    // Get search target from data attribute
    const searchTarget = inputElement.getAttribute('data-search-target');
    
    if (searchTarget === 'products') {
        filterProducts(query);
    } else if (searchTarget === 'services') {
        filterServices(query);
    }
}

function filterProducts(query) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
        const productCategory = card.getAttribute('data-category')?.toLowerCase() || '';
        
        const matches = productName.includes(query) || 
                       productCategory.includes(query) || 
                       query === '';
        
        card.style.display = matches ? 'block' : 'none';
    });
    
    // Update results count
    updateSearchResults(query, 'products');
}

function filterServices(query) {
    const serviceItems = document.querySelectorAll('.service-item');
    
    serviceItems.forEach(item => {
        const serviceName = item.querySelector('.service-name')?.textContent.toLowerCase() || '';
        const serviceDescription = item.querySelector('.service-description')?.textContent.toLowerCase() || '';
        
        const matches = serviceName.includes(query) || 
                       serviceDescription.includes(query) || 
                       query === '';
        
        item.style.display = matches ? 'block' : 'none';
    });
    
    updateSearchResults(query, 'services');
}

function updateSearchResults(query, type) {
    const resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) return;
    
    const visibleItems = document.querySelectorAll(
        type === 'products' ? '.product-card:not([style*="display: none"])' : 
        '.service-item:not([style*="display: none"])'
    );
    
    const count = visibleItems.length;
    const itemType = type === 'products' ? 'product' : 'service';
    
    if (query) {
        resultsContainer.textContent = `${count} ${itemType}${count !== 1 ? 's' : ''} found for "${query}"`;
    } else {
        resultsContainer.textContent = `Showing all ${count} ${itemType}${count !== 1 ? 's' : ''}`;
    }
}

// Filter Component (for product categories)
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            filterProductsByCategory(category);
        });
    });
}

function filterProductsByCategory(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productCategory = card.getAttribute('data-category');
        
        if (category === 'all' || productCategory === category) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update results count
    const visibleProducts = document.querySelectorAll('.product-card:not([style*="display: none"])');
    const resultsContainer = document.querySelector('.search-results');
    if (resultsContainer) {
        const categoryName = category === 'all' ? 'All Categories' : 
                           category.charAt(0).toUpperCase() + category.slice(1);
        resultsContainer.textContent = `${visibleProducts.length} products in ${categoryName}`;
    }
}

// Quantity Control Component
function createQuantityControl(initialValue = 1, minValue = 1, maxValue = 10) {
    const container = document.createElement('div');
    container.className = 'quantity-controls';
    
    container.innerHTML = `
        <button type="button" class="quantity-btn quantity-decrease">-</button>
        <input type="number" class="quantity-input" value="${initialValue}" min="${minValue}" max="${maxValue}" readonly>
        <button type="button" class="quantity-btn quantity-increase">+</button>
    `;
    
    const decreaseBtn = container.querySelector('.quantity-decrease');
    const increaseBtn = container.querySelector('.quantity-increase');
    const input = container.querySelector('.quantity-input');
    
    decreaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(input.value);
        if (currentValue > minValue) {
            input.value = currentValue - 1;
            input.dispatchEvent(new Event('change'));
        }
    });
    
    increaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(input.value);
        if (currentValue < maxValue) {
            input.value = currentValue + 1;
            input.dispatchEvent(new Event('change'));
        }
    });
    
    return container;
}

// Loading Spinner Component
function createLoadingSpinner(size = 'medium') {
    const spinner = document.createElement('div');
    spinner.className = `spinner spinner-${size}`;
    
    const sizeMap = {
        small: '16px',
        medium: '24px',
        large: '32px'
    };
    
    spinner.style.cssText = `
        width: ${sizeMap[size]};
        height: ${sizeMap[size]};
        border: 2px solid var(--border-light);
        border-top: 2px solid var(--primary-green);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
    `;
    
    return spinner;
}

// Notification Component
function createNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: 'var(--primary-green)',
        error: '#dc3545',
        warning: '#ffc107',
        info: 'var(--navy-dark)'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close notification">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--shadow-light);
        z-index: 3000;
        max-width: 350px;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
    `;
    
    // Close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            removeNotification(notification);
        }, duration);
    }
    
    return notification;
}

function removeNotification(notification) {
    if (notification && notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
}

// Tooltip Component
function createTooltip(element, text, position = 'top') {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    
    tooltip.style.cssText = `
        position: absolute;
        background: var(--navy-dark);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        font-size: 0.875rem;
        white-space: nowrap;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
    `;
    
    element.style.position = 'relative';
    element.appendChild(tooltip);
    
    element.addEventListener('mouseenter', function() {
        tooltip.style.opacity = '1';
        positionTooltip(tooltip, position);
    });
    
    element.addEventListener('mouseleave', function() {
        tooltip.style.opacity = '0';
    });
    
    return tooltip;
}

function positionTooltip(tooltip, position) {
    const rect = tooltip.parentElement.getBoundingClientRect();
    
    switch (position) {
        case 'top':
            tooltip.style.bottom = '100%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.marginBottom = '5px';
            break;
        case 'bottom':
            tooltip.style.top = '100%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.marginTop = '5px';
            break;
        case 'left':
            tooltip.style.right = '100%';
            tooltip.style.top = '50%';
            tooltip.style.transform = 'translateY(-50%)';
            tooltip.style.marginRight = '5px';
            break;
        case 'right':
            tooltip.style.left = '100%';
            tooltip.style.top = '50%';
            tooltip.style.transform = 'translateY(-50%)';
            tooltip.style.marginLeft = '5px';
            break;
    }
}

// Export component functions
window.RinseoComponents = {
    openModal,
    closeModal,
    createQuantityControl,
    createLoadingSpinner,
    createNotification,
    removeNotification,
    createTooltip,
    filterProductsByCategory,
    initializeFilters
};