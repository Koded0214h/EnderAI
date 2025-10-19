// src/content/validator.js
class FormValidator {
    constructor() {
        this.validationRules = {
            email: this.validateEmail.bind(this),
            phone: this.validatePhone.bind(this),
            date: this.validateDate.bind(this),
            url: this.validateUrl.bind(this),
            required: this.validateRequired.bind(this)
        };
    }

    validateField(field, value) {
        const validations = [];
        
        // Check required fields
        if (field.required || field.hasAttribute('required')) {
            validations.push(this.validationRules.required(value));
        }
        
        // Check type-specific validations
        if (field.type === 'email') {
            validations.push(this.validationRules.email(value));
        } else if (field.type === 'tel') {
            validations.push(this.validationRules.phone(value));
        } else if (field.type === 'url') {
            validations.push(this.validationRules.url(value));
        } else if (field.type === 'date') {
            validations.push(this.validationRules.date(value));
        }
        
        // Check custom patterns
        if (field.pattern) {
            validations.push(this.validatePattern(value, field.pattern));
        }
        
        // Check max length
        if (field.maxLength && value.length > field.maxLength) {
            validations.push({
                isValid: false,
                message: `Value exceeds maximum length of ${field.maxLength} characters`
            });
        }
        
        return validations.filter(validation => !validation.isValid);
    }

    validateEmail(email) {
        if (!email) return { isValid: true };
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        return {
            isValid,
            message: isValid ? '' : 'Please enter a valid email address'
        };
    }

    validatePhone(phone) {
        if (!phone) return { isValid: true };
        
        // Basic phone validation - allows various formats
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        const isValid = phoneRegex.test(cleanPhone);
        
        return {
            isValid,
            message: isValid ? '' : 'Please enter a valid phone number'
        };
    }

    validateDate(date) {
        if (!date) return { isValid: true };
        
        const dateObj = new Date(date);
        const isValid = !isNaN(dateObj.getTime());
        
        return {
            isValid,
            message: isValid ? '' : 'Please enter a valid date'
        };
    }

    validateUrl(url) {
        if (!url) return { isValid: true };
        
        try {
            new URL(url);
            return { isValid: true };
        } catch {
            return {
                isValid: false,
                message: 'Please enter a valid URL'
            };
        }
    }

    validateRequired(value) {
        const isValid = value != null && value.toString().trim().length > 0;
        
        return {
            isValid,
            message: isValid ? '' : 'This field is required'
        };
    }

    validatePattern(value, pattern) {
        if (!value) return { isValid: true };
        
        const regex = new RegExp(pattern);
        const isValid = regex.test(value);
        
        return {
            isValid,
            message: isValid ? '' : 'Value does not match required format'
        };
    }

    checkFormConsistency(formData) {
        const inconsistencies = [];
        
        // Check date consistency
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            
            if (end < start) {
                inconsistencies.push('End date cannot be before start date');
            }
        }
        
        // Check age consistency if date of birth provided
        if (formData.dateOfBirth && formData.age) {
            const calculatedAge = this.calculateAge(formData.dateOfBirth);
            if (Math.abs(calculatedAge - parseInt(formData.age)) > 1) {
                inconsistencies.push('Provided age does not match date of birth');
            }
        }
        
        return inconsistencies;
    }

    calculateAge(dateOfBirth) {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    showValidationErrors(field, errors) {
        // Remove existing error messages
        this.removeValidationErrors(field);
        
        if (errors.length === 0) return;
        
        // Create error container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'aether-validation-errors';
        errorContainer.style.cssText = `
            color: #DC2626;
            font-size: 12px;
            margin-top: 4px;
            padding: 4px 8px;
            background: #FEF2F2;
            border: 1px solid #FECACA;
            border-radius: 4px;
        `;
        
        errors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.textContent = error.message;
            errorContainer.appendChild(errorElement);
        });
        
        // Add error styling to field
        field.style.borderColor = '#DC2626';
        field.style.backgroundColor = '#FEF2F2';
        
        // Insert error message after field
        field.parentNode.insertBefore(errorContainer, field.nextSibling);
        
        // Remove errors on input
        const cleanup = () => {
            field.style.borderColor = '';
            field.style.backgroundColor = '';
            this.removeValidationErrors(field);
            field.removeEventListener('input', cleanup);
        };
        
        field.addEventListener('input', cleanup);
    }

    removeValidationErrors(field) {
        const existingErrors = field.parentNode.querySelector('.aether-validation-errors');
        if (existingErrors) {
            existingErrors.remove();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = FormValidator;
}