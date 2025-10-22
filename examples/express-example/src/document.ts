import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';

export const handleDocumentMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📄 Document message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    await whatsapp.messages.document({
        to: message.from,
        body: {
            link: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            caption: 'Here is a sample document for you',
            filename: 'sample-document.pdf',
        },
    });

    console.log(`✅ Document response sent to ${message.from}`);
};
