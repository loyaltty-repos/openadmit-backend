import Joi from "joi"
// ############ AUTH Validation ################
export const ValidateLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

export const ValidateSignup = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    otp: Joi.string().min(6).max(6).required()
});

export const ValidateVerifyOtp = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().min(6).max(6).required()
});

export const validateEmailOtp = Joi.object({
    email: Joi.string().email().required()
})

export const ValidateResetPassword = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    otp: Joi.string().min(6).max(6).required()
    
});
// ############ AUTH Validation END ################


// ############ PROFILE Validation ################
// export const ValidateProfileUpdate = Joi.object({
//     programDetails: Joi.object({
//         program: Joi.string().allow(null),
//         validity: Joi.date().allow(null)
//     }).allow(null),
//     phoneNumber: Joi.string()
//         .pattern(/^\+([1-9]{1}[0-9]{1,2})\d{10}$/)
//         .required()
//         .trim()
//         .messages({
//             'string.pattern.base': 'Phone number must start with a country code (e.g., +918388656625)',
//             'string.empty': 'Phone number is required',
//             'any.required': 'Phone number is required',
//         }),
//     personalDetails: Joi.object({
//         dob: Joi.date().allow(null),
//         gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').allow(null),
//         address: Joi.string().allow(null),
//         profession: Joi.string().allow(null)
//     }).allow(null),
//     name: Joi.string()
//         .min(1)
//         .max(100)
//         .optional()
//         .messages({
//             'string.empty': 'Name cannot be empty',
//             'string.min': 'Name must be at least 1 character long',
//             'string.max': 'Name must be at most 100 characters long',
//         }),
//     profilePicture: Joi.string()
//         .uri()
//         .optional()
//         .messages({
//             'string.uri': 'Profile picture must be a valid URL',
//         }),
//     email: Joi.string()
//         .email()
//         .optional()
//         .messages({
//             'string.email': 'Please provide a valid email address',
//         }),
//     collegeDetails: Joi.object({
//         branch: Joi.string().allow(null),
//         highestDegree: Joi.string().allow(null),
//         university: Joi.string().allow(null),
//         college: Joi.string().allow(null),
//         gpa: Joi.number().allow(null),
//         toppersGPA: Joi.number().allow(null),
//         noOfBacklogs: Joi.number().allow(null),
//         admissionTerm: Joi.string().allow(null),
//         coursesApplying: Joi.array().items(Joi.string()).allow(null)
//     }).allow(null),
//     greDetails: Joi.object({
//         grePlane: Joi.date().allow(null),
//         greDate: Joi.date().allow(null),
//         greScoreCard: Joi.string().allow(null),
//         greScore: Joi.object({
//             verbal: Joi.number().allow(null),
//             quant: Joi.number().allow(null),
//             awa: Joi.number().allow(null)
//         }).allow(null),
//         retakingGRE: Joi.string().allow(null)
//     }).allow(null),
//     ieltsDetails: Joi.object({
//         ieltsPlan: Joi.date().allow(null),
//         ieltsDate: Joi.date().allow(null),
//         ieltsScore: Joi.object({
//             reading: Joi.number().allow(null),
//             writing: Joi.number().allow(null),
//             speaking: Joi.number().allow(null),
//             listening: Joi.number().allow(null)
//         }).allow(null),
//         retakingIELTS: Joi.string().allow(null)
//     }).allow(null),
//     toeflDetails: Joi.object({
//         toeflPlan: Joi.date().allow(null),
//         toeflDate: Joi.date().allow(null),
//         toeflScore: Joi.object({
//             reading: Joi.number().allow(null),
//             writing: Joi.number().allow(null),
//             speaking: Joi.number().allow(null)
//         }).allow(null),
//         retakingTOEFL: Joi.string().allow(null)
//     }).allow(null),
//     visa: Joi.object({
//         countriesPlanningToApply: Joi.array().items(Joi.string()).allow(null),
//         visaInterviewDate: Joi.date().allow(null),
//         visaInterviewLocation: Joi.string().allow(null)
//     }).allow(null)
// }).unknown(false);

// validation/student.validation.js


// validation/student.update.validation.js



import { EAuthProvider } from '../constant/application.js';

// ---------- Reusable atoms ----------
const urlString = Joi.string().allow(null, ''); // string or empty string or null

const phoneWithCountry = Joi.string()
  .pattern(/^\+([1-9]{1}[0-9]{1,2})\d{10}$/)
  .trim()
  .messages({
    'string.pattern.base': 'Phone number must start with a country code (e.g., +918388656625)',
  });

const degreeEnum = Joi.string().valid('BACHELOR', 'MASTER', 'MBA', 'PHD', 'OTHER').allow(null, '');
const degreeLengthEnum = Joi.string().valid('2 YEARS', '3 YEARS', '4 YEARS', '5 YEARS', 'OTHER').allow(null, '');
const intakeModeEnum = Joi.string().valid('BASIC', 'ADVANCED').allow(null, '');
const yesNoEnum = Joi.string().valid('YES', 'NO').allow(null, '');
const genderEnum = Joi.string().valid('MALE', 'FEMALE', 'OTHER', "").allow(null, "");
const statusEnum = Joi.string().valid('PENDING', 'ACTIVE', 'COMPLETE', 'REJECTED');
const providerEnum = Joi.string().valid(...Object.values(EAuthProvider));
const tierEnum = Joi.string().valid('IIT', 'NIT', 'TIER 1', 'TIER 2', 'TIER 3', 'OTHER').allow(null, '');

