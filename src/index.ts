import { WebhookHandler } from './core/webhook';
import { WhatsApp } from './core/whatsapp';

export default WhatsApp;

export type { IRequest, IResponse } from './core/webhook';
export { WebhookHandler };

export {
    BusinessProfileApi,
    EncryptionApi,
    FlowApi,
    MessagesApi,
    PhoneNumberApi,
    QrCodeApi,
    RegistrationApi,
    TemplateApi,
    TwoStepVerificationApi,
    WabaApi,
} from './features';

export type {
    AudioMediaObject,
    BusinessProfileClass,
    BusinessProfileResponse,
    ContactObject,
    DocumentMediaObject,
    Flow,
    FlowClass,
    FlowEndpointRequest,
    FlowEndpointResponse,
    ImageMediaObject,
    InteractiveObject,
    LocationObject,
    MediaClass,
    MediaResponse,
    MediasResponse,
    MessageRequestParams,
    MessagesResponse,
    MessageTemplateObject,
    PhoneNumberClass,
    PhoneNumberResponse,
    QrCodeClass,
    QrCodeResponse,
    ReactionParams,
    RegistrationClass,
    StatusParams,
    StickerMediaObject,
    TemplateClass,
    TemplateResponse,
    TextMessageParams,
    TextObject,
    UploadMediaResponse,
    VideoMediaObject,
    WabaAccount,
    WABAClass,
} from './features';

export { HttpMethodsEnum, importConfig, isMetaError, MessageTypesEnum, StatusEnum, WebhookTypesEnum } from './shared';

export type { MetaError, WabaConfigType } from './shared';
