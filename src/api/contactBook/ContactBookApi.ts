// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids/

// Endpoints:
// - DELETE /{PHONE_NUMBER_ID}/contact_book?messaging_product=whatsapp&bsuid={BSUID}

import { WHATSAPP_MESSAGING_PRODUCT } from '../../config/defaults';
import { BaseAPI } from '../../types/base';
import { HttpMethodsEnum, WabaConfigEnum } from '../../types/enums';
import { WhatsAppValidationError } from '../../utils/isMetaError';
import { objectToQueryString } from '../../utils/objectToQueryString';

import type * as contactBook from './types/contactBook';

/**
 * API for the Meta-hosted contact book.
 *
 * The contact book pairs a WhatsApp user's phone number with their
 * business-scoped user ID (BSUID). Meta populates it automatically: any message
 * or call between a business phone number in your portfolio and a user stores
 * that pairing, which is why webhooks keep including the phone number even after
 * the user adopts a username. It is scoped to the business portfolio, not to a
 * single phone number, and only captures interactions from early April 2026
 * onward — there is no historical backfill.
 *
 * Endpoints covered:
 * - `DELETE /{PHONE_NUMBER_ID}/contact_book` - Delete a user's contact book entry
 *
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids/
 */
export default class ContactBookApi extends BaseAPI implements contactBook.ContactBookClass {
    private readonly endpoint = 'contact_book';

    /**
     * Delete a user's entry from your contact book.
     *
     * Once deleted, the user's phone number and BSUID are no longer included in
     * webhook payloads for any business phone number in the portfolio — unless
     * the number is still in the 30-day cache, or a new interaction recreates the
     * entry.
     *
     * @param params - Delete parameters.
     * @param params.bsuid - BSUID of the entry to delete (e.g. "US.13491208655302741918").
     * @returns Response reporting whether the entry was deleted.
     * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids/
     *
     * @example
     * ```typescript
     * const result = await client.contactBook.deleteEntry({ bsuid: 'US.13491208655302741918' });
     * console.log(result.deleted);
     * ```
     */
    async deleteEntry(
        params: contactBook.DeleteContactBookEntryParams,
    ): Promise<contactBook.DeleteContactBookEntryResponse> {
        if (!params?.bsuid) {
            throw new WhatsAppValidationError('"bsuid" is required to delete a contact book entry.');
        }

        const query = objectToQueryString({
            messaging_product: WHATSAPP_MESSAGING_PRODUCT,
            bsuid: params.bsuid,
        });

        return await this.sendJson<contactBook.DeleteContactBookEntryResponse>(
            HttpMethodsEnum.Delete,
            `${this.config[WabaConfigEnum.PhoneNumberId]}/${this.endpoint}${query}`,
            this.config[WabaConfigEnum.RequestTimeout],
        );
    }
}
