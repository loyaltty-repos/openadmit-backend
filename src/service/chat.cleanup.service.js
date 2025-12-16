import { getFirestore, getStorage } from '../config/firebase.js';
import logger from '../util/logger.js';

class ChatCleanupService {
    constructor() {
        this.db = getFirestore();
        this.storage = getStorage();
    }

    // Clean up expired chat rooms (safety net)
    async cleanupExpiredChatRooms() {
        try {
            logger.info('Starting cleanup of expired chat rooms');

            const chatRoomsRef = this.db.collection('chatRooms');
            const expiredRooms = await chatRoomsRef
                .where('expiresAt', '<=', new Date())
                .get();

            logger.info(`Found ${expiredRooms.size} expired chat rooms`);

            for (const roomDoc of expiredRooms.docs) {
                await this.cleanupChatRoom(roomDoc.id);
            }

            logger.info('Expired chat rooms cleanup completed');
        } catch (error) {
            logger.error('Expired chat rooms cleanup error:', error);
        }
    }

    // Clean up specific chat room
    async cleanupChatRoom(chatId) {
        try {
            logger.info(`Cleaning up chat room for Chat: ${chatId}`);

            // Delete all messages
            const messagesRef = this.db.collection('chatRooms').doc(chatId).collection('messages');
            const messages = await messagesRef.get();

            const batch = this.db.batch();

            // Track files to delete
            const filesToDelete = [];

            messages.docs.forEach(doc => {
                const messageData = doc.data();
                if (messageData.file && messageData.file.storagePath) {
                    filesToDelete.push(messageData.file.storagePath);
                }
                batch.delete(doc.ref);
            });

            // Delete chat room document
            batch.delete(this.db.collection('chatRooms').doc(chatId));

            await batch.commit();

            // Delete files from storage
            for (const filePath of filesToDelete) {
                try {
                    await this.storage.bucket().file(filePath).delete();
                    logger.info(`Deleted file: ${filePath}`);
                } catch (fileError) {
                    logger.warn(`Failed to delete file ${filePath}:`, fileError.message);
                }
            }

            logger.info(`Successfully cleaned up chat room for booking: ${chatId}`);
        } catch (error) {
            logger.error(`Failed to cleanup chat room for booking ${chatId}:`, error);
        }
    }

    // Scheduled cleanup job (run every hour)
    startScheduledCleanup() {
        logger.info('Starting scheduled chat cleanup service');

        setInterval(async () => {
            await this.cleanupExpiredChatRooms();
        }, 60 * 60 * 1000); // 1 hour

        setTimeout(async () => {
            await this.cleanupExpiredChatRooms();
        }, 60 * 1000); // 1 minute
    }
}

export default new ChatCleanupService();