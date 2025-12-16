import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { ValidateFilterAssignedUniversities, ValidateGetQuestionnaireQuestions, ValidateGetStudentTasks, ValidateGetSubtaskQuestionnaires, ValidateProfileUpdate, ValidateSubmitQuestionnaireResponse, ValidateUpdateAssignedUniversityStatus, validateJoiSchema } from '../../service/validationService.js';
import Student from '../../model/studentModel.js';
import StudentUniversityAssignment from '../../model/studentUniversityAssignmentModel.js';
import mongoose from 'mongoose';
import TaskSubtaskAssignment from '../../model/taskSubtaskAssignmentModel.js';
import SubtaskQuestionnaireAssignment from '../../model/subtaskQuestionnaireAssignmentModel.js';
import Task from '../../model/taskModel.js';
import Subtask from '../../model/subtaskModel.js';
import mailer from '../../service/email.service.js';
import config from '../../config/config.js';
import { AdminQuestionnaireSubmissionTemplate, QuestionnaireSubmissionTemplate } from '../../service/emailTemplates.js';
import Questionnaire from '../../model/questionnaireModel.js';
import Response from '../../model/responseModel.js';
import StudentActivity from '../../model/studentActivitySchema.js';
import UniversityRecommendation from '../../model/UniversityRecommendation.js';
import { ACTIVITY_STATUSES, ACTIVITY_TYPES } from '../../constant/application.js';
import StudentTaskAssignment from '../../model/studentTaskAssignmentModel.js';
import { getUniversitiesAccurate, getUniversitiesFast, } from '../../util/universityFinder.js';
import { assign } from 'nodemailer/lib/shared/index.js';

