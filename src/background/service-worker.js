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

        try {
            const prompt = this.buildNarrativePrompt(outline, context, tone, characterLimit);
            const response = await this.callGeminiAPI(prompt);
            return this.processGeminiResponse(response, characterLimit);
        } catch (error) {
            console.error('Gemini API error:', error);
            return this.fallbackNarrativeGeneration(outline, context, tone, characterLimit);
        }
    }

    async rewriteContent(content, newTone, characterLimit) {
        try {
            const prompt = this.buildRewritePrompt(content, newTone, characterLimit);
            const response = await this.callGeminiAPI(prompt);
            return this.processGeminiResponse(response, characterLimit);
        } catch (error) {
            console.error('Gemini API error:', error);
            return this.fallbackContentRewriting(content, newTone, characterLimit);
        }
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

    // Gemini API Integration
    async callGeminiAPI(prompt) {
        const API_KEY = 'AIzaSyAqv_qyqKXecPHlreWgTHWGUVjeUNtx76o';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }

    buildNarrativePrompt(outline, context, tone, characterLimit) {
        const limitText = characterLimit ? ` Keep your response under ${characterLimit} characters.` : '';
        return `Write a ${tone} narrative response for a form field. Context: ${context}. Use this information about the person: ${outline}. Make it personal and authentic. Only provide the response text itself, no introductions, headers, or explanations.${limitText}`;
    }

    buildRewritePrompt(content, newTone, characterLimit) {
        const limitText = characterLimit ? ` Keep your response under ${characterLimit} characters.` : '';
        return `Rewrite the following text in a ${newTone} tone: "${content}".${limitText}`;
    }

    processGeminiResponse(response, characterLimit) {
        try {
            const text = response.candidates[0].content.parts[0].text;
            let processed = text.trim();

            // Remove any introductory text like "Okay, here's a draft response..."
            const introPatterns = [
                /^Okay, here's a draft response.*?:\s*/i,
                /^Here's a draft.*?:\s*/i,
                /^Here's a response.*?:\s*/i,
                /^Here's an example.*?:\s*/i,
                /^Let me provide.*?:\s*/i,
                /^Based on the information.*?:\s*/i,
                /^\*\*.*?\*\*\s*/i,  // Remove markdown headers
                /^Career Goals.*?:\s*/i,
                /^Personal Statement.*?:\s*/i,
                /^Response.*?:\s*/i
            ];

            introPatterns.forEach(pattern => {
                processed = processed.replace(pattern, '');
            });

            // Clean up any remaining formatting
            processed = processed.replace(/^\s*[\*\-\•]\s*/gm, ''); // Remove bullet points
            processed = processed.replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines
            processed = processed.trim();

            if (characterLimit && processed.length > characterLimit) {
                processed = processed.substring(0, characterLimit - 3) + '...';
            }

            return processed;
        } catch (error) {
            console.error('Error processing Gemini response:', error);
            throw new Error('Failed to process AI response');
        }
    }

    // Fallback methods (simplified versions for when API fails)
    fallbackNarrativeGeneration(outline, context, tone, characterLimit) {
        const templates = {
            professional: `Based on my experience as outlined in ${outline}, I have developed strong capabilities in this area. My background has provided me with comprehensive understanding and practical skills that I believe align well with the requirements.`,
            academic: `Throughout my academic and professional journey as described in ${outline}, I have cultivated a deep interest in this field. The experiences I've gained have strengthened my technical abilities and critical thinking skills.`,
            casual: `My experience with ${outline} has given me hands-on understanding of these concepts. I've enjoyed applying these skills and am looking forward to new opportunities.`
        };

        let narrative = templates[tone] || templates.professional;

        if (characterLimit && narrative.length > characterLimit) {
            narrative = narrative.substring(0, characterLimit - 3) + '...';
        }

        return narrative;
    }

    fallbackContentRewriting(content, newTone, characterLimit) {
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

    // Set enhanced default vault data if none exists
    chrome.storage.local.get(['aetherFormVault'], (result) => {
        if (!result.aetherFormVault) {
            // Try to load enhanced vault template
            fetch(chrome.runtime.getURL('src/data/enhanced-vault.json'))
                .then(response => response.json())
                .then(enhancedVault => {
                    // Merge with sample data
                    const mergedVault = { ...enhancedVault };
                    // Add sample data to key fields
                    mergedVault.personal = {
                        ...mergedVault.personal,
                        fullName: "John Smith",
                        email: "john.smith@example.com",
                        phone: "+1-555-0123",
                        address: {
                            ...mergedVault.personal.address,
                            street: "123 Main Street",
                            city: "San Francisco",
                            state: "CA",
                            zipCode: "94105",
                            country: "USA"
                        }
                    };
                    mergedVault.professional = {
                        ...mergedVault.professional,
                        currentTitle: "Senior Software Engineer",
                        company: "Tech Innovations Inc.",
                        industry: "Technology",
                        yearsExperience: 8,
                        skills: ["JavaScript", "Python", "React", "Node.js", "AWS"],
                        education: [
                            {
                                ...mergedVault.professional.education[0],
                                institution: "Stanford University",
                                degree: "Bachelor of Science",
                                field: "Computer Science",
                                years: "2012-2016",
                                gpa: "3.8"
                            }
                        ],
                        workExperience: [
                            {
                                ...mergedVault.professional.workExperience[0],
                                company: "Tech Innovations Inc.",
                                title: "Senior Software Engineer",
                                startDate: "2020-01-15",
                                endDate: "Present",
                                responsibilities: ["Lead development teams", "Architect scalable systems"],
                                achievements: ["Reduced latency by 40%", "Improved team productivity by 25%"]
                            }
                        ]
                    };
                    mergedVault.narratives = {
                        ...mergedVault.narratives,
                        careerObjective: "Seeking to leverage my technical expertise in software engineering to build innovative solutions that solve real-world problems.",
                        professionalSummary: "Experienced software engineer with 8+ years in full-stack development, cloud architecture, and team leadership. Passionate about creating efficient, scalable systems and mentoring junior developers.",
                        keyAchievements: ["Led a team of 10 developers", "Reduced system latency by 40%", "Implemented CI/CD pipelines"],
                        personalInterests: ["Open source contributions", "Mentoring", "Hiking", "Photography"]
                    };

                    chrome.storage.local.set({ aetherFormVault: mergedVault }, () => {
                        console.log('EnderAI: Enhanced vault data initialized with sample data');
                    });
                })
                .catch(error => {
                    console.error('EnderAI: Failed to load enhanced vault template, using basic template', error);
                    // Fallback to basic template with sample data
                    chrome.storage.local.set({ aetherFormVault: defaultVault }, () => {
                        console.log('EnderAI: Basic vault data initialized');
                    });
                });
        }
    });
});