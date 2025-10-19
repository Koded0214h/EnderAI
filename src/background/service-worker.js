// src/background/service-worker.js
importScripts('./storage-utils.js');

class AetherFormAI {
    constructor() {
        this.vaultData = null;
        this.storageManager = new StorageManager();
    }

    async initialize() {
        this.vaultData = await this.storageManager.getVaultData();
        console.log('AetherForm AI: Service worker initialized');
    }

    // Layer 1: Intelligent Field Detection & Autofill
    async detectFieldIntent(fieldContext, pageContext) {
        // For now, use simple detection - in production, this would use AI
        return this.fallbackFieldDetection(fieldContext);
    }

    // Layer 2: Contextual Writing & Tailoring
    async generateNarrative(promptConfig) {
        const { outline, context, tone, characterLimit } = promptConfig;
        
        // Simulate AI generation - replace with actual AI API calls
        return this.simulateNarrativeGeneration(outline, context, tone, characterLimit);
    }

    async rewriteContent(content, newTone, characterLimit) {
        // Simulate content rewriting
        return this.simulateContentRewriting(content, newTone, characterLimit);
    }

    // Layer 3: Compliance & Consistency Checking
    async validateFormData(formData, pageContext) {
        return {
            typos: { hasErrors: false, suggestions: [] },
            consistency: [],
            completeness: { isComplete: true, missingFields: [] }
        };
    }

    async checkTypos(text) {
        return { hasErrors: false, suggestions: [] };
    }

    async checkConsistency(formData) {
        return [];
    }

    async translateLabel(label, targetLanguage = 'en') {
        return label; // Simple fallback - implement translation in production
    }

    // Simulation methods (replace with real AI)
    fallbackFieldDetection(context) {
        const lowerContext = context.toLowerCase();
        if (lowerContext.includes('name')) return 'fullName';
        if (lowerContext.includes('email')) return 'email';
        if (lowerContext.includes('phone')) return 'phone';
        if (lowerContext.includes('address')) return 'address';
        if (lowerContext.includes('essay') || lowerContext.includes('statement')) return 'personalStatement';
        return 'other';
    }

    simulateNarrativeGeneration(outline, context, tone, characterLimit) {
        const templates = {
            professional: `Based on my experience as outlined in ${outline}, I have developed strong capabilities in this area. My background has provided me with comprehensive understanding and practical skills that I believe align well with the requirements. I am confident in my ability to contribute effectively and am excited about the opportunity to apply my expertise in a meaningful context.`,
            academic: `Throughout my academic and professional journey as described in ${outline}, I have cultivated a deep interest in this field. The experiences I've gained have not only strengthened my technical abilities but also enhanced my critical thinking and problem-solving skills. I am eager to leverage this foundation to make valuable contributions and continue growing in this area.`,
            casual: `My experience with ${outline} has given me hands-on understanding of these concepts. I've enjoyed applying these skills in practical settings and am looking forward to new opportunities where I can continue developing my capabilities while making a positive impact.`
        };

        let narrative = templates[tone] || templates.professional;
        
        if (characterLimit && narrative.length > characterLimit) {
            narrative = narrative.substring(0, characterLimit - 3) + '...';
        }
        
        return narrative;
    }

    simulateContentRewriting(content, newTone, characterLimit) {
        // Simple simulation - just return the content as-is
        let rewritten = content;
        
        if (characterLimit && rewritten.length > characterLimit) {
            rewritten = rewritten.substring(0, characterLimit - 3) + '...';
        }
        
        return rewritten;
    }
}

// Initialize AI Core
const aetherAI = new AetherFormAI();
aetherAI.initialize();

// Message Handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Service worker received message:', request.action, request);

    const handlers = {
        'DETECT_FIELD_INTENT': async () => {
            const result = await aetherAI.detectFieldIntent(request.context, request.pageContext);
            return result;
        },
        'GENERATE_NARRATIVE': async () => {
            const result = await aetherAI.generateNarrative(request.config);
            return result;
        },
        'REWRITE_CONTENT': async () => {
            const result = await aetherAI.rewriteContent(request.content, request.tone, request.characterLimit);
            return result;
        },
        'VALIDATE_FORM': async () => {
            const result = await aetherAI.validateFormData(request.formData, request.pageContext);
            return result;
        },
        'TRANSLATE_LABEL': async () => {
            const result = await aetherAI.translateLabel(request.label, request.language);
            return result;
        },
        'GET_VAULT_DATA': async () => {
            return await aetherAI.storageManager.getVaultData();
        },
        'SAVE_VAULT_DATA': async () => {
            await aetherAI.storageManager.saveVaultData(request.vaultData);
            aetherAI.vaultData = request.vaultData;
            return { success: true };
        }
    };

    const handler = handlers[request.action];
    if (handler) {
        handler().then(sendResponse).catch(error => {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        });
        return true; // Keep message channel open for async response
    }
});

// Example vault data for testing
chrome.runtime.onInstalled.addListener(() => {
    const defaultVault = {
        personal: {
            fullName: "John Smith",
            email: "john.smith@example.com",
            phone: "+1-555-0123",
            address: {
                street: "123 Main Street",
                city: "San Francisco",
                state: "CA",
                zipCode: "94105",
                country: "USA"
            }
        },
        professional: {
            currentTitle: "Senior Software Engineer",
            company: "Tech Innovations Inc.",
            industry: "Technology",
            yearsExperience: 8,
            skills: ["JavaScript", "Python", "React", "Node.js", "AWS"],
            education: [
                {
                    institution: "Stanford University",
                    degree: "Bachelor of Science",
                    field: "Computer Science",
                    years: "2012-2016",
                    gpa: "3.8"
                }
            ],
            workExperience: [
                {
                    company: "Tech Innovations Inc.",
                    title: "Senior Software Engineer",
                    startDate: "2020-01-15",
                    endDate: "Present",
                    responsibilities: ["Lead development teams", "Architect scalable systems"],
                    achievements: ["Reduced latency by 40%", "Improved team productivity by 25%"]
                }
            ]
        },
        narratives: {
            careerObjective: "Seeking to leverage my technical expertise in software engineering to build innovative solutions that solve real-world problems.",
            professionalSummary: "Experienced software engineer with 8+ years in full-stack development, cloud architecture, and team leadership. Passionate about creating efficient, scalable systems and mentoring junior developers.",
            keyAchievements: ["Led a team of 10 developers", "Reduced system latency by 40%", "Implemented CI/CD pipelines"],
            personalInterests: ["Open source contributions", "Mentoring", "Hiking", "Photography"]
        },
        preferences: {
            tone: "professional",
            writingStyle: "concise",
            autoTranslate: false,
            validationStrictness: "medium"
        }
    };

    // Set default vault data if none exists
    chrome.storage.local.get(['aetherFormVault'], (result) => {
        if (!result.aetherFormVault) {
            chrome.storage.local.set({ aetherFormVault: defaultVault }, () => {
                console.log('AetherForm: Default vault data initialized');
            });
        }
    });
});