export default {
    getSelfData: async (req, res, next) => {
        try {
            const student = await Student.findById(req.authenticatedStudent._id).select('-password');
            if (!student) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Student')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, student);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    updateProfile: async (req, res, next) => {
        try {
            const studentId = req.authenticatedStudent._id;
            const updateData = req.body;

            // Validate update data
            // const validationResult = validateJoiSchema(ValidateProfileUpdate, updateData);
            // if (validationResult.error) {
            //     return httpError(next, validationResult.error, req, 422);
            // }

            // Prevent changes to isFeePaid, isVerified, and role
            const restrictedFields = ['isFeePaid', 'isVerified', 'role', "password"];
            restrictedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE(`Cannot update ${field}`)), req, 403);
                }
            });

            // Update only the provided fields
            const updatedStudent = await Student.findByIdAndUpdate(
                studentId,
                { $set: updateData },
                { new: true, runValidators: true, select: '-password' }
            );

            if (!updatedStudent) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Student')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedStudent);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get all universities assigned to the authenticated student with pagination and filtering
    getAssignedUniversities: async (req, res, next) => {
        try {
            // Validate filter query
            const { value, error } = validateJoiSchema(ValidateFilterAssignedUniversities, { ...req.query });
            if (error) return httpError(next, error, req, 422);

            const { universityId, admissionStatus, universityStatus, page, limit, sortOrder } = value;
            const skip = (page - 1) * limit;

            const query = { studentId: req.authenticatedStudent._id };
            if (universityId) query.universityId = universityId;
            if (admissionStatus) query.admissionStatus = admissionStatus;
            if (universityStatus) query.universityStatus = universityStatus;

            const totalAssignments = await StudentUniversityAssignment.countDocuments(query);

            const assignments = await StudentUniversityAssignment.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ assignedAt: sortOrder === 'asc' ? 1 : -1 })
                .populate('studentId', 'name email')
                .populate('universityId')
                .populate('assignedBy', 'name email')
                .lean();

            // Pagination metadata
            const pagination = {
                total: totalAssignments,
                page,
                limit,
                totalPages: Math.ceil(totalAssignments / limit),
                hasNextPage: page < Math.ceil(totalAssignments / limit),
                hasPrevPage: page > 1
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                assignments,
                pagination
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // getLlmAssignedUniversity: async (req, res, next) => {

    //     const start = Date.now();
    //     try {

    //         console.log("Starting LLM University Finder", start);
    //         const studentId = req.authenticatedStudent._id;
    //         const { preferredSpeed } = req.query;
    //         if (!preferredSpeed || !['FAST', 'ACCURATE'].includes(preferredSpeed)) {
    //             return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("preferredSpeed query parameter is required and must be either 'FAST' or 'ACCURATE'")), req, 422);
    //         }
    //         const student = await Student.findById(studentId).lean();
    //         if (!student) {
    //             return httpError(next, new Error(responseMessage.NOT_FOUND('Student')), req, 404);
    //         }
    //        // console.log("Student Data:", student);
    //         if (student.universityFinderLlmResponseLimit <= 0) {
    //             return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("You have reached your University Finder request limit. Please contact support to increase your limit.")), req, 403);
    //         }
    //         let universityResults;
    //         if (preferredSpeed === 'FAST') {
    //             console.log("Student degree:", student.degree);
    //             universityResults = await getUniversitiesFast(student, student.degree);
    //         } else {
    //             universityResults = await getUniversitiesAccurate(student, student.degree);
    //         }
    //         student.universityFinderLlmResponseLimit -= 1;
    //         // save student limit update
    //         await Student.findByIdAndUpdate(studentId, { universityFinderLlmResponseLimit: student.universityFinderLlmResponseLimit });
    //         const end = Date.now();
    //         console.log("Completed LLM University Finder", end);
    //         console.log(`LLM University Finder (${preferredSpeed}) took ${(end - start) / 1000} s`);
    //         httpResponse(req, res, 200, responseMessage.SUCCESS, {
    //             universityResults
    //         });
    //     } catch (err) {
    //         console.log("Error occurred in LLM University Finder:", err);
    //         const end = Date.now();
    //         console.log(`LLM University Finder (${preferredSpeed}) took ${(end - start) / 1000} s`);
    //         httpError(next, err, req, 500);
    //     }
    // },

    getLlmAssignedUniversity: async (req, res, next) => {
        const start = Date.now();
        try {
            console.log("Starting LLM University Finder", start);
            const studentId = req.authenticatedStudent._id;
            const { preferredSpeed } = req.query;

            if (!preferredSpeed || !['FAST', 'ACCURATE'].includes(preferredSpeed)) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("preferredSpeed query parameter is required and must be either 'FAST' or 'ACCURATE'")), req, 422);
            }

            const student = await Student.findById(studentId).lean();
            if (!student) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Student')), req, 404);
            }

            if (student.universityFinderLlmResponseLimit <= 0) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("You have reached your University Finder request limit. Please contact support to increase your limit.")), req, 403);
            }

            let universityResults;
            let rawOutput = null; // optional: capture raw if needed

            if (preferredSpeed === 'FAST') {
                console.log("Student degree:", student.degree);
                universityResults = await getUniversitiesFast(student, student.degree);
            } else {
                universityResults = await getUniversitiesAccurate(student, student.degree);
            }

            console.log("results", universityResults)

            try {
                // Save to DB
                const recommendation = new UniversityRecommendation({
                    student: studentId,
                    mode: preferredSpeed,
                    degreeKind: student.degree || "Masters",
                    results: universityResults,
                    // rawLlmOutput: rawOutput, // if you capture it
                });

                await recommendation.save();
            } catch (error) {
                console.log("recommendation saving error", error)
            }

            // Decrement limit
            student.universityFinderLlmResponseLimit -= 1;
            await Student.findByIdAndUpdate(studentId, {
                universityFinderLlmResponseLimit: student.universityFinderLlmResponseLimit
            });

            const end = Date.now();
            console.log(`LLM University Finder (${preferredSpeed}) took ${(end - start) / 1000} s`);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {

                universityResults
            });

        } catch (err) {
            console.log("Error occurred in LLM University Finder:", err);
            const end = Date.now();
            console.log(`LLM University Finder (${preferredSpeed}) took ${(end - start) / 1000} s`);
            httpError(next, err, req, 500);
        }
    },

    // Update admissionStatus and universityStatus of an assigned university (student only)
    updateAssignedUniversityStatus: async (req, res, next) => {
        try {
            const { assignmentId } = req.params
            const { value, error } = validateJoiSchema(ValidateUpdateAssignedUniversityStatus, req.body);
            if (error) return httpError(next, error, req, 422);
            if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("Assignent ID Required")), req, 404)
            }
            const { admissionStatus, universityStatus } = value;

            const assignment = await StudentUniversityAssignment.findById(assignmentId);
            if (!assignment) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Student-university assignment')), req, 404);
            }


            if (assignment.studentId.toString() !== req.authenticatedStudent._id.toString()) {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            if (admissionStatus !== undefined) assignment.admissionStatus = admissionStatus;
            if (universityStatus !== undefined) assignment.universityStatus = universityStatus;

            await assignment.save();

            const populatedAssignment = await StudentUniversityAssignment.findById(assignment._id)
                .populate('studentId', 'name email')
                .populate('universityId')
                .populate('assignedBy', 'name email')
                .lean();


            const activity = new StudentActivity({
                studentId: assignment.studentId,
                activityType: ACTIVITY_TYPES.UNIVERSITY_STATUS_UPDATED,
                message: `Student updated university status for assignment ${populatedAssignment?.universityId?.name}`,
                status: ACTIVITY_STATUSES.UPDATED,
                details: { assignmentId, admissionStatus, universityStatus }
            });
            await activity.save();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Assigned university status updated successfully',
                assignment: populatedAssignment
            });
        } catch (err) {
            console.log(err);

            httpError(next, err, req, 500);
        }
    },


    // Task Controller 

    getStudentTasks: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateGetStudentTasks, { ...req.query });
            if (error) return httpError(next, error, req, 422);

            const { page, limit, sortOrder } = value;
            const skip = (page - 1) * limit;

            // -----------------------------------------------------------------
            // 1. Aggregate from the *new* StudentTaskAssignment collection
            // -----------------------------------------------------------------
            const raw = await StudentTaskAssignment.aggregate([
                // ---- filter by the logged-in student --------------------------------
                { $match: { studentId: req.authenticatedStudent._id } },

                // ---- bring in Task data --------------------------------------------
                {
                    $lookup: {
                        from: 'tasks',
                        localField: 'taskId',
                        foreignField: '_id',
                        as: 'taskDetails'
                    }
                },
                { $unwind: '$taskDetails' },

                // ---- bring in Subtask data -----------------------------------------
                {
                    $lookup: {
                        from: 'subtasks',
                        localField: 'subtaskId',
                        foreignField: '_id',
                        as: 'subtaskDetails'
                    }
                },
                { $unwind: '$subtaskDetails' },

                // ---- (optional) bring in Questionnaire data ------------------------
                {
                    $lookup: {
                        from: 'questionnaires',
                        localField: 'questionnaireId',
                        foreignField: '_id',
                        as: 'questionnaireDetails'
                    }
                },
                // keep a single object even if questionnaireId is null
                {
                    $addFields: {
                        questionnaireDetails: {
                            $cond: [
                                { $gt: [{ $size: '$questionnaireDetails' }, 0] },
                                { $arrayElemAt: ['$questionnaireDetails', 0] },
                                null
                            ]
                        }
                    }
                },

                // ---- sort by assignment date ---------------------------------------
                { $sort: { assignedAt: sortOrder === 'asc' ? 1 : -1 } },

                // ---- pagination ----------------------------------------------------
                { $skip: skip },
                { $limit: limit },

                // ---- final projection (keeps the same fields you used before) -----
                {
                    $project: {
                        _id: 0,
                        taskId: '$taskDetails._id',
                        taskTitle: '$taskDetails.title',
                        taskDescription: '$taskDetails.description',
                        taskPriority: '$taskDetails.priority',
                        taskAssignedAt: '$taskDetails.createdDate',

                        subtaskId: '$subtaskDetails._id',
                        subtaskTitle: '$subtaskDetails.title',
                        subtaskDescription: '$subtaskDetails.description',
                        subtaskPriority: '$subtaskDetails.priority',
                        subtaskLogo: '$subtaskDetails.logo',

                        questionnaireId: '$questionnaireDetails._id',
                        questionnaireTitle: '$questionnaireDetails.title',

                        assignedAt: 1,
                        status: 1,
                        isLocked: 1,
                        dueDate: 1
                    }
                }
            ]);

            // -----------------------------------------------------------------
            // 2. Total count for pagination (still on the new collection)
            // -----------------------------------------------------------------
            const totalAssignments = await StudentTaskAssignment.countDocuments({
                studentId: req.authenticatedStudent._id
            });

            const pagination = {
                total: totalAssignments,
                page,
                limit,
                totalPages: Math.ceil(totalAssignments / limit),
                hasNextPage: page < Math.ceil(totalAssignments / limit),
                hasPrevPage: page > 1
            };

            // -----------------------------------------------------------------
            // 3. Restructure into the exact response format you already send
            // -----------------------------------------------------------------
            const structuredTasks = raw.reduce((acc, cur) => {
                const taskKey = cur.taskId.toString();

                // ---- task entry -------------------------------------------------
                if (!acc[taskKey]) {
                    acc[taskKey] = {
                        _id: cur.taskId,
                        title: cur.taskTitle,
                        description: cur.taskDescription,
                        priority: cur.taskPriority,
                        assignedAt: cur.taskAssignedAt,
                        subtasks: []
                    };
                }

                // ---- find (or create) subtask entry inside the task -------------
                const subKey = cur.subtaskId.toString();
                let subEntry = acc[taskKey].subtasks.find(s => s._id.toString() === subKey);
                if (!subEntry) {
                    subEntry = {
                        _id: cur.subtaskId,
                        title: cur.subtaskTitle,
                        description: cur.subtaskDescription,
                        priority: cur.subtaskPriority,
                        logo: cur.subtaskLogo,
                        assignedAt: cur.assignedAt,
                        status: cur.status,
                        isLocked: cur.isLocked,
                        dueDate: cur.dueDate,
                        questionnaires: []               // <-- new array for questionnaire rows
                    };
                    acc[taskKey].subtasks.push(subEntry);
                }

                // ---- questionnaire row (only when a questionnaire exists) -------
                if (cur.questionnaireId) {
                    subEntry.questionnaires.push({
                        _id: cur.questionnaireId,
                        title: cur.questionnaireTitle,
                        status: cur.status,
                        isLocked: cur.isLocked,
                        dueDate: cur.dueDate
                    });
                } else {
                    // keep the original sub-task level fields when there is no questionnaire
                    // (they are already set above)
                }

                return acc;
            }, {});

            // Convert map → array
            const tasks = Object.values(structuredTasks).map(t => {
                // If a subtask has no questionnaires, keep the sub-task level status fields
                t.subtasks = t.subtasks.map(s => {
                    if (s.questionnaires.length === 0) {
                        // expose the sub-task level fields directly (same as before DB change)
                        return {
                            _id: s._id,
                            title: s.title,
                            description: s.description,
                            priority: s.priority,
                            logo: s.logo,
                            assignedAt: s.assignedAt,
                            status: s.status,
                            isLocked: s.isLocked,
                            dueDate: s.dueDate
                        };
                    }
                    // otherwise return the subtask with its questionnaire array
                    return {
                        _id: s._id,
                        title: s.title,
                        description: s.description,
                        priority: s.priority,
                        logo: s.logo,
                        assignedAt: s.assignedAt,
                        status: s.status,
                        isLocked: s.isLocked,
                        dueDate: s.dueDate,
                        questionnaires: s.questionnaires
                    };
                });
                return t;
            });

            // -----------------------------------------------------------------
            // 4. Send response – **identical shape** to the original controller
            // -----------------------------------------------------------------
            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                tasks,
                pagination
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get questionnaires for a specific task and subtask
    getSubtaskQuestionnaires: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateGetSubtaskQuestionnaires, { ...req.params });
            if (error) return httpError(next, error, req, 422);

            const { taskId, subtaskId } = value;

            // 1. Find all StudentTaskAssignment entries for this student + task + subtask
            const assignments = await StudentTaskAssignment.find({
                studentId: req.authenticatedStudent._id,
                taskId,
                subtaskId
            })
                .populate({
                    path: 'questionnaireId',
                    match: { status: 'ACTIVE' }, // Only ACTIVE questionnaires
                    select: 'title description status'
                })
                .lean();

            if (!assignments || assignments.length === 0) {
                return httpError(next, new Error('Task or subtask not assigned to the student or not accessible'), req, 404);
            }

            // 2. Build response: only include assignments that have an ACTIVE questionnaire
            const questionnaires = assignments
                .filter(a => a.questionnaireId) // Only those with ACTIVE questionnaire
                .map(a => ({
                    _id: a._id,
                    questionnaireId: a.questionnaireId._id,
                    title: a.questionnaireId.title,
                    description: a.questionnaireId.description,
                    status: a.questionnaireId.status,
                    documentURL: a.documentURL || null,
                    documentStatus: a.documentStatus || "MISSING",
                    taskStatus: a.status, // Student's progress on this questionnaire
                    assignedAt: a.assignedAt
                }));

            // 3. If no active questionnaires found
            if (questionnaires.length === 0) {
                return httpResponse(req, res, 200, responseMessage.SUCCESS, { questionnaires: [] });
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, { questionnaires });
        } catch (err) {
            console.log(err);
            httpError(next, err, req, 500);
        }
    },



    getQuestionnaireQuestionsWithResponses: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateGetQuestionnaireQuestions, { ...req.params });
            if (error) return httpError(next, error, req, 422);

            const { taskId, subtaskId, questionnaireId } = value;

            // 1. Verify student has access via StudentTaskAssignment
            const assignment = await StudentTaskAssignment.findOne({
                studentId: req.authenticatedStudent._id,
                taskId,
                subtaskId,
                questionnaireId
            }).lean();

            if (!assignment) {
                return httpError(next, new Error('Task, subtask, or questionnaire not assigned to the student or not accessible'), req, 404);
            }

            // 2. Fetch the questionnaire (with questions)
            const questionnaire = await Questionnaire.findById(questionnaireId)
                .select('title description status questions')
                .lean();

            if (!questionnaire) {
                return httpError(next, new Error('Questionnaire not found'), req, 404);
            }

            // 3. Fetch existing responses for this student + task + subtask + questionnaire
            const responses = await Response.find({
                studentId: req.authenticatedStudent._id,
                taskId,
                subtaskId,
                questionnaireId
            }).lean();

            // 4. Map questions with responses
            const questionsWithResponses = questionnaire.questions.map(question => {
                const response = responses.find(r =>
                    r.questionId.toString() === question._id.toString()
                );

                return {
                    _id: question._id,
                    question: question.question,
                    ansType: question.ansType,
                    options: question.options || [],
                    answer: response ? response.answer : null,
                    status: response ? response.status : 'PENDING',
                    feedback: response ? response.feedback : null
                };
            });

            // 5. Return in exact same format
            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                questionnaire: {
                    _id: questionnaire._id,
                    title: questionnaire.title,
                    description: questionnaire.description,
                    status: questionnaire.status,
                    questions: questionsWithResponses
                }
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    submitQuestionnaireResponses: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateSubmitQuestionnaireResponse, { ...req.params, ...req.body });
            if (error) return httpError(next, error, req, 422);

            const { taskId, subtaskId, questionnaireId, responses } = value;

            // 1. Find the specific StudentTaskAssignment (includes questionnaireId)
            const assignment = await StudentTaskAssignment.findOne({
                studentId: req.authenticatedStudent._id,
                taskId,
                subtaskId,
                questionnaireId
            }).lean();

            if (!assignment) {
                return httpError(next, new Error('Task, subtask, or questionnaire not assigned to the student or not accessible'), req, 404);
            }

            // 2. Fetch the questionnaire to validate questions
            const questionnaire = await Questionnaire.findById(questionnaireId).lean();
            if (!questionnaire) {
                return httpError(next, new Error('Questionnaire not found'), req, 404);
            }

            const questionIds = questionnaire.questions.map(q => q._id.toString());
            const responseMap = new Map(responses.map(r => [r.questionId, r.answer]));

            const task = await Task.findById(taskId).lean();
            const subtask = await Subtask.findById(subtaskId).lean();

            const taskTitle = task ? task.title : 'Unknown Task';
            const subtaskTitle = subtask ? subtask.title : 'Unknown Subtask';

            // 3. Validate each response
            const operations = responses.map(async response => {
                if (!questionIds.includes(response.questionId)) {
                    throw new Error(`Invalid question ID: ${response.questionId}`);
                }

                const question = questionnaire.questions.find(q => q._id.toString() === response.questionId);
                const ansType = question.ansType;

                let validatedAnswer = response.answer;

                // Type validation per ansType
                switch (ansType) {
                    case 'TEXT':
                    case 'PARAGRAPH':
                        if (typeof validatedAnswer !== 'string') {
                            throw new Error(`Answer for "${question.question}" must be a string`);
                        }
                        break;

                    case 'MULTIPLE_CHOICE':
                    case 'CHECKBOX':
                        if (!Array.isArray(validatedAnswer) || !validatedAnswer.every(a => typeof a === 'string')) {
                            throw new Error(`Answer for "${question.question}" must be an array of strings`);
                        }
                        if (ansType === 'MULTIPLE_CHOICE' && validatedAnswer.length > 1) {
                            throw new Error(`Only one option allowed for "${question.question}"`);
                        }
                        break;

                    case 'FILE':
                        if (typeof validatedAnswer !== 'string' || !validatedAnswer.match(/^https?:\/\//)) {
                            throw new Error(`Answer for "${question.question}" must be a valid URL`);
                        }
                        break;

                    case 'DATE':
                        // Allow string (ISO) or Date object; validate format if needed
                        if (typeof validatedAnswer === 'string' && !isNaN(Date.parse(validatedAnswer))) {
                            validatedAnswer = new Date(validatedAnswer);
                        } else if (!(validatedAnswer instanceof Date) || isNaN(validatedAnswer)) {
                            throw new Error(`Answer for "${question.question}" must be a valid date`);
                        }
                        break;

                    default:
                        throw new Error(`Unsupported answer type: ${ansType}`);
                }

                // 4. Upsert response
                const filter = {
                    studentId: req.authenticatedStudent._id,
                    taskId,
                    subtaskId,
                    questionnaireId,
                    questionId: response.questionId
                };

                const update = {
                    $set: {
                        answer: validatedAnswer,
                        status: 'SUBMITTED',
                        submittedAt: new Date()
                    },
                    $inc: { version: 1 }
                };

                return Response.findOneAndUpdate(filter, update, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                });
            });

            // 5. Mark the questionnaire assignment as COMPLETED
            await StudentTaskAssignment.findOneAndUpdate(
                {
                    studentId: req.authenticatedStudent._id,
                    taskId,
                    subtaskId,
                    questionnaireId
                },
                { status: 'COMPLETED' }
            );

            // 6. Execute all response saves
            await Promise.all(operations);

            // 7. Log student activity
            const activity = new StudentActivity({
                studentId: req.authenticatedStudent._id,
                activityType: ACTIVITY_TYPES.QUESTIONNAIRE_SUBMITTED,
                message: `Student submitted responses for questionnaire "${questionnaire.title}"`,
                status: ACTIVITY_STATUSES.SUBMITTED,
                details: { taskId, subtaskId, questionnaireId }
            });
            await activity.save();

            // 8. Success response (unchanged format)
            httpResponse(req, res, 201, responseMessage.SUCCESS, {
                message: 'Responses submitted successfully'
            });
            await mailer.sendEmail(req.authenticatedStudent.email, QuestionnaireSubmissionTemplate(taskTitle, subtaskTitle, questionnaire.title));
            await mailer.sendEmail(config.SUPPORT_EMAIL, AdminQuestionnaireSubmissionTemplate(req.authenticatedStudent.email, req.authenticatedStudent.name, taskTitle, subtaskTitle, questionnaire.title));
        } catch (err) {
            httpError(next, err, req, 400);
        }
    },

    getStudentTimeline: async (req, res, next) => {
        try {
            const studentId = req.authenticatedStudent._id.toString();
            const { page = 1, limit = 10 } = req.query;

            const skip = (page - 1) * limit;

            const taskAssignments = await StudentTaskAssignment.find({ studentId })
                .populate({
                    path: 'taskId',
                    select: 'title description logo priority assignee createdDate category',

                })
                .sort({ assignedAt: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await StudentTaskAssignment.countDocuments({ studentId });

            const taskIds = taskAssignments.map(ta => ta.taskId._id);
            const subtaskAssignments = await TaskSubtaskAssignment.find({ studentId, taskId: { $in: taskIds } })
                .populate({
                    path: 'subtaskId',
                    select: 'title description logo priority',
                })

                .sort({ assignedAt: 1 })
                .lean();

            const timeline = taskAssignments.map(ta => ({
                task: {
                    ...ta.taskId,
                    assignedAt: ta.assignedAt,
                    status: ta.status,
                    isLocked: ta.isLocked,
                    dueDate: ta.dueDate,
                    createdAt: ta.createdAt,
                    updatedAt: ta.updatedAt
                },
                subtasks: subtaskAssignments
                    .filter(sa => sa.taskId.toString() === ta.taskId._id.toString())
                    .map(sa => ({
                        ...sa.subtaskId,
                        assignedAt: sa.assignedAt,
                        status: sa.status,
                        isLocked: sa.isLocked,
                        dueDate: sa.dueDate,
                        createdAt: sa.createdAt,
                        updatedAt: sa.updatedAt
                    }))
            }));

            const responseData = {
                total: total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
                timeline: timeline
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    // Get student dashboard stats
    getStudentDashboardStats: async (req, res, next) => {
        try {
            const studentId = req.authenticatedStudent._id

            const taskStats = await StudentTaskAssignment.aggregate([
                { $match: { studentId: studentId } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const universityStats = await StudentUniversityAssignment.countDocuments({
                studentId: studentId
            });

            const statsMap = taskStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {});

            const totalAssignedTasks = taskStats.reduce((sum, curr) => sum + curr.count, 0);
            const totalCompleted = statsMap['COMPLETED'] || 0;
            const totalPending = (statsMap['PENDING'] || 0) + (statsMap['IN_PROGRESS'] || 0);
            const totalUniversityAssigned = universityStats;

            const responseData = {
                totalAssignedTasks: totalAssignedTasks,
                totalCompletedTasks: totalCompleted,
                totalPendingTasks: totalPending,
                totalUniversityAssigned: totalUniversityAssigned
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


}