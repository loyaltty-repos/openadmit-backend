import httpResponse from '../../util/httpResponse.js';
import httpError from '../../util/httpError.js';
import responseMessage from '../../constant/responseMessage.js';
import University from '../../model/universityModel.js';
import Student from '../../model/studentModel.js';
import StudentUniversityAssignment from '../../model/studentUniversityAssignmentModel.js';
import { ValidateCreateStudentUniversityAssignment, ValidateUpdateStudentUniversityAssignment, ValidateFilterStudentUniversityAssignments, validateJoiSchema } from '../../service/validationService.js';
import mongoose from 'mongoose';

export default {
    // Create a new student-university assignment (ADMIN only)
    createStudentUniversityAssignment: async (req, res, next) => {
        try {
            // Validate input
            const { value, error } = validateJoiSchema(ValidateCreateStudentUniversityAssignment, req.body);
            if (error) return httpError(next, error, req, 422);



            const { studentId, universityId, admissionStatus, admissionComments, universityStatus } = value;

            // Validate student exists
            const student = await Student.findById(studentId).lean();
            if (!student) {
                return httpError(next, new Error('Student not found'), req, 404);
            }

            // Validate university exists
            const university = await University.findById(universityId).lean();
            if (!university) {
                return httpError(next, new Error('University not found'), req, 404);
            }

            // Check for duplicate assignment
            const existingAssignment = await StudentUniversityAssignment.findOne({
                studentId,
                universityId
            }).lean();
            if (existingAssignment) {
                return httpError(next, new Error('Student is already assigned to this university'), req, 400);
            }

            // Create new assignment
            const assignment = new StudentUniversityAssignment({
                studentId,
                universityId,
                assignedBy: req.authenticatedMember._id,
                admissionStatus,
                admissionComments,
                universityStatus
            });
            await assignment.save();

            // Fetch the assignment with populated fields
            const populatedAssignment = await StudentUniversityAssignment.findById(assignment._id)
                .populate('studentId', 'name email')
                .populate('universityId', 'name program')
                .populate('assignedBy', 'name email')
                .lean();

            httpResponse(req, res, 201, responseMessage.SUCCESS, {
                message: 'Student-university assignment created successfully',
                assignment: populatedAssignment
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update student-university assignment details (ADMIN only)
    updateStudentUniversityAssignment: async (req, res, next) => {
        try {
            const { assignmentId } = req.params;
            const { value, error } = validateJoiSchema(ValidateUpdateStudentUniversityAssignment, req.body);
            if (error) return httpError(next, error, req, 422);



            const { studentId, universityId, admissionStatus, admissionComments, universityStatus } = value;

            // Find assignment
            const assignment = await StudentUniversityAssignment.findById(assignmentId);
            if (!assignment) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Student-university assignment')), req, 404);
            }

            // If studentId or universityId is provided, validate and check for duplicates
            if (studentId || universityId) {
                const updatedStudentId = studentId || assignment.studentId;
                const updatedUniversityId = universityId || assignment.universityId;

                // Validate student exists
                if (studentId) {
                    const student = await Student.findById(studentId).lean();
                    if (!student) {
                        return httpError(next, new Error('Student not found'), req, 404);
                    }
                }

                // Validate university exists
                if (universityId) {
                    const university = await University.findById(universityId).lean();
                    if (!university) {
                        return httpError(next, new Error('University not found'), req, 404);
                    }
                }

                // Check for duplicate assignment (excluding the current assignment)
                const existingAssignment = await StudentUniversityAssignment.findOne({
                    studentId: updatedStudentId,
                    universityId: updatedUniversityId,
                    _id: { $ne: assignmentId }
                }).lean();
                if (existingAssignment) {
                    return httpError(next, new Error('Student is already assigned to this university'), req, 400);
                }

                assignment.studentId = updatedStudentId;
                assignment.universityId = updatedUniversityId;
            }

            // Update other fields if provided
            if (admissionStatus !== undefined) assignment.admissionStatus = admissionStatus;
            if (admissionComments !== undefined) assignment.admissionComments = admissionComments;
            if (universityStatus !== undefined) assignment.universityStatus = universityStatus;

            await assignment.save();

            // Fetch updated assignment with populated fields
            const populatedAssignment = await StudentUniversityAssignment.findById(assignment._id)
                .populate('studentId', 'name email')
                .populate('universityId', 'name program')
                .populate('assignedBy', 'name email')
                .lean();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Student-university assignment updated successfully',
                assignment: populatedAssignment
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Delete a student-university assignment (ADMIN only)
    deleteStudentUniversityAssignment: async (req, res, next) => {
        try {
            const { assignmentId } = req.params;

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            // Find assignment
            const assignment = await StudentUniversityAssignment.findById(assignmentId);
            if (!assignment) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Student-university assignment')), req, 404);
            }

            // Delete assignment
            await StudentUniversityAssignment.findByIdAndDelete(assignmentId);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Student-university assignment deleted successfully'
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get all student-university assignments with pagination and filtering (ADMIN only)
    getAllStudentUniversityAssignments: async (req, res, next) => {
        try {
            // Validate filter query
            const { value, error } = validateJoiSchema(ValidateFilterStudentUniversityAssignments, { ...req.query });
            if (error) return httpError(next, error, req, 422);


            const { studentId, universityId, admissionStatus, universityStatus, page, limit } = value;
            const skip = (page - 1) * limit;

            // Build query
            const query = {};
            if (studentId) query.studentId = studentId;
            if (universityId) query.universityId = universityId;
            if (admissionStatus) query.admissionStatus = admissionStatus;
            if (universityStatus) query.universityStatus = universityStatus;

            // Fetch total count for pagination
            const totalAssignments = await StudentUniversityAssignment.countDocuments(query);

            // Fetch paginated assignments
            const assignments = await StudentUniversityAssignment.find(query)
                .skip(skip)
                .limit(limit)
                .populate('studentId', 'name email')
                .populate('universityId', 'name program')
                .populate('assignedBy', 'name email')
                .lean();

            // Pagination metadata
            const pagination = {
                total: totalAssignments,
                page,
                limit,
                totalPages: Math.ceil(totalAssignments / limit),
                hasNextPage: page < Math.ceil(totalAssignments / limit),
                hasPrevPage: page > 1
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                assignments,
                pagination
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get a specific student-university assignment by ID (ADMIN only)
    getStudentUniversityAssignmentById: async (req, res, next) => {
        try {
            const { assignmentId } = req.params;



            const assignment = await StudentUniversityAssignment.findById(assignmentId)
                .populate('studentId', 'name email')
                .populate('universityId', 'name program')
                .populate('assignedBy', 'name email')
                .lean();

            if (!assignment) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Student-university assignment')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, assignment);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    }
};