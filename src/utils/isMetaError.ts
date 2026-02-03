export type MetaErrorData = {
    message: string;
    type: string;
    code: number;
    error_data?: {
        messaging_product?: 'whatsapp';
        details?: string;
    };
    error_subcode?: number;
    fbtrace_id: string;
};

export interface MetaError extends Error {
    error: MetaErrorData;
}

export const WHATSAPP_ERROR_CODES = [
    0, 1, 2, 3, 4, 10, 33, 100, 190, 200, 299, 368, 613, 80007, 130429, 130472, 130497, 131000, 131005, 131008, 131009,
    131016, 131020, 131021, 131026, 131030, 131031, 131037, 131041, 131042, 131044, 131045, 131047, 131048, 131049,
    131050, 131051, 131052, 131053, 131055, 131056, 131057, 131059, 131201, 131202, 131203, 131204, 131207, 131208,
    131209, 131210, 131211, 131212, 131213, 131214, 131215, 132000, 132001, 132005, 132007, 132008, 132012, 132015,
    132016, 132068, 132069, 133000, 133004, 133005, 133006, 133008, 133009, 133010, 133015, 133016, 134011, 134100,
    134101, 134102, 135000, 137000, 138000, 138001, 138002, 138003, 138004, 138005, 138006, 138007, 138009, 138012,
    138013, 138018, 139000, 139001, 139002, 139003, 139004, 139100, 139101, 139102, 139103, 200005, 200006, 200007,
    1752041, 2388001, 2388012, 2388019, 2388040, 2388047, 2388072, 2388073, 2388091, 2388093, 2388103, 2388293, 2388299,
    2494100, 2593079, 2593085, 2593107, 2593108,
] as const;

const WHATSAPP_ERROR_CODE_SET = new Set<number>(WHATSAPP_ERROR_CODES);

export type ApiPermissionErrorCode = number;
export type WhatsAppErrorCode = (typeof WHATSAPP_ERROR_CODES)[number] | ApiPermissionErrorCode;

export const AUTHORIZATION_ERROR_CODES = [0, 3, 10, 190] as const;
export const THROTTLING_ERROR_CODES = [4, 80007, 130429, 131048, 131056] as const;
export const INTEGRITY_ERROR_CODES = [368, 130497, 131031] as const;
export const SEND_MESSAGE_ERROR_CODES = [
    130472, 131000, 131005, 131008, 131009, 131016, 131021, 131026, 131030, 131042, 131044, 131045, 131047, 131050,
    131051, 131052, 131053, 131056, 131057, 131048, 132000, 132001, 132005, 132007, 132008, 132012, 132015, 132016,
    132068, 132069, 135000, 137000,
] as const;
export const FLOW_ERROR_CODES = [139000, 139001, 139002, 139003, 139004] as const;
export const BLOCK_USER_ERROR_CODES = [139100, 139101, 139102, 139103] as const;
export const CALLING_ERROR_CODES = [
    138000, 138001, 138002, 138003, 138004, 138005, 138006, 138007, 138009, 138012, 138013, 138018, 613,
] as const;
export const GROUP_ERROR_CODES = [
    131020, 131041, 131059, 131201, 131202, 131203, 131204, 131207, 131208, 131209, 131210, 131211, 131212, 131213,
    131214, 131215,
] as const;

const AUTHORIZATION_ERROR_CODE_SET = new Set<number>(AUTHORIZATION_ERROR_CODES);
const THROTTLING_ERROR_CODE_SET = new Set<number>(THROTTLING_ERROR_CODES);
const INTEGRITY_ERROR_CODE_SET = new Set<number>(INTEGRITY_ERROR_CODES);
const SEND_MESSAGE_ERROR_CODE_SET = new Set<number>(SEND_MESSAGE_ERROR_CODES);
const FLOW_ERROR_CODE_SET = new Set<number>(FLOW_ERROR_CODES);
const BLOCK_USER_ERROR_CODE_SET = new Set<number>(BLOCK_USER_ERROR_CODES);
const CALLING_ERROR_CODE_SET = new Set<number>(CALLING_ERROR_CODES);
const GROUP_ERROR_CODE_SET = new Set<number>(GROUP_ERROR_CODES);

export function isWhatsAppErrorCode(code: number): code is WhatsAppErrorCode {
    if (isApiPermissionErrorCode(code)) return true;
    return WHATSAPP_ERROR_CODE_SET.has(code);
}

