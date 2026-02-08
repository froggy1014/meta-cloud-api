import type { DocumentProcessedMessage, DocumentMessageHandler } from 'meta-cloud-api';

/**
 * Handler for document messages
 * Responds with a sample document using plain object API
 */
export const handleDocumentMessage: DocumentMessageHandler = async (whatsapp, processed: DocumentProcessedMessage) => {
    const { message } = processed;
    console.log(`📄 Document message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });
    await whatsapp.messages.showTypingIndicator({ messageId: message.id });

    // Send document response using plain object API
    await whatsapp.messages.document({
        to: message.from,
        body: {
            link: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            caption: 'Here is a sample PDF document 📎',
            filename: 'sample.pdf',
        },
    });

    console.log(`✅ Document response sent to ${message.from}`);
};
