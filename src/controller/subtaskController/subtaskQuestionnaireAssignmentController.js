import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { ValidateUpdateSubtaskQuestionnaireAssignment, validateJoiSchema } from '../../service/validationService.js';
import SubtaskQuestionnaireAssignment from '../../model/subtaskQuestionnaireAssignmentModel.js';

export default {
    // Update the status of a SubtaskQuestionnaireAssignment (ADMIN only)
    updateAssignmentStatus: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateUpdateSubtaskQuestionnaireAssignment, req.body);
            if (error) return httpError(next, error, req, 422);

    
            const { assignmentId, status } = value;

            const assignment = await SubtaskQuestionnaireAssignment.findById(assignmentId)
                .populate('subtaskId')
                .populate('questionnaireId');
            if (!assignment) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('SubtaskQuestionnaireAssignment')), req, 404);
            }

            // Update the status
            assignment.status = status;
            await assignment.save();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Assignment status updated successfully',
                assignment
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    }
};