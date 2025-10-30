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

        // Enhanced pattern matching with more comprehensive field types
        const enhancedPatterns = {
            personal: {
                ...this.fieldPatterns.personal,
                firstName: ['first name', 'given name', 'forename'],
                lastName: ['last name', 'surname', 'family name'],
                middleName: ['middle name', 'middle initial'],
                preferredName: ['preferred name', 'nickname', 'goes by'],
                emailPersonal: ['personal email', 'home email'],
                emailWork: ['work email', 'business email', 'professional email'],
                emailSchool: ['school email', 'university email', 'student email'],
                phoneHome: ['home phone', 'landline', 'residential phone'],
                phoneMobile: ['mobile phone', 'cell phone', 'cellular'],
                phoneWork: ['work phone', 'office phone', 'business phone'],
                dateOfBirth: ['date of birth', 'birth date', 'dob', 'birthday'],
                age: ['age', 'how old'],
                gender: ['gender', 'sex'],
                nationality: ['nationality', 'citizenship'],
                ethnicity: ['ethnicity', 'race'],
                maritalStatus: ['marital status', 'relationship status'],
                emergencyContact: ['emergency contact', 'emergency person'],
                socialSecurity: ['social security', 'ssn', 'social insurance'],
                driversLicense: ['driver\'s license', 'driving license', 'license number'],
                passportNumber: ['passport number', 'passport no'],
                citizenship: ['citizenship', 'citizen'],
                visaStatus: ['visa status', 'visa type'],
                languages: ['languages', 'language skills'],
                website: ['website', 'personal website', 'portfolio website'],
                linkedin: ['linkedin', 'linked in'],
                github: ['github', 'git hub'],
                twitter: ['twitter', 'x account'],
                portfolio: ['portfolio', 'online portfolio']
            },
            professional: {
                ...this.fieldPatterns.professional,
                department: ['department', 'division'],
                yearsInField: ['years in field', 'industry experience'],
                yearsAtCompany: ['years at company', 'tenure'],
                employmentStatus: ['employment status', 'employment type'],
                jobLevel: ['job level', 'seniority level'],
                salaryRange: ['salary range', 'salary expectation', 'compensation'],
                supervisorName: ['supervisor name', 'manager name', 'boss'],
                supervisorEmail: ['supervisor email', 'manager email'],
                supervisorPhone: ['supervisor phone', 'manager phone'],
                technicalSkills: ['technical skills', 'tech skills'],
                softSkills: ['soft skills', 'interpersonal skills'],
                licenses: ['licenses', 'professional licenses'],
                awards: ['awards', 'recognitions', 'honors'],
                publications: ['publications', 'papers'],
                patents: ['patents', 'intellectual property'],
                professionalMemberships: ['professional memberships', 'associations']
            },
            academic: {
                studentId: ['student id', 'student number', 'id number'],
                major: ['major', 'field of study', 'concentration'],
                minor: ['minor', 'secondary field'],
                expectedGraduation: ['expected graduation', 'graduation date'],
                currentGpa: ['current gpa', 'gpa'],
                cumulativeGpa: ['cumulative gpa', 'overall gpa'],
                academicStanding: ['academic standing', 'standing'],
                honors: ['honors', 'dean\'s list'],
                scholarships: ['scholarships', 'financial aid'],
                researchInterests: ['research interests', 'research focus'],
                thesisTopic: ['thesis topic', 'dissertation topic'],
                advisorName: ['advisor name', 'thesis advisor'],
                advisorEmail: ['advisor email'],
                relevantCoursework: ['relevant coursework', 'related courses'],
                academicAwards: ['academic awards', 'scholarly awards'],
                publications: ['academic publications', 'scholarly publications'],
                conferences: ['conferences', 'presentations'],
                extracurriculars: ['extracurriculars', 'activities'],
                leadershipRoles: ['leadership roles', 'leadership positions'],
                volunteerWork: ['volunteer work', 'community service']
            },
            testScores: {
                greVerbal: ['gre verbal', 'gre verbal score'],
                greQuantitative: ['gre quantitative', 'gre quant'],
                greWriting: ['gre writing', 'gre analytical'],
                gmatTotal: ['gmat total', 'gmat score'],
                toeflTotal: ['toefl total', 'toefl score'],
                ieltsOverall: ['ielts overall', 'ielts score'],
                satTotal: ['sat total', 'sat score'],
                actComposite: ['act composite', 'act score']
            },
            narratives: {
                careerObjective: ['career objective', 'objective'],
                professionalSummary: ['professional summary', 'summary'],
                personalStatement: ['personal statement', 'statement'],
                diversityStatement: ['diversity statement', 'diversity essay'],
                researchStatement: ['research statement', 'research interests'],
                teachingStatement: ['teaching statement', 'teaching philosophy'],
                leadershipStatement: ['leadership statement', 'leadership experience'],
                motivationLetter: ['motivation letter', 'letter of motivation'],
                coverLetter: ['cover letter', 'application letter'],
                elevatorPitch: ['elevator pitch', 'pitch'],
                professionalBio: ['professional bio', 'bio'],
                shortBio: ['short bio', 'brief bio'],
                longBio: ['long bio', 'detailed bio'],
                linkedinSummary: ['linkedin summary', 'profile summary'],
                aboutMe: ['about me', 'self description'],
                personalBrand: ['personal brand', 'brand statement'],
                uniqueValueProposition: ['unique value proposition', 'uvp'],
                careerGoals: ['career goals', 'professional goals'],
                fiveYearPlan: ['five year plan', '5 year plan'],
                whyThisCompany: ['why this company', 'company fit'],
                whyThisProgram: ['why this program', 'program fit'],
                whyThisSchool: ['why this school', 'school fit'],
                whyThisPosition: ['why this position', 'position fit'],
                greatestAchievement: ['greatest achievement', 'biggest achievement'],
                biggestChallenge: ['biggest challenge', 'greatest challenge'],
                futureContribution: ['future contribution', 'potential contribution'],
                researchInterests: ['research interests', 'research focus'],
                teachingPhilosophy: ['teaching philosophy', 'educational philosophy'],
                leadershipPhilosophy: ['leadership philosophy', 'leadership approach'],
                workStyle: ['work style', 'working style'],
                communicationStyle: ['communication style', 'communication approach'],
                conflictResolution: ['conflict resolution', 'conflict management'],
                problemSolving: ['problem solving', 'problem-solving'],
                learningStyle: ['learning style', 'learning approach'],
                strengths: ['strengths', 'key strengths'],
                areasForImprovement: ['areas for improvement', 'development areas'],
                careerHighlights: ['career highlights', 'professional highlights'],
                professionalJourney: ['professional journey', 'career journey'],
                personalGrowth: ['personal growth', 'growth story'],
                communityImpact: ['community impact', 'social impact'],
                futureVision: ['future vision', 'vision']
            },
            additional: {
                bloodType: ['blood type', 'blood group'],
                organDonor: ['organ donor', 'organ donation'],
                bankName: ['bank name', 'financial institution'],
                accountType: ['account type', 'account category'],
                driversLicenseNumber: ['driver\'s license number', 'license number'],
                driversLicenseState: ['driver\'s license state', 'issuing state'],
                passportExpiration: ['passport expiration', 'passport expiry'],
                visaType: ['visa type', 'visa category'],
                visaExpiration: ['visa expiration', 'visa expiry'],
                workAuthorization: ['work authorization', 'work permit'],
                publicationsCount: ['publications count', 'number of publications'],
                citationsCount: ['citations count', 'citation count'],
                patentsCount: ['patents count', 'number of patents'],
                awardsCount: ['awards count', 'number of awards']
            }
        };

        // Check enhanced patterns first
        for (const [category, fields] of Object.entries(enhancedPatterns)) {
            for (const [fieldType, patterns] of Object.entries(fields)) {
                if (patterns.some(pattern => context.includes(pattern))) {
                    return { category, fieldType, confidence: 'high' };
                }
            }
        }

        // Fall back to original patterns
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
        const lowerContext = context.toLowerCase();

        // Enhanced detection for different form types
        if (lowerContext.includes('personal statement') || lowerContext.includes('essay') || lowerContext.includes('statement') || lowerContext.includes('describe')) {
            return { category: 'narrative', fieldType: 'personalStatement', confidence: 'medium' };
        }

        if (lowerContext.includes('why') || lowerContext.includes('purpose') || lowerContext.includes('reason') || lowerContext.includes('motivation')) {
            return { category: 'narrative', fieldType: 'motivation', confidence: 'medium' };
        }

        if (lowerContext.includes('career goals') || lowerContext.includes('career aspirations') || lowerContext.includes('professional goals')) {
            return { category: 'narrative', fieldType: 'careerGoals', confidence: 'medium' };
        }

        if (lowerContext.includes('why this program') || lowerContext.includes('why this school') || lowerContext.includes('why this university')) {
            return { category: 'narrative', fieldType: 'programInterest', confidence: 'medium' };
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