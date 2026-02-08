import type { WhatsApp } from 'meta-cloud-api';
import { ComponentTypesEnum, LanguagesEnum, ParametersTypesEnum } from 'meta-cloud-api/enums';

/**
 * Send a template message using plain object API
 * Note: Template name must be approved by WhatsApp before use
 */
export const sendTemplateMessage = async (whatsapp: WhatsApp, to: string) => {
    await whatsapp.messages.template({
        to,
        body: {
            name: 'hello_world', // Use your approved template name
            language: {
                policy: 'deterministic',
                code: LanguagesEnum.English_US,
            },
            components: [
                {
                    type: ComponentTypesEnum.Body,
                    parameters: [
                        {
                            type: ParametersTypesEnum.Text,
                            text: 'John',
                        },
                    ],
                },
            ],
        },
    });

    console.log(`✅ Template message sent to ${to}`);
};
