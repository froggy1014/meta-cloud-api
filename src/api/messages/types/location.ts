// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/

import { MessageTypesEnum } from '../../../types/enums';
import { MessageRequestBody } from './common';

// Location Message Types
export type LocationObject = {
    longitude: number;
    latitude: number;
    name?: string;
    address?: string;
};

export type LocationMessageRequestBody = MessageRequestBody<MessageTypesEnum.Location> & {
    [MessageTypesEnum.Location]: [LocationObject];
};
