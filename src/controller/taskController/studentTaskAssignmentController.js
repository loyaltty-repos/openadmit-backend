import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { ValidateAddStudentsToTask, ValidateUpdateStudentTaskAssignment, ValidateRemoveStudentFromTask, validateJoiSchema } from '../../service/validationService.js';
import StudentTaskAssignment from '../../model/studentTaskAssignmentModel.js';
import SubtaskQuestionnaireAssignment from '../../model/subtaskQuestionnaireAssignmentModel.js';
import Task from '../../model/taskModel.js';
import Student from '../../model/studentModel.js';
import TaskSubtaskAssignment from '../../model/taskSubtaskAssignmentModel.js';

export default {
    addStudentsToTask: async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const { value, error } = validateJoiSchema(ValidateAddStudentsToTask, req.body);
            if (error) return httpError(next, error, req, 422);

            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { studentIds } = value;

            // 1. Validate task exists
            const task = await Task.findById(taskId).lean();
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // 2. Validate all studentIds exist
            const students = await Student.find({ _id: { $in: studentIds } }).lean();
            if (students.length !== studentIds.length) {
                return httpError(next, new Error('One or more studentIds are invalid'), req, 400);
            }

            // 3. Get existing subtasks for this task
            const existingSubtaskAssignments = await StudentTaskAssignment.find({ taskId })
                .distinct('subtaskId')
                .lean();

            const subtaskIds = [...new Set(existingSubtaskAssignments.map(id => id.toString()))];

            // 4. Get questionnaire assignments per subtask
            const subtaskQuestionnaires = await SubtaskQuestionnaireAssignment.find({
                subtaskId: { $in: subtaskIds }
            }).lean();

            const questionnaireMap = new Map();
            subtaskQuestionnaires.forEach(sq => {
                const key = sq.subtaskId.toString();
                if (!questionnaireMap.has(key)) questionnaireMap.set(key, []);
                questionnaireMap.get(key).push(sq.questionnaireId);
            });

            // 5. Check for existing student assignments (per subtask + questionnaire)
            const existingAssignments = await StudentTaskAssignment.find({
                taskId,
                studentId: { $in: studentIds }
            }).lean();

            const existingKeys = new Set(
                existingAssignments.map(a =>
                    `${a.studentId.toString()}_${a.subtaskId?.toString()}_${a.questionnaireId?.toString()}`
                )
            );

            // 6. Build new assignment records
            const newAssignments = [];

            for (const studentId of studentIds) {
                for (const subtaskId of subtaskIds) {
                    const questionnaires = questionnaireMap.get(subtaskId) || [];

                    if (questionnaires.length === 0) {
                        // No questionnaire → one assignment
                        const key = `${studentId}_${subtaskId}_null`;
                        if (!existingKeys.has(key)) {
                            newAssignments.push({
                                studentId,
                                taskId,
                                subtaskId,
                                questionnaireId: null,
                                assignedAt: new Date(),
                                status: "PENDING",
                                isLocked: false,
                                dueDate: null
                            });
                        }
                    } else {
                        // One per questionnaire
                        for (const questionnaireId of questionnaires) {
                            const key = `${studentId}_${subtaskId}_${questionnaireId.toString()}`;
                            if (!existingKeys.has(key)) {
                                newAssignments.push({
                                    studentId,
                                    taskId,
                                    subtaskId,
                                    questionnaireId,
                                    assignedAt: new Date(),
                                    status: "PENDING",
                                    isLocked: false,
                                    dueDate: null
                                });
                            }
                        }
                    }
                }
            }

            if (newAssignments.length === 0) {
                return httpError(next, new Error('All students are already assigned to all subtasks/questionnaires'), req, 400);
            }

            // 7. Save new assignments
            await StudentTaskAssignment.insertMany(newAssignments);

            // 8. Return updated task
            const populatedTask = await Task.findById(taskId).lean();

            const updatedAssignments = await StudentTaskAssignment.find({ taskId })
                .populate('studentId', '-password')
                .populate('subtaskId')
                .populate('questionnaireId', 'title')
                .lean();

            const studentSet = new Set();
            const subtaskMap = new Map();

            updatedAssignments.forEach(a => {
                studentSet.add(a.studentId._id.toString());

                const subKey = a.subtaskId._id.toString();
                if (!subtaskMap.has(subKey)) {
                    subtaskMap.set(subKey, {
                        subtask: a.subtaskId,
                        status: a.status,
                        isLocked: a.isLocked,
                        dueDate: a.dueDate
                    });
                }
            });

            populatedTask.students = Array.from(studentSet).map(id =>
                updatedAssignments.find(a => a.studentId._id.toString() === id).studentId
            );
            populatedTask.subtasks = Array.from(subtaskMap.values());
            populatedTask.totalStudent = populatedTask.students.length;
            populatedTask.totalSubtask = populatedTask.subtasks.length;

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Students added to task successfully',
                task: populatedTask
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Remove a student from a task (ADMIN only)
    removeStudentFromTask: async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const { value, error } = validateJoiSchema(ValidateRemoveStudentFromTask, req.body);
            if (error) return httpError(next, error, req, 422);

            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { studentId } = value;

            // 1. Validate task
            const task = await Task.findById(taskId).lean();
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // 2. Validate student
            const student = await Student.findById(studentId).lean();
            if (!student) {
                return httpError(next, new Error('Student not found'), req, 404);
            }

            // 3. Find all StudentTaskAssignment for this student + task
            const assignments = await StudentTaskAssignment.find({ taskId, studentId }).lean();
            if (assignments.length === 0) {
                return httpError(next, new Error('Student is not assigned to this task'), req, 400);
            }

            // 4. Check if any assignment is locked
            const locked = assignments.some(a => a.isLocked);
            if (locked) {
                return httpError(next, new Error('Cannot remove student: one or more assignments are locked'), req, 403);
            }

            // 5. Delete all related StudentTaskAssignment entries
            await StudentTaskAssignment.deleteMany({ taskId, studentId });

            // 6. Return updated task
            const populatedTask = await Task.findById(taskId).lean();

            const updatedAssignments = await StudentTaskAssignment.find({ taskId })
                .populate('studentId', '-password')
                .populate('subtaskId')
                .populate('questionnaireId', 'title')
                .lean();

            const studentSet = new Set();
            const subtaskMap = new Map();

            updatedAssignments.forEach(a => {
                studentSet.add(a.studentId._id.toString());

                const subKey = a.subtaskId._id.toString();
                if (!subtaskMap.has(subKey)) {
                    subtaskMap.set(subKey, {
                        subtask: a.subtaskId,
                        status: a.status,
                        isLocked: a.isLocked,
                        dueDate: a.dueDate
                    });
                }
            });

            populatedTask.students = Array.from(studentSet).map(id =>
                updatedAssignments.find(a => a.studentId._id.toString() === id)?.studentId || null
            ).filter(Boolean);
            populatedTask.subtasks = Array.from(subtaskMap.values());
            populatedTask.totalStudent = populatedTask.students.length;
            populatedTask.totalSubtask = populatedTask.subtasks.length;

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Student removed from task successfully',
                task: populatedTask
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update StudentTaskAssignment details (ADMIN only)
    updateStudentTaskAssignment: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateUpdateStudentTaskAssignment, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { assignmentId, status, isLocked, dueDate } = value;

            // Find the assignment
            const assignment = await StudentTaskAssignment.findById(assignmentId)
                .populate('studentId')
                .populate('taskId');
            if (!assignment) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('StudentTaskAssignment')), req, 404);
            }

            // Update fields if provided
            if (status) assignment.status = status;
            if (isLocked !== undefined) assignment.isLocked = isLocked;
            if (dueDate !== undefined) assignment.dueDate = dueDate;

            await assignment.save();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'StudentTaskAssignment updated successfully',
                assignment
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    getTaskByStudentId: async (req, res, next) => {
        try {
            const { studentId } = req.params;

            const isStudentExist = await Student.findById(studentId);
            if (!isStudentExist) {
                return httpError(
                    next,
                    new Error(responseMessage.CUSTOM_MESSAGE("Student Not Found")),
                    req,
                    400
                );
            }

            // 1. Pull every assignment for the student
            const assignments = await StudentTaskAssignment.find({ studentId })
                .populate("taskId")
                .sort({ createdAt: -1 })
                .lean();

            // 2. Keep only the **first** occurrence of each taskId (preserves order)
            const seen = new Set();
            const uniqueAssignments = [];

            for (const ass of assignments) {
                const taskIdStr = ass.taskId?._id?.toString();
                if (taskIdStr && !seen.has(taskIdStr)) {
                    seen.add(taskIdStr);
                    uniqueAssignments.push(ass);           // keep the whole assignment object
                }
            }

            // 3. Build the `task` array exactly like before – just the populated task objects
            const task = uniqueAssignments
            // 4. **Exact same response format**
            httpResponse(
                req,
                res,
                200,
                responseMessage.CUSTOM_MESSAGE("Student Assigned Task"),
                { task }
            );

        } catch (error) {
            console.error("getTaskByStudentId error:", error);
            httpError(next, error, req, 500);
        }
    },

    getStudentUpcomingTasks: async (req, res, next) => {
        try {
            const studentId = req.authenticatedStudent._id.toString();
            const { page = 1, limit = 10 } = req.query;

            const skip = (page - 1) * limit;
            const currentDate = new Date(); // Dynamic current date and time (e.g., 2025-07-10T16:44:00+05:30)

            const taskAssignments = await StudentTaskAssignment.find({
                studentId,
                status: { $in: ['PENDING', 'IN_PROGRESS'] },
                $or: [
                    { dueDate: { $ne: null } },
                    { dueDate: null }
                ]
            })
                .populate({
                    path: 'taskId',
                    select: 'title description logo priority assignee createdDate category',
                    populate: {
                        path: 'category',
                        select: 'name description'
                    }
                })
                .populate({
                    path: 'assignee',
                    select: 'name email role'
                })
                .sort({ dueDate: 1, assignedAt: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await StudentTaskAssignment.countDocuments({
                studentId,
                status: { $in: ['PENDING', 'IN_PROGRESS'] },
                $or: [
                    { dueDate: { $ne: null } },
                    { dueDate: null }
                ]
            });

            const upcomingTasks = taskAssignments.map(ta => ({
                ...ta.taskId,
                assignedAt: ta.assignedAt,
                dueDate: ta.dueDate,
                status: ta.status,
                isLocked: ta.isLocked,
                isOverdue: ta.dueDate && ta.dueDate < currentDate,
                createdAt: ta.createdAt,
                updatedAt: ta.updatedAt
            }));

            const responseData = {
                message: "I'm running from the updated function",
                total: total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
                upcomingTasks: upcomingTasks
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    getStudentUpcomingTasks: async (req, res, next) => {
        try {
            const studentId = req.authenticatedStudent._id.toString();
            let { page = 1, limit = 10 } = req.query;

            // Ensure numbers
            page = parseInt(page, 10) || 1;
            limit = parseInt(limit, 10) || 10;

            const skip = (page - 1) * limit;
            const currentDate = new Date();

            const taskAssignments = await StudentTaskAssignment.find({
                studentId,
                status: { $in: ['PENDING', 'IN_PROGRESS'] }
                // your $or on dueDate was effectively doing nothing, so I removed it
            })
                .populate({
                    path: 'taskId',
                    select: 'title description logo priority assignee createdDate category',
                    populate: {
                        path: 'category',
                        select: 'name description'
                    }
                })
                .sort({ dueDate: 1, assignedAt: 1 })
                .skip(skip)
                .limit(limit)
                .lean();

            // This still counts total assignments, same as before
            const total = await StudentTaskAssignment.countDocuments({
                studentId,
                status: { $in: ['PENDING', 'IN_PROGRESS'] }
            });

            // ✅ Remove duplicates by taskId
            // because you might have multiple StudentTaskAssignment docs
            // pointing to the same taskId for the same student
            const seenTaskIds = new Set();
            const upcomingTasks = [];

            for (const ta of taskAssignments) {
                if (!ta.taskId) continue; // safety guard

                const taskId = ta.taskId._id.toString();

                // Skip if we've already pushed this task once
                if (seenTaskIds.has(taskId)) continue;
                seenTaskIds.add(taskId);

                upcomingTasks.push({
                    ...ta.taskId,
                    assignedAt: ta.assignedAt,
                    dueDate: ta.dueDate,
                    status: ta.status,
                    isLocked: ta.isLocked,
                    isOverdue: ta.dueDate ? ta.dueDate < currentDate : null,
                    createdAt: ta.createdAt,
                    updatedAt: ta.updatedAt
                });
            }

            const responseData = {
                total: total, // still total assignments; change to upcomingTasks.length if you prefer
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit: limit,
                upcomingTasks: upcomingTasks
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


    // Admin side
    getUpcomingDeadlines: async (req, res, next) => {
        try {


            const { page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;
            const currentDate = new Date();

            const taskAssignments = await TaskSubtaskAssignment.find({
                status: { $in: ['PENDING', 'IN_PROGRESS'] },
                $or: [
                    { dueDate: { $lt: currentDate } },
                    { dueDate: { $gte: currentDate } },
                    { dueDate: null }
                ]
            })
                .populate({
                    path: 'taskId',
                    select: 'title description logo priority assignee createdDate category',
                    populate: {
                        path: 'category',
                        select: 'name description'
                    }
                })
                .populate({
                    path: 'studentId',
                    select: 'name email profilePicture phoneNumber status'
                })
                .sort({ dueDate: 1, assignedAt: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await TaskSubtaskAssignment.countDocuments({
                status: { $in: ['PENDING', 'IN_PROGRESS'] },
                $or: [
                    { dueDate: { $lt: currentDate } },
                    { dueDate: { $gte: currentDate } },
                    { dueDate: null }
                ]
            });

            const upcomingDeadlines = taskAssignments.map(ta => ({
                ...ta.taskId,
                student: ta.studentId,
                assignedAt: ta.assignedAt,
                dueDate: ta.dueDate,
                status: ta.status,
                isLocked: ta.isLocked,
                isOverdue: ta.dueDate && ta.dueDate < currentDate,
                isUpcoming: ta.dueDate && ta.dueDate >= currentDate,
                createdAt: ta.createdAt,
                updatedAt: ta.updatedAt
            }));

            const responseData = {
                total: total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
                upcomingDeadlines: upcomingDeadlines
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    }

};