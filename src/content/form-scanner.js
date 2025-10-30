// src/content/form-scanner.js

// FieldDetector Class
class FieldDetector {
    constructor() {
        this.fieldPatterns = {
            personal: {
                fullName: ['name', 'fullname', 'full name', 'nombre completo', 'nom complet'],
                email: ['email', 'e-mail', 'mail', 'correo', 'courriel'],
                phone: ['phone', 'telephone', 'mobile', 'cell', 'teléfono'],
                address: ['address', 'street', 'city', 'state', 'zip', 'postal', 'dirección'],
                dateOfBirth: ['dob', 'birth', 'date of birth', 'fecha de nacimiento']
            },
            professional: {
                company: ['company', 'employer', 'organization', 'empresa'],
                title: ['title', 'position', 'job title', 'puesto'],
                experience: ['experience', 'years exp', 'work history', 'experiencia'],
                education: ['education', 'degree', 'university', 'college', 'educación'],
                skills: ['skills', 'competencies', 'abilities', 'habilidades']
            }
        };
    }

    // Update the detectFieldType method in your FieldDetector class
    detectFieldType(fieldContext, fieldElement) {
        const context = fieldContext.toLowerCase();
        const elementType = fieldElement?.type || '';
        const elementName = fieldElement?.name || '';
        const elementId = fieldElement?.id || '';
        
        console.log('Field detection context:', { context, elementType, elementName, elementId });

        // First, check by input type
        if (elementType === 'email') return { category: 'personal', fieldType: 'email', confidence: 'high' };
        if (elementType === 'tel') return { category: 'personal', fieldType: 'phone', confidence: 'high' };

        // Then check by context patterns
        for (const [category, fields] of Object.entries(this.fieldPatterns)) {
            for (const [fieldType, patterns] of Object.entries(fields)) {
                if (patterns.some(pattern => context.includes(pattern))) {
                    return { category, fieldType, confidence: 'high' };
                }
            }
        }

        // Check by field name and ID
        const fieldIdentifiers = elementName + ' ' + elementId;
        const lowerIdentifiers = fieldIdentifiers.toLowerCase();
        
        if (lowerIdentifiers.includes('email') || lowerIdentifiers.includes('mail')) {
            return { category: 'personal', fieldType: 'email', confidence: 'medium' };
        }
        if (lowerIdentifiers.includes('phone') || lowerIdentifiers.includes('tel')) {
            return { category: 'personal', fieldType: 'phone', confidence: 'medium' };
        }
        if (lowerIdentifiers.includes('title') || lowerIdentifiers.includes('position')) {
            return { category: 'professional', fieldType: 'title', confidence: 'medium' };
        }
        if (lowerIdentifiers.includes('experience') || lowerIdentifiers.includes('year')) {
            return { category: 'professional', fieldType: 'experience', confidence: 'medium' };
        }
        if (lowerIdentifiers.includes('skill')) {
            return { category: 'professional', fieldType: 'skills', confidence: 'medium' };
        }

        return this.detectAmbiguousField(context);
    }

    detectAmbiguousField(context) {
        // Simple heuristic fallback
        if (context.includes('essay') || context.includes('statement') || context.includes('describe')) {
            return { category: 'narrative', fieldType: 'personalStatement', confidence: 'medium' };
        }
        
        if (context.includes('why') || context.includes('purpose') || context.includes('reason')) {
            return { category: 'narrative', fieldType: 'motivation', confidence: 'medium' };
        }

        return { category: 'other', fieldType: 'unknown', confidence: 'low' };
    }

