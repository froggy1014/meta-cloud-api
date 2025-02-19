import type { WabaConfigType } from '../types/config';
import { ComponentTypesEnum, HttpMethodsEnum, MessageTypesEnum, WabaConfigEnum } from '../types/enums';

import * as m from '../types/messages';
import type { RequesterClass, RequesterResponseInterface } from '../types/request';
import BaseAPI from './base';

export default class MessagesApi extends BaseAPI implements m.MessagesClass {
    private readonly commonMethod = HttpMethodsEnum.Post;
    private readonly commonEndpoint = 'messages';

    constructor(config: WabaConfigType, client: RequesterClass) {
        super(config, client);
    }

    bodyBuilder<T extends MessageTypesEnum, C extends ComponentTypesEnum>(
        type: T,
        payload:
            | m.AudioMediaObject
            | [m.ContactObject]
            | m.DocumentMediaObject
            | m.ImageMediaObject
            | m.InteractiveObject
            | m.LocationObject
            | m.MessageTemplateObject<C>
            | m.StickerMediaObject
            | m.TextObject
            | m.VideoMediaObject,
        toNumber: string,
        replyMessageId?: string,
    ) {
        const body: m.MessageRequestBody<T> = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: toNumber,
            type: type,
            [type]: payload,
        };

        if (replyMessageId) body['context'] = { message_id: replyMessageId };

        return body;
    }

    send(body: BodyInit | null): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.client.sendRequest(
            this.commonMethod,
            this.commonEndpoint,
            this.config[WabaConfigEnum.RequestTimeout],
            body,
        );
    }

    async audio(
        body: m.AudioMediaObject,
        recipient: number,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(
            JSON.stringify(this.bodyBuilder(MessageTypesEnum.Audio, body, recipient.toString(), replyMessageId)),
        );
    }

    async contacts(
        body: [m.ContactObject],
        recipient: number,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(
            JSON.stringify(this.bodyBuilder(MessageTypesEnum.Contacts, body, recipient.toString(), replyMessageId)),
        );
    }

    async document(
        body: m.DocumentMediaObject,
        recipient: number,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(
            JSON.stringify(this.bodyBuilder(MessageTypesEnum.Document, body, recipient.toString(), replyMessageId)),
        );
    }

    async image(
        body: m.ImageMediaObject,
        recipient: number,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(
            JSON.stringify(this.bodyBuilder(MessageTypesEnum.Image, body, recipient.toString(), replyMessageId)),
        );
    }

    async interactive(
        body: m.InteractiveObject,
        recipient: number,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(
            JSON.stringify(this.bodyBuilder(MessageTypesEnum.Interactive, body, recipient.toString(), replyMessageId)),
        );
    }

    async location(
        body: m.LocationObject,
        recipient: number,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(
            JSON.stringify(this.bodyBuilder(MessageTypesEnum.Location, body, recipient.toString(), replyMessageId)),
        );
    }

    async sticker(
        body: m.StickerMediaObject,
        recipient: number,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(
            JSON.stringify(this.bodyBuilder(MessageTypesEnum.Sticker, body, recipient.toString(), replyMessageId)),
        );
    }

    async template(
        body: m.MessageTemplateObject<ComponentTypesEnum>,
        recipient: number,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(
            JSON.stringify(this.bodyBuilder(MessageTypesEnum.Template, body, recipient.toString(), replyMessageId)),
        );
    }

    async text(
        body: m.TextObject,
        recipient: number,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(
            JSON.stringify(this.bodyBuilder(MessageTypesEnum.Text, body, recipient.toString(), replyMessageId)),
        );
    }

    async video(
        body: m.VideoMediaObject,
        recipient: number,
        replyMessageId?: string,
    ): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        return this.send(
            JSON.stringify(this.bodyBuilder(MessageTypesEnum.Video, body, recipient.toString(), replyMessageId)),
        );
    }

    async status(body: m.StatusObject): Promise<RequesterResponseInterface<m.MessagesResponse>> {
        const mp: m.GeneralMessageBody = { messaging_product: 'whatsapp' };
        const bodyToSend: m.StatusRequestBody = Object.assign(mp, body);

        return this.send(JSON.stringify(bodyToSend));
    }
}
