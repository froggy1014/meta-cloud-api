// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/payment_configuration_update/
// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/pg/

export type PaymentConfigurationProviderIn = 'upi_vpa' | 'razorpay' | 'payu' | 'zaakpay';

export interface PaymentConfigurationUpdateValue {
    configuration_name: string;
    provider_name: PaymentConfigurationProviderIn | string;
    provider_mid: string;
    status: string;
    created_timestamp: number;
    updated_timestamp: number;
}

export interface PaymentConfigurationUpdateWebhookValue {
    field: 'payment_configuration_update';
    value: PaymentConfigurationUpdateValue;
}

export type PaymentTransactionMethodType = 'upi' | 'card' | 'netbanking' | 'wallet' | string;

export type PaymentGatewayType = 'billdesk' | 'razorpay' | 'payu' | 'zaakpay' | string;

export interface PaymentTransactionAmount {
    value: number;
    offset: number;
}

export interface PaymentTransactionError {
    code: string;
    reason: string;
}

export interface PaymentTransactionRefund {
    id: string;
    amount: PaymentTransactionAmount;
    speed_processed?: 'instant' | 'normal' | string;
    status: string;
    created_timestamp?: string | number;
    updated_timestamp?: string | number;
}

export interface PaymentTransactionDetails {
    id: string;
    pg_transaction_id?: string;
    type: PaymentGatewayType;
    status: 'success' | 'failed' | string;
    created_timestamp?: string | number;
    updated_timestamp?: string | number;
    amount?: PaymentTransactionAmount;
    order_amount?: PaymentTransactionAmount;
    currency?: string;
    method?: {
        type: PaymentTransactionMethodType;
    };
    error?: PaymentTransactionError;
    refunds?: PaymentTransactionRefund[];
}

export interface PaymentTransactionWebhookPayload {
    reference_id: string;
    amount: PaymentTransactionAmount;
    currency: string;
    transaction?: PaymentTransactionDetails;
    receipt?: string;
    notes?: Record<string, string>;
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    additional_info1?: string;
    additional_info2?: string;
    additional_info3?: string;
    additional_info4?: string;
    additional_info5?: string;
    additional_info6?: string;
    additional_info7?: string;
    refunds?: PaymentTransactionRefund[];
}

export interface PaymentTransactionStatusWebhook {
    type: 'payment';
    id: string;
    status: string;
    timestamp: string;
    recipient_id: string;
    payment: PaymentTransactionWebhookPayload;
}
