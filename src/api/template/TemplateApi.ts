// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/

// Endpoints:
// - GET /{TEMPLATE_ID}
// - POST /{TEMPLATE_ID}
// - GET /{WABA_ID}/message_templates?...
// - POST /{WABA_ID}/message_templates
// - DELETE /{WABA_ID}/message_templates?...

import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import type { ResponsePagination, ResponseSuccess } from '../../types/request';
import { objectToQueryString } from '../../utils/objectToQueryString';
import type {
    TemplateClass,
    TemplateDeleteParams,
    TemplateGetParams,
    TemplateRequestBody,
    TemplateResponse,
} from './types';

/**
 * WhatsApp Message Templates API client for managing message templates.
 *
 * Message templates are pre-approved message formats that businesses can use to
 * send notifications and customer care messages. Templates must be approved by
 * Meta before they can be used to send messages.
 *
 * **Covered endpoints:**
 * - `GET /{TEMPLATE_ID}` - Get a single template ({@link TemplateApi.getTemplate})
 * - `POST /{TEMPLATE_ID}` - Update an existing template ({@link TemplateApi.updateTemplate})
 * - `GET /{WABA_ID}/message_templates` - List all templates ({@link TemplateApi.getTemplates})
 * - `POST /{WABA_ID}/message_templates` - Create a new template ({@link TemplateApi.createTemplate})
 * - `DELETE /{WABA_ID}/message_templates` - Delete a template ({@link TemplateApi.deleteTemplate})
 *
 * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/message-templates | Message Templates API Reference}
 * @see {@link https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/ | WhatsApp Templates Documentation}
 *
 * @example
 * ```ts
 * const client = new WhatsApp({ accessToken: '...', phoneNumberId: '...', businessAcctId: '...' });
 *
 * // Create a template
 * const template = await client.template.createTemplate({
 *   name: 'hello_world',
 *   language: 'en_US',
 *   category: 'MARKETING',
 *   components: [{ type: 'BODY', text: 'Hello {{1}}!' }],
 * });
 *
 * // List all templates
 * const templates = await client.template.getTemplates();
 * ```
 */
export default class TemplateApi extends BaseAPI implements TemplateClass {
    private readonly endpoint = 'message_templates';

    /**
     * Retrieves a single message template by its ID.
     *
     * Returns the full template definition including name, language, status,
     * category, and components.
     *
     * **Endpoint:** `GET /{TEMPLATE_ID}`
     *
     * @param templateId - The unique identifier of the template to retrieve
     * @returns A promise resolving to the template details
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/message-templates | Message Templates Reference}
     *
     * @example
     * ```ts
     * const template = await client.template.getTemplate('template_id_123');
     * console.log(template.name);     // e.g., "hello_world"
     * console.log(template.status);   // e.g., "APPROVED"
     * ```
     */
    async getTemplate(templateId: string): Promise<TemplateResponse> {
        return this.sendJson(HttpMethodsEnum.Get, `${templateId}`, this.config[WabaConfigEnum.RequestTimeout], null);
    }

