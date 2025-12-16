import { Router } from 'express'
import loanController from '../controller/Loan/loanController.js'
import universityController from '../controller/University/universityController.js'
import apiController from '../controller/apiController/apiController.js'
import { uploadFiles } from '../middleware/multerHandler.js'
import authController from '../controller/authController/authController.js'
import authentication, { paymentMiddleWare, paymentMiddleWareForLLM } from '../middleware/authentication.js'
import adminController from '../controller/adminController/adminController.js'
import { adminEditorOnly, adminOnly, memberAccess } from '../middleware/rbacMiddleware.js'
import categoryController from '../controller/faqController/categoryController.js'
import faqController from '../controller/faqController/faqController.js'
import paymentController from '../controller/paymentController/paymentController.js'
import studentController from '../controller/studentController/studentController.js'
import adminStudentManagementController from '../controller/adminController/adminStudentManagementController.js'
import questionnaireController from '../controller/questionnaireController/questionnaireController.js'
import subtaskController from '../controller/subtaskController/subtaskController.js'
import subtaskQuestionnaireAssignmentController from '../controller/subtaskController/subtaskQuestionnaireAssignmentController.js'
import studentTaskAssignmentController from '../controller/taskController/studentTaskAssignmentController.js'
import taskController from '../controller/taskController/taskController.js'
import taskSubtaskAssignmentController from '../controller/taskController/taskSubtaskAssignmentController.js'
import documentController from '../controller/documentController/documentController.js'
import studentUniversityAssignmentController from '../controller/University/studentUniversityAssignmentController.js'
import applicationController from '../controller/applicationController/applicationController.js'
import taskCategoryController from '../controller/taslCategoryController/taskCategoryController.js'
import passport from "../config/passport.js"
import chatController from '../controller/Chat/chat.controller.js'


const router = Router()


// public Routes
router.route('/self').get(apiController.self)
router.route('/health').get(apiController.health)
router.route('/upload-file').post(uploadFiles, apiController.uploadFile);
router.route('/faqs').get(faqController.getFaqs)
router.route('/universities/find').get(apiController.findUniversities);
router.route('/plans').get(apiController.getPlanDetails);
// auth routes
router.route('/auth/login').post(authController.login);
router.route('/auth/send-email-otp').post(authController.sendEmailOtp);
router.route('/auth/signup').post(authController.signup);
router.route('/auth/forgot-password').post(authController.forgotPassword);
router.route('/auth/verify-otp').post(authController.verifyOtp);
router.route('/auth/reset-password').post(authController.resetPassword);

router.route('/auth/google').get(passport.authenticate('google', { scope: ['profile', 'email'] }))
router.route('/auth/google/callback').get(
    passport.authenticate('google', { failureRedirect: '/auth/failure' }),
    authController.oauthSuccess
)
router.route('/auth/facebook').get(passport.authenticate('facebook', { scope: ['email'] }))
router.route('/auth/facebook/callback').get(
    passport.authenticate('facebook', { failureRedirect: '/auth/failure' }),
    authController.oauthSuccess
)
router.route('/auth/failure').get(authController.oauthFailure)

// payment routes
router.route('/payment/initiate').post(paymentMiddleWare, paymentController.initiatePayment);
router.route('/payment/verify').post(paymentMiddleWare, paymentController.verifyPayment);

router.route('/payment/initiateForLLMUpgrade').post(paymentMiddleWareForLLM, paymentController.initiatePaymentForLLMUpgrade);
router.route('/payment/verifyForLLMUpgrade').post(paymentMiddleWareForLLM, paymentController.verifyPaymentForLLMUpgrade);


// ******************** STUDENTS ROUTES ***********************************
// STUDENTS ROUTES
router.route('/student/self').get(authentication, studentController.getSelfData);
router.route('/student/profile').put(authentication, studentController.updateProfile);


router.route('/student/tasks')
    .get(authentication, studentController.getStudentTasks);

router.route('/student/tasks/:taskId/subtasks/:subtaskId/questionnaires')
    .get(authentication, studentController.getSubtaskQuestionnaires);

