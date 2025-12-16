
import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import Task from '../../model/taskModel.js';
import TaskCategory from '../../model/taskCategoryModel.js';
import { ValidateCreateTaskCategory, validateJoiSchema, ValidateUpdateTaskCategory } from '../../service/validationService.js';
import mongoose from 'mongoose';
export default {


    // Create a new task category (ADMIN only)
    createTaskCategory: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateCreateTaskCategory, req.body);
            if (error) return httpError(next, error, req, 422);



            const { name, description } = value;
            const existingCategory = await TaskCategory.findOne({ name }).lean();
            if (existingCategory) return httpError(next, new Error('Category name already exists'), req, 400);

            const category = new TaskCategory({ name, description });
            await category.save();

            httpResponse(req, res, 201, responseMessage.SUCCESS, { message: 'Task category created successfully', category });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update a task category (ADMIN only)
    updateTaskCategory: async (req, res, next) => {
        try {
            const { categoryId } = req.params;
            const { value, error } = validateJoiSchema(ValidateUpdateTaskCategory, req.body);
            if (error) return httpError(next, error, req, 422);



            const category = await TaskCategory.findById(categoryId);
            if (!category) return httpError(next, new Error(responseMessage.NOT_FOUND('Task Category')), req, 404);

            if (value.name) {
                const existingCategory = await TaskCategory.findOne({ name: value.name, _id: { $ne: categoryId } }).lean();
                if (existingCategory) return httpError(next, new Error('Category name already exists'), req, 400);
                category.name = value.name;
            }
            if (value.description !== undefined) category.description = value.description;

            await category.save();
            const populatedCategory = await TaskCategory.findById(category._id).lean();

            httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Task category updated successfully', category: populatedCategory });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Delete a task category (ADMIN only)
    deleteTaskCategory: async (req, res, next) => {
        try {
            const { categoryId } = req.params;

            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const category = await TaskCategory.findById(categoryId);
            if (!category) return httpError(next, new Error(responseMessage.NOT_FOUND('Task Category')), req, 404);

            const tasksWithCategory = await Task.find({ category: categoryId }).lean();
            if (tasksWithCategory.length > 0) return httpError(next, new Error('Cannot delete category with associated tasks'), req, 400);

            await TaskCategory.findByIdAndDelete(categoryId);

            httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Task category deleted successfully' });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get all task categories with pagination and filtering (ADMIN only)
    getAllTaskCategories: async (req, res, next) => {
        try {


            const { page = 1, limit = 10, search } = req.query;

            const query = {};
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }

            const skip = (page - 1) * limit;
            const total = await TaskCategory.countDocuments(query);

            const categories = await TaskCategory.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const responseData = {
                total: total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
                categories: categories
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get task category by ID (ADMIN only)
    getTaskCategoryById: async (req, res, next) => {
        try {


            const { categoryId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE('Invalid category ID')), req, 400);
            }

            const category = await TaskCategory.findById(categoryId).lean();
            if (!category) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task Category')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, { category });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    }
}