import type { PaymentTransactionStatusWebhook } from '../types/payments-in';
import type { StatusWebhook } from '../types/status';

export type PaymentTransactionInfo = {
    referenceId: string;
    status: string;
    currency: string;
    amount: PaymentTransactionStatusWebhook['payment']['amount'];
    transaction?: PaymentTransactionStatusWebhook['payment']['transaction'];
};

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
