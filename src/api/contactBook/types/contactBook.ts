// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids/

/**
 * Contact Book API Types
 * @see https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids/
 */

/**
 * Parameters for deleting a contact book entry.
 */
export type DeleteContactBookEntryParams = {
    /**
     * Business-scoped user ID whose entry should be removed, in standard BSUID
     * format (e.g. "US.13491208655302741918").
     */
    bsuid: string;
};

/**
 * Response for a contact book delete request.
 */
export type DeleteContactBookEntryResponse = {
    messaging_product: 'whatsapp';
    /** `true` when the request was processed successfully. */
    success?: boolean;
    /**
     * `true` when an entry existed for the BSUID and was removed.
     *
     * Since August 25, 2026 the endpoint reports `false` instead of returning an
     * error when the BSUID is unknown, malformed, or belongs to another business
     * portfolio, so a delete is effectively idempotent — always read this flag
     * rather than treating a resolved call as proof the entry existed.
     */
    deleted?: boolean;
};

export interface ContactBookClass {
    deleteEntry(params: DeleteContactBookEntryParams): Promise<DeleteContactBookEntryResponse>;
}
