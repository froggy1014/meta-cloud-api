import { MessageTypesEnum } from '../../../shared/types/enums';
import { MessageRequestBody } from './common';

// Common media object patterns
type MetaMediaObject = {
    id: string;
    link?: never;
};

type HostedMediaObject = {
    id?: never;
    link: string;
};

// Audio Message Types
export type AudioMediaObject = MetaMediaObject | HostedMediaObject;

export type AudioMessageRequestBody = MessageRequestBody<MessageTypesEnum.Audio> & {
    [MessageTypesEnum.Audio]: [AudioMediaObject];
};

// Document Message Types
type MetaDocumentMediaObject = MetaMediaObject & {
    caption?: string;
    filename?: string;
};

type HostedDocumentMediaObject = HostedMediaObject & {
    caption?: string;
    filename?: string;
};

export type DocumentMediaObject = MetaDocumentMediaObject | HostedDocumentMediaObject;

export type DocumentMessageRequestBody = MessageRequestBody<MessageTypesEnum.Document> & {
    [MessageTypesEnum.Document]: [DocumentMediaObject];
};

// Image Message Types
type MetaImageMediaObject = MetaMediaObject & {
    caption?: string;
};

type HostedImageMediaObject = HostedMediaObject & {
    caption?: string;
};

export type ImageMediaObject = MetaImageMediaObject | HostedImageMediaObject;

export type ImageMessageRequestBody = MessageRequestBody<MessageTypesEnum.Image> & {
    [MessageTypesEnum.Image]: [ImageMediaObject];
};

// Video Message Types
type MetaVideoMediaObject = MetaMediaObject & {
    caption?: string;
};

type HostedVideoMediaObject = HostedMediaObject & {
    caption?: string;
};

export type VideoMediaObject = MetaVideoMediaObject | HostedVideoMediaObject;

export type VideoMessageRequestBody = MessageRequestBody<MessageTypesEnum.Video> & {
    [MessageTypesEnum.Video]: [VideoMediaObject];
};

// Sticker Message Types
export type StickerMediaObject = MetaMediaObject | HostedMediaObject;

export type StickerMessageRequestBody = MessageRequestBody<MessageTypesEnum.Sticker> & {
    [MessageTypesEnum.Sticker]: [StickerMediaObject];
};