// ---------- Reusable nested blocks (all optional & null/empty-string friendly) ----------
const programDetails = Joi.object({
  program: Joi.string().allow(null, ''),
  intake: Joi.string().allow(null, ''),
  duration: Joi.string().allow(null, ''),
  validity: Joi.date().allow(null, ''),
}).allow(null, '');

const personalDetails = Joi.object({
  dob: Joi.date().allow(null, ''),
  gender: genderEnum,
  address: Joi.string().allow(null, ''),
  profession: Joi.string().allow(null, ''),
}).allow(null, '');

const schoolDetails = Joi.object({
  schoolName: Joi.string().allow(null, ''),
  board: Joi.string().allow(null, ''),
  yearOfPassing: Joi.number().integer().allow(null, ''),
  percentage: Joi.number().allow(null, ''),
}).allow(null, '');

const satDetails = Joi.object({
  satPlan: Joi.date().allow(null, ''),
  satDate: Joi.date().allow(null, ''),
  satScoreCard: Joi.string().allow(null, ''),
  satScore: Joi.object({
    readingWriting: Joi.number().allow(null, ''),
    math: Joi.number().allow(null, ''),
    total: Joi.number().allow(null, ''),
  }).allow(null, ''),
}).allow(null, '');

const actDetails = Joi.object({
  actPlan: Joi.date().allow(null, ''),
  actDate: Joi.date().allow(null, ''),
  actScoreCard: Joi.string().allow(null, ''),
  actScore: Joi.object({
    english: Joi.number().allow(null, ''),
    math: Joi.number().allow(null, ''),
    total: Joi.number().allow(null, ''),
  }).allow(null, ''),
}).allow(null, '');

const collegeDetails = Joi.object({
  branch: Joi.string().allow(null, ''),
  highestDegree: Joi.string().allow(null, ''),
  university: Joi.string().allow(null, ''),
  college: Joi.string().allow(null, ''),
  tier: tierEnum,
  gpa: Joi.number().allow(null, ''),
  gpaScale: Joi.number().allow(null, ''),
  toppersGPA: Joi.number().allow(null, ''),
  noOfBacklogs: Joi.number().allow(null, ''),
  admissionTerm: Joi.string().allow(null, ''),
  coursesApplying: Joi.array().items(Joi.string()).allow(null, ''),
}).allow(null, '');

const greDetails = Joi.object({
  grePlan: Joi.date().allow(null, ''),
  greDate: Joi.date().allow(null, ''),
  greScoreCard: Joi.string().allow(null, ''),
  greScore: Joi.object({
    verbal: Joi.number().allow(null, ''),
    quant: Joi.number().allow(null, ''),
    awa: Joi.number().allow(null, ''),
  }).allow(null, ''),
  retakingGRE: Joi.string().allow(null, ''),
}).allow(null, '');

const gmatDetails = Joi.object({
  gmatPlan: Joi.date().allow(null, ''),
  gmatDate: Joi.date().allow(null, ''),
  gmatScoreCard: Joi.string().allow(null, ''),
  gmatScore: Joi.object({
    verbal: Joi.number().allow(null, ''),
    quant: Joi.number().allow(null, ''),
    total: Joi.number().allow(null, ''),
  }).allow(null, ''),
  retakingGMAT: Joi.string().allow(null, ''),
}).allow(null, '');

const ieltsDetails = Joi.object({
  ieltsPlan: Joi.date().allow(null, ''),
  ieltsDate: Joi.date().allow(null, ''),
  ieltsScore: Joi.object({
    reading: Joi.number().allow(null, ''),
    writing: Joi.number().allow(null, ''),
    speaking: Joi.number().allow(null, ''),
    listening: Joi.number().allow(null, ''),
  }).allow(null, ''),
  retakingIELTS: Joi.string().allow(null, ''),
}).allow(null, '');

const toeflDetails = Joi.object({
  toeflPlan: Joi.date().allow(null, ''),
  toeflDate: Joi.date().allow(null, ''),
  toeflScore: Joi.object({
    reading: Joi.number().allow(null, ''),
    writing: Joi.number().allow(null, ''),
    speaking: Joi.number().allow(null, ''),
    listening: Joi.number().allow(null, ''),
  }).allow(null, ''),
  retakingTOEFL: Joi.string().allow(null, ''),
}).allow(null, '');

const duolingoDetails = Joi.object({
  duolingoPlan: Joi.date().allow(null, ''),
  duolingoDate: Joi.date().allow(null, ''),
  duolingoScore: Joi.object({
    reading: Joi.number().allow(null, ''),
    writing: Joi.number().allow(null, ''),
    speaking: Joi.number().allow(null, ''),
    listening: Joi.number().allow(null, ''),
  }).allow(null, ''),
  retakingDuolingo: Joi.string().allow(null, ''),
}).allow(null, '');

