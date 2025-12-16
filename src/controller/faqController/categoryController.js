import httpError from '../../util/httpError.js';
import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import { ValidateCategory, validateJoiSchema } from '../../service/validationService.js';
import Category from '../../model/categoryModel.js';
import Faq from '../../model/faqModel.js';

export default {
    // Create a new category (Admin-only)
    createCategory: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateCategory, req.body);

            if (error) {
                return httpError(next, error, req, 422);
            }

            const { name, description } = value;

            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE('Category already exists')), req, 409);
            }

            const category = new Category({ name, description });
            await category.save();

            httpResponse(req, res, 201, responseMessage.SUCCESS, { message: 'Category created successfully', categoryId: category._id });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Public apis 
    getAllCategories: async (req, res, next) => {
        try {
            const categories = await Category.find();
            httpResponse(req, res, 200, responseMessage.SUCCESS, categories);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update a category (Admin-only)
    updateCategory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { value, error } = validateJoiSchema(ValidateCategory, req.body);

            if (error) {
                return httpError(next, error, req, 422);
            }

            const updateData = value;

            const updatedCategory = await Category.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
            if (!updatedCategory) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Category')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedCategory);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Delete a category (Admin-only)
    deleteCategory: async (req, res, next) => {
        try {
            const { id } = req.params;

            const deletedCategory = await Category.findByIdAndDelete(id);
            if (!deletedCategory) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Category')), req, 404);
            }

            await Faq.deleteMany({ categoryId: id }); // Cascade delete FAQs
            httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Category and associated FAQs deleted successfully' });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
};