// Re-export all types from separate files

export * from './account';
export * from './appStateSync';
export * from './business';
export * from './calls';
export * from './common';
export * from './flows';
export * from './groups';
export * from './history';
export * from './marketing';
export * from './message';
export * from './messageEchoes';
export * from './messaging';
export * from './partner';
export * from './payments';
export * from './phoneNumber';
export * from './security';
export * from './status';
export * from './template';
export * from './webhookFields';

import type {
    AccountAlertsWebhookValue,
    AccountReviewUpdateWebhookValue,
    AccountSettingsUpdateWebhookValue,
    AccountUpdateWebhookValue,
} from './account';
import type { SmbAppStateSyncWebhookValue } from './appStateSync';
import type { BusinessCapabilityUpdateWebhookValue, BusinessStatusUpdateWebhookValue } from './business';
import type { CallsWebhookValue } from './calls';
// Import types needed for WebhookValue
import type { WebhookContact, WebhookError, WebhookMetadata } from './common';
import type { FlowsWebhookValue } from './flows';
import type {
    GroupLifecycleUpdateWebhookValue,
    GroupParticipantsUpdateWebhookValue,
    GroupSettingsUpdateWebhookValue,
    GroupStatusUpdateWebhookValue,
} from './groups';
import type { HistoryWebhookValue } from './history';
import type { AutomaticEventsWebhookValue, TrackingEventsWebhookValue } from './marketing';
import type { WhatsAppMessage } from './message';
import type { MessageEchoesWebhookValue, SmbMessageEchoesWebhookValue } from './messageEchoes';
import type { MessagingHandoversWebhookValue, StandbyWebhookValue, UserPreferencesWebhookValue } from './messaging';
import type { PartnerSolutionsWebhookValue } from './partner';
import type { PaymentConfigurationUpdateWebhookValue } from './payments';
import type { PhoneNumberNameUpdateWebhookValue, PhoneNumberQualityUpdateWebhookValue } from './phoneNumber';
import type { SecurityWebhookValue } from './security';
import type { StatusWebhook } from './status';
import type {
    MessageTemplateComponentsUpdateWebhookValue,
    MessageTemplateQualityUpdateWebhookValue,
    MessageTemplateStatusUpdateWebhookValue,
    TemplateCategoryUpdateWebhookValue,
    TemplateCorrectCategoryDetectionWebhookValue,
} from './template';

// ============================================================================
// Webhook Value Types (Discriminated Union)
// ============================================================================

/**
 * Webhook value for incoming messages
 */
export interface MessageWebhookValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    contacts: Array<WebhookContact>;
    messages: Array<WhatsAppMessage>;
}

/**
 * Webhook value for status updates
 */
export interface StatusWebhookValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    statuses: Array<StatusWebhook>;
}

/**
 * Webhook value for errors (no contacts or messages)
 */
export interface ErrorWebhookValue {
    messaging_product: 'whatsapp';
    metadata: WebhookMetadata;
    errors: Array<WebhookError>;
}

/**
 * Union type for all webhook value types
 */
export type WebhookValue = MessageWebhookValue | StatusWebhookValue | ErrorWebhookValue;

/**
 * Union type for all webhook field values
 */
export type WebhookFieldValue =
    | AccountUpdateWebhookValue
    | AccountReviewUpdateWebhookValue
    | AccountAlertsWebhookValue
    | AccountSettingsUpdateWebhookValue
    | AutomaticEventsWebhookValue
    | BusinessCapabilityUpdateWebhookValue
    | BusinessStatusUpdateWebhookValue
    | CallsWebhookValue
    | FlowsWebhookValue
    | GroupLifecycleUpdateWebhookValue
    | GroupParticipantsUpdateWebhookValue
    | GroupSettingsUpdateWebhookValue
    | GroupStatusUpdateWebhookValue
    | HistoryWebhookValue
    | MessageEchoesWebhookValue
    | MessageTemplateComponentsUpdateWebhookValue
    | MessageTemplateQualityUpdateWebhookValue
    | MessageTemplateStatusUpdateWebhookValue
    | MessagingHandoversWebhookValue
    | PartnerSolutionsWebhookValue
    | PaymentConfigurationUpdateWebhookValue
    | PhoneNumberNameUpdateWebhookValue
    | PhoneNumberQualityUpdateWebhookValue
    | SecurityWebhookValue
    | SmbAppStateSyncWebhookValue
    | SmbMessageEchoesWebhookValue
    | StandbyWebhookValue
    | TemplateCategoryUpdateWebhookValue
    | TemplateCorrectCategoryDetectionWebhookValue
    | TrackingEventsWebhookValue
    | UserPreferencesWebhookValue;

// ============================================================================
// Top-Level Webhook Structure
// ============================================================================

export interface WebhookPayload {
    object: 'whatsapp_business_account';
    entry: Array<{
        id: string;
        changes: Array<
            | {
                  value: WebhookValue;
                  field: 'messages';
              }
            | WebhookFieldValue
        >;
    }>;
}

// ============================================================================
// Legacy/Compatibility Types
// ============================================================================

/**
 * @deprecated Use specific message types instead
 * Represents a message received through the webhook
 */
export interface WebhookMessage {
    wabaId: string;
    id: string;
    from: string;
    timestamp: string;
    type: any;
    phoneNumberId: string;
    displayPhoneNumber: string;
    profileName: string;
    text?: any;
    image?: any;
    video?: any;
    audio?: any;
    document?: any;
    sticker?: any;
    location?: any;
    contacts?: any;
    interactive?: any;
    button?: any;
    order?: any;
    system?: any;
    reaction?: any;
    statuses?: StatusWebhook;
    originalData: any;
}

/**
 * @deprecated Use WebhookValue instead
 */
export interface WebhookMessageValue {
    messaging_product: string;
    metadata: WebhookMetadata;
    contacts?: Array<WebhookContact>;
    messages: Array<WhatsAppMessage>;
    statuses?: Array<StatusWebhook>;
    errors?: Array<WebhookError>;
}

/**
 * Webhook event received from WhatsApp
 */
export interface WebhookEvent {
    field: string;
    value: any;
    timestamp: number;
}

// Re-export MessageStatus enum
export { MessageStatus } from './status';
