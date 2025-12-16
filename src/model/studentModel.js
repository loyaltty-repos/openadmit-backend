import mongoose from "mongoose";
import { EAuthProvider } from "../constant/application.js";
const studentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    name: {
        type: String,
        default: null,
    },
    profilePicture: {
        type: String,
        default: null,
    },
    degree: {
        type: String,
        enum: ['BACHELOR', 'MASTER', 'MBA', 'PHD', 'OTHER'],
        default: 'MASTER'
    },
    degreeLength: {
        type: String,
        enum: ['2 YEARS', '3 YEARS', '4 YEARS', '5 YEARS', 'OTHER'],
        default: null
    },
    programDetails: {
        program: {
            type: String,
            default: null
        },
        intake: {
            type: String,
            default: null
        },
        duration: {
            type: String,
            default: null
        },
        validity: {
            type: Date,
            default: null
        }
    },
    intakeMode: {
        type: String,
        enum: ['BASIC', 'ADVANCED'],
        default: null
    },
    stemRequired: {
        type: String,
        enum: ['YES', 'NO'],
        default: null
    },
    f1Required: {
        type: String,
        enum: ['YES', 'NO'],
        default: null
    },
    phoneNumber: {
        type: String,
        default: null
    },
    personalDetails: {
        dob: {
            type: Date,
            default: null
        },
        gender: {
            type: String,
            enum: ['MALE', 'FEMALE', 'OTHER', ""],
            default: null
        },
        address: {
            type: String,
            default: null
        },
        profession: {
            type: String,
            default: null
        }
    },
    schoolDetails: {
        schoolName: {
            type: String,
            default: null
        },
        board: {
            type: String,
            default: null
        },
        yearOfPassing: {
            type: Number,
            default: null
        },
        percentage: {
            type: Number,
            default: null
        }
    },
    satDetails: {
        satPlan: {
            type: Date,
            default: null
        },
        satDate: {
            type: Date,
            default: null
        },
        satScoreCard: {
            type: String,
            default: null
        },
        satScore: {
            readingWriting: {
                type: Number,
                default: null
            },
            math: {
                type: Number,
                default: null
            },
            total: {
                type: Number,
                default: null
            }
        }

    },
    actDetails: {
        actPlan: {
            type: Date,
            default: null
        },
        actDate: {
            type: Date,
            default: null
        },
        actScoreCard: {
            type: String,
            default: null
        },
        actScore: {
            english: {
                type: Number,
                default: null
            },
            math: {
                type: Number,
                default: null
            },
            total: {
                type: Number,
                default: null
            }
        }

    },
    collegeDetails: {
        branch: {
            type: String,
            default: null
        },
        highestDegree: {
            type: String,
            default: null
        },
        university: {
            type: String,
            default: null
        },
        college: {
            type: String,
            default: null
        },
        tier: {
            type: String,
            enum: ['IIT', 'NIT', 'TIER 1', 'TIER 2', 'TIER 3', 'OTHER'],
            default: null
        },
        gpa: {
            type: Number,
            default: null
        },
        gpaScale: {
            type: Number,
            default: null
        },
        toppersGPA: {
            type: Number,
            default: null
        },
        noOfBacklogs: {
            type: Number,
            default: null
        },
        admissionTerm: {
            type: String,
            default: null
        },
        coursesApplying: {
            type: [String],
            default: null
        }
    },
    greDetails: {
        grePlan: {
            type: Date,
            default: null
        },
        greDate: {
            type: Date,
            default: null
        },
        greScoreCard: {
            type: String,
            default: null
        },
        greScore: {
            verbal: {
                type: Number,
                default: null
            },
            quant: {
                type: Number,
                default: null
            },
            awa: {
                type: Number,
                default: null
            }
        },
        retakingGRE: {
            type: String,
            default: null
        }
    },
    gmatDetails: {
        gmatPlan: {
            type: Date,
            default: null
        },
        gmatDate: {
            type: Date,
            default: null
        },
        gmatScoreCard: {
            type: String,
            default: null
        },
        gmatScore: {
            verbal: {
                type: Number,
                default: null
            },
            quant: {
                type: Number,
                default: null
            },
            total: {
                type: Number,
                default: null
            }
        },
        retakingGMAT: {
            type: String,
            default: null
        }
    },
    ieltsDetails: {
        ieltsPlan: {
            type: Date,
            default: null
        },
        ieltsDate: {
            type: Date,
            default: null
        },
        ieltsScore: {
            reading: {
                type: Number,
                default: null
            },
            writing: {
                type: Number,
                default: null
            },
            speaking: {
                type: Number,
                default: null
            },
            listening: {
                type: Number,
                default: null
            }
        },
        retakingIELTS: {
            type: String,
            default: null
        }
    },
    duolingoDetails: {
        duolingoPlan: {
            type: Date,
            default: null
        },
        duolingoDate: {
            type: Date,
            default: null
        },
        duolingoScore: {
           reading: {
                type: Number,
                default: null
            },
            writing: {
                type: Number,
                default: null
            },
            speaking: {
                type: Number,
                default: null
            },
            listening: {
                type: Number,
                default: null
            }
        },
        retakingDuolingo: {
            type: String,
            default: null
        }
    },
    toeflDetails: {
        toeflPlan: {
            type: Date,
            default: null
        },
        toeflDate: {
            type: Date,
            default: null
        },
        toeflScore: {
            reading: {
                type: Number,
                default: null
            },
            writing: {
                type: Number,
                default: null
            },
            speaking: {
                type: Number,
                default: null
            },
            listening: {
                type: Number,
                default: null
            }
        },
        retakingTOEFL: {
            type: String,
            default: null
        }
    },
    experienceDetails: {
        totalExperience: {
            type: Number,
            default: null
        },
        experienceIndustry: {
            type: String,
            default: null
        }
    },
    leadershipActivities: {
        type: String,
        default: null
    },
    researchPublications: {
        type: String,
        default: null
    },
    certifications: {
        type: String,
        default: null
    },
    visa: {
        countriesPlanningToApply: {
            type: [String],
            default: null
        },
        visaInterviewDate: {
            type: Date,
            default: null
        },
        visaInterviewLocation: {
            type: String,
            default: null
        }
    },
    status: {
        type: String,
        enum: ["PENDING", "ACTIVE", "COMPLETE", "REJECTED"],
        default: "PENDING"
    },
    isFeePaid: {
        type: Boolean,
        default: false
    },
    universityFinderLlmResponseLimit:{
        type: Number,
        default: 5
    },
    planDetails: {
        course: {
            type: String,
            default: null
        },
        planId: {
            type: String,
            default: null
        },
        planName: {
            type: String,
            default: null
        },
        planPrice: {
            type: Number,
            default: null
        },
        planBuyDate: {
            type: Date,
            default: Date.now()
        },
        receiptLink: {
            type: String,

        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        default: null
    },
    facebookId: {
        type: String,
        default: null
    },
    provider: {
        type: String,
        enum: [...Object.values(EAuthProvider)],
        default: 'LOCAL'
    },
    role: {
        type: String,
        default: "STUDENT"
    },

    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

studentSchema.statics.findByEmail = function (email) {
    return this.findOne({ email });
};

studentSchema.statics.findByGoogleId = function (googleId) {
    return this.findOne({ googleId });
};

studentSchema.statics.findByFacebookId = function (facebookId) {
    return this.findOne({ facebookId });
};

studentSchema.methods.comparePassword = async function (password) {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, this.password);
};

studentSchema.methods.isAccountConfirmed = function () {
    return this.isVerified;
};

const Student = mongoose.model('Student', studentSchema);
export default Student