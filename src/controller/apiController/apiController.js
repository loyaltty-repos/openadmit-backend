import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import quicker from '../../util/quicker.js';
import { uploadOnImageKit } from '../../service/imageKitService.js';
import University from '../../model/universityModel.js';
import { PAYMENT_PLANS } from '../../constant/application.js';

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    health: (req, res, next) => {
        try {
            const healthData = {
                application: quicker.getApplicationHealth(),
                system: quicker.getSystemHealth(),
                timestamp: Date.now(),
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, healthData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    uploadFile: async (req, res, next) => {
        try {
            const { body } = req



            if (!req.file) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE('No file uploaded')), req, 400)
            }

            if (!body.category) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE('Category is required')), req, 400)
            }

            const uploadedFile = await uploadOnImageKit(req.file.path, body.category)

            if (!uploadedFile) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE('File upload failed')), req, 500)
            }

            return httpResponse(req, res, 200, responseMessage.SUCCESS, uploadedFile)
        } catch (err) {
            return httpError(next, err, req, 500)
        }
    },
    findUniversities: async (req, res, next) => {
        try {
            const {
                degree,
                country,
                fieldOfStudy,

                highestEducation,
                schoolName,
                schoolBoard,
                score,
                topTenPercent,

                englishTest,
                aptitudeTest,
                apExams,

                coCurricularRating,
                extraCurricularRating,
                internshipDuration,
                internshipUnit,

                page = 1,
                limit = 10,

                // Sorting
                sortBy = 'ranking.national',
                sortOrder = 'asc'
            } = req.query;

            let query = {};

            if (country) {
                query.location = { $regex: new RegExp(country, 'i') };
            }

            if (fieldOfStudy) {
                query.program = { $regex: new RegExp(fieldOfStudy, 'i') };
            }

            if (degree) {
                if (degree.toLowerCase().includes('bachelor') || degree.toLowerCase().includes('undergraduate')) {
                    query.university_category = { $regex: new RegExp('undergraduate|bachelor', 'i') };
                } else if (degree.toLowerCase().includes('master') || degree.toLowerCase().includes('graduate')) {
                    query.university_category = { $regex: new RegExp('graduate|master', 'i') };
                } else if (degree.toLowerCase().includes('phd') || degree.toLowerCase().includes('doctoral')) {
                    query.university_category = { $regex: new RegExp('doctoral|phd', 'i') };
                }
            }

            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const skip = (pageNum - 1) * limitNum;

            let sort = {};
            if (sortBy) {
                const order = sortOrder === 'desc' ? -1 : 1;
                if (sortBy === 'ranking') {
                    sort['ranking.national'] = order;
                } else if (sortBy === 'tuition') {
                    sort['tuition_fees_per_year'] = order;
                } else if (sortBy === 'acceptance_rate') {
                    sort['acceptance_rate'] = order;
                } else if (sortBy === 'name') {
                    sort['name'] = order;
                } else {
                    sort[sortBy] = order;
                }
            }

            const universities = await University.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean();

            const totalCount = await University.countDocuments(query);
            const totalPages = Math.ceil(totalCount / limitNum);

            const formattedUniversities = universities.map(university => {
                let matchAnalysis = {
                    academicFit: 0,
                    testScoreCompatibility: 0,
                    extracurricularMatch: 0,
                    locationPreference: 0,
                    programAlignment: 0,
                    financialFeasibility: 0,
                    admissionProbability: 0
                };

                let academicScore = 0;

                if (score) {
                    const numericScore = parseFloat(score);
                    if (numericScore >= 95) academicScore += 25;
                    else if (numericScore >= 90) academicScore += 22;
                    else if (numericScore >= 85) academicScore += 18;
                    else if (numericScore >= 80) academicScore += 15;
                    else if (numericScore >= 75) academicScore += 12;
                    else academicScore += 8;
                }

                if (topTenPercent === 'true' || topTenPercent === true) {
                    academicScore += 10;
                }

                if (highestEducation) {
                    const education = highestEducation.toLowerCase();
                    if (degree) {
                        const targetDegree = degree.toLowerCase();
                        if (
                            (education.includes('12th') && targetDegree.includes('bachelor')) ||
                            (education.includes('bachelor') && targetDegree.includes('master')) ||
                            (education.includes('master') && targetDegree.includes('phd'))
                        ) {
                            academicScore += 15;
                        }
                    }
                }

                if (schoolBoard) {
                    const board = schoolBoard.toLowerCase();
                    if (board.includes('cbse') || board.includes('icse') || board.includes('ib')) {
                        academicScore += 5;
                    }
                }

                matchAnalysis.academicFit = Math.min(academicScore, 100);

                let testScore = 0;

                if (englishTest) {
                    const test = englishTest.toLowerCase();
                    if (test.includes('ielts')) testScore += 15;
                    else if (test.includes('toefl')) testScore += 15;
                    else if (test.includes('pte')) testScore += 12;
                    else if (test.includes('duolingo')) testScore += 10;
                }

                if (aptitudeTest) {
                    const aptitude = aptitudeTest.toLowerCase();
                    if (aptitude.includes('gre')) testScore += 20;
                    else if (aptitude.includes('gmat')) testScore += 18;
                    else if (aptitude.includes('sat')) testScore += 15;
                    else if (aptitude.includes('act')) testScore += 15;
                }

                if (apExams === 'true' || apExams === true) {
                    testScore += 10;
                }

                matchAnalysis.testScoreCompatibility = Math.min(testScore, 100);

                // 3. EXTRACURRICULAR ANALYSIS (20% weight)
                let activityScore = 0;

                if (coCurricularRating && Array.isArray(coCurricularRating)) {
                    const rating = parseInt(coCurricularRating[0]) || 3;
                    activityScore += (rating * 5);
                }

                if (extraCurricularRating && Array.isArray(extraCurricularRating)) {
                    const rating = parseInt(extraCurricularRating[0]) || 3;
                    activityScore += (rating * 5);
                }

                if (internshipDuration) {
                    const duration = parseInt(internshipDuration);
                    const unit = internshipUnit?.toLowerCase() || 'weeks';

                    let internshipMonths = 0;
                    if (unit === 'weeks') internshipMonths = duration / 4;
                    else if (unit === 'months') internshipMonths = duration;

                    if (internshipMonths >= 6) activityScore += 20;
                    else if (internshipMonths >= 3) activityScore += 15;
                    else if (internshipMonths >= 1) activityScore += 10;
                    else if (internshipMonths > 0) activityScore += 5;
                }

                matchAnalysis.extracurricularMatch = Math.min(activityScore, 100);

                let alignmentScore = 0;

                if (country && university.location && university.location.toLowerCase().includes(country.toLowerCase())) {
                    alignmentScore += 50;
                }

                if (fieldOfStudy && university.program) {
                    const fieldWords = fieldOfStudy.toLowerCase().split(' ');
                    const programWords = university.program.toLowerCase().split(' ');
                    const matchingWords = fieldWords.filter(word =>
                        programWords.some(pWord => pWord.includes(word) || word.includes(pWord))
                    );
                    alignmentScore += (matchingWords.length / fieldWords.length) * 50;
                }

                matchAnalysis.locationPreference = alignmentScore >= 50 ? 100 : 0;
                matchAnalysis.programAlignment = Math.min(alignmentScore, 100);

                let admissionProb = 85;

                if (university.acceptance_rate) {
                    if (university.acceptance_rate <= 10) admissionProb -= 30;
                    else if (university.acceptance_rate <= 25) admissionProb -= 15;
                    else if (university.acceptance_rate <= 50) admissionProb -= 5;
                }

                if (matchAnalysis.academicFit >= 80) admissionProb += 10;
                else if (matchAnalysis.academicFit >= 60) admissionProb += 5;
                else if (matchAnalysis.academicFit < 40) admissionProb -= 15;

                if (matchAnalysis.testScoreCompatibility >= 80) admissionProb += 5;
                else if (matchAnalysis.testScoreCompatibility < 40) admissionProb -= 10;

                matchAnalysis.admissionProbability = Math.max(5, Math.min(admissionProb, 95));

                let financialScore = 80;
                if (university.tuition_fees_per_year) {
                    if (university.tuition_fees_per_year > 60000) financialScore -= 20;
                    else if (university.tuition_fees_per_year > 40000) financialScore -= 10;
                    else if (university.tuition_fees_per_year > 20000) financialScore -= 5;
                }
                matchAnalysis.financialFeasibility = financialScore;

                const overallMatch = (
                    (matchAnalysis.academicFit * 0.30) +
                    (matchAnalysis.testScoreCompatibility * 0.25) +
                    (matchAnalysis.extracurricularMatch * 0.20) +
                    (matchAnalysis.programAlignment * 0.15) +
                    (matchAnalysis.admissionProbability * 0.10)
                );

                const matchPercentage = Math.round(Math.max(45, Math.min(overallMatch, 99)));

                // Generate AI suggestions
                const suggestions = [];
                if (matchAnalysis.academicFit < 70) {
                    suggestions.push("Consider improving academic scores or taking advanced courses");
                }
                if (matchAnalysis.testScoreCompatibility < 60) {
                    suggestions.push("Take standardized tests (IELTS/TOEFL, GRE/GMAT) to improve compatibility");
                }
                if (matchAnalysis.extracurricularMatch < 50) {
                    suggestions.push("Engage in more co-curricular activities and gain internship experience");
                }

                let matchLevel = 'Poor';
                if (matchPercentage >= 85) matchLevel = 'Excellent';
                else if (matchPercentage >= 75) matchLevel = 'Very Good';
                else if (matchPercentage >= 65) matchLevel = 'Good';
                else if (matchPercentage >= 55) matchLevel = 'Fair';

                return {
                    _id: university._id,
                    name: university.name,
                    matchPercentage: `${matchPercentage}%`,
                    matchLevel: matchLevel,
                    location: university.location || 'Location not specified',
                    universityType: university.university_type || 'Private',
                    tuitionFee: university.tuition_fees_per_year ? `${university.tuition_fees_per_year.toLocaleString()}` : 'Contact University',
                    program: university.program,
                    ranking: {
                        national: university.ranking?.national ? `#${university.ranking.national} in National Universities` : 'Ranking not available',
                        international: university.ranking?.international || null
                    },
                    acceptanceRate: university.acceptance_rate ? `${university.acceptance_rate}%` : 'Not specified',
                    logo: university.logo,
                    banner: university.banner,
                    description: university.description,
                    website_url: university.website_url,
                    living_cost_per_year: university.living_cost_per_year,
                    application_fee: university.application_fee,
                    application_deadline: university.application_deadline,

                    aiAnalysis: {
                        academicFit: `${Math.round(matchAnalysis.academicFit)}%`,
                        testScoreCompatibility: `${Math.round(matchAnalysis.testScoreCompatibility)}%`,
                        extracurricularMatch: `${Math.round(matchAnalysis.extracurricularMatch)}%`,
                        programAlignment: `${Math.round(matchAnalysis.programAlignment)}%`,
                        admissionProbability: `${Math.round(matchAnalysis.admissionProbability)}%`,
                        financialFeasibility: `${Math.round(matchAnalysis.financialFeasibility)}%`,
                        overallRecommendation: matchLevel
                    },

                    improvementSuggestions: suggestions,

                    detailedAnalysis: {
                        strengths: (() => {
                            const strengths = [];
                            if (matchAnalysis.academicFit >= 80) strengths.push("Strong academic background");
                            if (matchAnalysis.testScoreCompatibility >= 70) strengths.push("Good test score profile");
                            if (matchAnalysis.extracurricularMatch >= 70) strengths.push("Excellent extracurricular profile");
                            if (matchAnalysis.programAlignment >= 80) strengths.push("Perfect program match");
                            return strengths;
                        })(),

                        weaknesses: (() => {
                            const weaknesses = [];
                            if (matchAnalysis.academicFit < 60) weaknesses.push("Academic scores need improvement");
                            if (matchAnalysis.testScoreCompatibility < 50) weaknesses.push("Missing required test scores");
                            if (matchAnalysis.extracurricularMatch < 50) weaknesses.push("Limited extracurricular activities");
                            if (university.acceptance_rate && university.acceptance_rate < 20) weaknesses.push("Highly competitive admission");
                            return weaknesses;
                        })(),

                        nextSteps: (() => {
                            const steps = [];
                            if (!englishTest) steps.push("Take IELTS/TOEFL exam");
                            if (!aptitudeTest && degree?.toLowerCase().includes('master')) steps.push("Consider taking GRE/GMAT");
                            if (matchAnalysis.extracurricularMatch < 60) steps.push("Gain more internship/work experience");
                            steps.push("Prepare strong personal statement and essays");
                            return steps;
                        })()
                    }
                };
            });

            const responseData = {
                universities: formattedUniversities,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1,
                    limit: limitNum
                },
                filters: {
                    degree,
                    country,
                    fieldOfStudy,
                    sortBy,
                    sortOrder
                }
            };

            return httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            return httpError(next, err, req, 500);
        }
    },
    
    getPlanDetails: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS, PAYMENT_PLANS);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
};