const experienceDetails = Joi.object({
  totalExperience: Joi.number().allow(null, ''),
  experienceIndustry: Joi.string().allow(null, ''),
}).allow(null, '');

const visa = Joi.object({
  countriesPlanningToApply: Joi.array().items(Joi.string()).allow(null, ''),
  visaInterviewDate: Joi.date().allow(null, ''),
  visaInterviewLocation: Joi.string().allow(null, ''),
}).allow(null, '');

const planDetails = Joi.object({
  course: Joi.string().allow(null, ''),
  planId: Joi.string().allow(null, ''),
  planName: Joi.string().allow(null, ''),
  planPrice: Joi.number().allow(null, ''),
  planBuyDate: Joi.date().allow(null, ''),
  receiptLink: Joi.string().allow(null, ''), // keep non-URL paths allowed
}).allow(null, '');

// ---------- UPDATE VALIDATOR (PATCH) ----------
export const ValidateProfileUpdate = Joi.object({
  // Core identity (all optional on update)
  email: Joi.string().email().messages({
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string().min(6).messages({
    'string.min': 'Password must be at least 6 characters long',
  }),
  name: Joi.string().min(0).max(100).messages({
    'string.min': 'Name must be at least 0 character long',
    'string.max': 'Name must be at most 100 characters long',
  }),
  profilePicture: urlString, // string | '' | null

  // Flat fields mapped to enums/strings
  degree: degreeEnum,
  degreeLength: degreeLengthEnum,
  intakeMode: intakeModeEnum,
  stemRequired: yesNoEnum,
  f1Required: yesNoEnum,
  phoneNumber: phoneWithCountry,

  // Nested structures
  programDetails,
  personalDetails,
  schoolDetails,
  satDetails,
  actDetails,
  collegeDetails,
  greDetails,
  gmatDetails,
  ieltsDetails,
  toeflDetails,
  duolingoDetails,
  experienceDetails,

  // Simple text areas
  leadershipActivities: Joi.string().allow(null, ''),
  researchPublications: Joi.string().allow(null, ''),
  certifications: Joi.string().allow(null, ''),

  // Visa & plan
  visa,
  status: statusEnum,
  isFeePaid: Joi.boolean(),
  planDetails,

  // Auth/identity meta
  isVerified: Joi.boolean(),
  googleId: Joi.string().allow(null, ''),
  facebookId: Joi.string().allow(null, ''),
  provider: providerEnum,
  role: Joi.string().valid('STUDENT'),
  lastLogin: Joi.date().allow(null, ''),

  // Explicitly disallow server-managed fields if they sneak in
  createdAt: Joi.forbidden(),
  updatedAt: Joi.forbidden(),
  _id: Joi.forbidden(),
})
  .unknown(false)  // block fields not in the model
  .min(1)          // require at least one field to update
  .prefs({ abortEarly: false }); // collect all errors in one go

// ############ PROFILE Validation END ################



// ############ MEMBER Validation ################
export const ValidateMemberCreate = Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('ADMIN', 'EDITOR', 'VIEWER').required(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'INVITED').default('INVITED'),
     bio: Joi.string().trim().allow('', null),
  phone: Joi.string().trim().allow('', null),
  address: Joi.string().trim().allow('', null),
  profilePicture: Joi.string().allow('', null),
});

export const ValidateMemberUpdate = Joi.object({
    firstName: Joi.string().trim().allow(null),
    lastName: Joi.string().trim().allow(null),
    email: Joi.string().email().allow(null),
    phone: Joi.string().trim().allow(null),
    address: Joi.string().trim().allow(null),
    profilePicture: Joi.string().allow(null),
    bio: Joi.string().trim().allow(null),
    role: Joi.string().valid('ADMIN', 'EDITOR', 'VIEWER').allow(null), // Allow for admin updates
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'INVITED').allow(null) // Allow for admin updates
}).or('firstName', 'lastName', 'email', 'phone', 'address', 'profilePicture', 'role', 'status', 'bio').unknown(false);


export const ValidatePasswordUpdate = Joi.object({
    oldPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().min(6).required().valid(Joi.ref('newPassword'))
}).unknown(false);


export const ValidateMembersQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
}).unknown(false);

// ############ MEMBER Validation END ################


// ############ CATEGORY Validation ################
export const ValidateCategory = Joi.object({
    name: Joi.string().trim().optional(),
    description: Joi.string().trim().allow(null)
}).unknown(false);


// ############ CATEGORY Validation END ################

// ############ FAQ Validation ################
export const ValidateFaq = Joi.object({
    question: Joi.string().trim().optional(),
    answer: Joi.string().trim().optional(),
    categoryId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'categoryId must be a valid 24-character hexadecimal string',
            'any.required': 'categoryId is required'
        })
}).unknown(false);

// ############ FAQ Validation END ################


