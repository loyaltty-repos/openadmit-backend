import httpResponse from '../../util/httpResponse.js';
import httpError from '../../util/httpError.js';
import responseMessage from '../../constant/responseMessage.js';
import { ValidateUniversityCreate, ValidateUniversityUpdate, ValidateUniversityQuery, validateJoiSchema } from '../../service/validationService.js';
import University from '../../model/universityModel.js';
import StudentUniversityAssignment from '../../model/studentUniversityAssignmentModel.js';
export default {
    // Create a new university 
    createUniversity: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateUniversityCreate, req.body);
            if (error) {
                return httpError(next, error, req, 422);
            }

            const university = new University(value);
            await university.save();

            httpResponse(req, res, 201, responseMessage.SUCCESS, { message: 'University created successfully', universityId: university._id });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get all universities with filters, pagination, and search 
    getAllUniversities: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateUniversityQuery, req.query);
            if (error) {
                return httpError(next, error, req, 422);
            }

            const { page, limit, name, program, university_type, university_category, min_acceptance_rate, max_acceptance_rate, min_living_cost_per_year, max_living_cost_per_year, min_tuition_fees_per_year, max_tuition_fees_per_year, min_application_fee, max_application_fee, search } = value;
            const skip = (page - 1) * limit;

            // Build query
            const query = {};
            if (name) query.name = { $regex: name, $options: 'i' };
            if (program) query.program = { $regex: program, $options: 'i' };
            if (university_type) query.university_type = { $regex: university_type, $options: 'i' };
            if (university_category) query.university_category = { $regex: university_category, $options: 'i' };
            if (min_acceptance_rate || max_acceptance_rate) {
                query.acceptance_rate = {};
                if (min_acceptance_rate) query.acceptance_rate.$gte = min_acceptance_rate;
                if (max_acceptance_rate) query.acceptance_rate.$lte = max_acceptance_rate;
            }
            if (min_living_cost_per_year || max_living_cost_per_year) {
                query.living_cost_per_year = {};
                if (min_living_cost_per_year) query.living_cost_per_year.$gte = min_living_cost_per_year;
                if (max_living_cost_per_year) query.living_cost_per_year.$lte = max_living_cost_per_year;
            }
            if (min_tuition_fees_per_year || max_tuition_fees_per_year) {
                query.tuition_fees_per_year = {};
                if (min_tuition_fees_per_year) query.tuition_fees_per_year.$gte = min_tuition_fees_per_year;
                if (max_tuition_fees_per_year) query.tuition_fees_per_year.$lte = max_tuition_fees_per_year;
            }
            if (min_application_fee || max_application_fee) {
                query.application_fee = {};
                if (min_application_fee) query.application_fee.$gte = min_application_fee;
                if (max_application_fee) query.application_fee.$lte = max_application_fee;
            }

            // Search across multiple fields
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { program: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { location: { $regex: search, $options: 'i' } },
                    { university_type: { $regex: search, $options: 'i' } },
                    { university_category: { $regex: search, $options: 'i' } }
                ];
            }

            const universities = await University.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await University.countDocuments(query);
            const totalPages = Math.ceil(total / limit);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                universities,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit
                }
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get university by ID 
    getUniversityById: async (req, res, next) => {
        try {
            const { id } = req.params;

            const university = await University.findById(id);
            if (!university) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('University')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, university);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update a university 
    updateUniversity: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { value, error } = validateJoiSchema(ValidateUniversityUpdate, req.body);
            if (error) {
                return httpError(next, error, req, 422);
            }

            const updatedUniversity = await University.findByIdAndUpdate(id, { $set: value }, { new: true, runValidators: true });
            if (!updatedUniversity) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('University')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedUniversity);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Delete a university (Admin-only)
    deleteUniversity: async (req, res, next) => {
        try {
            const { id } = req.params;


            const isUniversityExist = await University.findById(id)
            if (!isUniversityExist) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('University')), req, 404);
            }

            const isUniversityAssignedToTheStudent = await StudentUniversityAssignment.findOne({
                universityId: isUniversityExist._id
            })

            if (isUniversityAssignedToTheStudent) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE('This University is Assigned To the Student ')), req, 404);
            }

            const deletedUniversity = await University.findByIdAndDelete(id);

            httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'University deleted successfully' });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    }
};