import type { WebhookMessage, WhatsApp } from 'meta-cloud-api';
import { DocumentMessageBuilder } from 'meta-cloud-api/api/messages/builders';

export const handleDocumentMessage = async (whatsapp: WhatsApp, message: WebhookMessage) => {
    console.log(`📄 Document message received from ${message.from}`);

    await whatsapp.messages.markAsRead({ messageId: message.id });

    const documentMessage = new DocumentMessageBuilder()
        .setLink('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')
        .setCaption('Here is a sample document for you')
        .setFilename('sample-document.pdf')
        .build();

    await whatsapp.messages.document({
        to: message.from,
        body: documentMessage,
    });

    console.log(`✅ Document response sent to ${message.from}`);
};