// ############ LOAN Validation ################
export const ValidateLoanApplication = Joi.object({
    name: Joi.string().trim().required(),
    phoneNumber: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    pinCode: Joi.string().trim().required(),
    address: Joi.string().trim().required(),
    admissionTerm: Joi.string().trim().required(),
    admissionStatus: Joi.string().trim().required(),
    coBorrower: Joi.object({
        name: Joi.string().trim().required(),
        universitiesReceivedAdmitFrom: Joi.array().items(Joi.string().trim()).required()
    }).required(),

}).unknown(false);

export const ValidateLoanQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').optional(),
    search: Joi.string().trim().optional(),
    admissionTerm: Joi.string().trim().optional(),
    admissionStatus: Joi.string().trim().optional(),
}).unknown(false);
// ############ LOAN Validation END ################


// ############ UNIVERSITY Validation ################
export const ValidateUniversityCreate = Joi.object({
    name: Joi.string().trim().required(),
    logo: Joi.string().trim().uri().allow(null),
    banner: Joi.string().trim().uri().allow(null),
    description: Joi.string().trim().allow(null),
    website_url: Joi.string().trim().uri().allow(null),
    location: Joi.string().trim().allow(null),
    university_type: Joi.string().trim().allow(null),
    address: Joi.string().trim().allow(null),
    program: Joi.string().trim().required(),
    university_category: Joi.string().trim().allow(null),
    ranking: Joi.object({
        international: Joi.number().min(0).allow(null),
        national: Joi.number().min(0).allow(null)
    }).allow(null),
    acceptance_rate: Joi.number().min(0).max(100).allow(null),
    living_cost_per_year: Joi.number().min(0).allow(null),
    tuition_fees_per_year: Joi.number().min(0).allow(null),
    application_fee: Joi.number().min(0).allow(null),
    application_deadline: Joi.date().allow(null)
}).unknown(false);

export const ValidateUniversityUpdate = Joi.object({
    name: Joi.string().trim(),
    logo: Joi.string().trim().uri().allow(null),
    banner: Joi.string().trim().uri().allow(null),
    description: Joi.string().trim().allow(null),
    website_url: Joi.string().trim().uri().allow(null),
    location: Joi.string().trim().allow(null),
    university_type: Joi.string().trim().allow(null),
    address: Joi.string().trim().allow(null),
    program: Joi.string().trim(),
    university_category: Joi.string().trim().allow(null),
    ranking: Joi.object({
        international: Joi.number().min(0).allow(null),
        national: Joi.number().min(0).allow(null)
    }).allow(null),
    acceptance_rate: Joi.number().min(0).max(100).allow(null),
    living_cost_per_year: Joi.number().min(0).allow(null),
    tuition_fees_per_year: Joi.number().min(0).allow(null),
    application_fee: Joi.number().min(0).allow(null),
    application_deadline: Joi.date().allow(null)
}).or('name', 'logo', 'banner', 'description', 'website_url', 'location', 'university_type', 'address', 'program', 'university_category', 'ranking', 'acceptance_rate', 'living_cost_per_year', 'tuition_fees_per_year', 'application_fee', 'application_deadline').unknown(false);

export const ValidateUniversityQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    name: Joi.string().trim().optional(),
    program: Joi.string().trim().optional(),
    university_type: Joi.string().trim().optional(),
    university_category: Joi.string().trim().optional(),
    min_acceptance_rate: Joi.number().min(0).max(100).optional(),
    max_acceptance_rate: Joi.number().min(0).max(100).optional(),
    min_living_cost_per_year: Joi.number().min(0).optional(),
    max_living_cost_per_year: Joi.number().min(0).optional(),
    min_tuition_fees_per_year: Joi.number().min(0).optional(),
    max_tuition_fees_per_year: Joi.number().min(0).optional(),
    min_application_fee: Joi.number().min(0).optional(),
    max_application_fee: Joi.number().min(0).optional(),
    status: Joi.string().optional(), // If status is added later
    search: Joi.string().trim().optional()
}).unknown(false);
// ############ UNIVERSITY Validation END ################


// ############# STUDENT MANAGEMENT ADMIN SIDE #############################
export const getStudentsSchema = Joi.object({
    page: Joi.number()
        .min(1)
        .default(1)
        .label('Page')
        .error((errors) => errors.map((error) => {
            if (error.code === 'number.min') return new Error('Page must be greater than or equal to 1');
            return error;
        })),
    limit: Joi.number()
        .min(1)
        .max(100)
        .default(10)
        .label('Limit')
        .error((errors) => errors.map((error) => {
            if (error.code === 'number.min') return new Error('Limit must be greater than or equal to 1');
            if (error.code === 'number.max') return new Error('Limit must be less than or equal to 100');
            return error;
        })),
    search: Joi.string()
        .optional()
        .allow('')
        .label('Search')
        .error((errors) => errors.map((error) => error)),
    status: Joi.string()
        .valid('PENDING', 'ACTIVE', 'COMPLETE', 'REJECTED')
        .optional()
        .label('Status')
        .error((errors) => errors.map((error) => {
            if (error.code === 'any.only') return new Error('Status must be one of PENDING, ACTIVE, COMPLETE, REJECTED');
            return error;
        })),
    isVerified: Joi.boolean()
        .optional()
        .label('Is Verified')
        .error((errors) => errors.map((error) => error)),
    sortBy: Joi.string()
        .valid('createdAt', 'updatedAt')
        .default('createdAt')
        .label('Sort By')
        .error((errors) => errors.map((error) => {
            if (error.code === 'any.only') return new Error('Sort By must be createdAt or updatedAt');
            return error;
        })),
    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .label('Sort Order')
        .error((errors) => errors.map((error) => {
            if (error.code === 'any.only') return new Error('Sort Order must be asc or desc');
            return error;
        })),
})

