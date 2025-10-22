export enum CategoryEnum {
    Authentication = 'AUTHENTICATION',
    Marketing = 'MARKETING',
    Utility = 'UTILITY',
}

export enum TemplateStatusEnum {
    Approved = 'APPROVED',
    Pending = 'PENDING',
    Rejected = 'REJECTED',
}

export enum HttpMethodsEnum {
    Get = 'GET',
    Post = 'POST',
    Put = 'PUT',
    Delete = 'DELETE',
}

export enum MessageTypesEnum {
    Audio = 'audio',
    Contacts = 'contacts',
    Document = 'document',
    Image = 'image',
    Interactive = 'interactive',
    Location = 'location',
    Reaction = 'reaction',
    Sticker = 'sticker',
    Template = 'template',
    Text = 'text',
    Video = 'video',
    Button = 'button',
    Order = 'order',
    System = 'system',
    Unsupported = 'unsupported',
    Unknown = 'unknown',
    Statuses = 'statuses',
    '*' = '*',
}

export enum ParametersTypesEnum {
    Action = 'ACTION',
    CouponCode = 'COUPON_CODE',
    Currency = 'CURRENCY',
    DateTime = 'DATE_TIME',
    Document = 'DOCUMENT',
    ExpirationTimeMs = 'EXPIRATION_TIME_MS',
    Image = 'IMAGE',
    LimitedTimeOffer = 'LIMITED_TIME_OFFER',
    Location = 'LOCATION',
    OrderStatus = 'ORDER_STATUS',
    Payload = 'PAYLOAD',
    Product = 'PRODUCT',
    Text = 'TEXT',
    TtlMinutes = 'TTL_MINUTES',
    Video = 'VIDEO',
    WebviewInteraction = 'WEBVIEW_INTERACTION',
    WebviewPresentation = 'WEBVIEW_PRESENTATION',
}

export enum InteractiveTypesEnum {
    Button = 'button',
    List = 'list',
    Product = 'product',
    ProductList = 'product_list',
    CtaUrl = 'cta_url',
    LocationRequest = 'location_request_message',
    AddressMessage = 'address_message',
    Flow = 'flow',
}

export enum ButtonPositionEnum {
    First = 1,
    Second = 2,
    Third = 3,
    Fourth = 4,
    Fifth = 5,
}

export enum SubTypeEnum {
    Catalog = 'CATALOG',
    CopyCode = 'COPY_CODE',
    Flow = 'FLOW',
    Mpm = 'MPM',
    OrderDetails = 'ORDER_DETAILS',
    QuickReply = 'QUICK_REPLY',
    Reminder = 'REMINDER',
    Url = 'URL',
    VoiceCall = 'VOICE_CALL',
}

export enum ComponentTypesEnum {
    Header = 'HEADER',
    Body = 'BODY',
    Button = 'BUTTON',
    Footer = 'FOOTER',
}

export enum WabaConfigEnum {
    AppId = 'M4D_APP_ID',
    Port = 'WA_PORT',
    AppSecret = 'M4D_APP_SECRET',
    PhoneNumberId = 'WA_PHONE_NUMBER_ID',
    BusinessAcctId = 'WA_BUSINESS_ACCOUNT_ID',
    APIVersion = 'CLOUD_API_VERSION',
    AccessToken = 'CLOUD_API_ACCESS_TOKEN',
    WebhookEndpoint = 'WEBHOOK_ENDPOINT',
    WebhookVerificationToken = 'WEBHOOK_VERIFICATION_TOKEN',
    ListenerPort = 'LISTENER_PORT',
    MaxRetriesAfterWait = 'MAX_RETRIES_AFTER_WAIT',
    RequestTimeout = 'REQUEST_TIMEOUT',
    Debug = 'DEBUG',
    PrivatePem = 'FLOW_API_PRIVATE_PEM',
    Passphrase = 'FLOW_API_PASSPHRASE',
}

export enum ConversationTypesEnum {
    BusinessInitiated = 'business_initiated',
    CustomerInitiated = 'customer_initiated',
    ReferralConversion = 'referral_conversion',
}

