import { logger } from '@config/logger.js';
import { MessageTemplates } from '@services/whatsapp/templates.js';
import type { AudioMessage, DocumentMessage, ImageMessage, VideoMessage } from 'meta-cloud-api/webhook';

/**
 * Image message handler
 * Processes incoming image messages
 */
export async function handleImageMessage(message: ImageMessage): Promise<void> {
    try {
        const userId = message.from;

        logger.info('Processing image message', {
            userId,
            messageId: message.id,
            mediaId: message.image.id,
            mimeType: message.image.mime_type,
        });

        // For now, acknowledge the image but don't process it
        await MessageTemplates.sendText(
            userId,
            'Thank you for the image. If you need help, please describe your issue in text.',
        );
    } catch (error) {
        logger.error('Error handling image message', {
            messageId: message.id,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

/**
 * Document message handler
 * Processes incoming document messages
 */
export async function handleDocumentMessage(message: DocumentMessage): Promise<void> {
    try {
        const userId = message.from;

        logger.info('Processing document message', {
            userId,
            messageId: message.id,
            mediaId: message.document.id,
            filename: message.document.filename,
            mimeType: message.document.mime_type,
        });

        // Acknowledge the document
        await MessageTemplates.sendText(
            userId,
            `Thank you for sending "${message.document.filename}". Our team will review it when processing your ticket.`,
        );
    } catch (error) {
        logger.error('Error handling document message', {
            messageId: message.id,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

/**
 * Video message handler
 * Processes incoming video messages
 */
export async function handleVideoMessage(message: VideoMessage): Promise<void> {
    try {
        const userId = message.from;

        logger.info('Processing video message', {
            userId,
            messageId: message.id,
            mediaId: message.video.id,
            mimeType: message.video.mime_type,
        });

        // Acknowledge the video
        await MessageTemplates.sendText(
            userId,
            'Thank you for the video. Our team will review it when processing your ticket.',
        );
    } catch (error) {
        logger.error('Error handling video message', {
            messageId: message.id,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

/**
 * Audio message handler
 * Processes incoming audio messages
 */
export async function handleAudioMessage(message: AudioMessage): Promise<void> {
    try {
        const userId = message.from;

        logger.info('Processing audio message', {
            userId,
            messageId: message.id,
            mediaId: message.audio.id,
            mimeType: message.audio.mime_type,
        });

        // Acknowledge the audio
        await MessageTemplates.sendText(
            userId,
            'Thank you for the audio message. Please also describe your issue in text so we can help you better.',
        );
    } catch (error) {
        logger.error('Error handling audio message', {
            messageId: message.id,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
