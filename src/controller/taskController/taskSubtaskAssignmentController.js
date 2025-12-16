import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { ValidateAddSubtasksToTask, ValidateRemoveSubtasksFromTask, ValidateUpdateTaskSubtaskAssignment, validateJoiSchema } from '../../service/validationService.js';
import Task from '../../model/taskModel.js';
import StudentTaskAssignment from '../../model/studentTaskAssignmentModel.js';
import TaskSubtaskAssignment from '../../model/taskSubtaskAssignmentModel.js';
import Subtask from '../../model/subtaskModel.js';
import Student from '../../model/studentModel.js';

export default {
    // Add subtasks to a task (ADMIN only)
    addSubtasksToTask: async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const { value, error } = validateJoiSchema(ValidateAddSubtasksToTask, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { subtaskIds } = value;

            // Find task
            const task = await Task.findById(taskId);
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // Validate subtaskIds exist
            const subtasks = await Subtask.find({ _id: { $in: subtaskIds } }).lean();
            if (subtasks.length !== subtaskIds.length) {
                return httpError(next, new Error('One or more subtaskIds are invalid'), req, 400);
            }

            // Fetch existing students assigned to the task
            const studentAssignments = await StudentTaskAssignment.find({ taskId }).lean();
            const studentIds = studentAssignments.map(assignment => assignment.studentId.toString());

            if (studentIds.length === 0) {
                return httpError(next, new Error('No students assigned to this task'), req, 400);
            }

            // Check for existing assignments to avoid duplicates
            const existingAssignments = await TaskSubtaskAssignment.find({
                taskId,
                subtaskId: { $in: subtaskIds },
                studentId: { $in: studentIds }
            }).lean();

            const existingSubtaskStudentPairs = new Set(
                existingAssignments.map(assignment => `${assignment.studentId.toString()}-${assignment.subtaskId.toString()}`)
            );

            // Create new TaskSubtaskAssignment records for non-duplicate pairs
            const assignmentPromises = [];
            studentIds.forEach(studentId => {
                subtaskIds.forEach(subtaskId => {
                    const pair = `${studentId}-${subtaskId}`;
                    if (!existingSubtaskStudentPairs.has(pair)) {
                        const assignment = new TaskSubtaskAssignment({
                            studentId,
                            taskId,
                            subtaskId,
                            assignedAt: new Date(),
                            status: "PENDING",
                            isLocked: false,
                            dueDate: null
                        });
                        assignmentPromises.push(assignment.save());
                    }
                });
            });

            if (assignmentPromises.length === 0) {
                return httpError(next, new Error('All subtasks are already assigned to all students'), req, 400);
            }

            await Promise.all(assignmentPromises);

            // Fetch updated task with associations
            const populatedTask = await Task.findById(task._id).lean();
            const updatedStudentAssignments = await StudentTaskAssignment.find({ taskId: task._id })
                .populate('studentId', 'name email')
                .lean();
            const updatedTaskSubtaskAssignments = await TaskSubtaskAssignment.find({ taskId: task._id })
                .populate('studentId', 'name email')
                .populate('subtaskId', 'title')
                .lean();

            populatedTask.students = updatedStudentAssignments.map(assignment => assignment.studentId);
            populatedTask.subtasks = updatedTaskSubtaskAssignments.map(assignment => ({
                subtask: assignment.subtaskId,
                student: assignment.studentId,
                status: assignment.status,
                isLocked: assignment.isLocked,
                dueDate: assignment.dueDate
            }));

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Subtasks added to task successfully',
                task: populatedTask
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Remove subtasks from a task (ADMIN only)
    removeSubtasksFromTask: async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const { value, error } = validateJoiSchema(ValidateRemoveSubtasksFromTask, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { subtaskIds } = value;

            // Find task
            const task = await Task.findById(taskId);
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // Check if assignments exist for the subtasks
            const assignmentsToRemove = await TaskSubtaskAssignment.find({
                taskId,
                subtaskId: { $in: subtaskIds }
            });

            if (assignmentsToRemove.length === 0) {
                return httpError(next, new Error('No matching subtasks found to remove'), req, 400);
            }

            // Prevent removal if any assignment is locked
            const lockedAssignments = assignmentsToRemove.filter(assignment => assignment.isLocked);
            if (lockedAssignments.length > 0) {
                return httpError(next, new Error('Cannot remove subtasks: some assignments are locked'), req, 403);
            }

            // Remove TaskSubtaskAssignment records
            await TaskSubtaskAssignment.deleteMany({
                taskId,
                subtaskId: { $in: subtaskIds }
            });

            // Fetch updated task with associations
            const populatedTask = await Task.findById(task._id).lean();
            const updatedStudentAssignments = await StudentTaskAssignment.find({ taskId: task._id })
                .populate('studentId', 'name email')
                .lean();
            const updatedTaskSubtaskAssignments = await TaskSubtaskAssignment.find({ taskId: task._id })
                .populate('studentId', 'name email')
                .populate('subtaskId', 'title')
                .lean();

            populatedTask.students = updatedStudentAssignments.map(assignment => assignment.studentId);
            populatedTask.subtasks = updatedTaskSubtaskAssignments.map(assignment => ({
                subtask: assignment.subtaskId,
                student: assignment.studentId,
                status: assignment.status,
                isLocked: assignment.isLocked,
                dueDate: assignment.dueDate
            }));

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Subtasks removed from task successfully',
                task: populatedTask
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update TaskSubtaskAssignment details (ADMIN only)
    updateTaskSubtaskAssignment: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateUpdateTaskSubtaskAssignment, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { assignmentId, status, isLocked, dueDate } = value;

            // Find the assignment
            const assignment = await TaskSubtaskAssignment.findById(assignmentId)
                .populate('studentId', 'name email')
                .populate('subtaskId', 'title')
                .populate('taskId', 'title');
            if (!assignment) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('TaskSubtaskAssignment')), req, 404);
            }

            // Update fields if provided
            if (status) assignment.status = status;
            if (isLocked !== undefined) assignment.isLocked = isLocked;
            if (dueDate !== undefined) assignment.dueDate = dueDate;

            await assignment.save();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'TaskSubtaskAssignment updated successfully',
                assignment
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    getSubTaskByTaskId: async (req, res, next) => {
        try {
            const { taskId } = req.params

            const { studentId } = req.query

            const isTaskExist = await Task.findById(taskId)
            if (!isTaskExist) {
                return httpError(next, new Error(responseMessage.NOT_FOUND("Task")), req, 400)
            }

            const query = {
                taskId,
            }

            if (studentId) {
                const isStudentExist = await Student.findById(studentId)
                if (!isStudentExist) {
                    return httpError(next, new Error(responseMessage.NOT_FOUND("Student")), req, 400)
                }
                query.studentId = isStudentExist?._id

            }

            const subTasks = await TaskSubtaskAssignment.find(query).populate("taskId").sort({ createdAt: -1 })


            httpResponse(req, res, 200, responseMessage.CUSTOM_MESSAGE("Subtask Fetch SuccessFully"), {
                subTasks
            })


        } catch (error) {
            httpError(next, err, req, 500);
        }
    }
};                                                                                                            