import type { ButtonMessage, InteractivePaymentMethodMessage, WhatsAppMessage } from '../types/message';
import { ORDER_DETAILS_CLICKED_PAYLOAD } from '../types/payments-br';
import type { PaymentTransactionStatusWebhook } from '../types/payments-in';
import type { StatusWebhook } from '../types/status';
import { isButtonMessage, isInteractiveMessage } from './messageHelpers';

export { ORDER_DETAILS_CLICKED_PAYLOAD };

export type PaymentMethodSelection = {
    referenceId: string;
    credentialId: string;
    paymentMethod: string;
    paymentTimestamp: number;
    lastFourDigits?: string;
};

export type PaymentTransactionInfo = {
    referenceId: string;
    status: string;
    currency: string;
    amount: PaymentTransactionStatusWebhook['payment']['amount'];
    transaction?: PaymentTransactionStatusWebhook['payment']['transaction'];
};

export function isPaymentMethodMessage(msg: WhatsAppMessage): msg is InteractivePaymentMethodMessage {
    return isInteractiveMessage(msg) && msg.interactive.type === 'payment_method';
}

export function getPaymentMethodSelection(msg: WhatsAppMessage): PaymentMethodSelection | null {
    if (!isPaymentMethodMessage(msg)) {
        return null;
    }

    const paymentMethod = msg.interactive.payment_method;
    return {
        referenceId: paymentMethod.reference_id,
        credentialId: paymentMethod.credential_id,
        paymentMethod: paymentMethod.payment_method,
        paymentTimestamp: paymentMethod.payment_timestamp,
        lastFourDigits: paymentMethod.last_four_digits,
    };
}

export function isOrderDetailsButtonClick(msg: WhatsAppMessage): msg is ButtonMessage {
    return isButtonMessage(msg) && msg.button.payload === ORDER_DETAILS_CLICKED_PAYLOAD;
}

export function isPaymentTransactionStatus(status: StatusWebhook): status is PaymentTransactionStatusWebhook {
    return 'type' in status && status.type === 'payment';
}

export function getPaymentTransactionInfo(status: StatusWebhook): PaymentTransactionInfo | null {
    if (!isPaymentTransactionStatus(status)) {
        return null;
    }

    return {
        referenceId: status.payment.reference_id,
        status: status.status,
        currency: status.payment.currency,
        amount: status.payment.amount,
        transaction: status.payment.transaction,
    };
}
