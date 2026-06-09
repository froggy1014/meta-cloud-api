// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orders/
// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orderdetailstemplate/
// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/payment-request-cta/

import type {
    BrazilOrderHeader,
    BrazilOrderSimpleText,
    BrazilPaymentRequestSetting,
    BrazilPaymentSetting,
    BrazilPixDynamicCode,
    OrderDetailsBrInput,
    OrderDetailsBrParameters,
    OrderDetailsInteractiveObjectBr,
    OrderDetailsTemplateButtonComponentBr,
    OrderStatusBrInput,
    OrderStatusInteractiveObjectBr,
    OrderStatusTemplateComponentBr,
    OrderStatusTemplateInputBr,
    PaymentRequestTemplateButtonComponentBr,
} from '../types/payments-br';

export type BuildOrderDetailsBrOptions = {
    body: BrazilOrderSimpleText;
    footer?: BrazilOrderSimpleText;
    header?: BrazilOrderHeader;
    parameters: OrderDetailsBrInput;
};

export type BuildOrderStatusBrOptions = {
    body: BrazilOrderSimpleText;
    footer?: BrazilOrderSimpleText;
    header?: BrazilOrderHeader;
    parameters: OrderStatusBrInput;
};

function toOrderSimpleText(body: string | BrazilOrderSimpleText): BrazilOrderSimpleText {
    return typeof body === 'string' ? { text: body } : body;
}

function applyBrDefaults(orderDetails: OrderDetailsBrInput): OrderDetailsBrParameters {
    return {
        ...orderDetails,
        payment_type: 'br',
        currency: 'BRL',
    };
}

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
            parameters: applyBrDefaults(options.parameters),
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

export function buildOrderDetailsTemplateButtonBr(
    orderDetails: OrderDetailsBrInput,
    index = 0,
): OrderDetailsTemplateButtonComponentBr {
    return {
        type: 'button',
        sub_type: 'order_details',
        index,
        parameters: [
            {
                type: 'action',
                action: {
                    order_details: applyBrDefaults(orderDetails),
                },
            },
        ],
    };
}

export function buildOrderDetailsTemplateButtonBrPix(
    orderDetails: Omit<OrderDetailsBrInput, 'payment_settings'>,
    pix: BrazilPixDynamicCode,
    index = 0,
): OrderDetailsTemplateButtonComponentBr {
    return buildOrderDetailsTemplateButtonBr(
        {
            ...orderDetails,
            payment_settings: [buildPixPaymentSetting(pix)],
        },
        index,
    );
}

export function buildPaymentRequestTemplateButtonBr(
    paymentSetting: BrazilPaymentRequestSetting,
    index = 0,
): PaymentRequestTemplateButtonComponentBr {
    return {
        type: 'button',
        sub_type: 'payment_request',
        index,
        parameters: [
            {
                type: 'action',
                action: {
                    payment_request: {
                        payment_setting: paymentSetting,
                    },
                },
            },
        ],
    };
}

export function buildOrderStatusTemplateComponentBr(
    orderStatus: OrderStatusTemplateInputBr,
): OrderStatusTemplateComponentBr {
    return {
        type: 'order_status',
        parameters: [
            {
                type: 'order_status',
                order_status: orderStatus,
            },
        ],
    };
}

export { toOrderSimpleText as toBrazilOrderSimpleText };