export function isApiPermissionErrorCode(code: number): code is ApiPermissionErrorCode {
    return code >= 200 && code < 300;
}

export function isAuthorizationErrorCode(
    code: number,
): code is ApiPermissionErrorCode | (typeof AUTHORIZATION_ERROR_CODES)[number] {
    return isApiPermissionErrorCode(code) || AUTHORIZATION_ERROR_CODE_SET.has(code);
}

export function isThrottlingErrorCode(code: number): code is (typeof THROTTLING_ERROR_CODES)[number] {
    return THROTTLING_ERROR_CODE_SET.has(code);
}

export function isIntegrityErrorCode(code: number): code is (typeof INTEGRITY_ERROR_CODES)[number] {
    return INTEGRITY_ERROR_CODE_SET.has(code);
}

export function isSendMessageErrorCode(code: number): code is (typeof SEND_MESSAGE_ERROR_CODES)[number] {
    return SEND_MESSAGE_ERROR_CODE_SET.has(code);
}

export function isFlowErrorCode(code: number): code is (typeof FLOW_ERROR_CODES)[number] {
    return FLOW_ERROR_CODE_SET.has(code);
}

export function isBlockUserErrorCode(code: number): code is (typeof BLOCK_USER_ERROR_CODES)[number] {
    return BLOCK_USER_ERROR_CODE_SET.has(code);
}

export function isCallingErrorCode(code: number): code is (typeof CALLING_ERROR_CODES)[number] {
    return CALLING_ERROR_CODE_SET.has(code);
}

export function isGroupErrorCode(code: number): code is (typeof GROUP_ERROR_CODES)[number] {
    return GROUP_ERROR_CODE_SET.has(code);
}

export class WhatsAppError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WhatsAppError';
    }
}

export class WhatsAppApiError extends WhatsAppError {
    readonly error: MetaErrorData;
    readonly statusCode?: number;

    constructor(message: string, error: MetaErrorData, statusCode?: number) {
        super(message);
        this.name = 'WhatsAppApiError';
        this.error = error;
        this.statusCode = statusCode;
    }
}

export class WhatsAppAuthorizationError extends WhatsAppApiError {
    constructor(message: string, error: MetaErrorData, statusCode?: number) {
        super(message, error, statusCode);
        this.name = 'WhatsAppAuthorizationError';
    }
}

export class WhatsAppThrottlingError extends WhatsAppApiError {
    constructor(message: string, error: MetaErrorData, statusCode?: number) {
        super(message, error, statusCode);
        this.name = 'WhatsAppThrottlingError';
    }
}

export class WhatsAppIntegrityError extends WhatsAppApiError {
    constructor(message: string, error: MetaErrorData, statusCode?: number) {
        super(message, error, statusCode);
        this.name = 'WhatsAppIntegrityError';
    }
}

export class WhatsAppSendMessageError extends WhatsAppApiError {
    constructor(message: string, error: MetaErrorData, statusCode?: number) {
        super(message, error, statusCode);
        this.name = 'WhatsAppSendMessageError';
    }
}

export class WhatsAppFlowError extends WhatsAppApiError {
    constructor(message: string, error: MetaErrorData, statusCode?: number) {
        super(message, error, statusCode);
        this.name = 'WhatsAppFlowError';
    }
}

export class WhatsAppBlockUserError extends WhatsAppApiError {
    constructor(message: string, error: MetaErrorData, statusCode?: number) {
        super(message, error, statusCode);
        this.name = 'WhatsAppBlockUserError';
    }
}

export class WhatsAppCallingError extends WhatsAppApiError {
    constructor(message: string, error: MetaErrorData, statusCode?: number) {
        super(message, error, statusCode);
        this.name = 'WhatsAppCallingError';
    }
}

export class WhatsAppGroupError extends WhatsAppApiError {
    constructor(message: string, error: MetaErrorData, statusCode?: number) {
        super(message, error, statusCode);
        this.name = 'WhatsAppGroupError';
    }
}