export const studentIdSchema = Joi.object({
    studentId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .label('Student ID')
        .error((errors) => errors.map((error) => {
            switch (error.code) {
                case 'any.required':
                    return new Error('Student ID is required');
                case 'string.pattern.base':
                    return new Error('Student ID must be a valid MongoDB ObjectId');
                default:
                    return error;
            }
        })),
});


// ############# STUDENT MANAGEMENT ADMIN SIDE END #############################

// ############ QUESTIONNAIRE Validation ################
export const questionSchema = Joi.object({
    question: Joi.string().trim().required(),
    ansType: Joi.string().valid("TEXT", "MULTIPLE_CHOICE", "FILE", "DATE", "CHECKBOX", "PARAGRAPH").required(),
    options: Joi.array().items(Joi.string().trim()).default([])
        .when('ansType', {
            is: 'MULTIPLE_CHOICE',
            then: Joi.array().items(Joi.string().trim()).min(2).required(),
            otherwise: Joi.array().items(Joi.string().trim()).optional()
        })
        .when('ansType', {
            is: 'CHECKBOX',
            then: Joi.array().items(Joi.string().trim()).min(2).required(),
            otherwise: Joi.array().items(Joi.string().trim()).optional()
        })
});

export const ValidateCreateQuestionnaire = Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().trim().allow(null, ''),
    status: Joi.string().valid("ACTIVE", "DRAFT", "ARCHIVED").default("DRAFT"),
    questions: Joi.array().items(questionSchema).min(1).required()
});

export const ValidateUpdateQuestionnaire = Joi.object({
    title: Joi.string().trim().optional(),
    description: Joi.string().trim().allow(null, '').optional(),
    status: Joi.string().valid("ACTIVE", "DRAFT", "ARCHIVED").optional(),
    questions: Joi.array().items(questionSchema).optional()
});

export const ValidateDeleteQuestion = Joi.object({
    questionnaireId: Joi.string().required(),
    questionId: Joi.string().required()
});
// ############ QUESTIONNAIRE Validation END ################

// ############ SUBTASK Validation ################
export const ValidateCreateSubtask = Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().trim().allow(null, ''),
    logo: Joi.string().trim().allow(null, ''),
    priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").default("LOW"),
    questionnaireIds: Joi.array().items(Joi.string()).default([]).optional()
});

export const ValidateUpdateSubtask = Joi.object({
    title: Joi.string().trim().optional(),
    description: Joi.string().trim().allow(null, '').optional(),
    logo: Joi.string().trim().allow(null, '').optional(),
    priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").optional(),
    questionnaireIds: Joi.array().items(Joi.string()).optional()
});
// ############ SUBTASK Validation END ################

// ############ SUBTASK QUESTIONNAIRE ASSIGNMENT Validation ################
export const ValidateUpdateSubtaskQuestionnaireAssignment = Joi.object({
    assignmentId: Joi.string().required(),
    status: Joi.string().valid("PENDING", "IN_PROGRESS", "COMPLETED").required()
});
// ############ SUBTASK QUESTIONNAIRE ASSIGNMENT Validation END ################


// ############ TASK Validation ################
export const ValidateCreateTask = Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().trim().allow(null, ''),
    logo: Joi.string().trim().allow(null, ''),
    priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").default("MEDIUM"),
    assignee: Joi.string().optional(),
    isDefault: Joi.boolean().default(false),
    createdDate: Joi.date().default(Date.now),
    studentIds: Joi.array().items(Joi.string()).default([]).optional(),
    subtaskIds: Joi.array().items(Joi.string()).default([]).optional(),
    category: Joi.string().optional() // Optional category ID
});

export const ValidateUpdateTask = Joi.object({
    title: Joi.string().trim().optional(),
    description: Joi.string().trim().allow(null, '').optional(),
    logo: Joi.string().trim().allow(null, '').optional(),
    priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").optional(),
    assignee: Joi.string().optional(),
    isDefault: Joi.boolean().optional(),
    createdDate: Joi.date().optional(),
    category: Joi.string().optional() // Optional category ID
});

export const ValidateCreateTaskCategory = Joi.object({
    name: Joi.string().trim().required(),
    description: Joi.string().trim().allow(null, '')
});

export const ValidateUpdateTaskCategory = Joi.object({
    name: Joi.string().trim().optional(),
    description: Joi.string().trim().allow(null, '').optional()
});

export const ValidateAddSubtasksToTask = Joi.object({
    subtaskIds: Joi.array().items(Joi.string()).min(0).required()
});

