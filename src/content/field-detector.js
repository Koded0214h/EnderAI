// src/content/field-detector.js
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

    detectFieldType(fieldContext) {
        const context = fieldContext.toLowerCase();
        
        for (const [category, fields] of Object.entries(this.fieldPatterns)) {
            for (const [fieldType, patterns] of Object.entries(fields)) {
                if (patterns.some(pattern => context.includes(pattern))) {
                    return { category, fieldType, confidence: 'high' };
                }
            }
        }

        // AI-enhanced detection for ambiguous fields
        return this.detectAmbiguousField(context);
    }

    detectAmbiguousField(context) {
        // Simple heuristic fallback - in real implementation, this would use AI
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

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = FieldDetector;
}