export enum StatusEnum {
    Delivered = 'delivered',
    Read = 'read',
    Sent = 'sent',
}

export enum VideoMediaTypesEnum {
    Mp4 = 'video/mp4',
    Threegp = 'video/3gp',
}

export enum StickerMediaTypesEnum {
    Webp = 'image/webp',
}

export enum ImageMediaTypesEnum {
    Jpeg = 'image/jpeg',
    Png = 'image/png',
}

export enum DocumentMediaTypesEnum {
    Text = 'text/plain',
    Pdf = 'application/pdf',
    Ppt = 'application/vnd.ms-powerpoint',
    Word = 'application/msword',
    Excel = 'application/vnd.ms-excel',
    OpenDoc = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    OpenPres = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    OpenSheet = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

export enum AudioMediaTypesEnum {
    Aac = 'audio/aac',
    Mp4 = 'audio/mp4',
    Mpeg = 'audio/mpeg',
    Amr = 'audio/amr',
    Ogg = 'audio/ogg',
}

export enum WebhookTypesEnum {
    Audio = 'audio',
    Button = 'button',
    Document = 'document',
    Text = 'text',
    Image = 'image',
    Interactive = 'interactive',
    Order = 'order',
    Sticker = 'sticker',
    System = 'system',
    Unknown = 'unknown',
    Video = 'video',
}

export enum SystemChangeTypesEnum {
    CustomerChangedNumber = 'customer_changed_number',
    CustomerIdentityChanged = 'customer_identity_changed',
}

export enum ReferralSourceTypesEnum {
    Ad = 'ad',
    Post = 'post',
}

export enum RequestCodeMethodsEnum {
    Sms = 'SMS',
    Voice = 'VOICE',
}

export enum LanguagesEnum {
    Afrikaans = 'af',
    Albanian = 'sq',
    Arabic = 'ar',
    Azerbaijani = 'az',
    Bengali = 'bn',
    Bulgarian = 'bg',
    Catalan = 'ca',
    Chinese_CHN = 'zh_CN',
    Chinese_HKG = 'zh_HK',
    Chinese_TAI = 'zh_TW',
    Croatian = 'hr',
    Czech = 'cs',
    Danish = 'da',
    Dutch = 'nl',
    English = 'en',
    English_UK = 'en_GB',
    English_US = 'en_US',
    Estonian = 'et',
    Filipino = 'fil',
    Finnish = 'fi',
    French = 'fr',
    Georgian = 'ka',
    German = 'de',
    Greek = 'el',
    Gujarati = 'gu',
    Hausa = 'ha',
    Hebrew = 'he',
    Hindi = 'hi',
    Hungarian = 'hu',
    Indonesian = 'id',
    Irish = 'ga',
    Italian = 'it',
    Japanese = 'ja',
    Kannada = 'kn',
    Kazakh = 'kk',
    Kinyarwanda = 'rw_RW',
    Korean = 'ko',
    Kyrgyz_Kyrgyzstan = 'ky_KG',
    Lao = 'lo',
    Latvian = 'lv',
    Lithuanian = 'lt',
    Macedonian = 'mk',
    Malay = 'ms',
    Malayalam = 'ml',
    Marathi = 'mr',
    Norwegian = 'nb',
    Persian = 'fa',
    Polish = 'pl',
    Portuguese_BR = 'pt_BR',
    Portuguese_POR = 'pt_PT',
    Punjabi = 'pa',
    Romanian = 'ro',
    Russian = 'ru',
    Serbian = 'sr',
    Slovak = 'sk',
    Slovenian = 'sl',
    Spanish = 'es',
    Spanish_ARG = 'es_AR',
    Spanish_SPA = 'es_ES',
    Spanish_MEX = 'es_MX',
    Swahili = 'sw',
    Swedish = 'sv',
    Tamil = 'ta',
    Telugu = 'te',
    Thai = 'th',
    Turkish = 'tr',
    Ukrainian = 'uk',
    Urdu = 'ur',
    Uzbek = 'uz',
    Vietnamese = 'vi',
    Zulu = 'zu',
}

export enum CurrencyCodesEnum {
    AFN = 'AFN',
    EUR = 'EUR',
    ALL = 'ALL',
    DZD = 'DZD',
    USD = 'USD',
    AOA = 'AOA',
    XCD = 'XCD',
    ARS = 'ARS',
    AMD = 'AMD',
    AWG = 'AWG',
    AUD = 'AUD',
    AZN = 'AZN',
    BSD = 'BSD',
    BHD = 'BHD',
    BDT = 'BDT',
    BBD = 'BBD',
    BYN = 'BYN',
    BZD = 'BZD',
    XOF = 'XOF',
    BMD = 'BMD',
    INR = 'INR',
    BTN = 'BTN',
    BOB = 'BOB',
    BOV = 'BOV',
    BAM = 'BAM',
    BWP = 'BWP',
    NOK = 'NOK',
    BRL = 'BRL',
    BND = 'BND',
    BGN = 'BGN',
    BIF = 'BIF',
    CVE = 'CVE',
    KHR = 'KHR',
    XAF = 'XAF',
    CAD = 'CAD',
    KYD = 'KYD',
    CLP = 'CLP',
    CLF = 'CLF',
    CNY = 'CNY',
    COP = 'COP',
    COU = 'COU',
    KMF = 'KMF',
    CDF = 'CDF',
    NZD = 'NZD',
    CRC = 'CRC',
    HRK = 'HRK',
    CUP = 'CUP',
    CUC = 'CUC',
    ANG = 'ANG',
    CZK = 'CZK',
    DKK = 'DKK',
    DJF = 'DJF',
    DOP = 'DOP',
    EGP = 'EGP',
    SVC = 'SVC',
    ERN = 'ERN',
    SZL = 'SZL',
    ETB = 'ETB',
    FKP = 'FKP',
    FJD = 'FJD',
    XPF = 'XPF',
    GMD = 'GMD',
    GEL = 'GEL',
    GHS = 'GHS',
    GIP = 'GIP',
    GTQ = 'GTQ',
    GBP = 'GBP',
    GNF = 'GNF',
    GYD = 'GYD',
    HTG = 'HTG',
    HNL = 'HNL',
    HKD = 'HKD',
    HUF = 'HUF',
    ISK = 'ISK',
    IDR = 'IDR',
    XDR = 'XDR',
    IRR = 'IRR',
    IQD = 'IQD',
    ILS = 'ILS',
    JMD = 'JMD',
    JPY = 'JPY',
    JOD = 'JOD',
    KZT = 'KZT',
    KES = 'KES',
    KPW = 'KPW',
    KRW = 'KRW',
    KWD = 'KWD',
    KGS = 'KGS',
    LAK = 'LAK',
    LBP = 'LBP',
    LSL = 'LSL',
    ZAR = 'ZAR',
    LRD = 'LRD',
    LYD = 'LYD',
    CHF = 'CHF',
    MOP = 'MOP',
    MKD = 'MKD',
    MGA = 'MGA',
    MWK = 'MWK',
    MYR = 'MYR',
    MVR = 'MVR',
    MRU = 'MRU',
    MUR = 'MUR',
    XUA = 'XUA',
    MXN = 'MXN',
    MXV = 'MXV',
    MDL = 'MDL',
    MNT = 'MNT',
    MAD = 'MAD',
    MZN = 'MZN',
    MMK = 'MMK',
    NAD = 'NAD',
    NPR = 'NPR',
    NIO = 'NIO',
    NGN = 'NGN',
    OMR = 'OMR',
    PKR = 'PKR',
    PAB = 'PAB',
    PGK = 'PGK',
    PYG = 'PYG',
    PEN = 'PEN',
    PHP = 'PHP',
    PLN = 'PLN',
    QAR = 'QAR',
    RON = 'RON',
    RUB = 'RUB',
    RWF = 'RWF',
    SHP = 'SHP',
    WST = 'WST',
    STN = 'STN',
    SAR = 'SAR',
    RSD = 'RSD',
    SCR = 'SCR',
    SLL = 'SLL',
    SGD = 'SGD',
    XSU = 'XSU',
    SBD = 'SBD',
    SOS = 'SOS',
    SSP = 'SSP',
    LKR = 'LKR',
    SDG = 'SDG',
    SRD = 'SRD',
    SEK = 'SEK',
    CHE = 'CHE',
    CHW = 'CHW',
    SYP = 'SYP',
    TWD = 'TWD',
    TJS = 'TJS',
    TZS = 'TZS',
    THB = 'THB',
    TOP = 'TOP',
    TTD = 'TTD',
    TND = 'TND',
    TRY = 'TRY',
    TMT = 'TMT',
    UGX = 'UGX',
    UAH = 'UAH',
    AED = 'AED',
    USN = 'USN',
    UYU = 'UYU',
    UYI = 'UYI',
    UYW = 'UYW',
    UZS = 'UZS',
    VUV = 'VUV',
    VES = 'VES',
    VND = 'VND',
    YER = 'YER',
    ZMW = 'ZMW',
    ZWL = 'ZWL',
    XBA = 'XBA',
    XBB = 'XBB',
    XBC = 'XBC',
    XBD = 'XBD',
    XTS = 'XTS',
    XXX = 'XXX',
    XAU = 'XAU',
    XPD = 'XPD',
    XPT = 'XPT',
    XAG = 'XAG',
    AFA = 'AFA',
    FIM = 'FIM',
    ALK = 'ALK',
    ADP = 'ADP',
    ESP = 'ESP',
    FRF = 'FRF',
    AOK = 'AOK',
    AON = 'AON',
    AOR = 'AOR',
    ARA = 'ARA',
    ARP = 'ARP',
    ARY = 'ARY',
    RUR = 'RUR',
    ATS = 'ATS',
    AYM = 'AYM',
    AZM = 'AZM',
    BYB = 'BYB',
    BYR = 'BYR',
    BEC = 'BEC',
    BEF = 'BEF',
    BEL = 'BEL',
    BOP = 'BOP',
    BAD = 'BAD',
    BRB = 'BRB',
    BRC = 'BRC',
    BRE = 'BRE',
    BRN = 'BRN',
    BRR = 'BRR',
    BGJ = 'BGJ',
    BGK = 'BGK',
    BGL = 'BGL',
    BUK = 'BUK',
    HRD = 'HRD',
    CYP = 'CYP',
    CSJ = 'CSJ',
    CSK = 'CSK',
    ECS = 'ECS',
    ECV = 'ECV',
    GQE = 'GQE',
    EEK = 'EEK',
    XEU = 'XEU',
    GEK = 'GEK',
    DDM = 'DDM',
    DEM = 'DEM',
    GHC = 'GHC',
    GHP = 'GHP',
    GRD = 'GRD',
    GNE = 'GNE',
    GNS = 'GNS',
    GWE = 'GWE',
    GWP = 'GWP',
    ITL = 'ITL',
    ISJ = 'ISJ',
    IEP = 'IEP',
    ILP = 'ILP',
    ILR = 'ILR',
    LAJ = 'LAJ',
    LVL = 'LVL',
    LVR = 'LVR',
    LSM = 'LSM',
    ZAL = 'ZAL',
    LTL = 'LTL',
    LTT = 'LTT',
    LUC = 'LUC',
    LUF = 'LUF',
    LUL = 'LUL',
    MGF = 'MGF',
    MVQ = 'MVQ',
    MLF = 'MLF',
    MTL = 'MTL',
    MTP = 'MTP',
    MRO = 'MRO',
    MXP = 'MXP',
    MZE = 'MZE',
    MZM = 'MZM',
    NLG = 'NLG',
    NIC = 'NIC',
    PEH = 'PEH',
    PEI = 'PEI',
    PES = 'PES',
    PLZ = 'PLZ',
    PTE = 'PTE',
    ROK = 'ROK',
    ROL = 'ROL',
    STD = 'STD',
    CSD = 'CSD',
    SKK = 'SKK',
    SIT = 'SIT',
    RHD = 'RHD',
    ESA = 'ESA',
    ESB = 'ESB',
    SDD = 'SDD',
    SDP = 'SDP',
    SRG = 'SRG',
    CHC = 'CHC',
    TJR = 'TJR',
    TPE = 'TPE',
    TRL = 'TRL',
    TMM = 'TMM',
    UGS = 'UGS',
    UGW = 'UGW',
    UAK = 'UAK',
    SUR = 'SUR',
    USS = 'USS',
    UYN = 'UYN',
    UYP = 'UYP',
    VEB = 'VEB',
    VEF = 'VEF',
    VNC = 'VNC',
    YDD = 'YDD',
    YUD = 'YUD',
    YUM = 'YUM',
    YUN = 'YUN',
    ZRN = 'ZRN',
    ZRZ = 'ZRZ',
    ZMK = 'ZMK',
    ZWC = 'ZWC',
    ZWD = 'ZWD',
    ZWN = 'ZWN',
    ZWR = 'ZWR',
    XFO = 'XFO',
    XRE = 'XRE',
    XFU = 'XFU',
}

export enum DataLocalizationRegionEnum {
    // APAC
    AU = 'AU', // Australia
    ID = 'ID', // Indonesia
    IN = 'IN', // India
    JP = 'JP', // Japan
    SG = 'SG', // Singapore
    KR = 'KR', // South Korea

