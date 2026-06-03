// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/one-click-payments/
// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orderdetailstemplate/

/** Payload sent when a user taps an order details template button. */
export const ORDER_DETAILS_CLICKED_PAYLOAD = 'ORDER_DETAILS_CLICKED';

export type BrazilPaymentMethodWebhookType = 'offsite_card_pay' | string;

export interface BrazilPaymentMethodWebhookPayload {
    payment_method: BrazilPaymentMethodWebhookType;
    payment_timestamp: number;
    reference_id: string;
    last_four_digits?: string;
    credential_id: string;
}

export interface InteractivePaymentMethodMessageInteractive {
    type: 'payment_method';
    payment_method: BrazilPaymentMethodWebhookPayload;
}