    getFieldContext(element) {
        // Get comprehensive context around the field
        const context = [];
        
        // Label text
        const label = this.findFieldLabel(element);
        if (label) context.push(label);
        
        // Placeholder
        if (element.placeholder) context.push(element.placeholder);
        
        // Parent element text
        const parentText = element.closest('div, p, li, td')?.textContent || '';
        if (parentText) context.push(parentText.substring(0, 200));
        
        // Previous sibling text (often contains instructions)
        let prevSibling = element.previousElementSibling;
        for (let i = 0; i < 3 && prevSibling; i++) {
            if (prevSibling.textContent) {
                context.push(prevSibling.textContent);
            }
            prevSibling = prevSibling.previousElementSibling;
        }
        
        return context.join(' ').trim();
    }

    findFieldLabel(element) {
        // Try multiple methods to find the label
        if (element.labels && element.labels.length > 0) {
            return Array.from(element.labels).map(label => label.textContent).join(' ');
        }
        
        if (element.id) {
            const labelFor = document.querySelector(`label[for="${element.id}"]`);
            if (labelFor) return labelFor.textContent;
        }
        
        // Look for label wrapping the input
        const parentLabel = element.closest('label');
        if (parentLabel) return parentLabel.textContent;
        
        // Look for preceding text that might be a label
        let prev = element.previousElementSibling;
        while (prev) {
            if (prev.textContent && prev.textContent.trim().length > 0) {
                return prev.textContent;
            }
            prev = prev.previousElementSibling;
        }
        
        return '';
    }
}