    /**
     * Updates an existing message template.
     *
     * Allows modifying template components and other properties. Note that editing
     * an approved template will resubmit it for review, changing its status back
     * to `PENDING`.
     *
     * **Endpoint:** `POST /{TEMPLATE_ID}`
     *
     * @param templateId - The unique identifier of the template to update
     * @param template - Partial template body containing only the fields to update
     * @returns A promise resolving to a success response (`{ success: true }`)
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/message-templates | Message Templates Reference}
     *
     * @example
     * ```ts
     * await client.template.updateTemplate('template_id_123', {
     *   components: [{ type: 'BODY', text: 'Updated greeting: Hello {{1}}!' }],
     * });
     * ```
     */
    async updateTemplate(templateId: string, template: Partial<TemplateRequestBody>): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${templateId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(template),
        );
    }

    /**
     * Lists message templates for the WhatsApp Business Account.
     *
     * Returns a paginated list of templates, optionally filtered by query parameters
     * such as category, language, name, status, or quality score.
     *
     * **Endpoint:** `GET /{WABA_ID}/message_templates`
     *
     * @param params - Optional query parameters to filter results
     * @param params.category - Filter by template category (e.g., `'MARKETING'`, `'UTILITY'`)
     * @param params.content - Filter by template content
     * @param params.language - Filter by language code (e.g., `'en_US'`)
     * @param params.name - Filter by exact template name
     * @param params.name_or_content - Filter by name or content (search)
     * @param params.quality_score - Filter by quality score
     * @param params.status - Filter by template status (e.g., `'APPROVED'`, `'PENDING'`, `'REJECTED'`)
     * @returns A promise resolving to a paginated response containing an array of templates
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/message-templates | Message Templates Reference}
     *
     * @example
     * ```ts
     * // List all templates
     * const allTemplates = await client.template.getTemplates();
     *
     * // Filter by category and status
     * const approved = await client.template.getTemplates({
     *   category: 'MARKETING',
     *   status: 'APPROVED',
     * });
     * ```
     */
    async getTemplates(params?: TemplateGetParams): Promise<ResponsePagination<TemplateResponse>> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}${objectToQueryString(params ?? {})}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    /**
     * Creates a new message template for the WhatsApp Business Account.
     *
     * The template will be submitted for review. Once approved, it can be used
     * to send template messages via {@link MessagesApi.template}.
     *
     * **Endpoint:** `POST /{WABA_ID}/message_templates`
     *
     * @param template - The template definition
     * @param template.name - Template name (lowercase alphanumeric and underscores only)
     * @param template.language - Language code (e.g., `'en_US'`)
     * @param template.category - Template category (`'MARKETING'`, `'UTILITY'`, or `'AUTHENTICATION'`)
     * @param template.components - Array of template components (header, body, footer, buttons)
     * @param template.allow_category_change - Whether Meta can auto-assign a different category
     * @param template.parameter_format - Parameter format (`'POSITIONAL'` or `'NAMED'`)
     * @param template.sub_category - Optional sub-category for the template
     * @param template.message_send_ttl_seconds - Optional TTL in seconds for message delivery attempts
     * @returns A promise resolving to the created template response with its assigned `id` and `status`
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/message-templates | Message Templates Reference}
     *
     * @example
     * ```ts
     * const template = await client.template.createTemplate({
     *   name: 'order_confirmation',
     *   language: 'en_US',
     *   category: 'UTILITY',
     *   components: [
     *     { type: 'BODY', text: 'Your order {{1}} has been confirmed.' },
     *   ],
     * });
     * console.log(template.id);     // Template ID
     * console.log(template.status); // "PENDING"
     * ```
     */
    async createTemplate(template: TemplateRequestBody): Promise<TemplateResponse> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}`,
            this.config[WabaConfigEnum.RequestTimeout],
            JSON.stringify(template),
        );
    }

    /**
     * Deletes a message template from the WhatsApp Business Account.
     *
     * Deleting a template removes all language variations of that template.
     * To delete a specific language version, provide the `hsm_id` parameter.
     *
     * **Endpoint:** `DELETE /{WABA_ID}/message_templates`
     *
     * @param params - The delete parameters
     * @param params.name - The name of the template to delete (required)
     * @param params.hsm_id - Optional template ID to delete a specific language version
     * @returns A promise resolving to a success response (`{ success: true }`)
     *
     * @see {@link https://developers.facebook.com/docs/whatsapp/cloud-api/reference/message-templates | Message Templates Reference}
     *
     * @example
     * ```ts
     * // Delete all language versions of a template
     * await client.template.deleteTemplate({ name: 'old_template' });
     *
     * // Delete a specific language version
     * await client.template.deleteTemplate({ name: 'old_template', hsm_id: '123456' });
     * ```
     */
    async deleteTemplate(params: TemplateDeleteParams): Promise<ResponseSuccess> {
        return this.sendJson(
            HttpMethodsEnum.Delete,
            `${this.config[WabaConfigEnum.BusinessAcctId]}/${this.endpoint}${objectToQueryString(params)}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
