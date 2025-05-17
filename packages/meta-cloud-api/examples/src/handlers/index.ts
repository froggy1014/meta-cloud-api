import WhatsApp from '../../../src';
import { MessageType, WebhookMessage } from '../../../src/types/webhook';
import {
    handleAudioMessage,
    handleButtonMessage,
    handleContactsMessage,
    handleDocumentMessage,
    handleImageMessage,
    handleInteractiveMessage,
    handleLocationMessage,
    handleStickerMessage,
    handleTextMessage,
    handleUnknownMessage,
    handleVideoMessage,
} from './messageHandlers';

/**
 * Handle an incoming message based on its type
 */
export async function handleMessage(whatsapp: WhatsApp, message: WebhookMessage) {
    console.log(`Received message of type: ${message.type}`);

    try {
        await whatsapp.messages.markAsRead({
            messageId: message.id,
        });
        console.log(`Marked message ${message.id} as read`);
    } catch (error) {
        console.error('Error marking message as read:', error);
    }

    // Show typing indicator before replying
    try {
        await whatsapp.messages.showTypingIndicator({
            messageId: message.id,
        });
        console.log(`Showing typing indicator for message ${message.id}`);

        // Add a small delay to simulate typing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Handle different message types
        switch (message.type) {
            case MessageType.TEXT:
                await handleTextMessage(whatsapp, message);
                break;
            case MessageType.IMAGE:
                await handleImageMessage(whatsapp, message);
                break;
            case MessageType.AUDIO:
                await handleAudioMessage(whatsapp, message);
                break;
            case MessageType.VIDEO:
                await handleVideoMessage(whatsapp, message);
                break;
            case MessageType.DOCUMENT:
                await handleDocumentMessage(whatsapp, message);
                break;
            case MessageType.LOCATION:
                await handleLocationMessage(whatsapp, message);
                break;
            case MessageType.CONTACTS:
                await handleContactsMessage(whatsapp, message);
                break;
            case MessageType.BUTTON:
                await handleButtonMessage(whatsapp, message);
                break;
            case MessageType.INTERACTIVE:
                await handleInteractiveMessage(whatsapp, message);
                break;
            case MessageType.STICKER:
                await handleStickerMessage(whatsapp, message);
                break;
            default:
                await handleUnknownMessage(whatsapp, message);
                break;
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
}

/**
 * Handle status updates
 */
export function handleStatusUpdate(status: any) {
    console.log(`Message ${status.id} status updated to: ${status.status}`);
}