router.route('/student/tasks/:taskId/subtasks/:subtaskId/questionnaires/:questionnaireId')
    .get(authentication, studentController.getQuestionnaireQuestionsWithResponses);

router.route('/student/tasks/subtasks/questionnaires/question/responses')
    .post(authentication, studentController.submitQuestionnaireResponses);


router.route('/student/tasks/:taskId/subtasks/:subtaskId/documents')
    .get(authentication, documentController.getStudentDocumentsByTaskAndSubtaskId);
router.route('/student/tasks/documents')
    .get(authentication, documentController.getStudentAllDocuments);

router.route('/student/timeline')
    .get(authentication, studentController.getStudentTimeline);
router.route('/student/dashboard-stats')
    .get(authentication, studentController.getStudentDashboardStats);
router.route('/student/upcoming-task')
    .get(authentication, studentTaskAssignmentController.getStudentUpcomingTasks)
// ******************** STUDENTS ROUTES ***********************************


// ******************** ADMIN ROUTES ***********************************
// Admins route
router.route('/admin/auth/login').post(adminController.login);
router.route('/admin/auth/update-password').post(memberAccess, adminController.updatePassword);

router.route('/admin/create-member').post(adminOnly, adminController.addNewMember);
router.route('/admin/update-profile/:id').put(adminOnly, adminController.updateProfileByAdmin);
router.route('/admin/members').get(adminOnly, adminController.getAllMembers);
router.route('/admin/members/:id').delete(adminOnly, adminController.deleteMember);


router.route('/admin/self').get(memberAccess, adminController.getSelfData);
router.route('/admin/profile').put(memberAccess, adminController.updateProfile);


// category routes
router.route('/categories').get(categoryController.getAllCategories);//Public Access
router.route('/admin/categories').post(adminOnly, categoryController.createCategory);
router.route('/admin/categories/:id').put(adminOnly, categoryController.updateCategory);
router.route('/admin/categories/:id').delete(adminOnly, categoryController.deleteCategory);

// faq routes
router.route('/faqs').get(faqController.getFaqs);//Public Access 
router.route('/admin/faqs').post(adminOnly, faqController.createFaq);
router.route('/admin/faqs/:id').put(adminOnly, faqController.updateFaq);
router.route('/admin/faqs/:id').delete(adminOnly, faqController.deleteFaq);

//Loans Routes
router.route("/loans/apply").post(authentication, loanController.applyForLoan)
router.route("/loans").get(memberAccess, loanController.getAllLoans)

// University routes
router.route('/admin/universities').post(memberAccess, universityController.createUniversity);
router.route('/admin/universities').get(memberAccess, universityController.getAllUniversities);
router.route('/universities/:id').get(authentication, universityController.getUniversityById); // Access By the Student
router.route('/admin/universities/:id').get(memberAccess, universityController.getUniversityById); // Access By the Admin Side
router.route('/admin/universities/:id').put(memberAccess, universityController.updateUniversity);
router.route('/admin/universities/:id').delete(adminOnly, universityController.deleteUniversity);

//Student Management
router.route('/admin/students').get(memberAccess, adminStudentManagementController.getStudents);
router.route('/admin/students/:studentId')
    .get(memberAccess, adminStudentManagementController.getStudentById)
    .put(adminEditorOnly, adminStudentManagementController.updateStudentDetails)
    .delete(adminOnly, adminStudentManagementController.deleteStudent);
// ******************** ADMIN ROUTES ***********************************


// ******************** QUESTIONNAIRE ROUTES ***********************************
// Routes for all members (read-only)
router.route('/admin/questionnaires')
    .get(memberAccess, questionnaireController.getAllQuestionnaires);

// Routes for ADMIN only (create, update, delete)
router.route('/admin/questionnaires')
    .post(adminOnly, questionnaireController.createQuestionnaire);

router.route('/admin/questionnaires/:questionnaireId')
    .get(memberAccess, questionnaireController.getQuestionnaireById)
    .put(adminOnly, questionnaireController.updateQuestionnaire)
    .delete(adminOnly, questionnaireController.deleteQuestionnaire);

