import { TemplateMessageBuilder, type WhatsApp } from 'meta-cloud-api';

/**
 * Send a template message
 * Note: Template name must be approved by WhatsApp before use
 */
export const sendTemplateMessage = async (whatsapp: WhatsApp, to: string) => {
    const templateMessage = new TemplateMessageBuilder()
        .setName('hello_world') // Use your approved template name
        .setLanguage('en_US')
        .addBody(['John']) // Parameters for template body
        .build();

    await whatsapp.messages.template({
        to,
        body: templateMessage,
    });

    console.log(`✅ Template message sent to ${to}`);
};