export const ValidateRemoveSubtasksFromTask = Joi.object({
    subtaskIds: Joi.array().items(Joi.string()).min(1).required()
});

export const ValidateUpdateTaskSubtaskAssignment = Joi.object({
    assignmentId: Joi.string().required(),
    status: Joi.string().valid("PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED").optional(),
    isLocked: Joi.boolean().optional(),
    dueDate: Joi.date().allow(null).optional()
});
// ############ TASK Validation END ################

// ############ STUDENT TASK ASSIGNMENT Validation ################
export const ValidateAddStudentsToTask = Joi.object({
    studentIds: Joi.array().items(Joi.string()).min(1).required()
});

export const ValidateUpdateStudentTaskAssignment = Joi.object({
    assignmentId: Joi.string().required(),
    status: Joi.string().valid("PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED").optional(),
    isLocked: Joi.boolean().optional(),
    dueDate: Joi.date().allow(null).optional()
});

export const ValidateRemoveStudentFromTask = Joi.object({
    studentId: Joi.string().required()
});
// ############ STUDENT TASK ASSIGNMENT Validation END ################

// ############ Admin Side Document Manager ################

// Validation for creating a document
export const ValidateCreateDocument = Joi.object({
    studentId: Joi.string().required().messages({
        'string.base': 'Student ID must be a valid ObjectId',
        'any.required': 'Student ID is required'
    }),
    taskId: Joi.string().required().messages({
        'string.base': 'Task ID must be a valid ObjectId',
        'any.required': 'Task ID is required'
    }),
    subtaskId: Joi.string().required().messages({
        'string.base': 'Subtask ID must be a valid ObjectId',
        'any.required': 'Subtask ID is required'
    }),
    fileUrl: Joi.string().uri().required().messages({
        'string.uri': 'File URL must be a valid URL',
        'any.required': 'File URL is required'
    }),
    fileName: Joi.string().trim().required().messages({
        'string.base': 'File name must be a string',
        'any.required': 'File name is required'
    }),
    fileSize: Joi.number().optional().allow(null).messages({
        'number.base': 'File size must be a number'
    }),
    fileType: Joi.string().trim().required().valid('PDF', 'DOCX', 'JPG', 'PNG').messages({
        'string.base': 'File type must be a string',
        'any.required': 'File type is required',
        'any.only': 'File type must be one of PDF, DOCX, JPG, PNG'
    })
});

// Validation for updating a document
export const ValidateUpdateDocument = Joi.object({

    studentId: Joi.string().optional().messages({
        'string.base': 'Student ID must be a valid ObjectId'
    }),
    taskId: Joi.string().optional().messages({
        'string.base': 'Task ID must be a valid ObjectId'
    }),
    subtaskId: Joi.string().optional().messages({
        'string.base': 'Subtask ID must be a valid ObjectId'
    }),
    fileUrl: Joi.string().uri().optional().messages({
        'string.uri': 'File URL must be a valid URL'
    }),
    fileName: Joi.string().trim().optional().messages({
        'string.base': 'File name must be a string'
    }),
    fileSize: Joi.number().optional().allow(null).messages({
        'number.base': 'File size must be a number'
    }),
    fileType: Joi.string().trim().optional().valid('PDF', 'DOCX', 'JPG', 'PNG').messages({
        'string.base': 'File type must be a string',
        'any.only': 'File type must be one of PDF, DOCX, JPG, PNG'
    }),
    status: Joi.string().valid('PENDING', 'VERIFIED', 'REJECTED').optional().messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of PENDING, VERIFIED, REJECTED'
    })
});


// Validation for filtering documents
export const ValidateFilterDocuments = Joi.object({
    status: Joi.string().valid('PENDING', 'VERIFIED', 'REJECTED').optional().messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of PENDING, VERIFIED, REJECTED'
    }),
    uploader: Joi.string().optional().messages({
        'string.base': 'Uploader ID must be a valid ObjectId'
    }),
    studentId: Joi.string().optional().messages({
        'string.base': 'Student ID must be a valid ObjectId'
    }),
    taskId: Joi.string().optional().messages({
        'string.base': 'Task ID must be a valid ObjectId'
    }),
    subtaskId: Joi.string().optional().messages({
        'string.base': 'Subtask ID must be a valid ObjectId'
    }),
    page: Joi.number().integer().min(1).optional().default(1).messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).optional().default(10).messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1'
    }),
    // Advanced search parameters
    search: Joi.string().optional().messages({
        'string.base': 'Search must be a string'
    }),
    sortBy: Joi.string().valid('name', 'created', 'uploaded', 'size', 'status', 'type').optional().messages({
        'string.base': 'Sort by must be a string',
        'any.only': 'Sort by must be one of: name, created, uploaded, size, status, type'
    }),
    sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
        'string.base': 'Sort order must be a string',
        'any.only': 'Sort order must be either asc or desc'
    }),
    fileType: Joi.string().optional().messages({
        'string.base': 'File type must be a string'
    }),
    dateFrom: Joi.date().optional().messages({
        'date.base': 'Date from must be a valid date'
    }),
    dateTo: Joi.date().optional().messages({
        'date.base': 'Date to must be a valid date'
    })
});
export const ValidateGetStudentDocuments = Joi.object({
    taskId: Joi.string().required().messages({
        'string.base': 'Task ID must be a valid ObjectId',
        'any.required': 'Task ID is required'
    }),
    subtaskId: Joi.string().required().messages({
        'string.base': 'Subtask ID must be a valid ObjectId',
        'any.required': 'Subtask ID is required'
    }),
    page: Joi.number().integer().min(1).optional().default(1).messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).optional().default(10).messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1'
    })
});
// ############ Admin Side Document Manager END ################

