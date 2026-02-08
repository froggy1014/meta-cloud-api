import type { InteractiveMessageHandler, InteractiveProcessedMessage } from 'meta-cloud-api';

/**
 * Handler for interactive messages (button/list responses)
 * Responds based on the type of interactive message using plain object API
 */
export const handleInteractiveMessage: InteractiveMessageHandler = async (
    whatsapp,
    processed: InteractiveProcessedMessage,
) => {
    const { message } = processed;
    console.log(`🎯 Interactive message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    if (message.interactive.type === 'list_reply') {
        const selectedId = message.interactive.list_reply?.id;
        console.log(`User selected list option: ${selectedId}`);

        await whatsapp.messages.text({
            to: message.from,
            body: `You selected: ${selectedId}`,
        });
    } else if (message.interactive.type === 'button_reply') {
        const selectedId = message.interactive.button_reply?.id;
        console.log(`User clicked button: ${selectedId}`);

        await whatsapp.messages.text({
            to: message.from,
            body: `You clicked: ${selectedId}`,
        });
    }

    console.log(`✅ Interactive response sent to ${message.from}`);
};
