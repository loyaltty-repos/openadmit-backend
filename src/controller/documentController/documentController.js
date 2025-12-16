import httpError from '../../util/httpError.js';
import responseMessage from '../../constant/responseMessage.js';
import httpResponse from '../../util/httpResponse.js';
import { ValidateCreateDocument, ValidateUpdateDocument, ValidateFilterDocuments, validateJoiSchema, ValidateGetStudentDocuments } from '../../service/validationService.js';
import TaskSubtaskAssignment from '../../model/taskSubtaskAssignmentModel.js';
import Document from '../../model/documentModel.js';
import mongoose from 'mongoose';
export default {
    // Create a new document (ADMIN and EDITOR only)
    createDocument: async (req, res, next) => {
        try {
            // Validate input
            const { value, error } = validateJoiSchema(ValidateCreateDocument, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (!['ADMIN', 'EDITOR'].includes(req.authenticatedMember.role)) {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { studentId, taskId, subtaskId, fileUrl, fileName, fileSize, fileType } = value;

            // Validate that the student is assigned to the task and subtask
            const assignment = await TaskSubtaskAssignment.findOne({
                studentId,
                taskId,
                subtaskId
            }).lean();
            if (!assignment) {
                return httpError(next, new Error('Student is not assigned to this task and subtask'), req, 400);
            }

            // Create new document
            const document = new Document({
                studentId,
                taskId,
                subtaskId,
                uploader: req.authenticatedMember._id,
                fileUrl,
                fileName,
                fileSize,
                fileType
            });
            await document.save();

            // Fetch the document with populated fields
            const populatedDocument = await Document.findById(document._id)
                .populate('studentId', 'name email')
                .populate('taskId', 'title')
                .populate('subtaskId', 'title')
                .populate('uploader', 'name email')
                .lean();

            httpResponse(req, res, 201, responseMessage.SUCCESS, {
                message: 'Document created successfully',
                document: populatedDocument
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update document details (ADMIN and EDITOR only)
    updateDocument: async (req, res, next) => {
        try {

            const { documentId } = req.params
            const { value, error } = validateJoiSchema(ValidateUpdateDocument, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (!['ADMIN', 'EDITOR'].includes(req.authenticatedMember.role)) {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { studentId, taskId, subtaskId, fileUrl, fileName, fileSize, fileType, status } = value;

            if (!mongoose.Types.ObjectId.isValid(documentId)) {
                return httpError(next, new Error("Valid Document Id Required"), req, 403);
            }
            // Find document
            const document = await Document.findById(documentId);
            if (!document) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Document')), req, 404);
            }

            // If studentId, taskId, or subtaskId is provided, validate the new assignment
            if (studentId || taskId || subtaskId) {
                const updatedStudentId = studentId || document.studentId;
                const updatedTaskId = taskId || document.taskId;
                const updatedSubtaskId = subtaskId || document.subtaskId;

                const assignment = await TaskSubtaskAssignment.findOne({
                    studentId: updatedStudentId,
                    taskId: updatedTaskId,
                    subtaskId: updatedSubtaskId
                }).lean();

                if (!assignment) {
                    return httpError(next, new Error('Student is not assigned to this task and subtask'), req, 400);
                }

                // Update the fields
                document.studentId = updatedStudentId;
                document.taskId = updatedTaskId;
                document.subtaskId = updatedSubtaskId;
            }

            // Update other fields if provided
            if (fileUrl) document.fileUrl = fileUrl;
            if (fileName) document.fileName = fileName;
            if (fileSize !== undefined) document.fileSize = fileSize;
            if (fileType) document.fileType = fileType;
            if (status) document.status = status;

            await document.save();

            // Fetch updated document with populated fields
            const populatedDocument = await Document.findById(document._id)
                .populate('studentId', 'name email')
                .populate('taskId', 'title')
                .populate('subtaskId', 'title')
                .populate('uploader', 'name email')
                .lean();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Document updated successfully',
                document: populatedDocument
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Delete a document (ADMIN and EDITOR only)
    deleteDocument: async (req, res, next) => {
        try {
            const { documentId } = req.params;

            // Check role
            if (!['ADMIN', 'EDITOR'].includes(req.authenticatedMember.role)) {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            // Find document
            const document = await Document.findById(documentId);
            if (!document) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Document')), req, 404);
            }

            // Delete document
            await Document.findByIdAndDelete(documentId);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Document deleted successfully'
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get all documents with pagination and filtering (accessible to all members)
    getAllDocuments: async (req, res, next) => {
        try {
            // Validate filter query
            const { value, error } = validateJoiSchema(ValidateFilterDocuments, { ...req.query });
            if (error) return httpError(next, error, req, 422);

            const {
                status, uploader, studentId, taskId, subtaskId, page, limit,
                search, sortBy, sortOrder, fileType, dateFrom, dateTo
            } = { ...req.query, ...value };
            const skip = (page - 1) * limit;

            // Build query
            const query = {};
            if (status) query.status = status;
            if (uploader) query.uploader = uploader;
            if (studentId) query.studentId = studentId;
            if (taskId) query.taskId = taskId;
            if (subtaskId) query.subtaskId = subtaskId;
            if (fileType) query.fileType = new RegExp(fileType, 'i');

            // Advanced search functionality
            if (search) {
                query.$or = [
                    { fileName: new RegExp(search, 'i') },
                    { fileType: new RegExp(search, 'i') }
                ];
            }

            // Date range filtering
            if (dateFrom || dateTo) {
                query.createdAt = {};
                if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
                if (dateTo) query.createdAt.$lte = new Date(dateTo);
            }

            // Build sort object
            let sortObj = { createdAt: -1 }; // default sort
            if (sortBy) {
                const order = sortOrder === 'asc' ? 1 : -1;
                switch (sortBy) {
                    case 'name':
                        sortObj = { fileName: order };
                        break;
                    case 'created':
                        sortObj = { createdAt: order };
                        break;
                    case 'uploaded':
                        sortObj = { uploadedAt: order };
                        break;
                    case 'size':
                        sortObj = { fileSize: order };
                        break;
                    case 'status':
                        sortObj = { status: order };
                        break;
                    case 'type':
                        sortObj = { fileType: order };
                        break;
                    default:
                        sortObj = { createdAt: -1 };
                }
            }

            // Fetch total count for pagination
            const totalDocuments = await Document.countDocuments(query);

            // Fetch paginated documents
            const documents = await Document.find(query)
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .populate('studentId', 'name email')
                .populate('taskId', 'title')
                .populate('subtaskId', 'title')
                .populate('uploader', 'name email')
                .lean();

            // Pagination metadata
            const pagination = {
                total: totalDocuments,
                page,
                limit,
                totalPages: Math.ceil(totalDocuments / limit),
                hasNextPage: page < Math.ceil(totalDocuments / limit),
                hasPrevPage: page > 1
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                documents,
                pagination
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get a specific document by ID (accessible to all members)
    getDocumentById: async (req, res, next) => {
        try {
            const { documentId } = req.params;

            const document = await Document.findById(documentId)
                .populate('studentId', 'name email')
                .populate('taskId', 'title')
                .populate('subtaskId', 'title')
                .populate('uploader', 'name email')
                .lean();

            if (!document) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Document')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, document);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get all documents for a specific task and subtask assigned to the student
    getStudentDocumentsByTaskAndSubtaskId: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateGetStudentDocuments, { ...req.params, ...req.query });
            if (error) return httpError(next, error, req, 422);

            const { taskId, subtaskId, page, limit } = value;
            const skip = (page - 1) * limit;

            // Verify that the task and subtask are assigned to the student
            const assignment = await TaskSubtaskAssignment.findOne({
                studentId: req.authenticatedStudent._id,
                taskId,
                subtaskId,
            }).lean();

            if (!assignment) {
                return httpError(next, new Error('Task or subtask not assigned to the student or not accessible'), req, 404);
            }

            // Fetch documents for the student, task, and subtask
            const totalDocuments = await Document.countDocuments({
                studentId: req.authenticatedStudent._id,
                taskId,
                subtaskId
            });

            const documents = await Document.find({
                studentId: req.authenticatedStudent._id,
                taskId,
                subtaskId
            })
                .skip(skip)
                .limit(limit)
                .sort({ uploadedAt: -1 })
                .populate('studentId', 'name email')
                .populate('taskId', 'title')
                .populate('subtaskId', 'title')
                .populate('uploader', 'name email')
                .lean();

            const pagination = {
                total: totalDocuments,
                page,
                limit,
                totalPages: Math.ceil(totalDocuments / limit),
                hasNextPage: page < Math.ceil(totalDocuments / limit),
                hasPrevPage: page > 1
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                documents,
                pagination
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    getStudentAllDocuments: async (req, res, next) => {
        try {


            const { page, limit } = req.query;

            if (!page || +page <= 0 || !limit || +limit < 1) {
                return httpError(next, new Error("All Field Are Required"), req, 400)
            }
            const skip = (page - 1) * limit;

            const assignments = await TaskSubtaskAssignment.find({
                studentId: req.authenticatedStudent._id,
            })
                .populate('taskId', 'title')
                .populate('subtaskId', 'title')
                .lean();

            const documents = await Document.find({
                studentId: req.authenticatedStudent._id
            })
                .skip(skip)
                .limit(limit)
                .populate('taskId', 'title')
                .populate('subtaskId', 'title')
                .populate('uploader', 'name email')
                .lean();

            const structuredResponse = assignments.reduce((acc, assignment) => {
                const taskId = assignment.taskId._id.toString();
                if (!acc[taskId]) {
                    acc[taskId] = {
                        task: {
                            _id: assignment.taskId._id,
                            title: assignment.taskId.title
                        },
                        subtasks: []
                    };
                }

                const subtask = assignment.subtaskId;
                const subtaskDocs = documents.filter(doc =>
                    doc.taskId._id.toString() === taskId &&
                    doc.subtaskId._id.toString() === subtask._id.toString()
                );

                if (subtaskDocs.length > 0) {
                    acc[taskId].subtasks.push({
                        _id: subtask._id,
                        title: subtask.title,
                        documents: subtaskDocs.map(doc => ({
                            _id: doc._id,
                            fileUrl: doc.fileUrl,
                            fileName: doc.fileName,
                            fileSize: doc.fileSize,
                            fileType: doc.fileType,
                            uploader: doc.uploader,
                            status: doc.status,
                            createdAt: doc.createdAt
                        }))
                    });
                }

                return acc;
            }, {});

            const totalDocuments = await Document.countDocuments({ studentId: req.authenticatedStudent._id });
            const pagination = {
                total: totalDocuments,
                page: +page,
                limit,
                totalPages: Math.ceil(totalDocuments / limit),
                hasNextPage: page < Math.ceil(totalDocuments / limit),
                hasPrevPage: page > 1
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                documents: Object.values(structuredResponse),
                pagination
            });
        } catch (err) {
            console.log(err);

            httpError(next, err, req, 500);
        }
    },

    // ************* ADMIN SIDE CONTROLLER ******************
    getStudentAllDocumentsMembers: async (req, res, next) => {
        try {
            const { studentId } = req.params;
            const {
                page, limit, search, sortBy, sortOrder,
                fileType, dateFrom, dateTo, status
            } = req.query;

            if (!page || +page <= 0 || !limit || +limit < 1) {
                return httpError(next, new Error("All Field Are Required"), req, 400);
            }
            if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
                return httpError(next, new Error("Student Id Required"), req, 400);
            }

            const skip = (page - 1) * limit;

            const assignments = await TaskSubtaskAssignment.find({ studentId })
                .populate('taskId', 'title')
                .populate('subtaskId', 'title')
                .lean();

            // Build document query with advanced search
            const docQuery = { studentId };

            // Advanced search functionality
            if (search) {
                docQuery.$or = [
                    { fileName: new RegExp(search, 'i') },
                    { fileType: new RegExp(search, 'i') }
                ];
            }

            // Additional filters
            if (status) docQuery.status = status;
            if (fileType) docQuery.fileType = new RegExp(fileType, 'i');

            if (dateFrom || dateTo) {
                docQuery.createdAt = {};
                if (dateFrom) docQuery.createdAt.$gte = new Date(dateFrom);
                if (dateTo) docQuery.createdAt.$lte = new Date(dateTo);
            }


            let sortObj = { createdAt: -1 };
            if (sortBy) {
                const order = sortOrder === 'asc' ? 1 : -1;
                switch (sortBy) {
                    case 'name':
                        sortObj = { fileName: order };
                        break;
                    case 'created':
                        sortObj = { createdAt: order };
                        break;
                    case 'uploaded':
                        sortObj = { uploadedAt: order };
                        break;
                    case 'size':
                        sortObj = { fileSize: order };
                        break;
                    case 'status':
                        sortObj = { status: order };
                        break;
                    case 'type':
                        sortObj = { fileType: order };
                        break;
                    default:
                        sortObj = { createdAt: -1 };
                }
            }

            const documents = await Document.find(docQuery)
                .sort(sortObj)
                .populate('taskId', 'title')
                .populate('subtaskId', 'title')
                .populate('uploader', 'name email')
                .lean();

            const structuredResponse = assignments.reduce((acc, assignment) => {
                const taskId = assignment.taskId._id.toString();
                if (!acc[taskId]) {
                    acc[taskId] = {
                        task: {
                            _id: assignment.taskId._id,
                            title: assignment.taskId.title
                        },
                        subtasks: []
                    };
                }

                const subtask = assignment.subtaskId;
                const subtaskDocs = documents.filter(doc =>
                    doc.taskId?._id.toString() === taskId &&
                    doc.subtaskId?._id.toString() === subtask._id.toString()
                );

                if (subtaskDocs.length > 0) {
                    acc[taskId].subtasks.push({
                        _id: subtask._id,
                        title: subtask.title,
                        documents: subtaskDocs.map(doc => ({
                            _id: doc._id,
                            fileUrl: doc.fileUrl,
                            fileName: doc.fileName,
                            fileSize: doc.fileSize,
                            fileType: doc.fileType,
                            uploader: doc.uploader,
                            status: doc.status,
                            createdAt: doc.createdAt,
                            uploadedAt: doc.uploadedAt
                        }))
                    });
                } else if (!search && !status && !fileType && !dateFrom && !dateTo) {
                    // Include subtask even if no documents, only when no filters are applied
                    acc[taskId].subtasks.push({
                        _id: subtask._id,
                        title: subtask.title,
                        documents: []
                    });
                }

                return acc;
            }, {});

            const responseDocuments = Object.values(structuredResponse);
            const totalTasks = responseDocuments.length;
            const paginatedDocuments = responseDocuments.slice(skip, skip + +limit);

            const pagination = {
                total: totalTasks,
                page: +page,
                limit: +limit,
                totalPages: Math.ceil(totalTasks / limit),
                hasNextPage: page < Math.ceil(totalTasks / limit),
                hasPrevPage: page > 1
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                documents: paginatedDocuments,
                pagination
            });
        } catch (err) {
            console.log(err);
            httpError(next, err, req, 500);
        }
    }
    // ************* ADMIN SIDE CONTROLLER ******************
};