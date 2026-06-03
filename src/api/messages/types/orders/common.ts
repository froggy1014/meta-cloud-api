// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orders/

export type OrderAmount = {
    value: number;
    offset: number;
};

export type OrderAmountWithDescription = OrderAmount & {
    description?: string;
};

export type OrderDiscount = OrderAmountWithDescription & {
    discount_program_name?: string;
};

export type OrderItem = {
    retailer_id: string;
    name: string;
    amount: OrderAmount;
    quantity: number;
    sale_amount?: OrderAmount;
};

export type OrderExpiration = {
    timestamp: string;
    description: string;
};

export type OrderDetailsOrder = {
    status: 'pending';
    catalog_id?: string;
    expiration?: OrderExpiration;
    items: OrderItem[];
    subtotal: OrderAmount;
    tax: OrderAmountWithDescription;
    shipping?: OrderAmountWithDescription;
    discount?: OrderDiscount;
};

export type OrderGoodsType = 'digital-goods' | 'physical-goods';

export type OrderStatusValue = 'pending' | 'processing' | 'partially_shipped' | 'shipped' | 'completed' | 'canceled';

export type PaymentStatusValue = 'pending' | 'captured' | 'failed';

export type OrderStatusPayment = {
    status: PaymentStatusValue;
    timestamp?: number;
};

export type OrderStatusOrder = {
    status: OrderStatusValue;
    description?: string;
};

export type OrderSimpleText = {
    text: string;
};

export type OrderHeaderObject = {
    type: 'document' | 'image' | 'text' | 'video';
    document?: {
        id?: string;
        link?: string;
        filename?: string;
    };
    image?: {
        id?: string;
        link?: string;
    };
    text?: string;
    video?: {
        id?: string;
        link?: string;
    };
};
