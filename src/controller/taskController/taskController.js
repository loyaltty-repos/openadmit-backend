import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { ValidateCreateTask, ValidateUpdateTask, validateJoiSchema } from '../../service/validationService.js';
import Task from '../../model/taskModel.js';
import StudentTaskAssignment from '../../model/studentTaskAssignmentModel.js';
import TaskSubtaskAssignment from '../../model/taskSubtaskAssignmentModel.js';
import Student from '../../model/studentModel.js';
import Subtask from '../../model/subtaskModel.js';
import Response from '../../model/responseModel.js';
import Questionnaire from '../../model/questionnaireModel.js';
import mongoose from 'mongoose';
import { TaskAssignedTemplate } from '../../service/emailTemplates.js';
import mailer from '../../service/email.service.js';
import Member from '../../model/membersModel.js';
import TaskCategory from '../../model/taskCategoryModel.js';
import SubtaskQuestionnaireAssignment from '../../model/subtaskQuestionnaireAssignmentModel.js';

export default {
    // Create a new task with associated students and subtasks (ADMIN only)
    // createTask: async (req, res, next) => {
    //     try {
    //     const { taskId } = req.params;

    //     // 1. Validate
    //     if (!mongoose.Types.ObjectId.isValid(taskId)) {
    //         return httpError(next, new Error("Invalid task ID"), req, 400);
    //     }
    //     if (req.authenticatedMember.role !== "ADMIN") {
    //         return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
    //     }

    //     const page = Math.max(1, parseInt(req.query.page) || 1);
    //     const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    //     const skip = (page - 1) * limit;

    //     // 2. Fetch task
    //     const task = await Task.findById(taskId).select("title description").lean();
    //     if (!task) return httpError(next, new Error("Task not found"), req, 404);

    //     // 3. Get all subtasks of this task
    //     const subtasks = await Subtask.find({ taskId }).select("title").lean();
    //     if (!subtasks.length) {
    //         return httpResponse(req, res, 200, responseMessage.SUCCESS, {
    //             task,
    //             summary: { totalStudents: 0, totalSubtasks: 0, totalQuestionnaires: 0, totalResponses: 0 },
    //             data: [],
    //             pagination: { page, limit, total: 0, totalPages: 0 }
    //         });
    //     }
    //     const subtaskIds = subtasks.map(s => s._id);

    //     // 4. Get all questionnaires linked to these subtasks
    //     const sqAssignments = await SubtaskQuestionnaireAssignment.find({
    //         subtaskId: { $in: subtaskIds }
    //     })
    //     .populate({
    //         path: "questionnaireId",
    //         select: "title description status"
    //     })
    //     .lean();

    //     const questionnaireIds = sqAssignments
    //         .map(sq => sq.questionnaireId?._id?.toString())
    //         .filter(Boolean);

    //     // 5. Get all StudentTaskAssignment for this task
    //     const assignments = await StudentTaskAssignment.find({ taskId })
    //         .populate("studentId", "name email")
    //         .populate("subtaskId", "title")
    //         .populate("questionnaireId", "title")
    //         .lean();

    //     const studentIds = [...new Set(assignments.map(a => a.studentId._id.toString()))];

    //     // 6. Fetch ALL responses
    //     const responses = await Response.find({
    //         taskId,
    //         questionnaireId: { $in: questionnaireIds.map(id => new mongoose.Types.ObjectId(id)) },
    //         studentId: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) }
    //     })
    //     .populate("questionId", "question ansType options")
    //     .lean();

    //     // 7. Build lookup: qId → qId → response
    //     const responseMap = new Map(); // qId → Map<questionId, response>
    //     responses.forEach(r => {
    //         const qKey = r.questionnaireId.toString();
    //         if (!responseMap.has(qKey)) responseMap.set(qKey, new Map());
    //         responseMap.get(qKey).set(r.questionId._id.toString(), r);
    //     });

    //     // 8. Cache questionnaire questions
    //     const qCache = new Map();
    //     const getQuestions = async (qId) => {
    //         if (qCache.has(qId)) return qCache.get(qId);
    //         const doc = await Questionnaire.findById(qId).select("questions").lean();
    //         const questions = doc?.questions || [];
    //         qCache.set(qId, questions);
    //         return questions;
    //     };

    //     // 9. Build per-student structure
    //     const studentMap = new Map();

    //     for (const studentId of studentIds) {
    //         const student = assignments.find(a => a.studentId._id.toString() === studentId)?.studentId;
    //         if (!student) continue;

    //         const studentObj = {
    //             _id: student._id,
    //             name: student.name,
    //             email: student.email,
    //             subtasks: subtasks.map(st => ({
    //                 _id: st._id,
    //                 title: st.title,
    //                 questionnaires: []
    //             }))
    //         };
    //         studentMap.set(studentId, studentObj);
    //     }

    //     // 10. Fill questionnaires & questions
    //     for (const sq of sqAssignments) {
    //         const subtaskId = sq.subtaskId.toString();
    //         const qId = sq.questionnaireId._id.toString();

    //         const questions = await getQuestions(qId);
    //         const respMap = responseMap.get(qId) || new Map();

    //         for (const studentId of studentIds) {
    //             const studentObj = studentMap.get(studentId);
    //             if (!studentObj) continue;

    //             const subtaskEntry = studentObj.subtasks.find(s => s._id.toString() === subtaskId);
    //             if (!subtaskEntry) continue;

    //             let qEntry = subtaskEntry.questionnaires.find(q => q.questionnaireId.toString() === qId);
    //             if (!qEntry) {
    //                 qEntry = {
    //                     questionnaireId: sq.questionnaireId._id,
    //                     title: sq.questionnaireId.title,
    //                     description: sq.questionnaireId.description,
    //                     status: sq.questionnaireId.status,
    //                     assignmentStatus: "PENDING",
    //                     assignedAt: null,
    //                     questions: []
    //                 };
    //                 subtaskEntry.questionnaires.push(qEntry);
    //             }

    //             // Update assignment status
    //             const ass = assignments.find(a =>
    //                 a.studentId._id.toString() === studentId &&
    //                 a.subtaskId._id.toString() === subtaskId &&
    //                 a.questionnaireId?._id?.toString() === qId
    //             );
    //             if (ass) {
    //                 qEntry.assignmentStatus = ass.status;
    //                 qEntry.assignedAt = ass.assignedAt;
    //             }

    //             // Add all questions
    //             for (const q of questions) {
    //                 const resp = respMap.get(q._id.toString());
    //                 const studentResp = resp && resp.studentId.toString() === studentId ? resp : null;

    //                 if (qEntry.questions.some(x => x._id.toString() === q._id.toString())) continue;

    //                 qEntry.questions.push({
    //                     _id: q._id,
    //                     question: q.question,
    //                     ansType: q.ansType,
    //                     options: q.options || [],
    //                     answer: studentResp?.answer ?? null,
    //                     status: studentResp?.status ?? "PENDING",
    //                     submittedAt: studentResp?.submittedAt ?? null,
    //                     feedback: studentResp?.feedback ?? null
    //                 });
    //             }
    //         }
    //     }

    //     // 11. Final array + pagination
    //     const studentsArray = Array.from(studentMap.values())
    //         .map(s => ({
    //             ...s,
    //             subtasks: s.subtasks.filter(st => st.questionnaires.some(q => q.questions.length > 0))
    //         }))
    //         .filter(s => s.subtasks.length > 0);

    //     const totalStudents = studentsArray.length;
    //     const paginated = studentsArray.slice(skip, skip + limit);

    //     // 12. Summary
    //     const totalSubtasks = subtasks.length;
    //     const totalQuestionnaires = sqAssignments.length;
    //     const totalResponses = responses.length;

    //     const pagination = {
    //         total: totalStudents,
    //         page,
    //         limit,
    //         totalPages: Math.ceil(totalStudents / limit),
    //         hasNextPage: page < Math.ceil(totalStudents / limit),
    //         hasPrevPage: page > 1
    //     };

    //     // 13. Response — matches your format
    //     httpResponse(req, res, 200, responseMessage.SUCCESS, {
    //         task: {
    //             _id: task._id,
    //             title: task.title,
    //             description: task.description
    //         },
    //         summary: {
    //             totalStudents,
    //             totalSubtasks,
    //             totalQuestionnaires,
    //             totalResponses
    //         },
    //         data: paginated,
    //         pagination
    //     });

    // } catch (err) {
    //     console.error("getTaskStudentReport error:", err);
    //     httpError(next, err, req, 500);
    // }
    // },

    createTask: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateCreateTask, req.body);
            if (error) return httpError(next, error, req, 422);

            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { studentIds, subtaskIds, assignee, category, ...taskData } = value;
            taskData.assignee = assignee ? assignee : req.authenticatedMember._id;

            const assigneeExists = await Member.findById(taskData.assignee).lean();
            if (!assigneeExists) return httpError(next, new Error('Assignee not found'), req, 404);

            if (category) {
                const categoryExists = await TaskCategory.findById(category).lean();
                if (!categoryExists) return httpError(next, new Error('Category not found'), req, 404);
            }

            if (studentIds?.length > 0) {
                const students = await Student.find({ _id: { $in: studentIds } }).lean();
                if (students.length !== studentIds.length) return httpError(next, new Error('One or more studentIds are invalid'), req, 400);
            }

            if (subtaskIds?.length > 0) {
                const subtasks = await Subtask.find({ _id: { $in: subtaskIds } }).lean();
                if (subtasks.length !== subtaskIds.length) return httpError(next, new Error('One or more subtaskIds are invalid'), req, 400);
            }

            const questionnaireIds = await Promise.all(subtaskIds.map(subtaskId => SubtaskQuestionnaireAssignment.find({ subtaskId }).distinct('questionnaireId').lean()));

            const task = new Task({ ...taskData, category });
            await task.save();

            if (subtaskIds?.length > 0 && studentIds?.length > 0) {
                await Promise.all(
                    studentIds.flatMap(studentId =>
                        subtaskIds.flatMap((subtaskId, subIndex) => {
                            const questionnaires = questionnaireIds[subIndex];
                            if (questionnaires.length === 0) {
                                return [new StudentTaskAssignment({
                                    studentId,
                                    taskId: task._id,
                                    subtaskId,
                                    assignedAt: new Date(),
                                    status: "PENDING",
                                    isLocked: false,
                                    dueDate: null
                                }).save()];
                            } else {
                                return questionnaires.map(questionnaireId => new StudentTaskAssignment({
                                    studentId,
                                    taskId: task._id,
                                    subtaskId,
                                    questionnaireId,
                                    assignedAt: new Date(),
                                    status: "PENDING",
                                    isLocked: false,
                                    dueDate: null
                                }).save());
                            }
                        })
                    )
                );
            }

            const populatedTask = await Task.findById(task._id).populate('category', 'name description').lean();

            const assignments = await StudentTaskAssignment.find({ taskId: task._id })
                .populate('studentId', '-password')
                .populate('subtaskId')
                .populate('questionnaireId')
                .lean();

            populatedTask.students = [...new Map(assignments.map(a => [a.studentId._id.toString(), a.studentId])).values()];

            populatedTask.subtasks = assignments.map(assignment => ({
                subtask: assignment.subtaskId,
                student: assignment.studentId,
                questionnaire: assignment.questionnaireId,
                status: assignment.status,
                isLocked: assignment.isLocked,
                dueDate: assignment.dueDate
            }));
            await Promise.all(studentIds.map(async (studentId) => {
                const student = await Student.findById(studentId).lean();
                if (student && student.email) {
                    await mailer.sendEmail(student.email, TaskAssignedTemplate(student.name, populatedTask.title));
                };
            }));
            httpResponse(req, res, 201, responseMessage.SUCCESS, { message: 'Task created successfully', task: populatedTask });

        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update task details (ADMIN only)
    updateTaskDetails: async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const { value, error } = validateJoiSchema(ValidateUpdateTask, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            // Find task
            const task = await Task.findById(taskId);
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // Validate assignee if provided
            if (value.assignee) {
                const assigneeExists = await Member.findById(value.assignee);
                if (!assigneeExists) {
                    return httpError(next, new Error('Assignee not found'), req, 404);
                }
            }


            if (value.category) {
                const categoryExists = await TaskCategory.findById(value.category);
                if (!categoryExists) return httpError(next, new Error('Category not found'), req, 404);
            }

            // Update task fields
            if (value.title) task.title = value.title;
            if (value.description !== undefined) task.description = value.description;
            if (value.logo !== undefined) task.logo = value.logo;
            if (value.priority) task.priority = value.priority;
            if (value.assignee) task.assignee = value.assignee;
            if (value.isDefault !== undefined) task.isDefault = value.isDefault;
            if (value.createdDate) task.createdDate = value.createdDate;
            if (value.category) task.category = value.category
            await task.save();

            // Fetch updated task with associations
            const populatedTask = await Task.findById(task._id).lean();
            const studentAssignments = await StudentTaskAssignment.find({ taskId: task._id })
                .populate('studentId', "-password")
                .lean();
            const taskSubtaskAssignments = await TaskSubtaskAssignment.find({ taskId: task._id })
                .populate('studentId', "-password")
                .populate('subtaskId')
                .lean();

            populatedTask.students = studentAssignments.map(assignment => assignment.studentId);
            populatedTask.subtasks = taskSubtaskAssignments.map(assignment => ({
                subtask: assignment.subtaskId,
                student: assignment.studentId,
                status: assignment.status,
                isLocked: assignment.isLocked,
                dueDate: assignment.dueDate
            }));

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Task updated successfully',
                task: populatedTask
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Delete a task and its associated assignments (ADMIN only)
    deleteTask: async (req, res, next) => {
        try {
            const { taskId } = req.params;

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            // Find task
            const task = await Task.findById(taskId);
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // Delete associated StudentTaskAssignment and TaskSubtaskAssignment records
            await StudentTaskAssignment.deleteMany({ taskId: task._id });
            await TaskSubtaskAssignment.deleteMany({ taskId: task._id });

            // Delete task
            await Task.findByIdAndDelete(task._id);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Task deleted successfully'
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // ADMIN: Get all student responses for a task (by questionnaire)
    // ADMIN – Get every student’s questionnaire responses for a task
    // getStudentQuestionnaireResponses: async (req, res, next) => {
    //     try {
    //         const { taskId } = req.params;

    //         // 1. Validate taskId
    //         if (!mongoose.Types.ObjectId.isValid(taskId)) {
    //             return httpError(next, new Error("Invalid task ID"), req, 400);
    //         }

    //         // 2. Admin check
    //         if (req.authenticatedMember.role !== "ADMIN") {
    //             return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
    //         }

    //         // 3. Pagination
    //         const page = Math.max(1, parseInt(req.query.page) || 1);
    //         const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    //         const skip = (page - 1) * limit;

    //         // 4. Fetch task
    //         const task = await Task.findById(taskId).select("title description").lean();
    //         if (!task) {
    //             return httpError(next, new Error("Task not found"), req, 404);
    //         }

    //         // 5. Fetch all StudentTaskAssignment entries
    //         const assignments = await StudentTaskAssignment.find({ taskId })
    //             .populate({
    //                 path: "studentId",
    //                 select: "name email"
    //             })
    //             .populate({
    //                 path: "subtaskId",
    //                 select: "title"
    //             })
    //             .populate({
    //                 path: "questionnaireId",
    //                 select: "title description status"
    //             })
    //             .lean();

    //         if (!assignments.length) {
    //             return httpResponse(req, res, 200, responseMessage.SUCCESS, {
    //                 task,
    //                 summary: { totalStudents: 0, totalQuestionnaires: 0, totalResponses: 0 },
    //                 data: [],
    //                 pagination: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
    //             });
    //         }

    //         // 6. Extract unique IDs
    //         const studentIds = [...new Set(assignments.map(a => a.studentId._id.toString()))];
    //         const questionnaireIds = [...new Set(
    //             assignments
    //                 .map(a => a.questionnaireId?._id?.toString())
    //                 .filter(Boolean)
    //         )];

    //         // 7. Fetch all responses
    //         const responses = await Response.find({
    //             taskId,
    //             questionnaireId: { $in: questionnaireIds.map(id => new mongoose.Types.ObjectId(id)) },
    //             studentId: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) }
    //         })
    //             .populate({
    //                 path: "questionId",
    //                 select: "question ansType options"
    //             })
    //             .lean();

    //         // 8. Build response lookup: questionnaireId → questionId → response
    //         const responseMap = new Map(); // qId → Map<questionId, response>
    //         responses.forEach(r => {
    //             const qKey = r.questionnaireId.toString();
    //             if (!responseMap.has(qKey)) responseMap.set(qKey, new Map());
    //             responseMap.get(qKey).set(r.questionId._id.toString(), r);
    //         });

    //         // 9. Cache for Questionnaire questions
    //         const questionnaireCache = new Map();

    //         const getQuestionnaireQuestions = async (qId) => {
    //             if (questionnaireCache.has(qId)) {
    //                 return questionnaireCache.get(qId);
    //             }
    //             const qDoc = await Questionnaire.findById(qId)
    //                 .select("questions")
    //                 .lean();
    //             const questions = qDoc?.questions || [];
    //             questionnaireCache.set(qId, questions);
    //             return questions;
    //         };

    //         // 10. Build per-student data
    //         const studentMap = new Map();

    //         for (const ass of assignments) {
    //             const sId = ass.studentId._id.toString();
    //             if (!studentMap.has(sId)) {
    //                 studentMap.set(sId, {
    //                     _id: ass.studentId._id,
    //                     name: ass.studentId.name,
    //                     email: ass.studentId.email,
    //                     questionnaires: []
    //                 });
    //             }

    //             const qId = ass.questionnaireId?._id?.toString();
    //             if (!qId) continue;

    //             const studentObj = studentMap.get(sId);

    //             let qEntry = studentObj.questionnaires.find(q => q.questionnaireId.toString() === qId);
    //             if (!qEntry) {
    //                 qEntry = {
    //                     questionnaireId: ass.questionnaireId._id,
    //                     title: ass.questionnaireId.title,
    //                     description: ass.questionnaireId.description,
    //                     status: ass.questionnaireId.status,
    //                     documentURL: ass.documentURL || null,
    //                     documentStatus: ass.documentStatus || "NOT_UPLOADED",
    //                     subtask: {
    //                         _id: ass.subtaskId._id,
    //                         title: ass.subtaskId.title
    //                     },
    //                     assignmentStatus: ass.status,
    //                     assignedAt: ass.assignedAt,
    //                     questions: []
    //                 };
    //                 studentObj.questionnaires.push(qEntry);
    //             }

    //             // Fetch full questions
    //             const allQuestions = await getQuestionnaireQuestions(qId);
    //             const qResponseMap = responseMap.get(qId) || new Map();

    //             for (const q of allQuestions) {
    //                 const qResp = qResponseMap.get(q._id.toString());

    //                 const exists = qEntry.questions.some(x => x._id.toString() === q._id.toString());
    //                 if (exists) continue;

    //                 qEntry.questions.push({
    //                     _id: q._id,
    //                     question: q.question,
    //                     ansType: q.ansType,
    //                     options: q.options || [],
    //                     answer: qResp?.answer ?? null,
    //                     status: qResp?.status ?? "PENDING",
    //                     submittedAt: qResp?.submittedAt ?? null,
    //                     feedback: qResp?.feedback ?? null
    //                 });
    //             }
    //         }

    //         // 11. Convert to array and paginate
    //         const studentsArray = Array.from(studentMap.values())
    //             .map(s => ({
    //                 ...s,
    //                 questionnaires: s.questionnaires.filter(q => q.questions.length > 0)
    //             }))
    //             .filter(s => s.questionnaires.length > 0);

    //         const totalStudents = studentsArray.length;
    //         const paginated = studentsArray.slice(skip, skip + limit);

    //         // 12. Summary
    //         const totalQuestionnaires = questionnaireIds.length;
    //         const totalResponses = responses.length;

    //         const pagination = {
    //             total: totalStudents,
    //             page,
    //             limit,
    //             totalPages: Math.ceil(totalStudents / limit),
    //             hasNextPage: page < Math.ceil(totalStudents / limit),
    //             hasPrevPage: page > 1
    //         };

    //         // 13. Final response
    //         httpResponse(req, res, 200, responseMessage.SUCCESS, {
    //             task: {
    //                 _id: task._id,
    //                 title: task.title,
    //                 description: task.description
    //             },
    //             summary: {
    //                 totalStudents,
    //                 totalQuestionnaires,
    //                 totalResponses
    //             },
    //             data: paginated,
    //             pagination
    //         });

    //     } catch (err) {
    //         console.error("getStudentQuestionnaireResponses error:", err);
    //         httpError(next, err, req, 500);
    //     }
    // },

    getStudentQuestionnaireResponses: async (req, res, next) => {
    try {
        const { taskId } = req.params;

        // 1. Validate taskId
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return httpError(next, new Error("Invalid task ID"), req, 400);
        }

        // 2. Admin check
        if (req.authenticatedMember.role !== "ADMIN") {
            return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
        }

        // 3. Pagination
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;

        // 4. Fetch task
        const task = await Task.findById(taskId)
            .select("title description")
            .lean();

        if (!task) {
            return httpError(next, new Error("Task not found"), req, 404);
        }

        // 5. Fetch all StudentTaskAssignment entries
        const assignments = await StudentTaskAssignment.find({ taskId })
            .populate({
                path: "studentId",
                select: "name email"
            })
            .populate({
                path: "subtaskId",
                select: "title"
            })
            .populate({
                path: "questionnaireId",
                select: "title description status"
            })
            .lean();

        if (!assignments.length) {
            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                task,
                summary: { totalStudents: 0, totalQuestionnaires: 0, totalResponses: 0 },
                data: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            });
        }

        // 6. Extract unique IDs (safely handle deleted/missing students)
        const studentIds = [
            ...new Set(
                assignments
                    .map(a => a.studentId?._id?.toString())
                    .filter(Boolean)
            )
        ];

        const questionnaireIds = [
            ...new Set(
                assignments
                    .map(a => a.questionnaireId?._id?.toString())
                    .filter(Boolean)
            )
        ];

        // 7. Fetch all responses (only if we actually have valid IDs)
        let responses = [];
        if (studentIds.length && questionnaireIds.length) {
            responses = await Response.find({
                taskId,
                questionnaireId: {
                    $in: questionnaireIds.map(id => new mongoose.Types.ObjectId(id))
                },
                studentId: {
                    $in: studentIds.map(id => new mongoose.Types.ObjectId(id))
                }
            })
                .populate({
                    path: "questionId",
                    select: "question ansType options"
                })
                .lean();
        }

        // 8. Build response lookup: questionnaireId → questionId → response
        const responseMap = new Map(); // qId → Map<questionId, response>
        responses.forEach(r => {
            const qKey = r.questionnaireId.toString();
            if (!responseMap.has(qKey)) {
                responseMap.set(qKey, new Map());
            }
            responseMap.get(qKey).set(r.questionId._id.toString(), r);
        });

        // 9. Cache for Questionnaire questions
        const questionnaireCache = new Map();

        const getQuestionnaireQuestions = async (qId) => {
            if (questionnaireCache.has(qId)) {
                return questionnaireCache.get(qId);
            }
            const qDoc = await Questionnaire.findById(qId)
                .select("questions")
                .lean();
            const questions = qDoc?.questions || [];
            questionnaireCache.set(qId, questions);
            return questions;
        };

        // 10. Build per-student data
        const studentMap = new Map();

        for (const ass of assignments) {
            // Skip if student is deleted / not populated
            if (!ass.studentId || !ass.studentId._id) continue;

            const sId = ass.studentId._id.toString();

            if (!studentMap.has(sId)) {
                studentMap.set(sId, {
                    _id: ass.studentId._id,
                    name: ass.studentId.name,
                    email: ass.studentId.email,
                    questionnaires: []
                });
            }

            const qId = ass.questionnaireId?._id?.toString();
            if (!qId) continue; // No questionnaire, nothing to build

            const studentObj = studentMap.get(sId);

            let qEntry = studentObj.questionnaires.find(
                q => q.questionnaireId.toString() === qId
            );

            if (!qEntry) {
                // Handle possible missing subtask safely
                const subtaskInfo = ass.subtaskId && ass.subtaskId._id
                    ? {
                          _id: ass.subtaskId._id,
                          title: ass.subtaskId.title
                      }
                    : null;

                qEntry = {
                    questionnaireId: ass.questionnaireId._id,
                    title: ass.questionnaireId.title,
                    description: ass.questionnaireId.description,
                    status: ass.questionnaireId.status,
                    documentURL: ass.documentURL || null,
                    documentStatus: ass.documentStatus || "NOT_UPLOADED",
                    subtask: subtaskInfo,
                    assignmentStatus: ass.status,
                    assignedAt: ass.assignedAt,
                    questions: []
                };
                studentObj.questionnaires.push(qEntry);
            }

            // Fetch full questions
            const allQuestions = await getQuestionnaireQuestions(qId);
            const qResponseMap = responseMap.get(qId) || new Map();

            for (const q of allQuestions) {
                const qResp = qResponseMap.get(q._id.toString());

                const exists = qEntry.questions.some(
                    x => x._id.toString() === q._id.toString()
                );
                if (exists) continue;

                qEntry.questions.push({
                    _id: q._id,
                    question: q.question,
                    ansType: q.ansType,
                    options: q.options || [],
                    answer: qResp?.answer ?? null,
                    status: qResp?.status ?? "PENDING",
                    submittedAt: qResp?.submittedAt ?? null,
                    feedback: qResp?.feedback ?? null
                });
            }
        }

        // 11. Convert to array and paginate
        const studentsArray = Array.from(studentMap.values())
            .map(s => ({
                ...s,
                questionnaires: s.questionnaires.filter(q => q.questions.length > 0)
            }))
            .filter(s => s.questionnaires.length > 0);

        const totalStudents = studentsArray.length;
        const paginated = studentsArray.slice(skip, skip + limit);

        // 12. Summary
        const totalQuestionnaires = questionnaireIds.length;
        const totalResponses = responses.length;

        const totalPages = Math.ceil(totalStudents / limit) || 0;

        const pagination = {
            total: totalStudents,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };

        // 13. Final response
        httpResponse(req, res, 200, responseMessage.SUCCESS, {
            task: {
                _id: task._id,
                title: task.title,
                description: task.description
            },
            summary: {
                totalStudents,
                totalQuestionnaires,
                totalResponses
            },
            data: paginated,
            pagination
        });
    } catch (err) {
        console.error("getStudentQuestionnaireResponses error:", err);
        httpError(next, err, req, 500);
    }
},

    // update document status and document url
    // update document status and document url
    updateStudentQuestinnaireResponse: async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const { questionnaireId, studentId, documentURL, documentStatus } = req.body;

            // 1. Basic validations
            if (!mongoose.Types.ObjectId.isValid(taskId)) {
                return httpError(next, new Error("Invalid task ID"), req, 400);
            }

            if (!questionnaireId || !mongoose.Types.ObjectId.isValid(questionnaireId)) {
                return httpError(next, new Error("Invalid questionnaire ID"), req, 400);
            }

            // Ensure at least one field to update is provided
            if (typeof documentURL === "undefined" && typeof documentStatus === "undefined") {
                return httpError(
                    next,
                    new Error("Nothing to update. Provide documentURL and/or documentStatus."),
                    req,
                    400
                );
            }

            // // 2. Identify student from auth (adjust if your auth structure is different)
            // const studentId = req.authenticatedMember?.studentId || req.authenticatedMember?._id;
            // if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
            //     return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
            // }

            // 3. Build dynamic update object
            const updateData = {};
            if (typeof documentURL !== "undefined") {
                updateData.documentURL = documentURL; // can be null to clear
            }
            if (typeof documentStatus !== "undefined") {
                updateData.documentStatus = documentStatus; // e.g. "UPLOADED", "PENDING", "REJECTED"
            }

            console.log("taskId, questionnaireId, studentId:", taskId, questionnaireId, studentId);

            // 4. Update the StudentTaskAssignment record
            const updatedAssignment = await StudentTaskAssignment.findOneAndUpdate(
                {
                    taskId: new mongoose.Types.ObjectId(taskId),
                    questionnaireId: new mongoose.Types.ObjectId(questionnaireId),
                    studentId: new mongoose.Types.ObjectId(studentId),
                },
                { $set: updateData },
                { new: true }
            )
                .populate({ path: "studentId", select: "name email" })
                .populate({ path: "subtaskId", select: "title" })
                .populate({ path: "questionnaireId", select: "title description status" })
                .lean();

            if (!updatedAssignment) {
                return httpError(
                    next,
                    new Error("Assignment not found for this task, questionnaire, and student"),
                    req,
                    404
                );
            }

            // 5. Respond
            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: "Document info updated successfully",
                assignment: updatedAssignment,
            });
        } catch (err) {
            console.error("updateStudentQuestinnaireResponse error:", err);
            return httpError(next, err, req, 500);
        }
    },

    // getAllTasks: async (req, res, next) => {
    //     try {
    //         const page = parseInt(req.query.page) || 1;
    //         const limit = parseInt(req.query.limit) || 10;
    //         const skip = (page - 1) * limit;

    //         // 1. Fetch total count
    //         const totalTasks = await Task.countDocuments();

    //         // 2. Fetch paginated tasks
    //         const tasks = await Task.find()
    //             .skip(skip)
    //             .limit(limit)
    //             .lean();

    //         const taskIds = tasks.map(task => task._id);

    //         // 3. Fetch all StudentTaskAssignment for these tasks
    //         const studentTaskAssignments = await StudentTaskAssignment.find({
    //             taskId: { $in: taskIds }
    //         })
    //             .populate('studentId', '-password')
    //             .populate('subtaskId')
    //             .populate('questionnaireId', 'title') // optional: for future use
    //             .lean();

    //         // 4. Build response with students and subtasks
    //         const tasksWithAssignments = tasks.map(task => {
    //             const taskAssignments = studentTaskAssignments.filter(
    //                 a => a.taskId.toString() === task._id.toString()
    //             );

    //             // --- Students (unique) ---
    //             const uniqueStudents = [...new Map(
    //                 taskAssignments.map(a => [a.studentId?._id.toString(), a.studentId])
    //             ).values()];

    //             // --- Subtasks with status (one per student-subtask pair) ---
    //             const subtaskMap = new Map();

    //             taskAssignments.forEach(assignment => {
    //                 const subtaskId = assignment.subtaskId._id.toString();
    //                 const studentId = assignment.studentId._id.toString();

    //                 if (!subtaskMap.has(subtaskId)) {
    //                     subtaskMap.set(subtaskId, {
    //                         subtask: assignment.subtaskId,
    //                         students: [],
    //                         status: assignment.status,
    //                         isLocked: assignment.isLocked,
    //                         dueDate: assignment.dueDate
    //                     });
    //                 }

    //                 const entry = subtaskMap.get(subtaskId);
    //                 entry.students.push({
    //                     student: assignment.studentId,
    //                     status: assignment.status,
    //                     isLocked: assignment.isLocked,
    //                     dueDate: assignment.dueDate
    //                 });
    //             });

    //             const subtasks = Array.from(subtaskMap.values()).map(entry => ({
    //                 subtask: entry.subtask,
    //                 status: entry.status, // fallback: use first student's status
    //                 isLocked: entry.isLocked,
    //                 dueDate: entry.dueDate
    //             }));

    //             return {
    //                 ...task,
    //                 students: uniqueStudents,
    //                 subtasks,
    //                 totalStudent: uniqueStudents.length,
    //                 totalSubtask: subtasks.length
    //             };
    //         });

    //         // 5. Pagination
    //         const pagination = {
    //             total: totalTasks,
    //             page,
    //             limit,
    //             totalPages: Math.ceil(totalTasks / limit),
    //             hasNextPage: page < Math.ceil(totalTasks / limit),
    //             hasPrevPage: page > 1
    //         };

    //         httpResponse(req, res, 200, responseMessage.SUCCESS, {
    //             tasks: tasksWithAssignments,
    //             pagination
    //         });
    //     } catch (err) {
    //         console.log("error", err)
    //         httpError(next, err, req, 500);
    //     }
    // },

    getAllTasks: async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // 1. Fetch total count
        const totalTasks = await Task.countDocuments();

        // 2. Fetch paginated tasks
        const tasks = await Task.find()
            .skip(skip)
            .limit(limit)
            .lean();

        const taskIds = tasks.map(task => task._id);

        if (!taskIds.length) {
            const pagination = {
                total: totalTasks,
                page,
                limit,
                totalPages: Math.ceil(totalTasks / limit) || 0,
                hasNextPage: false,
                hasPrevPage: page > 1
            };

            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                tasks: [],
                pagination
            });
        }

        // 3. Fetch all StudentTaskAssignment for these tasks
        const studentTaskAssignments = await StudentTaskAssignment.find({
            taskId: { $in: taskIds }
        })
            .populate('studentId', '-password')
            .populate('subtaskId')
            .populate('questionnaireId', 'title') // optional: for future use
            .lean();

        // 4. Build response with students and subtasks
        const tasksWithAssignments = tasks.map(task => {
            const taskAssignments = studentTaskAssignments.filter(
                a => a.taskId.toString() === task._id.toString()
            );

            // Maps to keep things unique & safe
            const studentMap = new Map(); // key: studentId string, value: student doc
            const subtaskMap = new Map(); // key: subtaskId string, value: { subtask, students: [...] }

            taskAssignments.forEach(assignment => {
                const { studentId, subtaskId, status, isLocked, dueDate } = assignment;

                // If the referenced student or subtask has been deleted,
                // populate(...) will set them to null. We just skip those records.
                if (!studentId || !studentId._id) return;
                if (!subtaskId || !subtaskId._id) return;

                const studentKey = studentId._id.toString();
                const subtaskKey = subtaskId._id.toString();

                // --- Students (unique) ---
                if (!studentMap.has(studentKey)) {
                    studentMap.set(studentKey, studentId);
                }

                // --- Subtasks with per-student info ---
                if (!subtaskMap.has(subtaskKey)) {
                    subtaskMap.set(subtaskKey, {
                        subtask: subtaskId,
                        students: []
                    });
                }

                const entry = subtaskMap.get(subtaskKey);
                entry.students.push({
                    student: studentId,
                    status,
                    isLocked,
                    dueDate
                });
            });

            const uniqueStudents = Array.from(studentMap.values());

            // For each subtask, pick a "representative" status/isLocked/dueDate
            const subtasks = Array.from(subtaskMap.values()).map(entry => {
                const firstStudentEntry = entry.students[0] || {};
                return {
                    subtask: entry.subtask,
                    status: firstStudentEntry.status ?? null,
                    isLocked: firstStudentEntry.isLocked ?? false,
                    dueDate: firstStudentEntry.dueDate ?? null
                };
            });

            return {
                ...task,
                students: uniqueStudents,
                subtasks,
                totalStudent: uniqueStudents.length,
                totalSubtask: subtasks.length
            };
        });

        // 5. Pagination
        const totalPages = Math.ceil(totalTasks / limit) || 0;

        const pagination = {
            total: totalTasks,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };

        httpResponse(req, res, 200, responseMessage.SUCCESS, {
            tasks: tasksWithAssignments,
            pagination
        });
    } catch (err) {
        console.log('error', err);
        httpError(next, err, req, 500);
    }
},

    // Get a specific task by ID with associated students and subtasks (accessible to all members)
    getTaskById: async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const task = await Task.findById(taskId).lean();
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // Fetch associated assignments
            const studentAssignments = await StudentTaskAssignment.find({ taskId })
                .populate('studentId', "-password")
                .lean();
            const taskSubtaskAssignments = await TaskSubtaskAssignment.find({ taskId })
                .populate('studentId', "-password")
                .populate('subtaskId')
                .lean();

            task.students = studentAssignments.map(assignment => assignment.studentId);
            task.subtasks = taskSubtaskAssignments.map(assignment => ({
                subtask: assignment.subtaskId,
                student: assignment.studentId,
                status: assignment.status,
                isLocked: assignment.isLocked,
                dueDate: assignment.dueDate
            }));

            httpResponse(req, res, 200, responseMessage.SUCCESS, task);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


};