// ############ Admin Side Student University Assignment ################

// Validation for creating a student-university assignment
export const ValidateCreateStudentUniversityAssignment = Joi.object({
    studentId: Joi.string().required().messages({
        'string.base': 'Student ID must be a valid ObjectId',
        'any.required': 'Student ID is required'
    }),
    universityId: Joi.string().required().messages({
        'string.base': 'University ID must be a valid ObjectId',
        'any.required': 'University ID is required'
    }),
    admissionStatus: Joi.string().trim().optional().allow(null).messages({
        'string.base': 'Admission status must be a string'
    }),
    admissionComments: Joi.string().trim().optional().allow(null).messages({
        'string.base': 'Admission comments must be a string'
    }),
    universityStatus: Joi.string().trim().valid('Safe', 'Achievable', 'Ambitious', 'Very Ambitious', 'Can Try').optional().allow(null).messages({
        'string.base': 'University status must be a string',
        'any.only': 'University status must be one of Safe, Achievable, Ambitious, Very Ambitious, Can Try'
    })
});

// Validation for updating a student-university assignment
export const ValidateUpdateStudentUniversityAssignment = Joi.object({
    studentId: Joi.string().optional().messages({
        'string.base': 'Student ID must be a valid ObjectId'
    }),
    universityId: Joi.string().optional().messages({
        'string.base': 'University ID must be a valid ObjectId'
    }),
    admissionStatus: Joi.string().trim().optional().allow(null).messages({
        'string.base': 'Admission status must be a string'
    }),
    admissionComments: Joi.string().trim().optional().allow(null).messages({
        'string.base': 'Admission comments must be a string'
    }),
    universityStatus: Joi.string().trim().valid('Safe', 'Achievable', 'Ambitious', 'Very Ambitious', 'Can Try').optional().allow(null).messages({
        'string.base': 'University status must be a string',
        'any.only': 'University status must be one of Safe, Achievable, Ambitious, Very Ambitious, Can Try'
    })
});

// Validation for filtering student-university assignments
export const ValidateFilterStudentUniversityAssignments = Joi.object({
    studentId: Joi.string().optional().messages({
        'string.base': 'Student ID must be a valid ObjectId'
    }),
    universityId: Joi.string().optional().messages({
        'string.base': 'University ID must be a valid ObjectId'
    }),
    admissionStatus: Joi.string().trim().optional().allow(null).messages({
        'string.base': 'Admission status must be a string'
    }),
    universityStatus: Joi.string().trim().valid('Safe', 'Achievable', 'Ambitious', 'Very Ambitious', 'Can Try').optional().allow(null).messages({
        'string.base': 'University status must be a string',
        'any.only': 'University status must be one of Safe, Achievable, Ambitious, Very Ambitious, Can Try'
    }),
    page: Joi.number().integer().min(1).optional().default(1).messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).optional().default(10).messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1'
    })
});
// ############ Admin Side Student University Assignment END ################

// ############ Student Assign University  ################

export const ValidateFilterAssignedUniversities = Joi.object({
    universityId: Joi.string().optional().messages({
        'string.base': 'University ID must be a valid ObjectId'
    }),
    admissionStatus: Joi.string().trim().optional().allow(null).messages({
        'string.base': 'Admission status must be a string'
    }),
    universityStatus: Joi.string().trim().optional().allow(null).messages({
        'string.base': 'University status must be a string',
    }),
    page: Joi.number().integer().min(1).optional().default(1).messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).optional().default(10).messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1'
    }),
    sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
        'string.base': 'Sort order must be a string',
        'any.only': 'Sort order must be either asc or desc'
    })
});

export const ValidateUpdateAssignedUniversityStatus = Joi.object({
    admissionStatus: Joi.string().trim().optional().allow(null).messages({
        'string.base': 'Admission status must be a string'
    }),
    universityStatus: Joi.string().trim().optional().allow(null).messages({
        'string.base': 'University status must be a string',
    })
});


// ******************** STUDENT  TASK , SUBTASK , QUESTIONIORS ASSIGNEMENT ***********************

export const ValidateGetStudentTasks = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1).messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).optional().default(10).messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1'
    }),
    sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
        'string.base': 'Sort order must be a string',
        'any.only': 'Sort order must be either asc or desc'
    })
});

