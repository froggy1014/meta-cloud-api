// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orders/

export type {
    BuildOrderDetailsBrOptions,
    BuildOrderStatusBrOptions,
} from './orders-br';
export {
    buildBoletoPaymentSetting,
    buildOffsiteCardPaySetting,
    buildOrderDetailsInteractiveBr,
    buildOrderDetailsPixInteractiveBr,
    buildOrderStatusInteractiveBr,
    buildPaymentLinkSetting,
    buildPixPaymentSetting,
    toOrderSimpleText,
} from './orders-br';
export type {
    BuildOrderDetailsInOptions,
    BuildOrderStatusInOptions,
} from './orders-in';
export {
    buildOrderDetailsInteractiveIn,
    buildOrderStatusInteractiveIn,
} from './orders-in';

export {
    buildOrderDetailsTemplateButtonBr,
    buildOrderDetailsTemplateButtonBrPix,
    buildOrderDetailsTemplateButtonIn,
} from './template-order-details';
export { buildOrderStatusTemplateComponent } from './template-order-status';
