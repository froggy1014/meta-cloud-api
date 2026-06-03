/**
 * As-const alternatives to enums.
 *
 * Every enum in enums.ts gets a matching `as const` object and a union type here.
 * Use whichever style you prefer:
 *   - Enum:  CategoryEnum.Marketing
 *   - Const: Category.Marketing  (value: 'MARKETING')
 *   - Type:  CategoryType        (union: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY')
 */

// ---- Category ----
export const Category = {
    Authentication: 'AUTHENTICATION',
    Marketing: 'MARKETING',
    Utility: 'UTILITY',
} as const;
export type CategoryType = (typeof Category)[keyof typeof Category];

// ---- TemplateStatus ----
export const TemplateStatus = {
    Approved: 'APPROVED',
    Pending: 'PENDING',
    Rejected: 'REJECTED',
} as const;
export type TemplateStatusType = (typeof TemplateStatus)[keyof typeof TemplateStatus];

// ---- HttpMethods ----
export const HttpMethods = {
    Get: 'GET',
    Post: 'POST',
    Put: 'PUT',
    Delete: 'DELETE',
} as const;
export type HttpMethodsType = (typeof HttpMethods)[keyof typeof HttpMethods];

// ---- MessageTypes ----
export const MessageTypes = {
    Audio: 'audio',
    Contacts: 'contacts',
    Document: 'document',
    Image: 'image',
    Interactive: 'interactive',
    Location: 'location',
    Reaction: 'reaction',
    Sticker: 'sticker',
    Template: 'template',
    Text: 'text',
    Video: 'video',
    Button: 'button',
    Order: 'order',
    System: 'system',
    Unsupported: 'unsupported',
    Unknown: 'unknown',
    /** @deprecated Use WebhookProcessor.onStatus() instead */
    Statuses: 'statuses',
    All: '*',
} as const;
export type MessageTypesType = (typeof MessageTypes)[keyof typeof MessageTypes];

// ---- ParametersTypes ----
export const ParametersTypes = {
    Action: 'ACTION',
    CouponCode: 'COUPON_CODE',
    Currency: 'CURRENCY',
    DateTime: 'DATE_TIME',
    Document: 'DOCUMENT',
    ExpirationTimeMs: 'EXPIRATION_TIME_MS',
    Image: 'IMAGE',
    LimitedTimeOffer: 'LIMITED_TIME_OFFER',
    Location: 'LOCATION',
    OrderStatus: 'ORDER_STATUS',
    Payload: 'PAYLOAD',
    Product: 'PRODUCT',
    Text: 'TEXT',
    TtlMinutes: 'TTL_MINUTES',
    Video: 'VIDEO',
    WebviewInteraction: 'WEBVIEW_INTERACTION',
    WebviewPresentation: 'WEBVIEW_PRESENTATION',
} as const;
export type ParametersTypesType = (typeof ParametersTypes)[keyof typeof ParametersTypes];

// ---- InteractiveTypes ----
export const InteractiveTypes = {
    Button: 'button',
    List: 'list',
    Product: 'product',
    ProductList: 'product_list',
    CtaUrl: 'cta_url',
    Carousel: 'carousel',
    LocationRequest: 'location_request_message',
    AddressMessage: 'address_message',
    Flow: 'flow',
    OrderDetails: 'order_details',
    OrderStatus: 'order_status',
} as const;
export type InteractiveTypesType = (typeof InteractiveTypes)[keyof typeof InteractiveTypes];

// ---- ButtonPosition ----
export const ButtonPosition = {
    First: 1,
    Second: 2,
    Third: 3,
    Fourth: 4,
    Fifth: 5,
} as const;
export type ButtonPositionType = (typeof ButtonPosition)[keyof typeof ButtonPosition];

// ---- SubType ----
export const SubType = {
    Catalog: 'CATALOG',
    CopyCode: 'COPY_CODE',
    Flow: 'FLOW',
    Mpm: 'MPM',
    OrderDetails: 'ORDER_DETAILS',
    QuickReply: 'QUICK_REPLY',
    Reminder: 'REMINDER',
    Url: 'URL',
    VoiceCall: 'VOICE_CALL',
} as const;
export type SubTypeType = (typeof SubType)[keyof typeof SubType];

// ---- ComponentTypes (template) ----
export const ComponentType = {
    Header: 'HEADER',
    Body: 'BODY',
    Button: 'BUTTON',
    Footer: 'FOOTER',
} as const;
export type ComponentTypeType = (typeof ComponentType)[keyof typeof ComponentType];

// ---- ConversationTypes ----
export const ConversationTypes = {
    BusinessInitiated: 'business_initiated',
    CustomerInitiated: 'customer_initiated',
    ReferralConversion: 'referral_conversion',
} as const;
export type ConversationTypesType = (typeof ConversationTypes)[keyof typeof ConversationTypes];

// ---- Status ----
export const Status = {
    Delivered: 'delivered',
    Read: 'read',
    Sent: 'sent',
} as const;
export type StatusType = (typeof Status)[keyof typeof Status];

// ---- VideoMediaTypes ----
export const VideoMediaTypes = {
    Mp4: 'video/mp4',
    Threegp: 'video/3gp',
} as const;
export type VideoMediaTypesType = (typeof VideoMediaTypes)[keyof typeof VideoMediaTypes];

// ---- StickerMediaTypes ----
export const StickerMediaTypes = {
    Webp: 'image/webp',
} as const;
export type StickerMediaTypesType = (typeof StickerMediaTypes)[keyof typeof StickerMediaTypes];

