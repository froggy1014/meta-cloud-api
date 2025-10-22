// Types-only entry point for users who only need type imports
// This allows tree-shaking and reduces bundle size when only types are needed

// Essential webhook types
export type {
    WebhookContact,
    WebhookEvent,
    WebhookMessage,
    // New message types
    TextMessage,
    ImageMessage,
    VideoMessage,
    AudioMessage,
    DocumentMessage,
    StickerMessage,
    InteractiveMessage,
    InteractiveListReplyMessage,
    InteractiveButtonReplyMessage,
    ButtonMessage,
    LocationMessage,
    ContactsMessage,
    ReactionMessage,
    OrderMessage,
    SystemMessage,
    UnsupportedMessage,
    GroupMessage,
    WhatsAppMessage,
    // Webhook value types
    MessageWebhookValue,
    StatusWebhookValue,
    ErrorWebhookValue,
    WebhookValue,
    StatusWebhook,
    WebhookPayload,
} from './core/webhook/types';

// Base types and enums
export * from './types/enums';
export * from './types/index';

// Business Profile types
export type {
    BusinessProfileData,
    UpdateBusinessProfileRequest,
    BusinessProfileResponse,
    BusinessProfileField,
    BusinessProfileFieldsParam,
    BusinessProfileClass,
} from './api/profile/types';

// Phone Number types
export type {
    AccountMode,
    CodeVerificationStatus,
    Cursors,
    HealthStatus,
    HealthStatusEntity,
    MessagingLimitTier,
    PhoneNumberClass,
    PhoneNumberResponse,
    PhoneNumbersResponse,
    PlatformType,
    QualityRating,
    QualityScore,
    RequestVerificationCodeRequest,
    Throughput,
    ThroughputLevel,
    TwoStepVerificationParams,
    VerifyCodeRequest,
} from './api/phone/types';

// Template types
export type {
    CatalogButton,
    ComponentTypes,
    CopyCodeButton,
    FlowButton,
    MediaCarouselCard,
    MPMButton,
    OTPButton,
    PhoneNumberButton,
    ProductCarouselCard,
    QuickReplyButton,
    SPMButton,
    TemplateBody,
    TemplateButton,
    TemplateButtons,
    TemplateCarousel,
    TemplateClass,
    TemplateDeleteParams,
    TemplateFooter,
    TemplateFormat,
    TemplateGetParams,
    TemplateHeader,
    TemplateHeaderExample,
    TemplateLimitedTimeOffer,
    TemplateRequestBody,
    TemplateResponse,
    URLButton,
    // Factory types
    AuthenticationTemplateOptions,
    BodyOptions,
    ButtonOptions,
    CarouselCard,
    CarouselOptions,
    CatalogTemplateOptions,
    CouponTemplateOptions,
    CurrencyParameter,
    DateTimeParameter,
    FooterOptions,
    HeaderOptions,
    LimitedTimeOfferOptions,
    LimitedTimeOfferTemplateOptions,
    LocationParameter,
    MediaCardCarouselTemplateOptions,
    MediaParameter,
    MPMTemplateOptions,
    OTPTemplateOptions,
    ProductCardCarouselTemplateOptions,
    ProductParameter,
    ProductSection,
    SPMTemplateOptions,
    TemplateOptions,
    TemplateParameter,
    TextParameter,
} from './api/template/types';

// QR Code types
export type {
    CreateQrCodeRequest,
    QrCodeClass,
    QrCodeResponse,
    QrCodesResponse,
    UpdateQrCodeRequest,
} from './api/qrCode/types';

// WABA types
export type {
    UpdateWabaSubscription,
    WabaAccount,
    WABAClass,
    WabaAccountFields,
    WabaAccountFieldsParam,
    WabaHealthStatus,
    WabaHealthStatusEntity,
    WabaHealthStatusError,
    WabaSubscription,
    WabaSubscriptions,
} from './api/waba/types';

// WABA enums (needed for type definitions)
export {
    WabaAccountReviewStatus,
    WabaAccountStatus,
    WabaBusinessVerificationStatus,
    WabaHealthStatusCanSendMessage,
} from './api/waba/types';

// Messages types
export type {
    GeneralMessageBody,
    MessageRequestBody,
    MessageRequestParams,
    MessagesClass,
    MessagesResponse,
    StatusParams,
    TextMessageParams,
    TextObject,
    AudioMediaObject,
    DocumentMediaObject,
    ImageMediaObject,
    StickerMediaObject,
    VideoMediaObject,
    ContactObject,
    LocationObject,
    InteractiveObject,
    ReactionParams,
    MessageTemplateObject,
} from './api/messages/types';

// Media types
export type { MediaClass, MediaResponse, MediasResponse, UploadMediaResponse } from './api/media/types';

// Flow types and enums
export { FlowTypeEnum, FlowActionEnum, FlowCategoryEnum, FlowStatusEnum } from './api/flow/types';
export type {
    Flow,
    FlowAsset,
    FlowAssetsResponse,
    FlowClass,
    FlowDataExchangeRequest,
    FlowDataExchangeResponse,
    FlowDecryptedRequestResponse,
    FlowEncryptedRequestPayload,
    FlowEndpointRequest,
    FlowEndpointResponse,
    FlowErrorNotificationRequest,
    FlowErrorNotificationResponse,
    FlowHealthCheckRequest,
    FlowHealthCheckResponse,
    FlowHttpRequest,
    FlowMigrationFailure,
    FlowMigrationResult,
    FlowMigrationResponse,
    FlowPreview,
    FlowPreviewResponse,
    FlowsListResponse,
    FlowSuccessScreenResponse,
    FlowType,
    FlowValidationError,
    FlowValidationErrorPointer,
    Pagination,
    PaginationCursors,
    UpdateFlowResponse,
    ValidateFlowJsonResponse,
} from './api/flow/types';

// Registration types
export type { RegistrationClass, RegistrationRequest } from './api/registration/types';

// Two Step Verification types
export type { TwoStepVerificationClass, TwoStepVerificationRequest } from './api/twoStepVerification/types';

// Encryption types
export type { EncryptionPublicKeyResponse } from './api/encryption/types';

// Utility types
export type { MetaError } from './utils/isMetaError';

// Common enums that users need frequently
export {
    AudioMediaTypesEnum,
    BusinessVerticalEnum,
    ButtonPositionEnum,
    CategoryEnum,
    ComponentTypesEnum,
    ConversationTypesEnum,
    CurrencyCodesEnum,
    DataLocalizationRegionEnum,
    DocumentMediaTypesEnum,
    HttpMethodsEnum,
    ImageMediaTypesEnum,
    InteractiveTypesEnum,
    LanguagesEnum,
    MessageTypesEnum,
    ParametersTypesEnum,
    RequestCodeMethodsEnum,
    StatusEnum,
    StickerMediaTypesEnum,
    SubTypeEnum,
    SystemChangeTypesEnum,
    TemplateStatusEnum,
    VideoMediaTypesEnum,
    WabaConfigEnum,
    WebhookTypesEnum,
} from './types/enums';