// FormValidator Class
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

    // In FormValidator class, update validateField method
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
        
        // Check max length (only if maxLength is defined and positive)
        if (field.maxLength && field.maxLength > 0 && value.length > field.maxLength) {
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
        
        return inconsistencies;
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

// FormScanner Class (Your existing code)
class FormScanner {
    constructor() {
        this.vaultData = null;
        this.isScanning = false;
        this.scanningEnabled = false;
        this.fieldDetector = new FieldDetector();
        this.validator = new FormValidator();
        this.init();
    }

    async init() {
        await this.loadVaultData();
        await this.loadScanningState();
        this.startObserving();
        if (this.scanningEnabled) {
            this.scanExistingForms();
        }
        console.log('AetherForm Assistant: Form scanner initialized');
    }

    async loadScanningState() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['enderAIScanEnabled'], (result) => {
                this.scanningEnabled = result.enderAIScanEnabled || false;
                resolve();
            });
        });
    }

    async loadVaultData() {
        try {
            this.vaultData = await this.sendMessage('GET_VAULT_DATA');
            console.log('AetherForm Assistant: Vault data loaded', this.vaultData);
        } catch (error) {
            console.error('AetherForm Assistant: Failed to load vault data', error);
        }
    }

    startObserving() {
        const observer = new MutationObserver((mutations) => {
            if (!this.scanningEnabled) return;

            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (node.tagName === 'FORM' || node.querySelector('form')) {
                            this.scanForm(node.tagName === 'FORM' ? node : node.querySelector('form'));
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Listen for toggle messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'TOGGLE_SCANNING') {
                this.scanningEnabled = request.enabled;
                if (this.scanningEnabled) {
                    this.scanExistingForms();
                }
            }
        });
    }

    scanExistingForms() {
        const forms = document.querySelectorAll('form');
        console.log(`AetherForm Assistant: Found ${forms.length} forms on page`);
        forms.forEach(form => this.scanForm(form));
    }

    async scanForm(form) {
        if (this.isScanning) return;
        this.isScanning = true;

        try {
            const fields = this.extractFormFields(form);
            console.log(`AetherForm Assistant: Processing ${fields.length} fields in form`, form);
            
            for (const field of fields) {
                await this.processField(field);
            }

            this.addValidationUI(form);
            this.addAetherAssistantUI(form);
            
        } catch (error) {
            console.error('AetherForm Assistant: Error scanning form', error);
        } finally {
            this.isScanning = false;
        }
    }

    extractFormFields(form) {
        const fields = [];
        const inputElements = form.querySelectorAll('input, textarea, select');
        
        inputElements.forEach(element => {
            const context = this.fieldDetector.getFieldContext(element);
            const detection = this.fieldDetector.detectFieldType(context);
            
            const field = {
                element: element,
                type: element.type,
                tagName: element.tagName,
                name: element.name,
                id: element.id,
                label: this.fieldDetector.findFieldLabel(element),
                placeholder: element.placeholder,
                context: context,
                detection: detection,
                required: element.required || element.hasAttribute('required')
            };
            
            fields.push(field);
        });

        return fields;
    }

    // In the processField method, pass the field element to getValueFromVault
    async processField(field) {
        // Skip if already filled by user
        if (field.element.value && field.element.value.trim() !== '') {
            return;
        }

        console.log('AetherForm Assistant: Processing field', field);

        // Try to fill field based on detection - PASS THE FIELD ELEMENT
        const value = this.getValueFromVault(field.detection, field.element);
        if (value) {
            this.fillField(field, value);
        }

        // Add special handlers for narrative fields
        if ((field.detection.fieldType === 'personalStatement' ||
             field.detection.fieldType === 'motivation' ||
             field.detection.fieldType === 'careerGoals' ||
             field.detection.fieldType === 'programInterest') &&
            field.tagName === 'TEXTAREA') {
            this.addNarrativeAssistant(field.element, field.context);
        }

        // Add real-time validation
        this.addFieldValidation(field.element);
    }

    // Update the getValueFromVault method in FormScanner class
    getValueFromVault(detection, fieldElement) {
        if (!this.vaultData) return null;

        console.log('Getting value for field type:', detection.fieldType, 'from vault:', this.vaultData);

        const vaultMap = {
            'fullName': this.vaultData.personal?.fullName,
            'email': this.vaultData.personal?.email,
            'phone': this.vaultData.personal?.phone,
            'company': this.vaultData.professional?.company,
            'title': this.vaultData.professional?.currentTitle,
            'experience': this.vaultData.professional?.yearsExperience?.toString(),
            'education': this.vaultData.professional?.education?.[0]?.degree,
            'skills': this.vaultData.professional?.skills?.join(', ')
        };

        let fieldType = detection.fieldType;

        // Force override based on actual input type
        if (fieldElement.type === 'email') {
            fieldType = 'email';
        } else if (fieldElement.type === 'tel') {
            fieldType = 'phone';
        }

        const value = vaultMap[fieldType];
        console.log(`Field type: ${fieldType}, Value from vault: ${value}`);
        
        return value;
    }

    fillField(field, value) {
        field.element.value = value;
        field.element.dispatchEvent(new Event('input', { bubbles: true }));
        field.element.dispatchEvent(new Event('change', { bubbles: true }));
        
        this.highlightField(field.element, 'filled');
        console.log(`AetherForm Assistant: Filled ${field.detection.fieldType} with "${value}"`);
    }

    addNarrativeAssistant(textarea, context) {
        // Check if assistant already exists
        if (textarea.parentNode.querySelector('.ender-ai-narrative-assistant')) {
            return;
        }

        const assistantBtn = document.createElement('button');
        assistantBtn.textContent = '🪄 Generate with Gemini';
        assistantBtn.className = 'ender-ai-narrative-assistant';
        assistantBtn.style.cssText = `
            position: absolute;
            right: 8px;
            top: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            cursor: pointer;
            z-index: 1000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        // Hover effects
        assistantBtn.onmouseenter = () => {
            assistantBtn.style.background = 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)';
            assistantBtn.style.transform = 'translateY(-2px)';
            assistantBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        };
        assistantBtn.onmouseleave = () => {
            assistantBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            assistantBtn.style.transform = 'translateY(0)';
            assistantBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        };

        assistantBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            assistantBtn.textContent = '✨ Generating...';
            assistantBtn.disabled = true;
            assistantBtn.style.opacity = '0.7';

            try {
                const narrative = await this.generateNarrativeForField(textarea, context);
                if (narrative) {
                    textarea.value = narrative;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    this.highlightField(textarea, 'ai-generated');
                    console.log('EnderAI: Generated narrative content with Gemini');

                    // Show success feedback
                    assistantBtn.textContent = '✅ Generated!';
                    setTimeout(() => {
                        assistantBtn.textContent = '🪄 Generate with Gemini';
                        assistantBtn.disabled = false;
                        assistantBtn.style.opacity = '1';
                    }, 1500);
                }
            } catch (error) {
                console.error('EnderAI: Narrative generation failed', error);
                assistantBtn.textContent = '❌ Failed';
                assistantBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                setTimeout(() => {
                    assistantBtn.textContent = '🪄 Generate with Gemini';
                    assistantBtn.disabled = false;
                    assistantBtn.style.opacity = '1';
                    assistantBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }, 2000);
            }
        };

        textarea.parentNode.style.position = 'relative';
        textarea.parentNode.appendChild(assistantBtn);
    }

    async generateNarrativeForField(textarea, context) {
        // Determine what type of narrative to generate based on context
        let outline = this.vaultData.narratives?.professionalSummary ||
                     this.vaultData.narratives?.careerObjective ||
                     'Experienced professional seeking new opportunities';

        const lowerContext = context.toLowerCase();

        // Customize outline based on field type
        if (lowerContext.includes('career goals') || lowerContext.includes('career aspirations')) {
            outline = this.vaultData.narratives?.professionalSummary ||
                     'Professional with strong technical background and leadership experience';
        } else if (lowerContext.includes('why this program') || lowerContext.includes('why this school')) {
            outline = this.vaultData.narratives?.personalInterests ||
                     'Passionate about technology and its impact on society';
        } else if (lowerContext.includes('personal statement') || lowerContext.includes('essay')) {
            outline = this.vaultData.narratives?.professionalSummary + ' ' +
                     (this.vaultData.narratives?.personalInterests || '');
        }

        const narrative = await this.sendMessage('GENERATE_NARRATIVE', {
            config: {
                outline: outline,
                context: context,
                tone: this.vaultData.preferences?.tone || 'professional',
                characterLimit: textarea.maxLength > 0 ? textarea.maxLength : null
            }
        });

        return narrative;
    }

    addFieldValidation(field) {
        field.addEventListener('blur', () => {
            const errors = this.validator.validateField(field, field.value);
            this.validator.showValidationErrors(field, errors);
        });

        field.addEventListener('input', () => {
            this.validator.removeValidationErrors(field);
            field.style.borderColor = '';
            field.style.backgroundColor = '';
        });
    }

    addValidationUI(form) {
        // Check if validation button already exists
        if (form.querySelector('.ender-ai-validate-btn')) {
            return;
        }

        const validateBtn = document.createElement('button');
        validateBtn.textContent = '✅ Validate Form';
        validateBtn.className = 'ender-ai-validate-btn';
        validateBtn.type = 'button';
        validateBtn.style.cssText = `
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 10px;
            cursor: pointer;
            margin: 24px 0;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: block;
            width: 100%;
            max-width: 200px;
        `;

        validateBtn.onmouseenter = () => {
            validateBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            validateBtn.style.transform = 'translateY(-2px)';
            validateBtn.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
        };
        validateBtn.onmouseleave = () => {
            validateBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            validateBtn.style.transform = 'translateY(0)';
            validateBtn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
        };

        validateBtn.onclick = async () => {
            validateBtn.textContent = '🔍 Validating...';
            validateBtn.disabled = true;

            await this.validateEntireForm(form);

            validateBtn.textContent = '✅ Validate Form';
            validateBtn.disabled = false;
        };

        form.appendChild(validateBtn);
    }

    addAetherAssistantUI(form) {
        // Check if assistant UI already exists
        if (form.parentNode.querySelector('.ender-ai-assistant-header')) {
            return;
        }

        const assistantDiv = document.createElement('div');
        assistantDiv.className = 'ender-ai-assistant-header';
        assistantDiv.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
        `;

        assistantDiv.innerHTML = `
            <div style="position: relative; z-index: 1;">
                <div style="font-weight: 700; font-size: 18px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center;">
                    🚀 <span style="margin-left: 8px;">EnderAI Active</span>
                </div>
                <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
                    <span style="display: inline-block; margin: 0 8px; padding: 4px 8px; background: rgba(255,255,255,0.2); border-radius: 12px; font-size: 12px;">🤖 Gemini AI</span>
                    <span style="display: inline-block; margin: 0 8px; padding: 4px 8px; background: rgba(255,255,255,0.2); border-radius: 12px; font-size: 12px;">📝 Smart Fill</span>
                    <span style="display: inline-block; margin: 0 8px; padding: 4px 8px; background: rgba(255,255,255,0.2); border-radius: 12px; font-size: 12px;">✅ Validation</span>
                </div>
            </div>
        `;

        form.parentNode.insertBefore(assistantDiv, form);
    }

    async validateEntireForm(form) {
        const formData = this.extractFormData(form);
        const fields = this.extractFormFields(form);
        
        let hasErrors = false;
        const allErrors = [];

        // Validate each field
        fields.forEach(field => {
            const errors = this.validator.validateField(field.element, field.element.value);
            if (errors.length > 0) {
                hasErrors = true;
                allErrors.push(...errors);
                this.validator.showValidationErrors(field.element, errors);
            }
        });

        // Check form consistency
        const inconsistencies = this.validator.checkFormConsistency(formData);
        if (inconsistencies.length > 0) {
            hasErrors = true;
            allErrors.push(...inconsistencies.map(msg => ({ message: msg })));
        }

        this.showValidationResults(hasErrors, allErrors);
    }

    showValidationResults(hasErrors, errors) {
        const overlay = document.createElement('div');
        overlay.className = 'ender-ai-validation-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 2px solid ${hasErrors ? '#ef4444' : '#10b981'};
            border-radius: 16px;
            padding: 24px;
            max-width: 420px;
            max-height: 500px;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            backdrop-filter: blur(10px);
        `;

        let html = `
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="font-size: 28px; margin-right: 16px;">
                    ${hasErrors ? '❌' : '✅'}
                </div>
                <div>
                    <h3 style="margin: 0 0 4px 0; color: ${hasErrors ? '#ef4444' : '#10b981'}; font-size: 18px; font-weight: 700;">
                        Validation ${hasErrors ? 'Failed' : 'Passed'}
                    </h3>
                    <div style="font-size: 12px; color: #6b7280;">EnderAI Form Check</div>
                </div>
            </div>
        `;

        if (hasErrors && errors.length > 0) {
            html += '<div style="color: #ef4444; font-weight: 600; margin-bottom: 16px; font-size: 14px;">Issues found:</div><ul style="margin: 0; padding-left: 20px;">';
            errors.forEach(error => {
                html += `<li style="margin-bottom: 10px; color: #374151; line-height: 1.4; font-size: 14px;">${error.message}</li>`;
            });
            html += '</ul>';
        } else if (!hasErrors) {
            html += '<div style="color: #10b981; font-weight: 600; font-size: 14px;">🎉 All checks passed! Your form is ready to submit.</div>';
        }

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 10000);

        // Also allow clicking to dismiss
        overlay.onclick = () => overlay.remove();
    }

    // Utility methods
    extractFormData(form) {
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    highlightField(element, state) {
        const colors = {
            'filled': '#D1FAE5',
            'ai-generated': '#DBEAFE',
            'error': '#FEE2E2'
        };
        
        element.style.backgroundColor = colors[state] || '#FEF3C7';
        element.style.transition = 'background-color 0.3s ease';
        
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 3000);
    }

    async sendMessage(action, data = {}) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action, ...data }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FormScanner());
} else {
    new FormScanner();
}