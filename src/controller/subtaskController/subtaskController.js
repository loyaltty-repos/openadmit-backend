import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { ValidateCreateSubtask, validateJoiSchema, ValidateUpdateSubtask,  } from '../../service/validationService.js';
import Questionnaire from '../../model/questionnaireModel.js';
import TaskSubtaskAssignment from '../../model/taskSubtaskAssignmentModel.js';
import SubtaskQuestionnaireAssignment from '../../model/subtaskQuestionnaireAssignmentModel.js';
import Subtask from '../../model/subtaskModel.js';

export default {
    // Create a new subtask with associated questionnaires (ADMIN only)
    createSubtask: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateCreateSubtask, req.body);
            if (error) return httpError(next, error, req, 422);

            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { questionnaireIds, ...subtaskData } = value;

            // Validate questionnaireIds exist
            if (questionnaireIds && questionnaireIds.length > 0) {
                const questionnaires = await Questionnaire.find({ _id: { $in: questionnaireIds } }).lean();
                if (questionnaires.length !== questionnaireIds.length) {
                    return httpError(next, new Error('One or more questionnaireIds are invalid'), req, 400);
                }
            }

            // Create new subtask
            const subtask = new Subtask(subtaskData);
            await subtask.save();

            // Create SubtaskQuestionnaireAssignment records
            if (questionnaireIds && questionnaireIds.length > 0) {
                const assignmentPromises = questionnaireIds.map(async (questionnaireId) => {
                    const assignment = new SubtaskQuestionnaireAssignment({
                        subtaskId: subtask._id,
                        questionnaireId,
                        assignedAt: new Date(),
                        status: "PENDING"
                    });
                    return assignment.save();
                });
                await Promise.all(assignmentPromises);
            }

            // Fetch the subtask with associated questionnaires
            const populatedSubtask = await Subtask.findById(subtask._id).lean();
            const assignments = await SubtaskQuestionnaireAssignment.find({ subtaskId: subtask._id })
                .populate('questionnaireId')
                .lean();
            populatedSubtask.questionnaires = assignments.map(assignment => assignment.questionnaireId);

            httpResponse(req, res, 201, responseMessage.SUCCESS, {
                message: 'Subtask created successfully',
                subtask: populatedSubtask
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update an existing subtask and its associated questionnaires (ADMIN only)
    updateSubtask: async (req, res, next) => {
        try {
            const { subtaskId } = req.params;
            const { value, error } = validateJoiSchema(ValidateUpdateSubtask, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            // Find subtask
            const subtask = await Subtask.findById(subtaskId);
            if (!subtask) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Subtask')), req, 404);
            }

            // Check if subtask is associated with a task and locked
            const taskSubtaskAssignment = await TaskSubtaskAssignment.findOne({ subtaskId });
            if (taskSubtaskAssignment && taskSubtaskAssignment.isLocked) {
                return httpError(next, new Error('Cannot update subtask: it is locked due to task assignment'), req, 403);
            }

            const { questionnaireIds, ...subtaskData } = value;

            // Update subtask fields
            if (subtaskData.title) subtask.title = subtaskData.title;
            if (subtaskData.description !== undefined) subtask.description = subtaskData.description;
            if (subtaskData.logo !== undefined) subtask.logo = subtaskData.logo;
            if (subtaskData.priority) subtask.priority = subtaskData.priority;

            await subtask.save();

            // Update SubtaskQuestionnaireAssignment records if questionnaireIds are provided
            if (questionnaireIds !== undefined) {
                // Validate questionnaireIds exist
                if (questionnaireIds.length > 0) {
                    const questionnaires = await Questionnaire.find({ _id: { $in: questionnaireIds } }).lean();
                    if (questionnaires.length !== questionnaireIds.length) {
                        return httpError(next, new Error('One or more questionnaireIds are invalid'), req, 400);
                    }
                }

                // Remove existing assignments
                await SubtaskQuestionnaireAssignment.deleteMany({ subtaskId });

                // Create new assignments
                if (questionnaireIds.length > 0) {
                    const assignmentPromises = questionnaireIds.map(async (questionnaireId) => {
                        const assignment = new SubtaskQuestionnaireAssignment({
                            subtaskId,
                            questionnaireId,
                            assignedAt: new Date(),
                            status: "PENDING"
                        });
                        return assignment.save();
                    });
                    await Promise.all(assignmentPromises);
                }
            }

            // Fetch the updated subtask with associated questionnaires
            const populatedSubtask = await Subtask.findById(subtask._id).lean();
            const assignments = await SubtaskQuestionnaireAssignment.find({ subtaskId })
                .populate('questionnaireId')
                .lean();
            populatedSubtask.questionnaires = assignments.map(assignment => assignment.questionnaireId);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Subtask updated successfully',
                subtask: populatedSubtask
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Delete a subtask and its associated questionnaire assignments (ADMIN only)
    deleteSubtask: async (req, res, next) => {
        try {
            const { subtaskId } = req.params;

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            // Check if subtask is associated with a task
            const taskSubtaskAssignment = await TaskSubtaskAssignment.findOne({ subtaskId });
            if (taskSubtaskAssignment) {
                return httpError(next, new Error('Cannot delete subtask: it is associated with a task'), req, 400);
            }

            // Find subtask
            const subtask = await Subtask.findById(subtaskId);
            if (!subtask) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Subtask')), req, 404);
            }

            // Delete associated SubtaskQuestionnaireAssignment records
            await SubtaskQuestionnaireAssignment.deleteMany({ subtaskId });

            // Delete subtask
            await Subtask.findByIdAndDelete(subtaskId);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Subtask deleted successfully'
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get all subtasks with associated questionnaires (accessible to all members)
    getAllSubtasks: async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
    
            const totalSubtasks = await Subtask.countDocuments();
    
            const subtasks = await Subtask.find()
                .skip(skip)
                .limit(limit)
                .lean();
    
            const subtaskIds = subtasks.map(subtask => subtask._id);
    
            const assignments = await SubtaskQuestionnaireAssignment.find({ subtaskId: { $in: subtaskIds } })
                .populate('questionnaireId')
                .lean();
    
            const subtasksWithQuestionnaires = subtasks.map(subtask => {
                const subtaskAssignments = assignments.filter(assignment => assignment.subtaskId.toString() === subtask._id.toString());
                subtask.questionnaires = subtaskAssignments.map(assignment => assignment.questionnaireId);
                return subtask;
            });
    
            const pagination = {
                total: totalSubtasks,
                page,
                limit,
                totalPages: Math.ceil(totalSubtasks / limit),
                hasNextPage: page < Math.ceil(totalSubtasks / limit),
                hasPrevPage: page > 1
            };
    
            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                subtasks: subtasksWithQuestionnaires,
                pagination
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get a specific subtask by ID with associated questionnaires (accessible to all members)
    getSubtaskById: async (req, res, next) => {
        try {
            const { subtaskId } = req.params;
            const subtask = await Subtask.findById(subtaskId).lean();
            if (!subtask) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Subtask')), req, 404);
            }

            // Fetch associated questionnaires
            const assignments = await SubtaskQuestionnaireAssignment.find({ subtaskId })
                .populate('questionnaireId', 'title')
                .lean();
            subtask.questionnaires = assignments.map(assignment => assignment.questionnaireId);

            httpResponse(req, res, 200, responseMessage.SUCCESS, subtask);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    }
};