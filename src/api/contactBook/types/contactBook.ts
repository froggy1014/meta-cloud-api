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
    success?: boolean;
    deleted?: boolean;
};

export interface ContactBookClass {
    deleteEntry(params: DeleteContactBookEntryParams): Promise<DeleteContactBookEntryResponse>;
}