// ---- ImageMediaTypes ----
export const ImageMediaTypes = {
    Jpeg: 'image/jpeg',
    Png: 'image/png',
} as const;
export type ImageMediaTypesType = (typeof ImageMediaTypes)[keyof typeof ImageMediaTypes];

// ---- DocumentMediaTypes ----
export const DocumentMediaTypes = {
    Text: 'text/plain',
    Pdf: 'application/pdf',
    Ppt: 'application/vnd.ms-powerpoint',
    Word: 'application/msword',
    Excel: 'application/vnd.ms-excel',
    OpenDoc: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    OpenPres: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    OpenSheet: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
} as const;
export type DocumentMediaTypesType = (typeof DocumentMediaTypes)[keyof typeof DocumentMediaTypes];

// ---- AudioMediaTypes ----
export const AudioMediaTypes = {
    Aac: 'audio/aac',
    Mp4: 'audio/mp4',
    Mpeg: 'audio/mpeg',
    Amr: 'audio/amr',
    Ogg: 'audio/ogg',
} as const;
export type AudioMediaTypesType = (typeof AudioMediaTypes)[keyof typeof AudioMediaTypes];

// ---- WebhookTypes ----
export const WebhookTypes = {
    Audio: 'audio',
    Button: 'button',
    Document: 'document',
    Text: 'text',
    Image: 'image',
    Interactive: 'interactive',
    Order: 'order',
    Sticker: 'sticker',
    System: 'system',
    Unknown: 'unknown',
    Video: 'video',
} as const;
export type WebhookTypesType = (typeof WebhookTypes)[keyof typeof WebhookTypes];

// ---- SystemChangeTypes ----
export const SystemChangeTypes = {
    CustomerChangedNumber: 'customer_changed_number',
    CustomerIdentityChanged: 'customer_identity_changed',
} as const;
export type SystemChangeTypesType = (typeof SystemChangeTypes)[keyof typeof SystemChangeTypes];

// ---- ReferralSourceTypes ----
export const ReferralSourceTypes = {
    Ad: 'ad',
    Post: 'post',
} as const;
export type ReferralSourceTypesType = (typeof ReferralSourceTypes)[keyof typeof ReferralSourceTypes];

// ---- RequestCodeMethods ----
export const RequestCodeMethods = {
    Sms: 'SMS',
    Voice: 'VOICE',
} as const;
export type RequestCodeMethodsType = (typeof RequestCodeMethods)[keyof typeof RequestCodeMethods];

// ---- Languages ----
export const Languages = {
    Afrikaans: 'af',
    Albanian: 'sq',
    Arabic: 'ar',
    Azerbaijani: 'az',
    Bengali: 'bn',
    Bulgarian: 'bg',
    Catalan: 'ca',
    Chinese_CHN: 'zh_CN',
    Chinese_HKG: 'zh_HK',
    Chinese_TAI: 'zh_TW',
    Croatian: 'hr',
    Czech: 'cs',
    Danish: 'da',
    Dutch: 'nl',
    English: 'en',
    English_UK: 'en_GB',
    English_US: 'en_US',
    Estonian: 'et',
    Filipino: 'fil',
    Finnish: 'fi',
    French: 'fr',
    Georgian: 'ka',
    German: 'de',
    Greek: 'el',
    Gujarati: 'gu',
    Hausa: 'ha',
    Hebrew: 'he',
    Hindi: 'hi',
    Hungarian: 'hu',
    Indonesian: 'id',
    Irish: 'ga',
    Italian: 'it',
    Japanese: 'ja',
    Kannada: 'kn',
    Kazakh: 'kk',
    Kinyarwanda: 'rw_RW',
    Korean: 'ko',
    Kyrgyz_Kyrgyzstan: 'ky_KG',
    Lao: 'lo',
    Latvian: 'lv',
    Lithuanian: 'lt',
    Macedonian: 'mk',
    Malay: 'ms',
    Malayalam: 'ml',
    Marathi: 'mr',
    Norwegian: 'nb',
    Persian: 'fa',
    Polish: 'pl',
    Portuguese_BR: 'pt_BR',
    Portuguese_POR: 'pt_PT',
    Punjabi: 'pa',
    Romanian: 'ro',
    Russian: 'ru',
    Serbian: 'sr',
    Slovak: 'sk',
    Slovenian: 'sl',
    Spanish: 'es',
    Spanish_ARG: 'es_AR',
    Spanish_SPA: 'es_ES',
    Spanish_MEX: 'es_MX',
    Swahili: 'sw',
    Swedish: 'sv',
    Tamil: 'ta',
    Telugu: 'te',
    Thai: 'th',
    Turkish: 'tr',
    Ukrainian: 'uk',
    Urdu: 'ur',
    Uzbek: 'uz',
    Vietnamese: 'vi',
    Zulu: 'zu',
} as const;
export type LanguagesType = (typeof Languages)[keyof typeof Languages];

// ---- DataLocalizationRegion ----
export const DataLocalizationRegion = {
    AU: 'AU',
    ID: 'ID',
    IN: 'IN',
    JP: 'JP',
    SG: 'SG',
    KR: 'KR',
    DE: 'DE',
    CH: 'CH',
    GB: 'GB',
    BR: 'BR',
    BH: 'BH',
    ZA: 'ZA',
    AE: 'AE',
    CA: 'CA',
} as const;
export type DataLocalizationRegionType = (typeof DataLocalizationRegion)[keyof typeof DataLocalizationRegion];
