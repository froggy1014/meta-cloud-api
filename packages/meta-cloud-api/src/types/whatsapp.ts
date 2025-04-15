/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BusinessProfileClass } from './businessProfile';
import { EncryptionClass } from './encryption';
import { FlowClass } from './flow';
import { MediaClass } from './media';
import { MessagesClass } from './messages';
import { PhoneNumberClass } from './phoneNumber';
import { QrCodeClass } from './qrCode';
import { RegistrationClass } from './registration';
import { TemplateClass } from './template';
import { TwoStepVerificationClass } from './twoStepVerification';
import { WABAClass } from './waba';

export type WhatsAppConfig = {
    accessToken: string;
    baseUrl?: string;
    appId?: string;
    appSecret?: string;
    phoneNumberId?: number;
    businessAcctId?: string;
    apiVersion?: string;
    webhookEndpoint?: string;
    webhookVerificationToken?: string;
    listenerPort?: number;
    debug?: boolean;
    maxRetriesAfterWait?: number;
    requestTimeout?: number;
};

export declare class WhatsAppClass {
    constructor(config?: WhatsAppConfig);
    readonly messages: MessagesClass;
    readonly templates: TemplateClass;
    readonly phoneNumber: PhoneNumberClass;
    readonly qrCode: QrCodeClass;
    readonly encryption: EncryptionClass;
    readonly twoStepVerification: TwoStepVerificationClass;
    readonly registration: RegistrationClass;
    readonly media: MediaClass;
    readonly waba: WABAClass;
    readonly flow: FlowClass;
    readonly businessProfile: BusinessProfileClass;
    updateTimeout(ms: number): boolean;
    updatePhoneNumberId(phoneNumberId: number): boolean;
    updateAccessToken(accessToken: string): boolean;
    updateWabaId(wabaId: string): boolean;
}
