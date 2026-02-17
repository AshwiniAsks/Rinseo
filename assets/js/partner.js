// Partner Application Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const partnerForm = document.getElementById('partnerForm');
    
    // Form validation
    function validateForm(formData) {
        const errors = [];
        
        // Check required fields
        if (!formData.get('fullName') || formData.get('fullName').trim().length < 2) {
            errors.push('Please enter a valid full name');
        }
        
        if (!formData.get('phoneNumber') || formData.get('phoneNumber').trim().length < 10) {
            errors.push('Please enter a valid phone number');
        }
        
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!formData.get('cityLocation') || formData.get('cityLocation').trim().length < 2) {
            errors.push('Please enter your city/location');
        }
        
        if (!formData.get('motivation') || formData.get('motivation').trim().length < 10) {
            errors.push('Please share your motivation for partnering with Rinseo');
        }
        
        return errors;
    }
    
    // Show error messages
    function showErrors(errors) {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        if (errors.length > 0) {
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-container';
            errorContainer.innerHTML = `
                <div class="error-message">
                    <h4>Please fix the following errors:</h4>
                    <ul>
                        ${errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            partnerForm.insertBefore(errorContainer, partnerForm.firstChild);
            
            // Scroll to top of form
            errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Show success message
    function showSuccess() {
        // Hide the form
        partnerForm.style.display = 'none';
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-content">
                <h3>🎉 Thank you for your application!</h3>
                <p>We've received your partner application and will review it within 5-7 business days. Our team will contact you with next steps.</p>
            </div>
        `;
        
        partnerForm.parentNode.insertBefore(successMessage, partnerForm);
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Handle form submission
    partnerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(partnerForm);
        const errors = validateForm(formData);
        
        if (errors.length > 0) {
            showErrors(errors);
            return;
        }
        
        // Remove any existing error messages
        const existingErrors = document.querySelectorAll('.error-container');
        existingErrors.forEach(error => error.remove());
        
        // Simulate form submission
        const submitBtn = partnerForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            console.log('Partner application submitted:', Object.fromEntries(formData));
            showSuccess();
        }, 1500);
    });
    
    // Add real-time validation for email
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Remove existing email error
        const existingError = this.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        if (email && !emailRegex.test(email)) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'field-error';
            errorMsg.textContent = 'Please enter a valid email address';
            this.parentNode.appendChild(errorMsg);
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '';
        }
    });
    
    // Add real-time validation for phone number
    const phoneInput = document.getElementById('phoneNumber');
    phoneInput.addEventListener('input', function() {
        // Remove non-numeric characters except +, -, (, ), and spaces
        let value = this.value.replace(/[^\d+\-\(\)\s]/g, '');
        this.value = value;
    });
    
    phoneInput.addEventListener('blur', function() {
        const phone = this.value.trim();
        
        // Remove existing phone error
        const existingError = this.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        if (phone && phone.length < 10) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'field-error';
            errorMsg.textContent = 'Please enter a valid phone number';
            this.parentNode.appendChild(errorMsg);
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '';
        }
    });
});