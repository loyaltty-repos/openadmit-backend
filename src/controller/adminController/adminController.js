import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { ValidateMemberCreate, ValidateMemberUpdate, ValidatePasswordUpdate, ValidateLogin, validateJoiSchema, ValidateMembersQuery, ValidateGetAdminStudentTaskSubtaskQuestionsDetails, ValidateGetStudentActivities } from '../../service/validationService.js';
import quicker from '../../util/quicker.js';
import config from '../../config/config.js';
import Member from "../../model/membersModel.js"
import Student from '../../model/studentModel.js';
import TaskSubtaskAssignment from '../../model/taskSubtaskAssignmentModel.js';
import SubtaskQuestionnaireAssignment from "../../model/subtaskQuestionnaireAssignmentModel.js"
import Response from "../../model/responseModel.js"
import mongoose from 'mongoose';
import StudentActivity from '../../model/studentActivitySchema.js';
import Application from '../../model/applicationModel.js';
import StudentTaskAssignment from '../../model/studentTaskAssignmentModel.js';
export default {
    // All members: Login with cookie
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const validationResult = validateJoiSchema(ValidateLogin, req.body);
            if (validationResult.error) {
                return httpError(next, validationResult.error, req, 422);
            }

            const member = await Member.findOne({ email });
            if (!member || !await quicker.comparePassword(password, member.password)) {
                return httpError(next, new Error(responseMessage.INVALID_CREDENTIALS), req, 401);
            }

            if (member.status === 'INVITED') {
                await Member.findByIdAndUpdate(member._id, { status: 'ACTIVE' });
            }

            const accessToken = quicker.generateToken({ id: member._id, email, role: member.role }, config.ACCESS_TOKEN.SECRET, config.ACCESS_TOKEN.EXPIRY);
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                path: '/',
                sameSite: 'strict'
            });

            const userData = { ...member.toObject(), password: undefined };
            httpResponse(req, res, 200, responseMessage.SUCCESS, { user: userData, accessToken });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    /**
     * **************************************************
     *                      ADMIN ONLY ROUTES
     * **************************************************
     */
    // Admin-only: Add new member
    addNewMember: async (req, res, next) => {
        try {
            
            const validationResult = validateJoiSchema(ValidateMemberCreate, req.body);

            if (validationResult.error) {
                return httpError(next, validationResult.error, req, 422);
            }
            const { firstName, lastName, email, password, role, phone, address, profilePicture, bio } = validationResult.value;

            const hashedPassword = await quicker.hashPassword(password);
            const member = new Member({
                firstName,
                lastName,
                email,
                bio,
                password: hashedPassword,
                role,
                status: 'INVITED',
                phone,
                address,
                profilePicture
            });
            await member.save();

            // TODO: Implement email notification in future
            httpResponse(req, res, 201, responseMessage.SUCCESS, { message: 'Member invited successfully', memberId: member._id });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Admin-only: Update any member's profile (not self)
    updateProfileByAdmin: async (req, res, next) => {
        try {
            const admin = req.authenticatedMember;
            if (admin.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const memberId = req.params.id;

            if (memberId === admin._id.toString()) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("CANNOT UPDATE YOURSELF")), req, 403);
            }

            const { value, error } = validateJoiSchema(ValidateMemberUpdate, req.body);
            if (error) {
                return httpError(next, error, req, 422);
            }

            const updateData = value;

            if (updateData.password) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("Cannot update password via this endpoint")), req, 403);
            }

            const updatedMember = await Member.findByIdAndUpdate(
                memberId,
                { $set: updateData },
                { new: true, runValidators: true, select: '-password' }
            );

            if (!updatedMember) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Member')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedMember);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


    // Admin-only: Get all members 
    getAllMembers: async (req, res, next) => {
        try {
            const { page, limit } = validateJoiSchema(ValidateMembersQuery, req.query).value;
            const skip = (page - 1) * limit;

            // Fetch members excluding the authenticated member
            const members = await Member.find({ _id: { $ne: req.authenticatedMember._id } })
                .select('-password')
                .skip(skip)
                .limit(limit);

            // Sort in memory by createdDate (ascending) and role (ADMIN > EDITOR > VIEWER)
            const roleOrder = { ADMIN: 0, EDITOR: 1, VIEWER: 2 };
            members.sort((a, b) => {
                if (a.createdDate.getTime() !== b.createdDate.getTime()) {
                    return a.createdDate - b.createdDate; // Sort by createdDate first
                }
                return (roleOrder[a.role] || 3) - (roleOrder[b.role] || 3); // Then by role
            });

            const total = await Member.countDocuments({ _id: { $ne: req.authenticatedMember._id } });
            const totalPages = Math.ceil(total / limit);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                members,
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

    // Admin Only Delete Member
    deleteMember: async (req, res, next) => {
        try {
            const { id } = req.params

            if (id === req.authenticatedMember._id.toString()) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("Cannot Delete YourSelf")), req, 403);
            }

            const checkisMemberAdmin = await Member.findOne({
                _id: id,
                role: "ADMIN"
            })



            if (checkisMemberAdmin) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("Cannot Delete Admin Member")), req, 403);
            }

            const deleteMember = await Member.findByIdAndDelete(id)

            console.log(deleteMember);


            if (!deleteMember) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("Member Not Found for Delete")), req, 404);
            }

            httpResponse(req, res, 200, "Member Deleted Succefully", {})
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },

    /**
   * **************************************************
   *                      ADMIN ONLY ROUTES END
   * **************************************************
   */

    /**
    * **************************************************
    *                      ALL MEMBERS ROUTES
    * **************************************************
    */

    // All members: Get self data
    getSelfData: async (req, res, next) => {
        try {
            const member = await Member.findById(req.authenticatedMember._id).select('-password');
            if (!member) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Member')), req, 404);
            }
            httpResponse(req, res, 200, responseMessage.SUCCESS, member);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // All members: Update self profile
    updateProfile: async (req, res, next) => {
        try {
            const memberId = req.authenticatedMember._id;
            const { value, error } = validateJoiSchema(ValidateMemberUpdate, req.body);
            if (error) {
                return httpError(next, error, req, 422);
            }

            const updateData = value;

            // Prevent changes to restricted fields
            const restrictedFields = ['password', 'role', 'status'];
            restrictedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE(`Cannot update ${field}`)), req, 403);
                }
            });

            const updatedMember = await Member.findByIdAndUpdate(
                memberId,
                { $set: updateData },
                { new: true, runValidators: true, select: '-password' }
            );

            if (!updatedMember) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Member')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedMember);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // All members: Update password
    updatePassword: async (req, res, next) => {
        try {
            const memberId = req.authenticatedMember._id;
            const { oldPassword, newPassword, confirmPassword } = req.body;

            const validationResult = validateJoiSchema(ValidatePasswordUpdate, req.body);
            if (validationResult.error) {
                return httpError(next, validationResult.error, req, 422);
            }

            const member = await Member.findById(memberId).select('+password');
            if (!member || !await quicker.comparePassword(oldPassword, member.password)) {
                return httpError(next, new Error(responseMessage.INVALID_CREDENTIALS), req, 401);
            }

            const hashedPassword = await quicker.hashPassword(newPassword);
            await Member.findByIdAndUpdate(memberId, { password: hashedPassword });

            httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Password updated successfully' });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    /**
    * **************************************************
    *                      ALL MEMBERS ROUTES END
    * **************************************************
    */


    // ******************* ADMIN STUDNET TASK SUBTASK , QUESTIONNIORS *********************
    getAdminStudentTaskSubtaskQuestionsDetails: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateGetAdminStudentTaskSubtaskQuestionsDetails, { ...req.params, ...req.query });
            if (error) return httpError(next, error, req, 422);

            const { studentId, page, limit } = value;
            const skip = (page - 1) * limit;



            const student = await Student.findById(studentId)

            console.log(studentId, student);

            if (!student) {
                return httpError(next, new Error('Student not found'), req, 404);
            }

            const assignments = await TaskSubtaskAssignment.find({
                studentId
            })
                .populate('taskId', '')
                .populate('subtaskId', '')
                .skip(skip)
                .limit(limit)
                .lean();

            const taskSubtaskMap = assignments.reduce((acc, assignment) => {
                const taskId = assignment.taskId._id.toString();
                if (!acc[taskId]) {
                    acc[taskId] = { task: assignment.taskId, subtasks: [] };
                }
                acc[taskId].subtasks.push({ ...assignment.subtaskId, assignmentId: assignment._id });
                return acc;
            }, {});

            for (const taskId in taskSubtaskMap) {
                for (const subtask of taskSubtaskMap[taskId].subtasks) {
                    const questionnaires = await SubtaskQuestionnaireAssignment.find({
                        subtaskId: subtask._id
                    })
                        .populate({
                            path: 'questionnaireId',
                            populate: {
                                path: 'questions',
                                model: 'Question' // Assuming questions are in a separate model or embedded
                            }
                        })
                        .lean();

                    const responses = await Response.find({
                        studentId,
                        taskId: taskSubtaskMap[taskId].task._id,
                        subtaskId: subtask._id
                    }).lean();

                    subtask.questionnaires = questionnaires.map(q => {
                        const questionsWithResponses = q.questionnaireId.questions.map(question => {
                            const response = responses.find(r => r.questionId.toString() === question._id.toString());
                            return {
                                _id: question._id,
                                question: question.question,
                                ansType: question.ansType,
                                options: question.options || [],
                                answer: response ? response.answer : null,
                                status: response ? response.status : 'PENDING',
                                feedback: response ? response.feedback : null
                            };
                        });
                        return {
                            _id: q.questionnaireId._id,
                            title: q.questionnaireId.title,
                            description: q.questionnaireId.description,
                            status: q.questionnaireId.status,
                            questions: questionsWithResponses
                        };
                    });
                }
            }

            const totalAssignments = await TaskSubtaskAssignment.countDocuments({ studentId });
            const pagination = {
                total: totalAssignments,
                page,
                limit,
                totalPages: Math.ceil(totalAssignments / limit),
                hasNextPage: page < Math.ceil(totalAssignments / limit),
                hasPrevPage: page > 1
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                student: {
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                    tasks: Object.values(taskSubtaskMap)
                },
                pagination
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    // ******************* ADMIN STUDNET TASK *********************

    getStudentActivities: async (req, res, next) => {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                studentId,
                status
            } = req.query;


            const { error, value } = validateJoiSchema(ValidateGetStudentActivities, req.query);
            if (error) return httpError(next, error, req, 422);

            const query = {};
            if (studentId) query.studentId = mongoose.Types.ObjectId(studentId);
            if (status) query.status = status;
            if (search) {
                query.$or = [
                    { 'message': { $regex: search, $options: 'i' } },
                    { 'studentId.name': { $regex: search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;
            const total = await StudentActivity.countDocuments(query);

            const activities = await StudentActivity.find(query)
                .populate('studentId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const responseData = {
                total: total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
                activities: activities.map(activity => ({
                    _id: activity._id,
                    student: activity.studentId,
                    activityType: activity.activityType,
                    message: activity.message,
                    status: activity.status,
                    details: activity.details,
                    isRead: activity.isRead,
                    createdAt: activity.createdAt,
                    updatedAt: activity.updatedAt
                }))
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    markStudentActivityAsRead: async (req, res, next) => {
        try {
            const { activityId } = req.params;
            const activity = await StudentActivity.findById(activityId);
            if (!activity) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Student Activity')), req, 404);
            }
            activity.isRead = true;
            await activity.save();
            httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Student activity marked as read' });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get admin dashboard stats
    getAdminDashboardStats: async (req, res, next) => {
        try {

            const totalStudents = await Student.countDocuments();

            const totalActiveApplications = await Application.countDocuments({
                status: { $nin: ["APPROVED", "REJECTED"] }
            });

            const taskStats = await StudentTaskAssignment.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const statsMap = taskStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {});
            const totalPendingTasks = (statsMap['PENDING'] || 0) + (statsMap['IN_PROGRESS'] || 0);
            const totalCompletedTasks = statsMap['COMPLETED'] || 0;

            const responseData = {
                totalStudents: totalStudents,
                totalActiveApplications: totalActiveApplications,
                totalPendingTasks: totalPendingTasks,
                totalCompletedTasks: totalCompletedTasks
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    }
};