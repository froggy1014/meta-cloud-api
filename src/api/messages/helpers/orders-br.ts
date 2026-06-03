// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orders/

import type { OrderHeaderObject, OrderSimpleText } from '../types/orders/common';
import type {
    BrazilPaymentSetting,
    BrazilPixDynamicCode,
    OrderDetailsBrInput,
    OrderDetailsInteractiveObjectBr,
    OrderStatusBrInput,
    OrderStatusInteractiveObjectBr,
} from '../types/orders/orders-br';

export type BuildOrderDetailsBrOptions = {
    body: OrderSimpleText;
    footer?: OrderSimpleText;
    header?: OrderHeaderObject;
    parameters: OrderDetailsBrInput;
};

export type BuildOrderStatusBrOptions = {
    body: OrderSimpleText;
    footer?: OrderSimpleText;
    header?: OrderHeaderObject;
    parameters: OrderStatusBrInput;
};

export function buildPixPaymentSetting(pix: BrazilPixDynamicCode): BrazilPaymentSetting {
    return {
        type: 'pix_dynamic_code',
        pix_dynamic_code: pix,
    };
}

export function buildBoletoPaymentSetting(digitableLine: string): BrazilPaymentSetting {
    return {
        type: 'boleto',
        boleto: { digitable_line: digitableLine },
    };
}

export function buildPaymentLinkSetting(uri: string): BrazilPaymentSetting {
    return {
        type: 'payment_link',
        payment_link: { uri },
    };
}

export function buildOffsiteCardPaySetting(lastFourDigits: string, credentialId: string): BrazilPaymentSetting {
    return {
        type: 'offsite_card_pay',
        offsite_card_pay: {
            last_four_digits: lastFourDigits,
            credential_id: credentialId,
        },
    };
}

export function buildOrderDetailsInteractiveBr(options: BuildOrderDetailsBrOptions): OrderDetailsInteractiveObjectBr {
    return {
        type: 'order_details',
        ...(options.header ? { header: options.header } : {}),
        body: options.body,
        ...(options.footer ? { footer: options.footer } : {}),
        action: {
            name: 'review_and_pay',
            parameters: {
                ...options.parameters,
                payment_type: 'br',
                currency: 'BRL',
            },
        },
    };
}

export function buildOrderDetailsPixInteractiveBr(
    options: BuildOrderDetailsBrOptions & { pix: BrazilPixDynamicCode },
): OrderDetailsInteractiveObjectBr {
    const { pix, parameters, ...rest } = options;
    return buildOrderDetailsInteractiveBr({
        ...rest,
        parameters: {
            ...parameters,
            payment_settings: [buildPixPaymentSetting(pix)],
        },
    });
}

export function buildOrderStatusInteractiveBr(options: BuildOrderStatusBrOptions): OrderStatusInteractiveObjectBr {
    return {
        type: 'order_status',
        ...(options.header ? { header: options.header } : {}),
        body: options.body,
        ...(options.footer ? { footer: options.footer } : {}),
        action: {
            name: 'review_order',
            parameters: options.parameters,
        },
    };
}

export function toOrderSimpleText(body: string | OrderSimpleText): OrderSimpleText {
    return typeof body === 'string' ? { text: body } : body;
}