// Routes for managing questions (ADMIN only)
router.route('/admin/questionnaires/:questionnaireId/questions')
    .post(adminOnly, questionnaireController.addQuestion)
    .delete(adminOnly, questionnaireController.deleteQuestion);
// ******************** QUESTIONNAIRE ROUTES END ***********************************

// ******************** SUBTASK ROUTES  ***********************************
// Routes for all members (read-only)
router.route('/admin/subtasks')
    .get(memberAccess, subtaskController.getAllSubtasks);

// Routes for ADMIN only (create, update, delete)
router.route('/admin/subtasks')
    .post(adminOnly, subtaskController.createSubtask);

router.route('/admin/subtasks/:subtaskId')
    .get(memberAccess, subtaskController.getSubtaskById)
    .put(adminOnly, subtaskController.updateSubtask)
    .delete(adminOnly, subtaskController.deleteSubtask);

// Update Stautus 
router.route('/admin/subtask-questionnaire-assignments/update-status')
    .put(adminOnly, subtaskQuestionnaireAssignmentController.updateAssignmentStatus);

router.route("/admin/subtask/:taskId").get(memberAccess, taskSubtaskAssignmentController.getSubTaskByTaskId)

// ******************** SUBTASK ROUTES END ***********************************

// 
// ******************** TASK CATEGORY ROUTES ***********************************
router.route('/admin/task-categories')
    .post(memberAccess, taskCategoryController.createTaskCategory)
    .get(memberAccess, taskCategoryController.getAllTaskCategories);

router.route('/admin/task-categories/:categoryId')
    .put(memberAccess, taskCategoryController.updateTaskCategory)
    .delete(adminOnly, taskCategoryController.deleteTaskCategory)
    .get(memberAccess, taskCategoryController.getTaskCategoryById);
// ******************** TASK CATEGORY ROUTES ***********************************

// ******************** TASK ROUTES ***********************************

// Routes for all members (read-only)
router.route('/admin/tasks')
    .get(memberAccess, taskController.getAllTasks);

// Routes for ADMIN only
router.route('/admin/tasks')
    .post(adminOnly, taskController.createTask);

router.route('/admin/tasks/:taskId')
    .get(memberAccess, taskController.getTaskById)
    .put(adminOnly, taskController.updateTaskDetails)
    .delete(adminOnly, taskController.deleteTask);

router.route('/admin/tasks/:taskId/responses')
    .get(memberAccess, taskController.getStudentQuestionnaireResponses);


// route to update response

router.route('/admin/tasks/:taskId/upload-documents')
    .put(memberAccess, taskController.updateStudentQuestinnaireResponse);

// Routes for managing subtasks (ADMIN only)
router.route('/admin/tasks/:taskId/subtasks/add')
    .post(adminOnly, taskSubtaskAssignmentController.addSubtasksToTask);

router.route('/admin/tasks/:taskId/subtasks/remove')
    .post(adminOnly, taskSubtaskAssignmentController.removeSubtasksFromTask);

// Route for updating TaskSubtaskAssignment (ADMIN only)
router.route('/admin/task-subtask-assignments/update')
    .put(adminOnly, taskSubtaskAssignmentController.updateTaskSubtaskAssignment);

router.route("/admin/task/:studentId").get(studentTaskAssignmentController.getTaskByStudentId)


// Routes for ADMIN only
router.route('/admin/tasks/:taskId/students/add')
    .post(adminOnly, studentTaskAssignmentController.addStudentsToTask);

router.route('/admin/tasks/:taskId/students/remove')
    .post(adminOnly, studentTaskAssignmentController.removeStudentFromTask);

// Route for updating StudentTaskAssignment (ADMIN only)
router.route('/admin/student-task-assignments/update')
    .put(adminOnly, studentTaskAssignmentController.updateStudentTaskAssignment);

router.route('/admin/students/:studentId/task-subtask-question-details')
    .get(memberAccess, adminController.getAdminStudentTaskSubtaskQuestionsDetails);
// ******************** TASK ROUTES END ***********************************

