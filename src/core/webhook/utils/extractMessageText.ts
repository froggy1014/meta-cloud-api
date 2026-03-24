import { MessageTypesEnum } from '../../../types/enums';
import type { WhatsAppMessage } from '../types/message';

/**
 * Extracts a human-readable display text from any incoming WhatsApp message.
 *
 * Useful for logging, notifications, chat previews, and storing message summaries.
 *
 * @param message - The incoming WhatsApp message from a webhook handler
 * @returns A display-friendly string representing the message content
 *
 * @example
 * ```ts
 * handler.processor.onText(async (whatsapp, processed) => {
 *   const text = extractMessageText(processed.message);
 *   console.log(`Message from ${processed.message.from}: ${text}`);
 * });
 * ```
 */
export function extractMessageText(message: WhatsAppMessage): string {
    switch (message.type) {
        case MessageTypesEnum.Text:
            return message.text.body;

        case MessageTypesEnum.Image:
            return message.image.caption || '[Image]';

        case MessageTypesEnum.Video:
            return message.video.caption || '[Video]';

        case MessageTypesEnum.Audio:
            return message.audio.voice ? '[Voice Message]' : '[Audio]';

        case MessageTypesEnum.Document:
            return message.document.caption || message.document.filename || '[Document]';

        case MessageTypesEnum.Sticker:
            return message.sticker.animated ? '[Animated Sticker]' : '[Sticker]';

        case MessageTypesEnum.Interactive: {
            const interactive = message.interactive;
            if (interactive.type === 'button_reply') {
                return interactive.button_reply.title;
            }
            if (interactive.type === 'list_reply') {
                return interactive.list_reply.title;
            }
            if (interactive.type === 'nfm_reply') {
                return interactive.nfm_reply.body || interactive.nfm_reply.name || '[Form Reply]';
            }
            return '[Interactive]';
        }

        case MessageTypesEnum.Button:
            return message.button.text;

        case MessageTypesEnum.Location:
            return (
                message.location.name ||
                message.location.address ||
                `📍 ${message.location.latitude}, ${message.location.longitude}`
            );

        case MessageTypesEnum.Contacts: {
            const names = message.contacts.map((c) => c.name.formatted_name);
            return names.length === 1 ? `👤 ${names[0]}` : `👤 ${names.length} contacts`;
        }

        case MessageTypesEnum.Reaction:
            return message.reaction.emoji || '[Reaction removed]';

        case MessageTypesEnum.Order: {
            const count = message.order.product_items.length;
            return `🛒 Order: ${count} item${count > 1 ? 's' : ''}`;
        }

        case MessageTypesEnum.System:
            return message.system.body;

        case MessageTypesEnum.Unsupported:
            return '[Unsupported message]';

        default:
            return `[${(message as any).type}]`;
    }
}