    // Europe
    DE = 'DE', // EU (Germany)
    CH = 'CH', // Switzerland
    GB = 'GB', // United Kingdom

    // LATAM
    BR = 'BR', // Brazil

    // MEA
    BH = 'BH', // Bahrain
    ZA = 'ZA', // South Africa
    AE = 'AE', // United Arab Emirates

    // NORAM
    CA = 'CA', // Canada
}

/**
 * Business category values for WhatsApp Business Profile.
 * These values map to specific strings displayed in the WhatsApp client.
 */
export enum BusinessVerticalEnum {
    /**
     * Alcoholic Beverages
     */
    ALCOHOL = 'ALCOHOL',
    /**
     * Clothing and Apparel
     */
    APPAREL = 'APPAREL',
    /**
     * Automotive
     */
    AUTO = 'AUTO',
    /**
     * Beauty, Spa and Salon
     */
    BEAUTY = 'BEAUTY',
    /**
     * Education
     */
    EDU = 'EDU',
    /**
     * Entertainment
     */
    ENTERTAIN = 'ENTERTAIN',
    /**
     * Event Planning and Service
     */
    EVENT_PLAN = 'EVENT_PLAN',
    /**
     * Finance and Banking
     */
    FINANCE = 'FINANCE',
    /**
     * Public Service
     */
    GOVT = 'GOVT',
    /**
     * Food and Grocery
     */
    GROCERY = 'GROCERY',
    /**
     * Medical and Health
     */
    HEALTH = 'HEALTH',
    /**
     * Hotel and Lodging
     */
    HOTEL = 'HOTEL',
    /**
     * Non-profit
     */
    NONPROFIT = 'NONPROFIT',
    /**
     * Online Gambling & Gaming
     */
    ONLINE_GAMBLING = 'ONLINE_GAMBLING',
    /**
     * Over-the-Counter Drugs
     */
    OTC_DRUGS = 'OTC_DRUGS',
    /**
     * Other
     */
    OTHER = 'OTHER',
    /**
     * Non-Online Gambling & Gaming (E.g. Brick and mortar)
     */
    PHYSICAL_GAMBLING = 'PHYSICAL_GAMBLING',
    /**
     * Professional Services
     */
    PROF_SERVICES = 'PROF_SERVICES',
    /**
     * Restaurant
     */
    RESTAURANT = 'RESTAURANT',
    /**
     * Shopping and Retail
     */
    RETAIL = 'RETAIL',
    /**
     * Travel and Transportation
     */
    TRAVEL = 'TRAVEL',
}
