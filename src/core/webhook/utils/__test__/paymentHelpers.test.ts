import { describe, expect, it } from 'vitest';
import { MessageTypesEnum } from '../../../../types/enums';
import type { InteractivePaymentMethodMessage } from '../../types/message';
import type { PaymentTransactionStatusWebhook } from '../../types/payments-in';
import {
    getPaymentMethodSelection,
    isOrderDetailsButtonClick,
    isPaymentMethodMessage,
    ORDER_DETAILS_CLICKED_PAYLOAD,
} from '../paymentHelpers-br';
import { getPaymentTransactionInfo, isPaymentTransactionStatus } from '../paymentHelpers-in';

describe('paymentHelpers', () => {
    it('detects Brazil payment_method interactive messages', () => {
        const message: InteractivePaymentMethodMessage = {
            from: '5511999999999',
            id: 'wamid.test',
            timestamp: '1234567890',
            type: MessageTypesEnum.Interactive,
            interactive: {
                type: 'payment_method',
                payment_method: {
                    payment_method: 'offsite_card_pay',
                    payment_timestamp: 1726170122,
                    reference_id: 'order-001',
                    last_four_digits: '5235',
                    credential_id: '1234567',
                },
            },
        };

        expect(isPaymentMethodMessage(message)).toBe(true);
        expect(getPaymentMethodSelection(message)).toEqual({
            referenceId: 'order-001',
            credentialId: '1234567',
            paymentMethod: 'offsite_card_pay',
            paymentTimestamp: 1726170122,
            lastFourDigits: '5235',
        });
    });

    it('detects order details template button clicks', () => {
        expect(
            isOrderDetailsButtonClick({
                from: '5511999999999',
                id: 'wamid.test',
                timestamp: '1234567890',
                type: MessageTypesEnum.Button,
                context: { from: '15550783881', id: 'wamid.context' },
                button: {
                    payload: ORDER_DETAILS_CLICKED_PAYLOAD,
                    text: 'Review and pay',
                },
            }),
        ).toBe(true);
    });

    it('extracts payment transaction status details', () => {
        const status: PaymentTransactionStatusWebhook = {
            type: 'payment',
            id: 'status-id',
            status: 'captured',
            timestamp: '1234567890',
            recipient_id: '919876543210',
            payment: {
                reference_id: 'order-in-001',
                currency: 'INR',
                amount: { value: 1100, offset: 100 },
                transaction: {
                    id: 'pg-order-id',
                    type: 'razorpay',
                    status: 'success',
                },
            },
        };

        expect(isPaymentTransactionStatus(status)).toBe(true);
        expect(getPaymentTransactionInfo(status)).toMatchObject({
            referenceId: 'order-in-001',
            status: 'captured',
            currency: 'INR',
        });
    });
});
