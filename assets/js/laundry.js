// ===== RINSEO LAUNDRY SERVICE FUNCTIONALITY =====

// Initialize laundry page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('laundry.html')) {
        initializeLaundryPage();
    }
});

function initializeLaundryPage() {
    initializeCalendar();
    initializeServiceSelection();
    initializeBookingForm();
}

// Calendar functionality
let currentDate = new Date();
let selectedDate = null;

function initializeCalendar() {
    renderCalendar();
    
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
}

function renderCalendar() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthElement = document.querySelector('.calendar-month');
    const daysContainer = document.getElementById('calendarDays');
    
    if (!monthElement || !daysContainer) return;
    
    // Update month display
    monthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Clear previous days
    daysContainer.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate calendar days
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = date.getDate();
        
        // Add classes for styling
        if (date.getMonth() !== currentDate.getMonth()) {
            dayElement.classList.add('other-month');
        }
        
        if (date < new Date().setHours(0, 0, 0, 0)) {
            dayElement.classList.add('disabled');
        } else {
            dayElement.addEventListener('click', function() {
                selectDate(date, dayElement);
            });
        }
        
        // Check if this date is selected
        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        daysContainer.appendChild(dayElement);
    }
}

function selectDate(date, element) {
    // Remove previous selection
    const previousSelected = document.querySelector('.calendar-day.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    
    // Add selection to clicked date
    element.classList.add('selected');
    selectedDate = new Date(date);
    
    console.log('Selected date:', selectedDate.toDateString());
}

// Service selection functionality
function initializeServiceSelection() {
    const serviceRadios = document.querySelectorAll('input[name="serviceType"]');
    
    serviceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updatePricingDisplay(this.value);
        });
    });
    
    // Initialize with default selection
    const checkedRadio = document.querySelector('input[name="serviceType"]:checked');
    if (checkedRadio) {
        updatePricingDisplay(checkedRadio.value);
    }
}

function updatePricingDisplay(serviceType) {
    // This could be used to highlight relevant pricing columns
    const table = document.querySelector('.pricing-table');
    if (!table) return;
    
    const headers = table.querySelectorAll('th');
    const cells = table.querySelectorAll('td');
    
    // Reset all highlighting
    headers.forEach(header => header.classList.remove('highlighted'));
    cells.forEach(cell => cell.classList.remove('highlighted'));
    
    // Highlight relevant column
    if (serviceType === 'wash') {
        // Highlight "Wash Only" column (index 1)
        if (headers[1]) headers[1].classList.add('highlighted');
        table.querySelectorAll('tr').forEach(row => {
            const cell = row.cells[1];
            if (cell) cell.classList.add('highlighted');
        });
    } else if (serviceType === 'wash-iron') {
        // Highlight "Wash + Iron" column (index 2)
        if (headers[2]) headers[2].classList.add('highlighted');
        table.querySelectorAll('tr').forEach(row => {
            const cell = row.cells[2];
            if (cell) cell.classList.add('highlighted');
        });
    }
}

// Booking form functionality
function initializeBookingForm() {
    const confirmBtn = document.querySelector('.confirm-booking-btn');
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleBookingSubmission);
    }
    
    // Phone number formatting
    const phoneInput = document.getElementById('phoneNumber');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    
    e.target.value = value;
}

function handleBookingSubmission() {
    const serviceType = document.querySelector('input[name="serviceType"]:checked')?.value;
    const pickupTime = document.getElementById('pickupTime')?.value;
    const pickupAddress = document.getElementById('pickupAddress')?.value;
    const phoneNumber = document.getElementById('phoneNumber')?.value;
    const specialInstructions = document.getElementById('specialInstructions')?.value;
    
    // Validation
    const errors = [];
    
    if (!serviceType) {
        errors.push('Please select a service type');
    }
    
    if (!selectedDate) {
        errors.push('Please select a pickup date');
    }
    
    if (!pickupTime) {
        errors.push('Please select a pickup time');
    }
    
    if (!pickupAddress || pickupAddress.trim().length < 10) {
        errors.push('Please enter a complete pickup address');
    }
    
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
        errors.push('Please enter a valid phone number');
    }
    
    if (errors.length > 0) {
        RinseoUtils.showNotification(errors[0], 'error');
        return;
    }
    
    // Create booking object
    const booking = {
        serviceType: serviceType,
        pickupDate: selectedDate.toDateString(),
        pickupTime: pickupTime,
        pickupAddress: pickupAddress.trim(),
        phoneNumber: phoneNumber,
        specialInstructions: specialInstructions.trim(),
        timestamp: new Date().toISOString()
    };
    
    // Show loading state
    const confirmBtn = document.querySelector('.confirm-booking-btn');
    RinseoUtils.setLoadingState(confirmBtn, true);
    
    // Simulate booking submission
    setTimeout(() => {
        RinseoUtils.setLoadingState(confirmBtn, false);
        
        // Save booking to localStorage (in real app, this would go to server)
        const bookings = JSON.parse(localStorage.getItem('rinseo_bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('rinseo_bookings', JSON.stringify(bookings));
        
        // Show success message
        RinseoUtils.showNotification('Booking confirmed! We will contact you shortly.', 'success');
        
        // Redirect to confirmation or reset form
        setTimeout(() => {
            if (confirm('Booking confirmed! Would you like to add this service to your cart for payment?')) {
                addBookingToCart(booking);
            }
        }, 2000);
        
    }, 1500);
}

function addBookingToCart(booking) {
    // Add booking as a service item to cart
    const serviceId = `laundry-${Date.now()}`;
    const serviceName = `Laundry Service - ${booking.serviceType === 'wash' ? 'Wash Only' : 'Wash + Iron'}`;
    const basePrice = booking.serviceType === 'wash' ? 150 : 250; // Base price for service
    
    const success = RinseoCart.addItem(
        serviceId,
        'service',
        basePrice,
        serviceName,
        null
    );
    
    if (success) {
        setTimeout(() => {
            if (confirm('Service added to cart! Would you like to view your cart?')) {
                window.location.href = 'cart.html';
            }
        }, 1000);
    }
}

// Add CSS for highlighted pricing
const laundryStyles = document.createElement('style');
laundryStyles.textContent = `
    .pricing-table th.highlighted,
    .pricing-table td.highlighted {
        background-color: var(--background-soft) !important;
        border-left: 3px solid var(--primary-green);
        border-right: 3px solid var(--primary-green);
    }
    
    .pricing-table th.highlighted {
        color: var(--primary-green) !important;
        font-weight: 700;
    }
`;
document.head.appendChild(laundryStyles);