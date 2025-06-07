import { MessageTypesEnum } from '../../../shared/types/enums';
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