export function createWhatsAppApiError(error: MetaErrorData, statusCode?: number): WhatsAppApiError {
    const code = error.code;

    if (isAuthorizationErrorCode(code)) {
        return new WhatsAppAuthorizationError(error.message, error, statusCode);
    }
    if (isThrottlingErrorCode(code)) {
        return new WhatsAppThrottlingError(error.message, error, statusCode);
    }
    if (isIntegrityErrorCode(code)) {
        return new WhatsAppIntegrityError(error.message, error, statusCode);
    }
    if (isSendMessageErrorCode(code)) {
        return new WhatsAppSendMessageError(error.message, error, statusCode);
    }
    if (isFlowErrorCode(code)) {
        return new WhatsAppFlowError(error.message, error, statusCode);
    }
    if (isBlockUserErrorCode(code)) {
        return new WhatsAppBlockUserError(error.message, error, statusCode);
    }
    if (isCallingErrorCode(code)) {
        return new WhatsAppCallingError(error.message, error, statusCode);
    }
    if (isGroupErrorCode(code)) {
        return new WhatsAppGroupError(error.message, error, statusCode);
    }

    return new WhatsAppApiError(error.message, error, statusCode);
}

export class WhatsAppNetworkError extends WhatsAppError {
    readonly cause?: unknown;

    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = 'WhatsAppNetworkError';
        this.cause = cause;
    }
}

export class WhatsAppUnknownError extends WhatsAppError {
    readonly cause?: unknown;

    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = 'WhatsAppUnknownError';
        this.cause = cause;
    }
}

/**
 * Determines if the error is a Meta API error response
 * @param error Any error object to check
 * @returns Type guard indicating if error is a Meta API error
 */
export function isMetaError(error: any): error is MetaError {
    if (error == null || typeof error !== 'object') return false;
    if (!('error' in error) || typeof error.error !== 'object' || error.error == null) return false;

    const metaError = error.error as Record<string, unknown>;

    if (typeof metaError.message !== 'string') return false;
    if (typeof metaError.type !== 'string') return false;
    if (typeof metaError.code !== 'number') return false;
    if (typeof metaError.fbtrace_id !== 'string') return false;

    if ('error_data' in metaError && metaError.error_data != null) {
        if (typeof metaError.error_data !== 'object') return false;
        const errorData = metaError.error_data as Record<string, unknown>;
        if ('messaging_product' in errorData && errorData.messaging_product !== 'whatsapp') return false;
        if ('details' in errorData && typeof errorData.details !== 'string') return false;
    }

    if ('error_subcode' in metaError && typeof metaError.error_subcode !== 'number') return false;

    return true;
}

export function isWhatsAppApiErrorResponse(error: any): error is MetaError & { error: { code: WhatsAppErrorCode } } {
    return isMetaError(error) && isWhatsAppErrorCode(error.error.code);
}

export function isWhatsAppAuthorizationError(error: unknown): error is WhatsAppAuthorizationError {
    return error instanceof WhatsAppAuthorizationError;
}

export function isWhatsAppThrottlingError(error: unknown): error is WhatsAppThrottlingError {
    return error instanceof WhatsAppThrottlingError;
}

export function isWhatsAppIntegrityError(error: unknown): error is WhatsAppIntegrityError {
    return error instanceof WhatsAppIntegrityError;
}

export function isWhatsAppSendMessageError(error: unknown): error is WhatsAppSendMessageError {
    return error instanceof WhatsAppSendMessageError;
}

export function isWhatsAppFlowError(error: unknown): error is WhatsAppFlowError {
    return error instanceof WhatsAppFlowError;
}

export function isWhatsAppBlockUserError(error: unknown): error is WhatsAppBlockUserError {
    return error instanceof WhatsAppBlockUserError;
}

export function isWhatsAppCallingError(error: unknown): error is WhatsAppCallingError {
    return error instanceof WhatsAppCallingError;
}

export function isWhatsAppGroupError(error: unknown): error is WhatsAppGroupError {
    return error instanceof WhatsAppGroupError;
}

export function normalizeMetaError(errorData: unknown, statusCode?: number): MetaError {
    if (isMetaError(errorData)) return errorData;

    let message = 'Unknown error occurred';
    if (errorData && typeof errorData === 'object' && 'message' in errorData) {
        const candidate = (errorData as { message?: unknown }).message;
        if (typeof candidate === 'string') message = candidate;
    }

    return {
        name: 'MetaError',
        message,
        error: {
            message,
            type: 'UnknownError',
            code: typeof statusCode === 'number' ? statusCode : 500,
            fbtrace_id: '',
        },
    };
}
