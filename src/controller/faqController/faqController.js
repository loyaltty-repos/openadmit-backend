import httpError from '../../util/httpError.js';
import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import { ValidateFaq, validateJoiSchema } from '../../service/validationService.js';
import Category from '../../model/categoryModel.js';
import Faq from '../../model/faqModel.js';
import mongoose from 'mongoose';

export default {

    // Create a new FAQ (Admin-only)
    createFaq: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateFaq, req.body);

            if (error) {
                return httpError(next, error, req, 422);
            }

            const { question, answer, categoryId } = value;

            if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE('Invalid category ID')), req, 400);
            }

            const category = await Category.findById(categoryId);
            if (!category) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Category')), req, 404);
            }

            const faq = new Faq({ question, answer, categoryId });
            await faq.save();

            httpResponse(req, res, 201, responseMessage.SUCCESS, { message: 'FAQ created successfully', faqId: faq._id });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Also the public
    getFaqs: async (req, res, next) => {
        try {
            const { categoryId } = req.query;

            if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE('Invalid category ID')), req, 400);
            }

            if (categoryId) {
                const category = await Category.findById(categoryId);
                if (!category) {
                    return httpError(next, new Error(responseMessage.NOT_FOUND('Category')), req, 404);
                }
            }


            let faqs;

            if (categoryId) {
                faqs = await Faq.find({ categoryId: categoryId }).sort({ createdDate: -1 });
            } else {
                faqs = await Faq.aggregate([
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'categoryId',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },
                    {
                        $unwind: {
                            path: '$category',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $sort: { 'category.name': 1, createdDate: -1 }
                    },
                    {
                        $group: {
                            _id: '$category._id',
                            category: { $first: '$category' },
                            faqs: { $push: '$$ROOT' }
                        }
                    },
                    {
                        $sort: { 'category.name': 1 }
                    }
                ]);
            }

            // Return the FAQs in the response
            httpResponse(req, res, 200, responseMessage.SUCCESS, faqs);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update an FAQ (Admin-only)
    updateFaq: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { value, error } = validateJoiSchema(ValidateFaq, req.body);

            if (error) {
                return httpError(next, error, req, 422);
            }

            const updateData = value;

            const updatedFaq = await Faq.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
            if (!updatedFaq) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('FAQ')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedFaq);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Delete an FAQ (Admin-only)
    deleteFaq: async (req, res, next) => {
        try {
            const { id } = req.params;

            const deletedFaq = await Faq.findByIdAndDelete(id);
            if (!deletedFaq) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('FAQ')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'FAQ deleted successfully' });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    }
};