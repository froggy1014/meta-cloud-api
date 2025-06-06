import { MessageTypesEnum } from '../../types/enums';
import { MessageRequestBody } from './common';

// Contact Message Types
type AddressesObject = {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type?: 'HOME' | 'WORK' | string;
};

type EmailObject = {
    email?: string;
    type?: 'HOME' | 'WORK' | string;
};

type NameObject = {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    prefix?: string;
};

type OrgObject = {
    company?: string;
    department?: string;
    title?: string;
};

type PhoneObject = {
    phone?: 'PHONE_NUMBER';
    type?: 'CELL' | 'MAIN' | 'IPHONE' | 'HOME' | 'WORK' | string;
    wa_id?: string;
};

type URLObject = {
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
