import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { getStudentsSchema, studentIdSchema, validateJoiSchema } from '../../service/validationService.js';
import Student from '../../model/studentModel.js';

export default {
    getStudents: async (req, res, next) => {
        try {
            const query = req.query;

            const { error, value } = validateJoiSchema(getStudentsSchema, query);
            if (error) {
                return httpError(next, error, req, 400);
            }

            const { page, limit, search, status, isVerified, sortBy, sortOrder } = value;

            const queryObj = {};
            if (status) queryObj.status = status;
            if (isVerified !== undefined) queryObj.isVerified = isVerified;
            if (search) {
                queryObj.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phoneNumber: { $regex: search, $options: 'i' } },
                    { 'personalDetails.address': { $regex: search, $options: 'i' } },
                    { 'collegeDetails.branch': { $regex: search, $options: 'i' } },
                    { 'collegeDetails.university': { $regex: search, $options: 'i' } },
                ];
            }

            const skip = (page - 1) * limit;
            const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

            const students = await Student.find(queryObj)
                .select('-password')
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .lean();

            const totalStudents = await Student.countDocuments(queryObj);
            const totalPages = Math.ceil(totalStudents / limit);

            const data = {
                students,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalStudents,
                    limit,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, data);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    getStudentById: async (req, res, next) => {
        try {
            const params = req.params;

            const { error, value } = validateJoiSchema(studentIdSchema, params);
            if (error) {
                return httpError(next, error, req, 400);
            }

            const { studentId } = value;

            const student = await Student.findById(studentId)
                .select('-password')
                .lean();

            if (!student) {
                return httpError(next, new Error('Student not found'), req, 404);
            }

            const data = {
                student,
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, data);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    deleteStudent: async (req, res, next) => {
        try {
            const params = req.params;

            const { error, value } = validateJoiSchema(studentIdSchema, params);
            if (error) {
                return httpError(next, error, req, 400);
            }

            const { studentId } = value;

            const student = await Student.findById(studentId);
            if (!student) {
                return httpError(next, new Error('Student not found'), req, 404);
            }

            await Student.findByIdAndDelete(studentId);

            const data = {
                message: 'Student deleted successfully',
                studentId,
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, data);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


    updateStudentDetails: async (req, res, next) => {
        try {
            const params = req.params;
            const body = req.body;

            const { error: idError, value: idValue } = validateJoiSchema(studentIdSchema, params);
            if (idError) {
                return httpError(next, idError, req, 400);
            }
            const { studentId } = idValue;



            const updateData = {};
            if (body.name) updateData.name = body.name;
            if (body.profilePicture) updateData.profilePicture = body.profilePicture;
            if (body.phoneNumber) updateData.phoneNumber = body.phoneNumber;
            if (body.status) updateData.status = body.status;
            if (body.isFeePaid !== undefined) updateData.isFeePaid = body.isFeePaid;
            if (body.isVerified !== undefined) updateData.isVerified = body.isVerified;

            if (body.programDetails) {
                updateData['programDetails.program'] = body.programDetails.program;
                updateData['programDetails.validity'] = body.programDetails.validity;
            }
            if (body.personalDetails) {
                updateData['personalDetails.dob'] = body.personalDetails.dob;
                updateData['personalDetails.gender'] = body.personalDetails.gender;
                updateData['personalDetails.address'] = body.personalDetails.address;
                updateData['personalDetails.profession'] = body.personalDetails.profession;
            }
            if (body.collegeDetails) {
                updateData['collegeDetails.branch'] = body.collegeDetails.branch;
                updateData['collegeDetails.highestDegree'] = body.collegeDetails.highestDegree;
                updateData['collegeDetails.university'] = body.collegeDetails.university;
                updateData['collegeDetails.college'] = body.collegeDetails.college;
                updateData['collegeDetails.gpa'] = body.collegeDetails.gpa;
                updateData['collegeDetails.toppersGPA'] = body.collegeDetails.toppersGPA;
                updateData['collegeDetails.noOfBacklogs'] = body.collegeDetails.noOfBacklogs;
                updateData['collegeDetails.admissionTerm'] = body.collegeDetails.admissionTerm;
                updateData['collegeDetails.coursesApplying'] = body.collegeDetails.coursesApplying;
            }
            if (body.greDetails) {
                updateData['greDetails.grePlan'] = body.greDetails.grePlan;
                updateData['greDetails.greDate'] = body.greDetails.greDate;
                updateData['greDetails.greScoreCard'] = body.greDetails.greScoreCard;
                updateData['greDetails.greScore.verbal'] = body.greDetails.greScore?.verbal;
                updateData['greDetails.greScore.quant'] = body.greDetails.greScore?.quant;
                updateData['greDetails.greScore.awa'] = body.greDetails.greScore?.awa;
                updateData['greDetails.retakingGRE'] = body.greDetails.retakingGRE;
            }
            if (body.ieltsDetails) {
                updateData['ieltsDetails.ieltsPlan'] = body.ieltsDetails.ieltsPlan;
                updateData['ieltsDetails.ieltsDate'] = body.ieltsDetails.ieltsDate;
                updateData['ieltsDetails.ieltsScore.reading'] = body.ieltsDetails.ieltsScore?.reading;
                updateData['ieltsDetails.ieltsScore.writing'] = body.ieltsDetails.ieltsScore?.writing;
                updateData['ieltsDetails.ieltsScore.speaking'] = body.ieltsDetails.ieltsScore?.speaking;
                updateData['ieltsDetails.ieltsScore.listening'] = body.ieltsDetails.ieltsScore?.listening;
                updateData['ieltsDetails.retakingIELTS'] = body.ieltsDetails.retakingIELTS;
            }
            if (body.toeflDetails) {
                updateData['toeflDetails.toeflPlan'] = body.toeflDetails.toeflPlan;
                updateData['toeflDetails.toeflDate'] = body.toeflDetails.toeflDate;
                updateData['toeflDetails.toeflScore.reading'] = body.toeflDetails.toeflScore?.reading;
                updateData['toeflDetails.toeflScore.writing'] = body.toeflDetails.toeflScore?.writing;
                updateData['toeflDetails.toeflScore.speaking'] = body.toeflDetails.toeflScore?.speaking;
                updateData['toeflDetails.retakingTOEFL'] = body.toeflDetails.retakingTOEFL;
            }
            if (body.visa) {
                updateData['visa.countriesPlanningToApply'] = body.visa.countriesPlanningToApply;
                updateData['visa.visaInterviewDate'] = body.visa.visaInterviewDate;
                updateData['visa.visaInterviewLocation'] = body.visa.visaInterviewLocation;
            }

            if (body.password) {
                return httpError(next, new Error('Password updates are not supported via this endpoint'), req, 400);
            }

            const updatedStudent = await Student.findByIdAndUpdate(
                studentId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select('-password').lean();

            if (!updatedStudent) {
                return httpError(next, new Error('Student not found'), req, 404);
            }

            const data = {
                message: 'Student details updated successfully',
                student: updatedStudent,
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, data);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
};