export const ValidateGetSubtaskQuestionnaires = Joi.object({
    taskId: Joi.string().required().messages({
        'string.base': 'Task ID must be a valid ObjectId',
        'any.required': 'Task ID is required'
    }),
    subtaskId: Joi.string().required().messages({
        'string.base': 'Subtask ID must be a valid ObjectId',
        'any.required': 'Subtask ID is required'
    })
});

export const ValidateGetQuestionnaireQuestions = Joi.object({
    taskId: Joi.string().required().messages({
        'string.base': 'Task ID must be a valid ObjectId',
        'any.required': 'Task ID is required'
    }),
    subtaskId: Joi.string().required().messages({
        'string.base': 'Subtask ID must be a valid ObjectId',
        'any.required': 'Subtask ID is required'
    }),
    questionnaireId: Joi.string().required().messages({
        'string.base': 'Questionnaire ID must be a valid ObjectId',
        'any.required': 'Questionnaire ID is required'
    })
});


export const ValidateSubmitQuestionnaireResponse = Joi.object({
    taskId: Joi.string().required().messages({
        'string.base': 'Task ID must be a valid ObjectId',
        'any.required': 'Task ID is required'
    }),
    subtaskId: Joi.string().required().messages({
        'string.base': 'Subtask ID must be a valid ObjectId',
        'any.required': 'Subtask ID is required'
    }),
    questionnaireId: Joi.string().required().messages({
        'string.base': 'Questionnaire ID must be a valid ObjectId',
        'any.required': 'Questionnaire ID is required'
    }),
    responses: Joi.array().items(Joi.object({
        questionId: Joi.string().required().messages({
            'string.base': 'Question ID must be a valid ObjectId',
            'any.required': 'Question ID is required'
        }),
        answer: Joi.alternatives().try(
            Joi.string().allow(''), // TEXT, PARAGRAPH
            Joi.array().items(Joi.string()), // MULTIPLE_CHOICE, CHECKBOX
            Joi.string().uri(), // FILE
            Joi.date() // DATE
        ).required().messages({
            'any.required': 'Answer is required'
        })
    })).min(1).required().messages({
        'array.min': 'At least one response is required',
        'any.required': 'Responses array is required'
    })
});


// ******************** STUDENT  TASK , SUBTASK , QUESTIONIORS ASSIGNEMENT  END***********************

export const ValidateGetAdminStudentTaskSubtaskQuestionsDetails = Joi.object({
    studentId: Joi.string().required().messages({
        'string.base': 'Student ID must be a valid ObjectId',
        'any.required': 'Student ID is required'
    }),
    page: Joi.number().integer().min(1).optional().default(1).messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).optional().default(10).messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1'
    })
});


// ********************* APPLICATION VALIDATION **********************
// Validation for creating an application
export const ValidateCreateApplication = Joi.object({
    studentId: Joi.string().required().messages({
        'string.base': 'Student ID must be a valid ObjectId',
        'any.required': 'Student ID is required'
    }),
    universityId: Joi.string().required().messages({
        'string.base': 'University ID must be a valid ObjectId',
        'any.required': 'University ID is required'
    }),
    taskAssignments: Joi.array().items(Joi.string().required().messages({
        'string.base': 'Task Assignment ID must be a valid ObjectId',
        'any.required': 'Task Assignment ID is required'
    })).min(1).required().messages({
        'array.min': 'At least one task assignment is required',
        'any.required': 'Task assignments are required'
    }),
    assignTo: Joi.string().optional().messages({
        'string.base': 'Assign To must be a valid ObjectId'
    })
});

// Validation for updating an application
export const ValidateUpdateApplication = Joi.object({
    applicationId: Joi.string().required().messages({
        'string.base': 'Application ID must be a valid ObjectId',
        'any.required': 'Application ID is required'
    }),
    status: Joi.string().valid('UNDER_REVIEW', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'DRAFT', 'REJECTED').optional(),
    progress: Joi.number().min(0).max(100).optional(),
    taskAssignments: Joi.array().items(Joi.string().required().messages({
        'string.base': 'Task Assignment ID must be a valid ObjectId',
        'any.required': 'Task Assignment ID is required'
    })).optional(),
    assignTo: Joi.string().optional().messages({
        'string.base': 'Assign To must be a valid ObjectId'
    })
}).min(1);

// Validation for filtering applications
export const ValidateFilterApplications = Joi.object({
    status: Joi.string().valid('UNDER_REVIEW', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'DRAFT', 'REJECTED').optional(),
    studentId: Joi.string().optional(),
    universityId: Joi.string().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).optional().default(10)
});

// ********************* APPLICATION VALIDATION END **********************
//

// ############ Student Assign University  ################



export const ValidateGetStudentActivities = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).max(500).default(10).messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
    }),
    search: Joi.string().optional().allow('').messages({
        'string.base': 'Search must be a string'
    }),
    studentId: Joi.string().optional().messages({
        'string.base': 'Student ID must be a valid string'
    }),
    status: Joi.string().optional().messages({
        'any.only': 'Status must be a valid value'
    })
}).with('page', 'limit');
export const validateJoiSchema = (schema, value) => {
    const result = schema.validate(value, { abortEarly: false });
    return {
        value: result.value,
        error: result.error,
    };
};