import {
    AudioMediaObject,
    ComponentTypesEnum,
    ContactObject,
    DocumentMediaObject,
    ImageMediaObject,
    InteractiveObject,
    LocationObject,
    MessageTemplateObject,
    StickerMediaObject,
    TextObject,
    VideoMediaObject,
} from 'meta-cloud-api/types';

export interface AudioMessageRequestBody {
    body: AudioMediaObject;
    recipient: number;
    replyMessageId?: string;
}

export interface ContactsMessageRequestBody {
    body: [ContactObject];
    recipient: number;
    replyMessageId?: string;
}

export interface DocumentMessageRequestBody {
    body: DocumentMediaObject;
    recipient: number;
    replyMessageId?: string;
}

export interface ImageMessageRequestBody {
    body: ImageMediaObject;
    recipient: number;
    replyMessageId?: string;
}

export interface InteractiveMessageRequestBody {
    body: InteractiveObject;
    recipient: number;
    replyMessageId?: string;
}

export interface LocationMessageRequestBody {
    body: LocationObject;
    recipient: number;
    replyMessageId?: string;
}

export interface StickerMessageRequestBody {
    body: StickerMediaObject;
    recipient: number;
    replyMessageId?: string;
}

export interface TemplateMessageRequestBody {
    body: MessageTemplateObject<ComponentTypesEnum>;
    recipient: number;
    replyMessageId?: string;
}

export interface TextMessageRequestBody {
    body: TextObject;
    recipient: number;
    replyMessageId?: string;
}

export interface VideoMessageRequestBody {
    body: VideoMediaObject;
    recipient: number;
    replyMessageId?: string;
}
