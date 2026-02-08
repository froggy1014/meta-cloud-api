// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/

import { MessageTypesEnum } from '../../../types/enums';
import type { MessageRequestBody } from './common';

// Contact Message Types
export type AddressesObject = {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type?: 'HOME' | 'WORK' | string;
};

export type EmailObject = {
    email?: string;
    type?: 'HOME' | 'WORK' | string;
};

export type NameObject = {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    prefix?: string;
};

export type OrgObject = {
    company?: string;
    department?: string;
    title?: string;
};

export type PhoneObject = {
    phone?: string;
    type?: 'CELL' | 'MAIN' | 'IPHONE' | 'HOME' | 'WORK' | string;
    wa_id?: string;
};

export type URLObject = {
    url?: string;
    type?: 'HOME' | 'WORK' | string;
};

export type ContactObject = {
    addresses?: AddressesObject[];
    birthday?: `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
    emails?: EmailObject[];
    name: NameObject;
    org?: OrgObject;
    phones?: PhoneObject[];
    urls?: URLObject[];
};

export type ContactsMessageRequestBody = MessageRequestBody<MessageTypesEnum.Contacts> & {
    [MessageTypesEnum.Contacts]: [ContactObject];
};
