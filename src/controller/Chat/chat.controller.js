import { createCustomToken, getFirestore } from '../../config/firebase.js';
import httpResponse from '../../util/httpResponse.js';
import httpError from '../../util/httpError.js';
import responseMessage from '../../constant/responseMessage.js';
import Student from '../../model/studentModel.js';
import Member from '../../model/membersModel.js';
import ChatPresence from "../../model/ChatPresence.js";

import mongoose from 'mongoose';

export default {
    generateChatToken: async (req, res, next) => {
        try {
            const { authenticatedStudent, authenticatedMember } = req;
            const { targetId } = req.body; // Student provides memberId, Member provides studentId

            if (!targetId) {
                return httpError(next, new Error('Target ID is required'), req, 400);
            }

            if (!mongoose.Types.ObjectId.isValid(targetId)) {
                return httpError(next, new Error('Invalid Id'), req, 400);
            }

            let student, member, chatRoomId;

            // Determine user role and fetch participants
            if (authenticatedStudent) {
                // Student initiating chat with a Member
                student = authenticatedStudent;
                member = await Member.findById(targetId)
                    .select('firstName lastName email profilePicture phone bio role status createdDate')
                    .lean();
                if (!member || member.status !== 'ACTIVE') {
                    return httpError(next, new Error('Member not found or inactive'), req, 404);
                }
                chatRoomId = `${student._id}_${member._id}`;
            } else if (authenticatedMember) {
                member = authenticatedMember;
                student = await Student.findById(targetId)
                    .select('name email profilePicture phoneNumber isVerified isFeePaid status collegeDetails.university collegeDetails.college collegeDetails.branch personalDetails.profession personalDetails.address createdAt')
                    .lean();
                if (!student || !student.isVerified || !student.isFeePaid) {
                    return httpError(next, new Error('Student not found, unverified, or fee not paid'), req, 404);
                }
                chatRoomId = `${student._id}_${member._id}`;
            } else {
                return httpError(next, new Error('Unauthorized: No valid user found'), req, 401);
            }

            // Initialize Firestore
            const db = getFirestore();
            if (!db) {
                return httpError(next, new Error('Failed to initialize Firestore'), req, 500);
            }

            // Check if chat room exists
            const chatRoomRef = db.collection('chatRooms').doc(chatRoomId);
            const chatRoomDoc = await chatRoomRef.get();

            if (!chatRoomDoc.exists) {
                // Create new chat room
                await chatRoomRef.set({
                    studentId: student._id.toString(),
                    memberId: member._id.toString(),
                    status: 'active',
                    createdAt: new Date(),
                    participants: {
                        student: {
                            id: student._id.toString(),
                            name: student.name || 'Student',
                        },
                        member: {
                            id: member._id.toString(),
                            name: `${member.firstName} ${member.lastName}`.trim() || 'Member',
                        },
                    },
                }, { merge: true });
            } else {
                // Ensure chat room is active
                const chatRoomData = chatRoomDoc.data();
                if (chatRoomData.status !== 'active') {
                    await chatRoomRef.update({ status: 'active' });
                }
            }

            // Generate Firebase custom token
            const userId = authenticatedStudent ? student._id.toString() : member._id.toString();
            const customClaims = {
                chatRoomId,
                role: authenticatedStudent ? 'STUDENT' : 'MEMBER',
            };

            const firebaseToken = await createCustomToken(userId, customClaims);

            // Response
            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                firebaseToken,
                chatRoomId,
                userInfo: {
                    id: userId,
                    name: authenticatedStudent ? student.name : `${member.firstName} ${member.lastName}`.trim(),
                    email: authenticatedStudent ? student.email : member.email,
                    profilePicture: authenticatedStudent ? student.profilePicture : member.profilePicture,
                    role: authenticatedStudent ? 'STUDENT' : 'MEMBER',
                },
                targetInfo: {
                    id: authenticatedStudent ? member._id.toString() : student._id.toString(),
                    name: authenticatedStudent ? `${member.firstName} ${member.lastName}`.trim() : student.name,
                    email: authenticatedStudent ? member.email : student.email,
                    profilePicture: authenticatedStudent ? member.profilePicture : student.profilePicture,
                    phone: authenticatedStudent ? member.phone : student.phoneNumber,
                    role: authenticatedStudent ? 'MEMBER' : 'STUDENT',
                    ...(authenticatedStudent && {
                        bio: member.bio,
                        memberRole: member.role,
                        joinedDate: member.createdDate,
                    }),
                    ...(authenticatedMember && {
                        university: student.collegeDetails?.university,
                        college: student.collegeDetails?.college,
                        branch: student.collegeDetails?.branch,
                        profession: student.personalDetails?.profession,
                        address: student.personalDetails?.address,
                        isVerified: student.isVerified,
                        isFeePaid: student.isFeePaid,
                        studentStatus: student.status,
                        joinedDate: student.createdAt,
                    }),
                },
            });
        } catch (error) {
            console.error('Generate chat token error:', error);
            httpError(next, error, req, 500);
        }
    },



    getChatRooms: async (req, res, next) => {
        try {
            const { authenticatedStudent, authenticatedMember } = req;

            const db = getFirestore();
            if (!db) {
                return httpError(next, new Error('Failed to initialize Firestore'), req, 500);
            }

            // ======================================================
            // Pagination & search
            // ======================================================
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 20;
            const search = req.query.search ? req.query.search.trim() : '';

            if (page < 1 || limit < 1 || limit > 100) {
                return httpError(
                    next,
                    new Error('Page must be >= 1 & limit between 1-100'),
                    req,
                    400
                );
            }

            const userId = authenticatedStudent
                ? authenticatedStudent._id.toString()
                : authenticatedMember._id.toString();

            const role = authenticatedStudent ? 'studentId' : 'memberId';

            // ======================================================
            // 🔥 Fetch chat room list
            // ======================================================
            const roomQuery = db
                .collection('chatRooms')
                .where(role, '==', userId)
                .where('status', '==', 'active');

            const roomsSnapshot = await roomQuery.get();
            let chatRooms = roomsSnapshot.docs.map((doc) => ({
                chatRoomId: doc.id,
                ...doc.data(),
            }));

            // ======================================================
            // 🔥 Enrich participants with email from DB
            // (THIS is where we make sure participants.student.email exists)
            // ======================================================
            // Collect unique student & member ids from rooms
            const studentIds = [
                ...new Set(
                    chatRooms
                        .map((room) => room.studentId)
                        .filter(Boolean)
                        .map((id) => id.toString())
                ),
            ];
            const memberIds = [
                ...new Set(
                    chatRooms
                        .map((room) => room.memberId)
                        .filter(Boolean)
                        .map((id) => id.toString())
                ),
            ];

            // Fetch students & members in one go (adjust model names/fields if needed)
            const [students, members] = await Promise.all([
                Student.find(
                    { _id: { $in: studentIds } },
                    { _id: 1, email: 1, name: 1 }
                ).lean(),
                Member.find(
                    { _id: { $in: memberIds } },
                    { _id: 1, email: 1, name: 1 }
                ).lean(),
            ]);

            const studentMap = new Map(
                students.map((s) => [s._id.toString(), s])
            );
            const memberMap = new Map(
                members.map((m) => [m._id.toString(), m])
            );

            // Attach email into participants.* without breaking existing structure
            chatRooms = chatRooms.map((room) => {
                const student = studentMap.get(room.studentId?.toString());
                const member = memberMap.get(room.memberId?.toString());

                // Ensure participants object exists
                const participants = room.participants || {};

                // Ensure participants.student exists
                if (!participants.student) {
                    participants.student = {
                        id: room.studentId,
                    };
                }
                if (!participants.member) {
                    participants.member = {
                        id: room.memberId,
                    };
                }

                // Enrich student
                if (student) {
                    participants.student = {
                        ...participants.student,
                        email: student.email || participants.student.email || null,
                        name: participants.student.name || student.name || null,
                    };
                }

                // Enrich member
                if (member) {
                    participants.member = {
                        ...participants.member,
                        email: member.email || participants.member.email || null,
                        name: participants.member.name || member.name || null,
                    };
                }

                return {
                    ...room,
                    participants,
                };
            });

            // ======================================================
            // 🔥 Attach latestMessage + read flags + unread counts
            // ======================================================
            const roomsWithLatest = await Promise.all(
                chatRooms.map(async (room) => {
                    const messagesRef = db
                        .collection('chatRooms')
                        .doc(room.chatRoomId)
                        .collection('messages');

                    // Fetch last message only
                    const latestSnap = await messagesRef
                        .orderBy('timestamp', 'desc')
                        .limit(1)
                        .get();

                    let latestMessage = null;

                    if (!latestSnap.empty) {
                        const m = latestSnap.docs[0];
                        const data = m.data();

                        latestMessage = {
                            id: m.id,
                            content: data.content,
                            senderId: data.senderId,
                            senderName: data.senderName,
                            senderRole: data.senderRole,
                            type: data.type,
                            file: data.file || null,
                            timestamp: data.timestamp,

                            // Read flags
                            isReadByAdmin: data.isReadByAdmin ?? false,
                            isReadByStudent: data.isReadByStudent ?? false,
                        };
                    }

                    // ===== UNREAD COUNTS =====
                    let unreadCountForAdmin = 0;
                    let unreadCountForStudent = 0;

                    const allMsgs = await messagesRef.get();
                    allMsgs.forEach((msgDoc) => {
                        const msg = msgDoc.data();

                        if (
                            authenticatedMember &&
                            msg.senderId !== room.memberId &&
                            msg.isReadByAdmin !== true
                        ) {
                            unreadCountForAdmin++;
                        }

                        if (
                            authenticatedStudent &&
                            msg.senderId !== room.studentId &&
                            msg.isReadByStudent !== true
                        ) {
                            unreadCountForStudent++;
                        }
                    });

                    return {
                        ...room,
                        latestMessage,
                        unreadCountForAdmin,
                        unreadCountForStudent,
                    };
                })
            );

            chatRooms = roomsWithLatest;

            // ======================================================
            // 🔍 SEARCH FILTER (unchanged)
            // ======================================================
            if (search) {
                const s = search.toLowerCase();
                chatRooms = chatRooms.filter((room) => {
                    if (authenticatedStudent) {
                        const member = room.participants?.member;
                        return (
                            member?.name?.toLowerCase().includes(s) ||
                            member?.email?.toLowerCase().includes(s)
                        );
                    }

                    if (authenticatedMember) {
                        const student = room.participants?.student;
                        return (
                            student?.name?.toLowerCase().includes(s) ||
                            student?.email?.toLowerCase().includes(s)
                        );
                    }
                    return false;
                });
            }

            // ======================================================
            // SORT ROOMS BY ACTIVITY (unchanged)
            // ======================================================
            chatRooms.sort((a, b) => {
                const tA = a.latestMessage?.timestamp?._seconds || 0;
                const tB = b.latestMessage?.timestamp?._seconds || 0;
                return tB - tA;
            });

            // ======================================================
            // PAGINATION (unchanged)
            // ======================================================
            const totalItems = chatRooms.length;
            const start = (page - 1) * limit;
            const end = start + limit;
            const paginatedRooms = chatRooms.slice(start, end);
            const totalPages = Math.ceil(totalItems / limit);

            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                chatRooms: paginatedRooms,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    totalReturned: paginatedRooms.length,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
                search: search || null,
            });
        } catch (error) {
            console.error('Get chat rooms error:', error);
            httpError(next, error, req, 500);
        }
    },



    //  Get all students with pagination and search (for admins)
    getAllStudents: async (req, res, next) => {
        try {
            const { authenticatedMember } = req;
            if (!authenticatedMember || authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error('Unauthorized: Admin access required'), req, 403);
            }

            // Extract and validate pagination parameters
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search ? req.query.search.trim() : '';

            if (page < 1 || limit < 1) {
                return httpError(next, new Error('Invalid page or limit parameters'), req, 400);
            }

            // Calculate skip value for pagination
            const skip = (page - 1) * limit;

            // Build search query
            let searchQuery = {};
            if (search) {
                searchQuery = {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { phoneNumber: { $regex: search, $options: 'i' } },
                        { 'collegeDetails.university': { $regex: search, $options: 'i' } },
                        { 'collegeDetails.college': { $regex: search, $options: 'i' } },
                        { 'collegeDetails.branch': { $regex: search, $options: 'i' } },
                        { status: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            // Fetch total count of students with search filter
            const totalItems = await Student.countDocuments(searchQuery);

            const students = await Student.find(searchQuery)
                .select('name email profilePicture phoneNumber isVerified isFeePaid status collegeDetails.university collegeDetails.college collegeDetails.branch')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean();

            const sanitizedStudents = students.map(student => ({
                id: student._id.toString(),
                name: student.name || 'Unnamed Student',
                email: student.email,
                phoneNumber: student.phoneNumber || null,
                profilePicture: student.profilePicture || null,
                isVerified: student.isVerified,
                isFeePaid: student.isFeePaid,
                status: student.status,
                university: student.collegeDetails?.university || null,
                college: student.collegeDetails?.college || null,
                branch: student.collegeDetails?.branch || null,
            }));

            const totalPages = Math.ceil(totalItems / limit);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                students: sanitizedStudents,
                pagination: {
                    totalItems,
                    currentPage: page,
                    totalPages,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
                search: search || null,
            });
        } catch (error) {
            console.error('Get all students error:', error);
            httpError(next, error, req, 500);
        }
    },

    // Get all active members with pagination and search (for students)
    getAllMembers: async (req, res, next) => {
        try {
            const { authenticatedStudent } = req;
            if (!authenticatedStudent) {
                return httpError(next, new Error('Unauthorized: Student access required'), req, 403);
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search ? req.query.search.trim() : '';

            if (page < 1 || limit < 1) {
                return httpError(next, new Error('Invalid page or limit parameters'), req, 400);
            }

            const skip = (page - 1) * limit;

            // Build search query
            let searchQuery = { status: 'ACTIVE' };
            if (search) {
                searchQuery = {
                    status: 'ACTIVE',
                    $or: [
                        { firstName: { $regex: search, $options: 'i' } },
                        { lastName: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { phone: { $regex: search, $options: 'i' } },
                        { bio: { $regex: search, $options: 'i' } },
                        { role: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            const totalItems = await Member.countDocuments(searchQuery);

            const members = await Member.find(searchQuery)
                .select('firstName lastName email profilePicture phone bio role')
                .skip(skip)
                .limit(limit)
                .sort({ createdDate: -1 })
                .lean();

            const sanitizedMembers = members.map(member => ({
                id: member._id.toString(),
                name: `${member.firstName} ${member.lastName}`.trim() || 'Unnamed Member',
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
                phone: member.phone || null,
                bio: member.bio || null,
                role: member.role,
                profilePicture: member.profilePicture || null,
            }));

            const totalPages = Math.ceil(totalItems / limit);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                members: sanitizedMembers,
                pagination: {
                    totalItems,
                    currentPage: page,
                    totalPages,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
                search: search || null,
            });
        } catch (error) {
            console.error('Get all members error:', error);
            httpError(next, error, req, 500);
        }
    },

    // Clean up chat data after consultation ends
    cleanupChatRoom: async (req, res, next) => {
        try {
            const { chatId } = req.params;


            const db = getFirestore();

            const messagesRef = db.collection('chatRooms').doc(chatId).collection('messages');
            const messages = await messagesRef.get();

            const batch = db.batch();
            messages.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Delete chat room
            batch.delete(db.collection('chatRooms').doc(chatId));

            await batch.commit();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Chat room cleaned up successfully'
            });

        } catch (error) {
            console.error('Cleanup chat room error:', error);
            httpError(next, error, req, 500);
        }
    },

    setChatPresence: async (req, res, next) => {
        try {
            const { authenticatedStudent, authenticatedMember } = req;
            const { chatRoomId, active } = req.body;

            if (!chatRoomId) {
                return httpError(next, new Error("chatRoomId is required"), req, 400);
            }
            if (typeof active !== "boolean") {
                return httpError(next, new Error("active must be boolean"), req, 400);
            }

            const db = getFirestore();
            if (!db) {
                return httpError(next, new Error("Failed to initialize Firestore"), req, 500);
            }

            const role = authenticatedStudent ? "student" : authenticatedMember ? "member" : null;
            if (!role) {
                return httpError(next, new Error("Unauthorized"), req, 401);
            }

            // chatRoomId format: "studentId_memberId" (your app uses this)
            const parts = String(chatRoomId).split("_");
            if (parts.length !== 2) {
                return httpError(next, new Error("Invalid chatRoomId"), req, 400);
            }

            const myId = authenticatedStudent
                ? authenticatedStudent._id.toString()
                : authenticatedMember._id.toString();

            // strict check: student must match first part, member must match second part
            if (role === "student" && parts[0] !== myId) {
                return httpError(next, new Error("Unauthorized chatRoom access"), req, 403);
            }
            if (role === "member" && parts[1] !== myId) {
                return httpError(next, new Error("Unauthorized chatRoom access"), req, 403);
            }

            await db
                .collection("chatRooms")
                .doc(chatRoomId)
                .collection("presence")
                .doc(role)
                .set(
                    {
                        active,
                        userId: myId,
                        lastSeenAt: new Date(),
                    },
                    { merge: true }
                );

            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                chatRoomId,
                role,
                active,
            });
        } catch (err) {
            return httpError(next, err, req, 500);
        }
    },

        // ======================================================
    // ✅ MongoDB Chat Presence (Student/Admin)
    // ======================================================

    setStudentChatPresence: async (req, res, next) => {
        try {
            const { authenticatedStudent } = req;

            if (!authenticatedStudent?._id) {
                return httpError(next, new Error("Unauthorized: Student access required"), req, 401);
            }

            // Accept either `isOnline` or `active` from client (keeps frontend flexible)
            const isOnline =
                typeof req.body?.isOnline === "boolean"
                    ? req.body.isOnline
                    : typeof req.body?.active === "boolean"
                        ? req.body.active
                        : null;

            if (typeof isOnline !== "boolean") {
                return httpError(next, new Error("isOnline (boolean) is required"), req, 400);
            }

            const presence = await ChatPresence.findOneAndUpdate(
                { userType: "Student", userId: authenticatedStudent._id },
                {
                    $set: {
                        isOnline,
                        lastActiveAt: new Date(),
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            ).lean();

            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                userType: presence.userType,
                userId: presence.userId?.toString(),
                isOnline: presence.isOnline,
                lastActiveAt: presence.lastActiveAt,
                updatedAt: presence.updatedAt,
                createdAt: presence.createdAt,
            });
        } catch (error) {
            console.error("setStudentChatPresence error:", error);
            return httpError(next, error, req, 500);
        }
    },

    getAdminChatPresence: async (req, res, next) => {
        try {
            const { authenticatedStudent, authenticatedMember } = req;

            // Route uses `authentication`, so allow either if your middleware supports both
            if (!authenticatedStudent?._id && !authenticatedMember?._id) {
                return httpError(next, new Error("Unauthorized"), req, 401);
            }

            const { adminId } = req.params;
            if (!adminId) {
                return httpError(next, new Error("adminId is required"), req, 400);
            }
            if (!mongoose.Types.ObjectId.isValid(adminId)) {
                return httpError(next, new Error("Invalid adminId"), req, 400);
            }

            const presence = await ChatPresence.findOne({
                userType: "Member",
                userId: adminId,
            })
                .select("userType userId isOnline lastActiveAt createdAt updatedAt")
                .lean();

            // If no record exists yet => treat as offline
            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                userType: "Member",
                userId: adminId,
                isOnline: presence?.isOnline ?? false,
                lastActiveAt: presence?.lastActiveAt ?? null,
                updatedAt: presence?.updatedAt ?? null,
                createdAt: presence?.createdAt ?? null,
            });
        } catch (error) {
            console.error("getAdminChatPresence error:", error);
            return httpError(next, error, req, 500);
        }
    },

    setAdminChatPresence: async (req, res, next) => {
        try {
            const { authenticatedMember } = req;

            // Route uses `memberAccess`, so member should exist
            if (!authenticatedMember?._id) {
                return httpError(next, new Error("Unauthorized: Member access required"), req, 401);
            }

            const isOnline =
                typeof req.body?.isOnline === "boolean"
                    ? req.body.isOnline
                    : typeof req.body?.active === "boolean"
                        ? req.body.active
                        : null;

            if (typeof isOnline !== "boolean") {
                return httpError(next, new Error("isOnline (boolean) is required"), req, 400);
            }

            const presence = await ChatPresence.findOneAndUpdate(
                { userType: "Member", userId: authenticatedMember._id },
                {
                    $set: {
                        isOnline,
                        lastActiveAt: new Date(),
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            ).lean();

            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                userType: presence.userType,
                userId: presence.userId?.toString(),
                isOnline: presence.isOnline,
                lastActiveAt: presence.lastActiveAt,
                updatedAt: presence.updatedAt,
                createdAt: presence.createdAt,
            });
        } catch (error) {
            console.error("setAdminChatPresence error:", error);
            return httpError(next, error, req, 500);
        }
    },

    getStudentChatPresence: async (req, res, next) => {
        try {
            const { authenticatedMember } = req;

            // Route uses `memberAccess`
            if (!authenticatedMember?._id) {
                return httpError(next, new Error("Unauthorized: Member access required"), req, 401);
            }

            const { studentId } = req.params;
            if (!studentId) {
                return httpError(next, new Error("studentId is required"), req, 400);
            }
            if (!mongoose.Types.ObjectId.isValid(studentId)) {
                return httpError(next, new Error("Invalid studentId"), req, 400);
            }

            const presence = await ChatPresence.findOne({
                userType: "Student",
                userId: studentId,
            })
                .select("userType userId isOnline lastActiveAt createdAt updatedAt")
                .lean();

            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                userType: "Student",
                userId: studentId,
                isOnline: presence?.isOnline ?? false,
                lastActiveAt: presence?.lastActiveAt ?? null,
                updatedAt: presence?.updatedAt ?? null,
                createdAt: presence?.createdAt ?? null,
            });
        } catch (error) {
            console.error("getStudentChatPresence error:", error);
            return httpError(next, error, req, 500);
        }
    },


};