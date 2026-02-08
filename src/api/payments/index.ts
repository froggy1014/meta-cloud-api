// Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/onboarding-apis/

import PaymentsApi from './PaymentsApi';

export default PaymentsApi;

export { PaymentsApi };

export type {
    PaymentConfiguration,
    PaymentConfigurationCode,
    PaymentConfigurationCreateRequest,
    PaymentConfigurationCreateResponse,
    PaymentConfigurationDeleteRequest,
    PaymentConfigurationOauthLinkRequest,
    PaymentConfigurationOauthLinkResponse,
    PaymentConfigurationProvider,
    PaymentConfigurationStatus,
    PaymentConfigurationsResponse,
    PaymentConfigurationUpdateRequest,
    PaymentConfigurationUpdateResponse,
    PaymentsClass,
} from './types';
