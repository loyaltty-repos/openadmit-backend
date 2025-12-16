import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { ValidateCreateQuestionnaire, ValidateUpdateQuestionnaire, ValidateDeleteQuestion, validateJoiSchema, questionSchema } from '../../service/validationService.js';
import Questionnaire from '../../model/questionnaireModel.js';
import Joi from 'joi'
import SubtaskQuestionnaireAssignment from '../../model/subtaskQuestionnaireAssignmentModel.js';
export default {

    createQuestionnaire: async (req, res, next) => {
        try {

            const { value, error } = validateJoiSchema(ValidateCreateQuestionnaire, req.body);
            if (error) return httpError(next, error, req, 422);


            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }


            const questionnaire = new Questionnaire(value);
            await questionnaire.save();

            httpResponse(req, res, 201, responseMessage.SUCCESS, {
                message: 'Questionnaire created successfully',
                questionnaire
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


    updateQuestionnaire: async (req, res, next) => {
        try {
            const { questionnaireId } = req.params;
            const { value, error } = validateJoiSchema(ValidateUpdateQuestionnaire, req.body);
            if (error) return httpError(next, error, req, 422);


            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }


            const questionnaire = await Questionnaire.findById(questionnaireId);
            if (!questionnaire) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Questionnaire')), req, 404);
            }


            if (value.title) questionnaire.title = value.title;
            if (value.description !== undefined) questionnaire.description = value.description;
            if (value.status) questionnaire.status = value.status;


            if (value.questions) {
                questionnaire.questions = value.questions;
            }

            await questionnaire.save();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Questionnaire updated successfully',
                questionnaire
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


    addQuestion: async (req, res, next) => {
        try {
            const { questionnaireId } = req.params;
            const { value, error } = validateJoiSchema(Joi.object({ question: questionSchema.required() }), req.body);
            if (error) return httpError(next, error, req, 422);


            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }


            const questionnaire = await Questionnaire.findById(questionnaireId);
            if (!questionnaire) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Questionnaire')), req, 404);
            }

            questionnaire.questions.push(value.question);
            await questionnaire.save();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Question added successfully',
                questionnaire
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


    deleteQuestion: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateDeleteQuestion, req.body);
            if (error) return httpError(next, error, req, 422);

            const { questionnaireId, questionId } = value;


            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }


            const questionnaire = await Questionnaire.findById(questionnaireId);
            if (!questionnaire) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Questionnaire')), req, 404);
            }

            const questionIndex = questionnaire.questions.findIndex(q => q._id.toString() === questionId);
            if (questionIndex === -1) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Question')), req, 404);
            }

            questionnaire.questions.splice(questionIndex, 1);
            await questionnaire.save();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Question deleted successfully',
                questionnaire
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


    deleteQuestionnaire: async (req, res, next) => {
        try {
            const { questionnaireId } = req.params;

       

            const isAssignedToSubtask = await SubtaskQuestionnaireAssignment.findOne({
                questionnaireId:questionnaireId
            })

            if(isAssignedToSubtask){
                   return httpError(next, new Error('Cannot delete Questionnaire: it is associated with a Subtask'), req, 400);
            }

            // Find and delete questionnaire
            const questionnaire = await Questionnaire.findByIdAndDelete(questionnaireId);
            if (!questionnaire) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Questionnaire')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Questionnaire deleted successfully'
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


    getAllQuestionnaires: async (req, res, next) => {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                status = ''
            } = req.query;

            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            const skip = (pageNumber - 1) * limitNumber;

            let query = {};

            if (status && ['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(status.toUpperCase())) {
                query.status = status.toUpperCase();
            }

            if (search.trim()) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            const [questionnaires, total] = await Promise.all([
                Questionnaire.find(query)
                    .skip(skip)
                    .limit(limitNumber)
                    .sort({ createdAt: -1 })
                    .lean(),
                Questionnaire.countDocuments(query)
            ]);

            const totalPages = Math.ceil(total / limitNumber);

            const result = {
                questionnaires,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limitNumber,
                    hasNextPage: pageNumber < totalPages,
                    hasPreviousPage: pageNumber > 1
                }
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, result);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


    getQuestionnaireById: async (req, res, next) => {
        try {
            const { questionnaireId } = req.params;
            const questionnaire = await Questionnaire.findById(questionnaireId).lean();
            if (!questionnaire) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Questionnaire')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, questionnaire);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    }
};