// ******************** DOCUMENT ROUTES ***********************************
// Routes for documents (read-only for all members)
router.route('/admin/documents')
    .get(memberAccess, documentController.getAllDocuments);

// Routes for documents (ADMIN and EDITOR only for create)
router.route('/admin/documents')
    .post(adminEditorOnly, documentController.createDocument);

// Routes for a specific document (read-only for all members, update/delete for ADMIN and EDITOR)
router.route('/admin/documents/:documentId')
    .get(memberAccess, documentController.getDocumentById)
    .put(adminEditorOnly, documentController.updateDocument)
    .delete(adminEditorOnly, documentController.deleteDocument);


router.route('/admin/documents/student/:studentId').get(memberAccess, documentController.getStudentAllDocumentsMembers)
// ******************** DOCUMENT ROUTES END ***********************************

// ******************** ADMIN Student University Assignement ***********************************
router.route('/admin/student-university-assignments')
    .get(memberAccess, studentUniversityAssignmentController.getAllStudentUniversityAssignments)
    .post(adminEditorOnly, studentUniversityAssignmentController.createStudentUniversityAssignment);

router.route('/admin/student-university-assignments/:assignmentId')
    .get(memberAccess, studentUniversityAssignmentController.getStudentUniversityAssignmentById)
    .put(adminEditorOnly, studentUniversityAssignmentController.updateStudentUniversityAssignment)
    .delete(adminEditorOnly, studentUniversityAssignmentController.deleteStudentUniversityAssignment);


router.route('/admin/student-activities').get(memberAccess, adminController.getStudentActivities);
router.route('/admin/student-activities/:activityId/mark-read').put(memberAccess, adminController.markStudentActivityAsRead);
// ******************** ADMIN STUDENT UNIVERSITY ASSIGNMENT ROUTES END ***********************************

// ********************  STUDENT UNIVERSITY ASSIGNMENT ROUTES  ***********************************
router.route('/student/assigned-universities')
    .get(authentication, studentController.getAssignedUniversities);

router.route('/student/llm-assigned-university')
    .get(authentication, studentController.getLlmAssignedUniversity);

router.route('/student/assigned-universities/:assignmentId')
    .put(authentication, studentController.updateAssignedUniversityStatus);

// ********************  STUDENT UNIVERSITY ASSIGNMENT ROUTES END ***********************************



// ********************* APPLICATION CONTROLLER ROUTES ******************
router.route('/admin/applications')
    .get(memberAccess, applicationController.getApplications)
    .post(adminOnly, applicationController.createApplication);

router.route('/admin/applications/:applicationId')
    .get(memberAccess, applicationController.getApplicationById)
    .put(adminEditorOnly, applicationController.updateApplication)
    .delete(adminEditorOnly, applicationController.deleteApplication);

router.route('/admin/dashboard-stats').get(memberAccess, adminController.getAdminDashboardStats)
router.route('/admin/upcoming-deadlines').get(memberAccess, studentTaskAssignmentController.getUpcomingDeadlines)
// ********************* APPLICATION CONTROLLER ROUTES END ******************


// ********************* CHAT CONTROLLER ROUTES ******************

// Generate Firebase token and create/retrieve chat room
router.route('/chat/student/generate-token')
    .post(authentication, chatController.generateChatToken) // For students
router.route('/chat/admin/generate-token')
    .post(memberAccess, chatController.generateChatToken); // For members (all active members)

// Get list of active chat rooms for the authenticated user
router.route('/chat/student/rooms')
    .get(authentication, chatController.getChatRooms) // For students
router.route('/chat/admin/rooms')
    .get(memberAccess, chatController.getChatRooms); // For members (all active members)


// Get all students  (admin only)
router.route('/chat/admin/students')
    .get(memberAccess, chatController.getAllStudents);
// Get all active members (student only)
router.route('/chat/student/members')
    .get(authentication, chatController.getAllMembers);


//   router.route('/chat/cleanup/:chatId').delete(authentication, chatController.cleanupChatRoom);
// ********************* CHAT CONTROLLER ROUTES END ******************




export default router