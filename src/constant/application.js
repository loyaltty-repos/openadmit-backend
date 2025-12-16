export const EApplicationEnvironment = Object.freeze({
    PRODUCTION: 'production',
    DEVELOPMENT: 'development'
});

// activityConstants.js
export const ACTIVITY_TYPES = Object.freeze({
    LOGIN: 'LOGIN',
    SIGNUP: 'SIGNUP',
    LOAN_APPLICATION: 'LOAN_APPLICATION',
    PAYMENT_INITIATED: 'PAYMENT_INITIATED',
    PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
    PROFILE_UPDATED: 'PROFILE_UPDATED',
    UNIVERSITY_STATUS_UPDATED: 'UNIVERSITY_STATUS_UPDATED',
    QUESTIONNAIRE_SUBMITTED: 'QUESTIONNAIRE_SUBMITTED',
    QUESTIONNAIRE_UPDATED: 'QUESTIONNAIRE_UPDATED'
})

export const ACTIVITY_STATUSES = Object.freeze({
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    SUBMITTED: 'SUBMITTED',
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    UPDATED: 'UPDATED'
})
export const EAuthProvider = Object.freeze({
    LOCAL: "LOCAL",
    GOOGLE: "GOOGLE",
    FACEBOOK: "FACEBOOK"
})


export const PAYMENT_PLANS = Object.freeze(
    {
        masters: {
            basic: {
                id: 'MASTERS_BASIC',
                name: 'UpBroad Basic',
                price: 24999,
                features: [
                    'Help you shortlist universities',
                    'Prepare and Assess Your Admissions Documents Tailored for 1 Unique University'
                ]
            },
            pro: {
                id: 'MASTERS_PRO',
                name: 'UpBroad Pro',
                price: 39999,
                features: [
                    'Help you shortlist universities',
                    'Prepare and Assess Your Admissions Documents Tailored for 3 Unique Universities',
                    'Become Your Mentors',
                    'Help You Crack Interviews',
                    'Guide You Through Scholarships'
                ]
            },
            premier: {
                id: 'MASTERS_PREMIER',
                name: 'UpBroad Premier',
                price: 59999,
                features: [
                    'Help you shortlist universities',
                    'Prepare and Assess Your Admissions Documents Tailored for 5 Unique Universities',
                    'Become Your Mentors',
                    'Help You Crack Interviews',
                    'Guide You Through Scholarships',
                    'US Job Market Masterclass',
                    'GRE Help',
                    'Give You Visa Assistance',
                    'Guide You Pre-Departure',
                    'Connect You to a Community'
                ]
            }
        },
        bachelors: {
            basic: {
                id: 'BACHELORS_BASIC',
                name: 'UpBroad Basic',
                price: 44999,
                features: [
                    'One (1) Statement of Purpose (SOP) preparation',
                    'University shortlisting (limited to the US)',
                    'One (1) Letter of Recommendation (LOR) preparation'
                ]
            },
            pro: {
                id: 'BACHELORS_PRO',
                name: 'UpBroad Pro',
                price: 69999,
                features: [
                    'Help in shortlisting universities (US)',
                    'Preparation and assessment of admissions documents',
                    'Mentorship & interview preparation',
                    'Guidance on available scholarships'
                ]
            },
            premier: {
                id: 'BACHELORS_PREMIER',
                name: 'UpBroad Premier',
                price: 84999,
                features: [
                    'Help in shortlisting universities (US)',
                    'Preparation and assessment of admissions documents',
                    'Mentorship & interview preparation',
                    'Job Market Masterclass',
                    'Visa assistance',
                    'Pre-departure guidance'
                ]
            }
        },
        mba: {
            basic: {
                id: 'MBA_BASIC',
                name: 'UpBroad Basic',
                price: 44999,
                features: [
                    'Help you shortlist universities',
                    'Prepare and assess your admissions documents tailored for 1 unique university'
                ]
            },
            pro: {
                id: 'MBA_PRO',
                name: 'UpBroad Pro',
                price: 59999,
                features: [
                    'Help you shortlist universities',
                    'Prepare and assess your admissions documents tailored for 3 unique universities',
                    'Become your mentors',
                    'Help you crack interviews',
                    'Guide you through scholarships'
                ]
            },
            premier: {
                id: 'MBA_PREMIER',
                name: 'UpBroad Premier',
                price: 79999,
                features: [
                    'Help you shortlist universities',
                    'Prepare and assess your admissions documents tailored for 5 unique universities',
                    'Become your mentors',
                    'Help you crack interviews',
                    'Guide you through scholarships',
                    'US job market masterclass',
                    'GRE help',
                    'Give you visa assistance',
                    'Guide you pre-departure',
                    'Connect you to a community'
                ]
            }
        }
    })
