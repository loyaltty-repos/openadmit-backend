import httpResponse from '../../util/httpResponse.js';
import httpError from '../../util/httpError.js';
import responseMessage from '../../constant/responseMessage.js';
import { ValidateLoanApplication, ValidateLoanQuery, validateJoiSchema } from '../../service/validationService.js';
import Loan from '../../model/loanModel.js';
import StudentActivity from '../../model/studentActivitySchema.js';
import { ACTIVITY_STATUSES, ACTIVITY_TYPES } from '../../constant/application.js';

export default {
    // Apply for a loan (Authenticated Student only)
    applyForLoan: async (req, res, next) => {
        try {
            const student = req.authenticatedStudent;

            const { value, error } = validateJoiSchema(ValidateLoanApplication, req.body);
            if (error) {
                return httpError(next, error, req, 422);
            }

            const loanData = {
                ...value,
                appliedBy: student._id
            };

            const loan = new Loan(loanData);
            await loan.save();

            // const activity = new StudentActivity({
            //     studentId: student._id,
            //     activityType: ACTIVITY_TYPES.LOAN_APPLICATION,
            //     message: `Student ${student.email} applied for a loan`,
            //     status: ACTIVITY_STATUSES.SUBMITTED,
            //     details: { loanId: loan._id }
            // });
            // await activity.save();

            httpResponse(req, res, 201, responseMessage.SUCCESS, { message: 'Loan application submitted successfully', loanId: loan._id });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get all loan applications with filters, pagination, and search (Admin-only)
    getAllLoans: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateLoanQuery, req.query);
            if (error) {
                return httpError(next, error, req, 422);
            }

            const { page, limit, status, search, admissionTerm, admissionStatus } = value;
            const skip = (page - 1) * limit;

            // Build query
            const query = {};
            if (status) query.status = status;
            if (admissionTerm) query.admissionTerm = admissionTerm;
            if (admissionStatus) query.admissionStatus = admissionStatus;

            // Search across multiple fields
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { 'coBorrower.name': { $regex: search, $options: 'i' } },
                    { 'coBorrower.universitiesReceivedAdmitFrom': { $regex: search, $options: 'i' } },
                ];
            }

            const loans = await Loan.find(query)
                .populate('appliedBy', '-password')
                .sort({ createdDate: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Loan.countDocuments(query);
            const totalPages = Math.ceil(total / limit);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                loans,
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
    }
};