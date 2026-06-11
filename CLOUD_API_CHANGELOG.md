# WhatsApp Business Platform API — Changelog Tracker

> Source: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
> Updated: 2026-06-09T06:43:10.860Z


## June 10, 2026

- [ ] **#411** Documented the optional transfer_action request parameter and the new 147005 error code for the WhatsApp Business Username API.

## June 4, 2026

- [x] **#410** Clarified that deleting a business phone number is not supported via the API; use WhatsApp Manager.

## June 3, 2026

- [x] **#409** [In-App Signup] Added In-App Signup, a new guide for creating opt-in deep links that WhatsApp users click to subscribe to your messages. The guide covers creating, retrieving, listing, updating, and disabling signups, error codes, and messaging customer base management.

## June 2, 2026

- [x] **#408** [Cloud API] Added Meta Business Agent section to the About the WhatsApp Business Platform page. Meta Business Agent lets you configure and operate AI-powered agents on WhatsApp, including agent configuration, knowledge management, custom connectors, thread control, and evaluation tools.
- [x] **#407** [Cloud API] Published Updates to WhatsApp Business accounts, Onboarding changes, and Managing messaging accounts — three new guides describing the evolving WhatsApp Business account model, including the new WhatsApp Business Account (WAAC) and Messaging Account structure, phased rollout timeline, and the paid_messaging_account_id parameter for multi-Messaging Account scenarios.
- [x] **#406** [Cloud API] Updated About the WhatsApp Business Platform to reflect new account model terminology, including updated WhatsApp Business Account description and API heading changes.
- [x] **#405** [Cloud API, Message Templates] Updated the Message Templates API to return detailed response objects when archiving or unarchiving templates, instead of {"success": true}. Archiving now returns archived_templates (successfully archived IDs) and failed_templates (per-template error messages). Unarchiving returns unarchived_templates and failed_templates in the same format. This enables callers to handle partial failures when archiving or unarchiving templates in bulk.

## June 1, 2026

- [x] **#404** [Cloud API] Added Call recording, a guide for recording WhatsApp Business Calling API calls. Covers enabling recording on business-initiated and user-initiated calls, the legally required announcement and consent flow, the call_recording_available webhook payload, the 7-day retention policy, and error cases.

## May 29, 2026

- [x] **#403** [Cloud API, Webhooks] Added voicemail configuration and webhooks to the Configure Call Settings page. Voicemail is in alpha — early integration partners can configure announcement media, REJECT and TIMEOUT triggers, and receive recorded voicemails through the existing messages webhook field as inbound audio messages.

## May 28, 2026

- [x] **#402** [Cloud API] Updated the Business Scoped User IDs page. Renamed the contact request interactive message type from contact_request to request_contact_info. Fixed the parent BSUID endpoint URL to use api.facebook.com instead of graph.facebook.com.
- [x] **#401** [Cloud API, Webhooks] Updated the Calling API reference page. Added BSUID and username fields to calling webhooks: to_user_id, to_parent_user_id, and contacts with username, user_id, parent_user_id for Call Connect and Call Terminate webhooks, and recipient_user_id for Call Status webhooks.

## May 27, 2026

- [x] **#400** [Cloud API, Pricing] Added an ISO Country Code column to the country calling codes table on the pricing page. The new column displays ISO 3166 Alpha-2 country codes (for example, US, GB, IN) alongside the existing country calling codes, supporting the migration to Business Scoped User ID (BSUID).

## May 26, 2026

- [x] **#399** [Cloud API, Pricing] Updated the Pricing page with upcoming rate card changes effective July 1, 2026 and October 1, 2026, including new markets moving to standalone pricing and rate card updates across 16 currencies. Updated billing localization sections for Brazil and India with migration deadlines and links to the new Currency Migration API. Added a new Change billing currency via API page documenting the WABA Currency Migration API, which allows cloning an existing WABA into a new WABA with a different currency o...
- [x] **#398** [Updated the AI Providers pricing policy page with upcoming rates effective July 1, 2026.] Updated the Calling API Pricing page with upcoming rate cards effective July 1, 2026 across 16 currencies.

## May 18, 2026

- [x] **#397** [Embedded Signup] Added Reconnect offboarded coexistence clients, a new guide for coexistence partners. When a coexistence client re-registers their WhatsApp Business app (device switch, reinstall, or re-registration), they see a pre-checked opt-in to reconnect all previously connected Cloud API products. Reonboarding completes automatically in the background within a few minutes.

## May 14, 2026

- [x] **#396** [Cloud API, Groups API] Updated mark messages as read documentation. Businesses can now mark group messages as read using the same Messages API endpoint. Unlike individual messages, each group message must be marked as read individually — marking one message does not mark earlier messages in the group as read.

## May 13, 2026

- [x] **#395** [Cloud API] Effective June 15, 2026, Keyboard suggestions will be enabled by default for all authentication templates. On iOS 26 and later, WhatsApp users will see a native one-tap autofill prompt in the keyboard when they receive an authentication code. No integration changes are required. To opt out before this date, use the Allow autofill on iOS toggle in WhatsApp Manager.

## May 12, 2026

- [x] **#394** [Cloud API, Pricing] Updated the AI Providers pricing policy page. Effective May 13, 2026, Meta will no longer charge “AI Providers” for non-template messages delivered to users in EU/EEA markets. Charges for non-template messages delivered to users in Brazil remain in effect. Updated rate card CSV and PDF.

## April 30, 2026

- [x] **#393** [Cloud API] Updated per-user marketing template message limits documentation. Added new retry limits section describing WABA-level enforcement for excessive retry attempts. Added new timezone IDs reference documentation listing all supported timezone identifiers for the WhatsApp Business Platform.

## April 21, 2026

- [x] **#392** [Marketing Messages] Marketing Messages API for WhatsApp Additional offsite conversion metrics are now available in WhatsApp Manager and in the Template Analytics API. New metrics include: registrations completed, adds to wishlist, adds of payment info, levels achieved, ratings submitted, tutorials completed, searches, leads, content views, other, and custom events. See Viewing metrics and Setting up conversion measurement for details.
- [x] **#391** [Marketing Messages API for WhatsApp] Automatic creative optimizations are now disabled by default at the WhatsApp Business Account level. You can opt in via the API or directly in WhatsApp Manager. Updated ACO documentation with refreshed content: added Dynamic CTA and Hyperlink formatting to Coming soon, and updated text formatting description.

## April 20, 2026

- [x] **#390** [Cloud API, Webhooks] The account_update webhook’s PARTNER_REMOVED event disconnection_info object now supports three additional reason values when your client was using both the WhatsApp Business app and Cloud API: ACCOUNT_DISCONNECTED (enforcement or your client explicitly deleted their WhatsApp account), CHANGE_NUMBER (your client changed their phone number), and USER_RE_REGISTERED (your client re-registered on a new device). These values are part of a gradual rollout and may not be available to you immediately.

## April 17, 2026

- [x] **#389** [Cloud API] Added new error code 131064. The API returns this error when a WhatsApp Business account has exceeded its messaging limit due to template classification violations. This applies to both template messages and direct send messages. The restriction is automatically lifted after the enforcement period.

## April 15, 2026

- [x] **#388** [Cloud API, Embedded Signup] WhatsApp Business app phone numbers from Nigeria and South Africa are now supported when onboarding WhatsApp Business app users via Embedded Signup.

## April 3, 2026

- [x] **#387** [Cloud API, Webhooks] The account_update webhook’s PARTNER_REMOVED event now includes a disconnection_info object when your client was using both the WhatsApp Business app and Cloud API and the disconnection was due to a business downgrade or device inactivity. The object contains a reason field (BUSINESS_DOWNGRADE, PRIMARY_INACTIVITY, or COMPANION_INACTIVITY) and an initiated_by field (USER or SYSTEM). This feature is part of a gradual rollout and may not be available to you immediately.

## April 1, 2026

- [x] **#386** [Cloud API, Pricing] Updated per-message rate cards with rate changes for Saudi Arabia, India, Pakistan, and Turkey. Introduced 8 new billing currencies for both messaging and calling: AED, ARS, CLP, COP, MYR, PEN, SAR, and SGD.

## March 27, 2026

- [x] **#385** [Cloud API, Conversational Components] Removed the request_welcome webhook and welcome message feature from conversational components. This feature is no longer supported. The enable_welcome_message parameter has been removed from the Conversational Automation API.

## March 2, 2026

- [x] **#384** [Cloud API, Marketing Messages API for WhatsApp, Pricing] Added upcoming rates for 2026 for the following countries: Argentina (ARS), Australia (AUD), Chile (CLP), Colombia (COP), Euro (EUR), India (INR), Indonesia (IDR), Malaysia (MYR), Mexico (MXN), Peru (PEN), Saudi Arabia (SAR), Singapore (SGD), United Arab Emirates (AED), United Kingdom (GBP), United States (USD).

## February 19, 2026

- [x] **#383** [Marketing Messages] Marketing Messages API for WhatsApp Added a new Automatic Creative Optimization type: Auto promotion tag.
- [x] **#382** [MessagesWebhook Subscriptions] Cloud API

## February 4, 2026

- [x] **#381** [Webhook Subscriptions] Embedded Signup

## February 3, 2026

- [x] **#380** [Official Business Account] Cloud API

## January 29, 2026

- [x] **#379** [Multi-Partner SolutionsMarketing Messages] Marketing Messages API for WhatsApp

## January 28, 2026

- [x] **#378** [Cloud API] Added new pricing policy for AI Providers. Effective February 16, 2026, in countries where Meta is legally required to support AI Providers, Meta will charge AI Providers for non-template messages sent to WhatsApp users.

## December 18, 2025

- [x] **#377** [Message Templates] Business Management API Added hsm_ids field to DELETE WhatsApp Business Account > Message Templates endpoint. Accepts an array of up to 100 template IDs to delete in a single request. Cannot be combined with the name or hsm_id parameters. See Delete templates by IDs.

## December 8, 2025

- [x] **#376** [Message Templates] Cloud API, Business Management API Added business portfolio pacing, a new template message delivery batching mechanism that allows time to gather feedback on any template sent as part of a large-scale messaging campaign.

## December 4, 2025

- [x] **#375** [Marketing Messages] Marketing Messages API for WhatsApp

## December 3, 2025

- [x] **#374** [Marketing Messages] Cloud API

## December 1, 2025

- [x] **#373** [Business Encryption] Cloud API Added No Storage, an alternative Local Storage configuration. With No Storage, in-transit data is kept for a shorter period of time, and at-rest data is not persisted.

## November 26, 2025

- [x] **#372** [Embedded Signup] Added a note in embedded signup indicating users may experience a new completion flow for all versions. A new View your setup guide button will take users to a new setup guidance page in the WhatsApp Manager, which will provide next steps on:
- [x] **#371** [Business verification] Resolving integrity issues and accessing Business Support Home
- [x] **#370** [Sending the first message via a partner solution] Sending business-initiated messages using templates

## November 25, 2025

- [x] **#369** [MessagesWebhook Subscriptions] Embedded Signup
- [x] **#368** [The following messages event webhooks are now supported for Coexistence in Embedded Signup:] Edit messages

## November 19, 2025

- [x] **#367** [Marketing Messages] Marketing Messages API for WhatsApp Marketing Messages API for WhatsApp (formerly known as Marketing Messages Lite API) is now generally available.

## November 11, 2025

- [x] **#366** [WhatsApp Flows Endpoints Security Enhancements (Data API Version 4.0)] To further protect user interactions and ensure requests are genuinely from the intended recipients, we have strengthened the security of WA Flows endpoints. Previously, the system relied on flow tokens as identifiers. While effective, we have added some improvements to the verification process. We have introduced a robust two-signature authentication mechanism: 1. Platform-side Signature Verification: Our platform now verifies the authorization of requests for specific flow messages. This proce...

## November 3, 2025

- [x] **#365** [MessagesWebhook Subscriptions] Cloud API
- [x] **#364** [Updated the unsupported messages webhook by adding details about the actual message type.] Added new played status messages webhook status value, which indicates when a voice message is played by the Whatsapp user.
- [x] **#363** [Webhook Subscriptions] Cloud API
- [x] **#362** [Updated the unsupported message webhookby adding details about the actual message type.] Added new played status message webhook which indicates when a voice messge is played by the Whatsapp user.

## October 31, 2025

- [x] **#361** [Marketing MessagesWhatsApp Business Account] MM Lite API Added two new Automatic Creative Optimization types: product extensions and text formatting optimization.

## October 23, 2025

- [x] **#360** [MM Lite Onboarding] Embedded Signup
- [x] **#359** [The following countries/regions are now supported for Coexistence in Embedded Signup:] Australia
- [x] **#358** [Japan] Philippines
- [x] **#357** [Russia] South Korea
- [x] **#356** [Turkey] European Economic Area (EEA) European Union (EU) United Kingdom (UK)

## October 20, 2025

- [x] **#355** [Marketing Messages] MM Lite API Offsite conversion metrics is now available in WhatsApp Business Manager and in the Template Analytics API. Added two new Automatic Creative Optimization features: Headline extraction and Tap-target title extraction.
- [x] **#354** [MessagesWebhook Subscriptions] Cloud API Ad click IDs will not be included in incoming text messages webhooks payloads describing an incoming message that originated from a WhatsApp Status ad placements⁠.

## October 17, 2025

- [x] **#353** [Marketing Messages] MM Lite API Added marketing_messages_onboarding_status and owner_business_info fields to check Terms of Service and Intent request status for business manager.
- [x] **#352** [Embedded Signup] If you don’t want to configure and host the Embedded Signup implementation code on your website or customer portal, you can now use Hosted Embedded Signup (“Hosted ES”) instead. Hosted ES is a pre-configured implementation of Embedded Signup that is hosted by Meta. You can get a link to Hosted ES in the App Dashboard and add it to your website or customer portal. Business customers who click the link will be presented with a webpage with a “Get started” button that launches the Embedded Signup f...

## October 16, 2025

- [x] **#351** [MessagesWebhook Subscriptions] Cloud API, Business Management API Incoming media messages webhooks (image messages, video messages, etc.) now include the incoming media asset’s media URL, which is assigned to the url property. You can now designate an audio message as a voice message. Delivered voice messages appear in the WhatsApp client with a play icon, waveform graphic, profile image, and a microphone icon. If the recipient has enabled voice message transcripts⁠, a text transcription of the message can also appear:

## October 14, 2025

- [x] **#350** [Marketing Messages] MM Lite API The product_policy field is now 100% rolled out for businesses customers.

## October 8, 2025

- [x] **#349** [Webhook SubscriptionsWhatsApp Business Account] Cloud API, Business Management API Messaging limits are now business portfolio-based instead of business phone number-based, and the initial increase via scaling path is now 2,000 instead of 1,000. To support this change, for version 24.0 and newer requests, a new whatsapp_business_manager_messaging_limit field has been added, which returns the owning business portfolio’s messaging limit. This field is available on the following endpoints: GET /<BUSINESS_PORTFOLIO_ID> GET /<WHATSAPP_BUSINESS_ACC...
- [x] **#348** [Embedded Signup] Embedded Signup version 4 is now available. Version 4 provides a simplified onboarding experience and allows you to onboard business customers to multiple products (WhatsApp Cloud API, Marketing Messages Lite API, Ads that click-to-WhatsApp⁠ and the Conversions API).
- [x] **#347** [MM Lite OnboardingMarketing Messages] Embedded Signup Embedded Signup version 4 is now available. Version 4 provides a simplified onboarding experience and allows you to onboard business customers to multiple products (WhatsApp Cloud API, Marketing Messages Lite API, Ads that click-to-WhatsApp and the Conversions API). For more information, see the versions and v4 page.
- [x] **#346** [MM Lite] Updated the onboarding page with an onboarding video tutorial.

## October 6, 2025

- [x] **#345** [Groups API] Introducing WhatsApp Groups API, which enables programmatic creation and management of groups on WhatsApp.

## October 3, 2025

- [x] **#344** [Solution providers] Access verification is no longer required to become a Tech Provider.

## October 1, 2025

- [x] **#343** [Cloud API, Marketing Messages Lite API, Pricing] Changed WhatsApp Business Platform rates. Increased marketing message rates for United Arab Emirates. Increased utility and authentication message rates for Colombia. Decreased marketing message rates for Mexico. Decreased utility and authentication message rates for Saudi Arabia, Argentina, and Egypt. Zimbabwe is now mapped to our “Rest of Africa” region vs. “Other.” Messages delivered to WhatsApp users with a +263 country calling code (Zimbabwe) will now be charged “Rest of Africa” rates.
- [x] **#342** [Marketing Messages] MM Lite API

## September 29, 2025

- [x] **#341** [MM Lite OnboardingMarketing Messages] MM Lite API Added a Coexistence onboarding guide to MM Lite. Whatsapp Business users can now onboard with their existing WhatsApp Business app account and phone number.

## September 24, 2025

- [x] **#340** [Cloud API] Added note in the media document when retrieving a media from a media ID received via webhook, the media ID will only be available to download for 30 days. After October 9th this will only be available for 7 days.

## September 10, 2025

- [x] **#339** [Flow JSON Validation Updates] Validation for routing model and data model in Flow JSON The Flow’s routing model's improved validation makes sure only valid routes are used for navigation. We’ve also improved the validation for the screen’s data model. These updates don't change how things work, but they make it easier to spot errors in the Flow JSON.

## September 8, 2025

- [x] **#338** [Call Permissions] Cloud API Updated v3 document to display an example of the v3 syntax. Added Call Permissions Request type under interactive objects for messages.

## September 3, 2025

- [x] **#337** [Webhook SubscriptionsMarketing Messages] MM Lite API On September 8th, 2025, we’re launching a new “MM Lite ToS signed” webhook, which will be sent whenever a business signs the MM Lite ToS via any method (e.g. Embedded Signup, or in WhatsApp Manager). The webhook will have a more descriptive name than the existing AD_ACCOUNT_LINKED webhook. The older webhook will be deprecated by Jan 1, 2026. Conversion metrics will now also be available in WhatsApp Manager UI and via the WhatsApp Business Management API. This means that we’re removin...

## August 27, 2025

- [x] **#336** [MessagesCall Permissions] Embedded Signup Updated v3 document to display an example of the v3 syntax.
- [x] **#335** [Cloud API] Added Call Permissions Request type under interactive objects for messages.

## August 22, 2025

- [x] **#334** [Marketing Messages] MM Lite API
- [x] **#333** [Added a features page comparing MM Lite and Cloud API features.] MM Lite API uptime and availability metrics are now live on metastatus.com⁠, providing visibility into service status.

## August 14, 2025

- [x] **#332** [Embedded Signup] In September we are simplifying the Embedded Signup flow across all versions. You can preview the simplified flow by configuring Embedded Signup with v#-public-preview (e.g. v3-public-preview) and launching the flow. See Versions for additional details.

## August 12, 2025

- [x] **#331** [Webhook SubscriptionsMM Lite Onboarding] Cloud API Added AD_ACCOUNT_LINKED event to the account_update webhook, which triggers when a WABA has onboarded to MM LITE through Embedded Signup or Intent API giving the partner access to its ad accounts.

## August 11, 2025

- [x] **#330** [Business Management API] Added Welcome Message Sequences, which allow you to populate a set of pre-defined text and FAQs or a prefilled message, that can appear in a WhatsApp thread when a user taps a Click-to-WhatsApp ad.

## August 6, 2025

- [x] **#329** [Marketing Messages] MM Lite API Added a image background generation field for automatic creative optimization.

## August 4, 2025

- [x] **#328** [Cloud API] Added new whatsapp_business_manage_events permission to log events.

## July 30, 2025

- [x] **#327** [Message Templates] Cloud API Changed the Media Card Carousel Template requirements so that card body text is no longer mandatory.

## July 25, 2025

- [x] **#326** [Marketing Messages] MM Lite API Updated references to “Mobile App ID” to “Meta App ID” when creating a template to avoid confusion. Added a Template-to-ad-syncing guideline for clients to follow to ensure all templates be set up for conversion metrics.
- [x] **#325** [Message Templates] Cloud API Added the Tap target title URL override message template.

## July 22, 2025

- [x] **#324** [Marketing Messages] MM Lite API Local Storage is now available for MM Lite. If you have already enabled Local Storage for the Cloud API, your existing settings are automatically applied to the MM Lite API.

## July 16, 2025

- [x] **#323** [Marketing Messages] MM Lite API Added a troubleshooting guide on how to identify admins of a business portfolio using Meta Business Suite or the API. Both methods return the same results. Meta Business Suite⁠: Navigate to the Business Settings to view users with Full Control access. API: GET /<WHATSAPP_BUSINESS_ACCOUNT_ID> and GET /<BUSINESS_PORTFOLIO_ID>/business_users endpoints to get a list of business portfolio admins.

## July 15, 2025

- [x] **#322** [Marketing Messages] MM Lite API Added marketing_messages_onboarding_status field which provides more granular eligibility status data. The field will be a replacement for marketing_messages_api_status field which will be deprecated in version 24.0. Fixed the marketing_messages_lite_api_status field to correct a bug which was erroneously returning ELIGIBLE when it should have returned ONBOARDED. This field will be deprecated in version 24.0, so we recommend using the new marketing_onboarding_status field instead. Ch...
- [x] **#321** [Multi-Partner SolutionsCalls] Cloud API
- [x] **#320** [WhatsApp Business Calling API now available.] WhatsApp Business Platform
- [x] **#319** [Multi-solution Conversations is now available in open beta] Multi-solution Conversations enables businesses to use multiple partners and solutions on the same phone number, enabling a seamless chat thread experience for their customers.

## July 8, 2025

- [x] **#318** [Component updates] Validation for nested expressions in Flow JSON actions Nested expressions used in actions are now validated to ensure referenced variables in the data model exist. This doesn’t add any functional change, but makes it easier to spot errors on Flow JSON.

## July 7, 2025

- [x] **#317** [Webhook SubscriptionsWhatsApp Business Profile] Business Management API Added PROFILE_PICTURE_LOST as a new alert_type to account_alerts webhooks, to notify you when a business phone number’s business profile photo has been deleted.

## July 1, 2025

- [x] **#316** [Marketing Messages] MM Lite API Per-message pricing now applies to MM Lite API! See Pricing on the WhatsApp Business Platform to learn more.
- [x] **#315** [Cloud API] Per-message pricing is now live.

## June 24, 2025

- [x] **#314** [Marketing Messages] MM Lite API
- [x] **#313** [Permissions] The ads_read permission is now optional for partners. This change impacts the Intent API and the Embedded Signup onboarding flows. Prior to this change, partners had to apply for App Review to get advanced access for this new permission, regardless of whether or not their app intended to call the Insights API for conversion metrics. Now, partners only need to request advanced access for this permission via App Review if their app intends to use the Insights API.
- [x] **#312** [Automatic Creative Optimizations] Added text overlays and image animation Automatic Creative Optimizations. Like other optimizations, these are enabled by default on all templates, but can be disabled upon template creation, or when editing a template.

## June 20, 2025

- [x] **#311** [Marketing Messages] MM Lite API Businesses in Russia who were previously unable to send messages via MM Lite API can now do so. Note that these businesses will not have access to some advanced features, but can still take advantage of all other benefits, such as exclusive marketing features. For more details, see Geographic availability of features.

## June 18, 2025

- [x] **#310** [Embedded Signup] Solution Partners can now claim sandbox accounts.

## June 13, 2025

- [x] **#309** [Official Business AccountPhone Numbers] Cloud API You can now request Official Business Account status via API and edit your display name via API. Before you could only do this using WhatsApp Manager.

## June 10, 2025

- [x] **#308** [Component Updates] Update to the ChipsSelector component We are updating the ChipsSelector component to align its behaviour with other list selection components (i.e. CheckboxGroup, RadioButtonsGroup and Dropdown). The ChipsSelector component can now: Be used inside If/Switch components Have “on-select-action” and “on-unselect-action” properties defined at its root.
- [x] **#307** [Image Carousel component] The Image Carousel component allows users to slide through multiple images.
- [x] **#306** [Marketing Messages] MM Lite API Added two new Insights API fields so you can get read rate and click rate benchmarks via API instead of only via WhatsApp Manager: marketing_messages_read_rate_benchmark marketing_messages_click_rate_benchmark

## June 5, 2025

- [x] **#305** [Webhook Subscriptions] Embedded Signup Embedded Signup now gives business customers the option to have us automatically identify purchase or lead gen events in message threads that originate from ads that click to WhatsApp. To be notified of these events, you can subscribe to the new new automatic_events webhook, and optionally, report them via Conversions API. See Automatic Events API for more details.

## June 4, 2025

- [x] **#304** [Webhook SubscriptionsPhone Numbers] Business Management API A phone_number_quality_update webhook with event set to THROUGHPUT_UPGRADE and current_limit set to TIER_UNLIMITED will now be triggered if your business phone number is upgraded to higher throughput.

## May 29, 2025

- [x] **#303** [Cloud API] Added error code 132018 for help diagnosing invalid parameters when attempting to send a template message. Applies to version 23.0 and newer versions.
- [x] **#302** [Embedded Signup] Version 3 is now available. As part of this release, we have introduced versioning that will align with Graph API’s release cadence. The following changes apply to version 3: only_waba_sharing is no longer a valid extras.featureType value, since bypassing the phone number screen is obsolete now that business customers are able to complete the flow with a verified business phone number, unverified number, or no number at all. Added extras.version which must be set to 3 to enable version 3.
- [x] **#301** [Added extras.features for enabling Marketing Messages Lite API and App-Only Install onboarding.] Added extras.features.api_access_only for enabling App-Only Install onboarding. Enabling Marketing Messages Lite API onboarding must now be done through the extras.features instead of extras.featureType. Session info will be automatically enabled for all users. Partners will still have to add an event listener on the same window to process incoming information. coexistence is no longer a valid extras.featureType value, you must use whatsapp_business_app_onboarding to launch the Whatsapp Business...

## May 23, 2025

- [x] **#300** [Marketing Messages] MM Lite API

## May 21, 2025

- [x] **#299** [Marketing Messages] MM Lite API Added an Error messages section to WhatsApp Manager that shows a summary of errors encountered by your templates within a given period of time.

## May 20, 2025

- [x] **#298** [Marketing Messages] MM Lite API Added new error codes to help diagnose messaging errors. These will be available with Graph API version 23.0. 134100 134101 134102 134103

## May 5, 2025

- [x] **#297** [MM Lite Onboarding] Embedded Signup Solution providers can now onboard WhatsApp Business app users who have a WhatsApp Business app phone number with an India country dialing code.

## April 16, 2025

- [x] **#296** [Marketing Messages] MM Lite API Limited access available for tracking click events. We are offering a limited roll-out of webhook access to click events on marketing messages sent using MM Lite. Read the “Tracking click events” page for more information

## April 11, 2025

- [x] **#295** [Marketing Messages] MM Lite API
- [x] **#294** [Early access to Automated Creative Optimizations] We are piloting a new optimization capability exclusive to MM Lite API (not available on Cloud API), which automatically enhances the visual appeal and engagement of marketing messages. Similarly to Advantage+ creative, this capability tests minor variations of your existing image header with different crop orientations or color filters, and automatically selects the variant which is getting the highest click-through rate over time with no input needed from you. A small group of businesses will ...

## April 9, 2025

- [x] **#293** [Template Categorization] We no longer support the allow_category_change property during template creation. Previously, if set to true in a template creation request, this allowed us to update a template’s category to marketing, if we determined marketing to be its category per its content and our guidelines. This is now the default behavior.

## April 8, 2025

- [x] **#292** [Message template updates] Flows can now be sent with other buttons in message templates You can now send message templates with a Flow and other types of buttons as part of the same message. An icon can now be selected for different types of Flows, and a default icon will be displayed if none is selected. This will not affect templates that have already been sent.
- [x] **#291** [Messages] Cloud API Added typing indicators so you can let WhatsApp users know that you are preparing a response.

## April 2, 2025

- [x] **#290** [WhatsApp Business Account] WhatsApp Manager

## April 1, 2025

- [x] **#289** [Marketing Messages] MM Lite API
- [x] **#288** [MM lite is now in Open Beta] With this update, MM lite has: Self-signup for all partners and businesses. All businesses and solution providers (including Solution Partners, Tech Providers and Tech Partners) can now use self-serve onboarding flows to onboard to MM Lite API. See documentation on Onboarding for more details. Global availability. MM Lite API is now available in all regions where Cloud API is also available. Note that while the API is available, some geographic variation of features may apply, see details here.
- [x] **#287** [Pricing] Lowered authentication-international pricing rates for Egypt, Nigeria, Pakistan, and South Africa.

## March 31, 2025

- [x] **#286** [Cloud API, On-Premises API] Payments API for business portfolios with Singapore addresses is no longer available.

## March 27, 2025

- [x] **#285** [Marketing MessagesMessage Templates] MM Lite API
- [x] **#284** [Updates to character and emoji limits in Templates] This update applies across all Templates on the Business Messaging API, and is not specific to MM Lite API (also applies on Cloud API). As part of our ongoing efforts to improve the performance and user experience of our messaging platform, we are introducing changes to the body component of marketing templates via Cloud API and MM Lite API. These changes will impact the character limits and emoji usage in the body component, depending on the format and tag of the template. Key Updates: Characte...

## March 20, 2025

- [x] **#283** [WhatsApp Business Account On-Behalf Requests] Cloud API Added partner-initiated WABA creation to replace the On-Behalf-Of (“OBO”) account ownership model, which is being deprecated. Starting September 30, 2025, WABAs can no longer be onboarded to the OBO model.

## March 11, 2025

- [x] **#282** [Update to on-select-action behaviour] In Flow JSON version 6.0, we introduced a breaking change that triggered the on-select-action at the component level when a new screen was rendered. This same functionality is present in Flow JSON versions 6.1, 6.2, and 6.3. Reversion of this Change: We are reverting this change in Flow JSON version 7.0. From this version onwards, if an on-select-action is present on the component level, it will not be triggered when a new screen is rendered. This behavior is identical to that of Flow JSON versi...

## February 27, 2025

- [x] **#281** [Marketing Messages] App Dashboard Added additional tiles to the App Dashboard > WhatsApp > Quickstart panel to make it easier for you to get started with complementary products that can help you scale business messaging:
- [x] **#280** [Marketing Messages Lite API] Conversions API
- [x] **#279** [Marketing API] These tiles make it easier to find documentation for these products and automatically add required permissions to an App Review request, which you can review and submit at your convenience. Note that these tiles only appear for products that you are eligible to use.

## February 14, 2025

- [x] **#278** [Message Templates] Cloud API Added new endpoints to support template groups and template group analytics, which allows you group sets of templates for easier analytic analysis. Added GET /<WABA_ID>/template_groups Added POST /<WABA_ID>/template_groups
- [x] **#277** [Added GET /<WABA_ID>/template_group_analytics] Added GET /<TEMPLATE_GROUP_ID> Added POST /<TEMPLATE_GROUP_ID> Added DELETE /<TEMPLATE_GROUP_ID>

## February 11, 2025

- [x] **#276** [MM Lite Onboarding] Embedded Signup Added ability for solution providers to onboard WhatsApp Business app users via Embedded Signup (aka “Coexistence”).

## February 1, 2025

- [x] **#275** [Pricing] Lowered authentication pricing rates for Egypt, Malaysia, Nigeria, Pakistan, Saudi Arabia, South Africa, and the United Arab Emirates. Added authentication-international pricing rates for Egypt, Malaysia, Nigeria, Pakistan, Saudi Arabia, South Africa, and the United Arab Emirates.

## January 23, 2025

- [x] **#274** [Embedded Signup] Added ability for business customers of solution providers to claim “555” business phone numbers when onboarding via Embedded Signup.

## January 16, 2025

- [x] **#273** [Cloud API] Added the Block API giving businesses the ability to manage unwanted spam by blocking or unblocking specific customer phone numbers.

## January 14, 2025

- [x] **#272** [Chips selector component] The Chips Selector component simplifies tasks, such as selecting preferences or time slots, by presenting options in a compact and interactive format.
- [x] **#271** [Footer supported with RichText component] The RichText component can now be used in conjunction with the Footer component on the same screen, allowing the Flow to navigate from or end at a screen that includes RichText.
- [x] **#270** [Developer tooling improvements] Some Flow APIs have been simplified, making them easier to create and send:
- [x] **#269** [Published Flow can be created in a single API call] Two new optional parameters (flow_json, publish) are now available in the Create Flow API call, which allow you to provide the Flow JSON and publish the new Flow immediately. Previously, at least three API calls were required (Create Flow, Update Flow JSON, and Publish Flow).
- [x] **#268** [Simplified send Flow API call] The number of required parameters for sending a Flow has decreased. You now only need to specify flow_message_version, flow_cta and flow_id/flow_name. The rest of the parameters are now optional.
- [x] **#267** [Simplified creation of message template with a Flow] Similarly, the number of required parameters has decreased for creation of message template with a Flow. Only text, and flow identifier flow_id/flow_name/flow_json need to be provided for Flow button. The rest of the parameters are now optional.

## January 7, 2025

- [x] **#266** [Solution MigrationMulti-Partner Solutions] Multi-Partner Solutions Added ability to migrate business customers off of Multi-Partner Solutions via Embedded Signup and via Meta Business Suite. Both methods skip business phone number re-verification. Added app_id parameter to the POST /<WHATSAPP_BUSINESS_ACCOUNT>/set_solution_migration_intent endpoint to allow for migration off of Multi-Partner Solutions.

## December 10, 2024

- [x] **#265** [NavigationList component] The Navigation list offers a user-friendly way to explore multiple options within a Flow. Each list item enables navigation and can display a range of content, including text, images, and tags, making it easy for users to move between different screens in the Flow.
- [x] **#264** [Regular expressions supported in TextInput component] Introduced a new pattern property to enable regular expression validation for text inputs with input-type as text, password, passcode and number.
- [x] **#263** [Developer tooling improvements] This release also adds some features to the API, and makes some of those available on the Builder:
- [x] **#262** [Published Flows can be edited from the Builder] All new Flows could be edited from the API since November, and now they can also be edited from the Flows Builder on WhatsApp Manager. This enables changes to be made directly within the same Flow, allowing messages to be sent with the updated content using the same Flow ID, eliminating the need to recreate the Flow.
- [x] **#261** [API to migrate (copy) Flows from one WABA to another] Flows can be migrated from one WhatsApp Business account (WABA) to another owned by the same business. Migration doesn't move the source Flows, it creates copies of them with the same names in the destination WABA. migration API documentation and included in the Flows API Postman collection.⁠ Endpoint encryption examples in C# & Go
- [x] **#260** [Example code is now available for Flows endpoint in C# here⁠ and in Go here.⁠] Flow previews can be shared from the Builder A new share button will generate the preview URL without the need to use the existing API, so it can be shared with other users and embedded as an iframe into other applications.
- [x] **#259** [New Flow JSON deprecation webhooks] Introducing new webhooks when the Flow version is about to be frozen or expired. These warnings will also be visible on the Builder.
- [x] **#258** [Embedded Signup] Added Sandbox accounts for easier testing of the Embedded Signup flow.

## December 1, 2024

- [x] **#257** [Marketing Messages] MM Lite API
- [x] **#256** [USA availability, and checking MM Lite eligibility via API] Businesses in the USA are now eligible to use the MM Lite API. In addition, a new MM Lite enrolment parameter allows businesses and partners to programmatically check MM Lite eligibility. See API docs for details.

## November 18, 2024

- [x] **#255** [Marketing Messages] MM Lite API
- [x] **#254** [Reduced sync and async latency] MM Lite team has quickly responded to feedback on “async” or “delivery” latency. This is defined as the time between an API call being received by MM Lite API, and MM Lite API dispatching a “delivered” webhook, assuming a user is online when the message is sent. MM Lite previously had a p99 “async” delivery time of 12s, vs. p99 of 5s on Cloud API. This time has now been reduced to 9s. No action is required on a business or partner’s part.
- [x] **#253** [Webhook SubscriptionsMarketing Messages] Cloud API
- [x] **#252** [Added user preferences for marketing messages.] Added user_preferences webhook field for user preferences for marketing messages. Added error code 131050 for messages webhooks, indicating message non-delivery due user marketing preferences.

## November 15, 2024

- [x] **#251** [Marketing Messages] MM Lite API
- [x] **#250** [New easier onboarding flow, for partner-managed businesses] MM Lite is rolling out a new way for partners to guide a business through signing the MM Lite Terms of Service and moving to MM Lite. In parallel with the Embedded Signup flow already available, a partner will also alternatively be able to initiate the following flow: Call an ‘Intent API’ endpoint to indicate a BMID the partner wishes to assist in migrating to MM Lite. (If a BMID contains any OBO WABAs, these must be migrated to ‘shared’ prior to this event). Admins of that BMID will receive a n...

## November 13, 2024

- [x] **#249** [WhatsApp Business Account UsersWhatsApp Business Account] Cloud API Added GET /<SOLUTION_ID>/access_token endpoint for getting business tokens of business customers who have onboarded to the platform via a Multi-Partner Solution.

## November 12, 2024

- [x] **#248** [CalendarPicker component] New component that allows users to select a single date or a range of dates from a more user-friendly full calendar view making it easier to navigate dates and visualize date availability. Flow JSON Version 6.0 Version 6.0 introduces three backwards incompatible changes: String values in component properties can't be empty. Previously values such as “”, “ “, “\n”, “\t”, “\n” were accepted; from version 6.0 these are no longer valid. Maximum image size for list components (Checkbox Group, Radio B...
- [x] **#247** [New update_data action] A new action has been added to support dynamic updates of the current screen based on user interactions. This action can be used to update elements on the same screen in response to user inputs, handle dynamic data relationships, promote reusable templates, and more.
- [x] **#246** [New on-unselect-action property] A new property has been added to several components that works similarly to the existing on-select-action but will allow changes made by the update_data operation in the on-select-action to be reverted.
- [x] **#245** [OptIn and EmbeddedLink can now open external links] A new action open_url can be used in on-click-action to open external links in Flows from EmbeddedLink and OptIn components. These external links will open in the device's default browser.
- [x] **#244** [Developer tooling improvements] We are introducing a new page within the Builder, and improvements to the API and onboarding through the UI:
- [x] **#243** [Business insights] Statistics on how consumers interact with your Flows can now be found on the builder on published Flows. These metrics help track Flow performance and reveal usage trends, including the count of user interactions with Flows.
- [x] **#242** [Published Flows can now be edited] All new Flows can be edited by updating their metadata or Flow JSON via API, even after they have been published. This enables changes to be made directly within the same Flow, allowing messages to be sent with the updated content using the same Flow ID, eliminating the need to recreate the Flow.
- [x] **#241** [Simplified Flows onboarding] All businesses can now start creating and building Flows. To send and publish a Flow, business verification and high message quality are still required.
- [x] **#240** [Solution MigrationMulti-Partner Solutions] Cloud API Added POST /<WHATSAPP_BUSINESS_ACCOUNT>/set_solution_migration_intent endpoint to enable Tech Providers to migrate business customers from one Solution Partner and Multi-Partner Solution to another Solution Partner and Multi-Partner Solution.

## November 8, 2024

- [x] **#239** [Marketing Messages] MM Lite API
- [x] **#238** [App Conversion reporting now supported] Businesses can now use MM Lite API to measure when marketing messages lead users to perform app events, such as purchases, searches, or achieving levels in games. See Integrate with App Conversions for details.

## November 5, 2024

- [x] **#237** [Conversational Automation] Cloud API, Business Management API Added POST /<BUSINESS_PORTFOLIO_ID>/self_certify_whatsapp_business endpoint for partner-led business verifiation.

## November 1, 2024

- [x] **#236** [Cloud API, Pricing] Service conversations are now free for all businesses, including via AI-enabled conversational experiences.
- [x] **#235** [Marketing Messages] MM Lite API
- [x] **#234** [Metrics in WhatsApp Manager] To represent this new conversation type, MM Lite API conversations are available in every surface where reporting is offered: Ads Manager UI [recommended] Marketing API “Insights API” [recommended] WhatsApp Manager UI “WABA Insights” page and “Template Insights” page
- [x] **#233** [Business Management API] Pricing webhooks For full details on how to see MM Lite API metrics via API and in pricing webhooks, consult the MM Lite API docs. In the Marketing API “Insights API” response, MM Lite events can be return using fields named marketing_messages_[event] In the Business Management API “Template Analytics” endpoint, MM Lite events can be returned using the query parameter MARKETING_MESSAGES_LITE_API In the Business Management API “Conversation Analytics” endpoints, MM Lite events can be returned usi...
- [x] **#232** [Businesses can now see MM Lite metrics as “Marketing - lite” in the WhatsApp Manager UI:] We recommend you integrate with the Marketing API “Insights API” for MM Lite Metrics, and encourage end businesses to log into Ads Manager UI to see their metrics, instead of using the WhatsApp business surface. Ads Mgr UI and Insights API show conversion metrics that are not available on WhatsApp surfaces, and will continue to support new metrics and features as the primary surface for MM Lite API reporting as the API grows.
- [x] **#231** [API docs for partners have been updated to reflect how to fetch MM Lite metrics via API.] API docs have been updated to reflect how to fetch MM Lite metrics via API, see Viewing metrics.

## October 30, 2024

- [x] **#230** [Marketing MessagesMessage Templates] MM Lite API
- [x] **#229** [Exclusive feature: TTLs for Marketing messages] We continue to invest to improve consumer experiences and business outcomes. We are introducing customizable message validity periods (time-to-live or TTL) for marketing messages on MM Lite API, to ensure marketing messages are always timely and relevant for users thus performant for businesses. We are also updating our customizable range for TTL for utility and authentication templates, to provide businesses more control and flexibility.
- [x] **#228** [Marketing: From 12 hours to 30 days, for businesses on MM Lite API] Utility: From 30 seconds to 12 hours, for businesses on Cloud API
- [x] **#227** [Authentication: From 30 seconds to 15 minutes, for businesses on Cloud API or On-Premises API] Businesses can customize the TTL of marketing, utility and authentication templates during template creation via WhatsApp Manager (via pre-set increments) and via API (in 1-second increments). This is reflected in our dev docs and Business Help Center⁠.

## October 15, 2024

- [x] **#226** [Marketing Messages] MM Lite API
- [x] **#225** [New rate cards and pricing category for MM Lite] Marketing message conversations initiated via MM Lite API are counted and billed separately from Marketing message conversations initiated via Cloud API. This includes updates to pricing webhooks. For details, please see Pricing.

## October 11, 2024

- [x] **#224** [Solution MigrationMulti-Partner Solutions] Business Management API Added POST /<WHATSAPP_BUSINESS_ACCOUNT_ID>/set_solution_migration_intent endpoint for adding a WABA to an active multi-partner solution.

## October 8, 2024

- [x] **#223** [We are adding some tooling improvements to both the API and Flows Builder.] Flows can be referenced by name using the API Flow messages can be sent using the Flow's name instead of its ID, which is useful when you have clones of the same Flow in multiple WhatsApp Business Accounts with different Flow IDs. You can also create a message template with a Flow using the Flow's name.
- [x] **#222** [Flow JSON can be used when creating Message Templates through the API] It is now possible to provide Flow JSON as part of the request payload when creating Message Templates with a Flow attached, so you don't need to create and publish a Flow as a previous step.
- [x] **#221** [Endpoint setup on Flows builder has a dedicated section] Flows with endpoint can be configured on a dedicated tab at the bottom of the Flows builder. Other endpoint-related features can also be found there, such as snippets and links to the documentation.

## October 2, 2024

- [x] **#220** [Message TemplatesPhone Number Registration] Cloud API Starting with version 21.0 the package_name and signature_hash parameters must be defined within the supported_apps array when creating one-tap autofill and zero-tap authentication templates. Starting with version 21.0, to enable local storage on a business phone number, the number must be in an unregistered state, and you must use the POST /<WHATSAPP_BUSINESS_PHONE_NUMBER>/settings endpoint to enable local storage before registering the number (instead of enabling during registration)...

## October 1, 2024

- [x] **#219** [Cloud API, Pricing] Updated pricing rates in India, Saudi Arabia, the United Arab Emirates, and the United Kingdom.

## September 25, 2024

- [x] **#218** [Cloud API] Changed steps in the App Dashboard to make it easier to become a Tech Provider.

## September 24, 2024

- [x] **#217** [Message Templates] Cloud API Added checkout button templates (only available to India businesses that use business phone numbers with India country calling codes).

## September 16, 2024

- [x] **#216** [RichText component] You can use this component to render text with rich formatting options. The following markdown syntax is supported: - Heading and Subheading - Text formatting (italic, bold, strikethrough) - Basic lists - Links - Images - Tables
- [x] **#215** [TextBody and TextCaption can use markdown] A new property "markdown" can be used with both components, which allows to use a subset of the RichText capabilities.
- [x] **#214** [Flow termination message has a new look] SMBs are now able to view the responses received for Flows completion and download them in CSV format. Consumers will soon also be able to view the information submitted when completing the Flow. In Flow JSON, certain fields can now be marked as "sensitive" so that data for those fields is not visible as part of the response details displayed to the user.
- [x] **#213** [Developer tooling improvements] We are making it easier to preview Flows and integrate into existing websites. Web preview now can be used in interactive mode and inside an iframe The preview URL can be configured with new parameters to make it interactive and show a debug panel. It works with Flows with and without an endpoint. It can also be embedded as an iframe, so it can be integrated into an existing website.
- [x] **#212** [Flows data endpoint improvements] We have increased the payload limit of the Flows data endpoint to 10MB, allowing for the transmission of multiple images to screens using list (RadioButtonsGroup, CheckboxGroup, Dropdown) and RichText components.

## September 11, 2024

- [x] **#211** [Marketing Messages] Cloud API
- [x] **#210** [Added single-product message templates.] Added product card carousel templates.

## September 10, 2024

- [x] **#209** [Cloud API] Changed media asset caching behavior from developer definable (via Cache-Control header) to a fixed time period of 10 minutes. You can still force us to fetch assets from your server instead of our cache, however. See Media Caching.

## September 6, 2024

- [x] **#208** [Multi-Partner SolutionsWhatsApp Business Account] Cloud API
- [x] **#207** [Added Messages business asset access for more granular control of WhatsApp Business Account access.] Added ability to create Multi-Partner Solutions via embeddable button.

## August 13, 2024

- [x] **#206** [Upgrading Flows to version 5.0 from 4.0: Version 5.0 introduces a backwards incompatible change:] All DatePicker components now receive and set dates in “YYYY-MM-DD” format, which makes the values unrelated to time zones (more details). No additional changes are required to port a Flow from version 4.0 to 5.0, which will unlock your access to the following new functionality:
- [x] **#205** [Images and colors are now available in Pickers] Added support for displaying images and colors in list components (RadioButtonsGroup, CheckboxGroup, Dropdown). Media upload components: Increased limit for the number of media files sent as part of the response message It is now possible to have up to 10 media files sent as part of the response message, with the combined size of all files up to 100MB.
- [x] **#204** [Developer tooling improvements] This release introduces a few improvements to help developers onboard and debug Flows with endpoint.
- [x] **#203** [New health status endpoint for Flow Graph API] It is now possible to query flow health status using new health_status field and get status of Flow health and other related entities like WABA, Business which are involved in message sending (more details).
- [x] **#202** [New templates and development guides] New refined templates are now available in Flows Builder with dedicated development guides and endpoint templates ready to use. You can find them under the Flow creation screen on WhatsApp Manager, or following the links below:
- [x] **#201** [Pre-Approved Loan] Health Insurance
- [x] **#200** [Personalised offer] Purchased Intent
- [x] **#199** [Improved error details for Flows with endpoint] More detailed errors when using an endpoint are displayed on draft mode on mobile, and on the Builder in WhatsApp Manager to help with debugging.

## August 1, 2024

- [x] **#198** [Cloud API, Pricing] Lowered utility conversation pricing rates.

## July 9, 2024

- [x] **#197** [Endpoint health check debugger] You can now check the status of the endpoint of your Flow with this new health check validator, which allows easy troubleshooting of any issues with encryption or health check requests.
- [x] **#196** [You can find it on the endpoint setup modal within the Flows Builder in WhatsApp Manager.] Actions debugger A new panel is added to the existing Flows Builder in WhatsApp Manager, which allows viewing the data exchanged between the Flow and the Flow’s endpoint and the data passed between screens when navigating.

## June 25, 2024

- [x] **#195** [Marketing Messages] MM Lite API
- [x] **#194** [Show MM Lite metrics on the Template Analytics API] MM Lite metrics are now available from the Template Analytics API endpoint. See documentation for details.

## June 11, 2024

- [x] **#193** [Developer Tooling Improvements] We are introducing several improvements to help developers onboard and use Flows.
- [x] **#192** [[Developer Tools] Improved Flows Preview in the WhatsApp Manager Builder, and in Developer Docs] Better/snappier preview loading and saving performance. Ability to simulate iOS and dark theme modes. Mobile-like bottom sheet experience within the Flows Builder editor, which displays Flow JSON error(s).
- [x] **#191** [[Developer Tools] Update Application linked to a Flow through the Flows API] Added an optional application ID parameter to the Update Flow API request. [Developer Tools] Send-Time validation of the screen name in "navigate" action Added validation of the screen parameter in the message payload at Flow message send time if the action is navigate: invalid screens (i.e. screens that are no defined in the Flow JSON, or screens which cannot act as a first screen) will be rejected, and an API error will be returned.
- [x] **#190** [Improved Flows experience for users] We are releasing several improvements to the UX of Flows. These changes are not tied to a Flow JSON version; that is, they will apply to any Flows being actively sent.
- [x] **#189** [Progress Indicator] We have introduced a new feature to visually inform users about how much progress is left to complete the Flow. This is applicable for any Flows with more than one screen.
- [x] **#188** [Text Truncation improvements] Optimized the character limit strategy for components to maximize the amount of content displayed based on device resolution.
- [x] **#187** [Stopping WhatsApp Flows Support on Android OS 5.x.x] As announced in May, we have now stopped support for Flows on Android devices running OS 5.x.x and older. This means that Flow messages sent to users on such devices will not be delivered, and you will receive a webhook containing a “Message Undeliverable” error. For more details on this error, please refer to the error codes documentation.

## June 1, 2024

- [x] **#186** [Message Templates] Cloud API Added ability to set a custom time-to-live on utility templates.
- [x] **#185** [Business Management API] Added automatic category updates to correct templates that are miscategorized according to our guidelines.

## May 1, 2024

- [x] **#184** [Deprecating data_channel_uri] v18.0 / Forward: New field endpoint_uri will be returned. v17.0 / Backwards: Old field data_channel_uri will be returned.
- [x] **#183** [Stopping WhatsApp Flows Support on Android OS 5.x.x] Starting June 11th, 2024, WhatsApp Flows will only be supported on Android OS 6.0 and newer versions. This means that businesses will no longer be able to send Flow messages to users with Android OS 5.x.x devices and will receive a webhook containing a “Message Undeliverable” error when trying to do so. For more details on error, please refer to the error codes. Additionally, starting from July 9th, 2024, users on Android OS 5.x.x devices will no longer be able to interact with any existing Flow...

## April 10, 2024

- [x] **#182** [Webhook Subscriptions] Cloud API Added webook callback URL override on business phone numbers.

## April 1, 2024

- [x] **#181** [Support the Opt-in component in the Flows UI builder] Extend the support of the opt-in component in the Message Templates in Flows UI editor to allow users to add and modify an additional “Read More” screen. This feature enables you to display additional information (for example, terms and conditions) on a separate screen instead of cluttering the main Flow screen. This improves the user experience and simplifies the Flow creation process.

## March 18, 2024

- [x] **#180** [Conversational Automation] Cloud API

## March 1, 2024

- [x] **#179** [Flows template gallery] Adds a new screen for creating flow. The users can now interact with the template before using it for creating a flow. Exposing “UpdatedAt” field New field “UpdatedAt” exposed for the GraphAPI endpoints. The field is updated for every flow when name, status, flow json, etc. changes.
- [x] **#178** [The field is returned with the GraphAPI endpoint and used on the WA Manager -> Flows page.] BugFix- “form_name” will be removed from business paylaod Bug fix for Android implementation where ‘form_name’ was unintentionally included in payload. If businesses are using this, then they may need to modify server implementations for a more sustainable setup.

## February 13, 2024

- [x] **#177** [Phone Number Registration] Cloud API Changed business phone number registration/deregistration attempt limits to 10 requests per business number in a 72 hour moving window (was a one-week moving window).

## February 6, 2024

- [x] **#176** [Marketing Messages] Cloud API, On-Premises API Added per-user marketing template message limits to help deliver high-quality user experiences.

## February 1, 2024

- [x] **#175** [Details page] Introduce a new details page that provides a clear overview of Flow endpoint performance, with data on availability, latency, requests, and errors.
- [x] **#174** [This page is available for published Flows with endpoint from the Flows Builder in WhatsApp Manager.] Monitoring API Introduce a new Graph API field in WA Flow object named “metric” which allows businesses to retrieve a set of endpoint related metrics.
- [x] **#173** [Send flow via WhatsApp Manager] Introduce a new feature in the Flows Builder that allows Flows to be sent directly via WhatsApp Manager. The functionality works only with phone numbers registered to Cloud API. New flow template: appointment booking template Add a new flow JSON template “Book an Appointment” which can be used when creating a flow in Builder. The flow template can be found here. Add an endpoint example in NodeJS that works with the “Book an Appointment” flow JSON end to end. The endpoint code is available on Git...

## January 26, 2024

- [x] **#172** [Message Templates] Cloud API Changed Cloud API template message delivery retry time-to-live from 24 hours to 30 days. You can still override this value for authentication templates. Changed biz_opaque_callback_data character maximum from 256 to 512.

## January 18, 2024

- [x] **#171** [Conversational Automation] Cloud API

## January 1, 2024

- [x] **#170** [Introduces support for Flow JSON version 3.1] Adds optional property success for terminal screens to indicate whether terminating on that screen results in a successful flow completion. Use the new endpoint_uri field instead of the deprecated data_channel_uri.
- [x] **#169** [API changes] Make parameter name optional for Update Flow API request.

## December 18, 2023

- [x] **#168** [Messages] Cloud API Added location request messages.

## December 12, 2023

- [x] **#167** [Business Management API] Added cta_url_link_tracking_opted_out field on WhatsApp Message Template node for enabling/disabling button click tracking.

## December 1, 2023

- [x] **#166** [Introduces support for Flow JSON version 3.0] Removes the data_channel_uri property from Flow JSON Introduces ability to specify Flow endpoint via API or WhatsApp Manager.
- [x] **#165** [WhatsApp Manager changes] Adds additional filtering options (by ID and status) on the listing page of Flows
- [x] **#164** [Adds support for deleting and deprecating Flows] Adds the ability to clone Flows
- [x] **#163** [Flows in message templates] Adds support for attaching images when creating and attaching Forms in Message Templates
- [x] **#162** [Adds new custom form starter template when creating and attaching Forms in Message Templates] API changes Introduces new webhook sent at the flow creation. Deprecates the data_channel_uri field in the Get Flow API request and replaces it with the endpoint_uri field.

## November 20, 2023

- [x] **#161** [Message Templates] Business Management API Added console logging to help with debugging one-tap and zero-tap authentication templates.

## November 14, 2023

- [x] **#160** [Webhook Subscriptions] Cloud API Added health_status field to various nodes for checking messaging health status. Added biz_opaque_callback_data field to free-form messages for including arbitrary strings in messages webhooks.
- [x] **#159** [Embedded Signup] Embedded Signup can now be used to migrate customer business phone numbers from one WhatsApp Business Account to another.

## November 3, 2023

- [x] **#158** [Message Templates] Business Management API Carousel template creation now requires at least one button.

## October 23, 2023

- [x] **#157** [Message Templates] Business Management API, Cloud API, On-Premises API Added zero-tap authentication messages.

## October 10, 2023

- [x] **#156** [MessagesPhone Number Registration] Cloud API
- [x] **#155** [WhatsApp Flows is now available.] Added new data_localization_region field on WhatsApp Business Phone Number > Register endpoint for enabling local storage. Added new click-to-action URL buttons for free-form interactive messages.

## October 4, 2023

- [x] **#154** [Message Templates] Business Management API, Cloud API, On-Premises API Authentication templates using the code expiration warning now use the code_expiration_minutes value (instead of a default of 10 minutes) to determine if the delivered template message should display an autofill button or copy code button. Autofill buttons displayed in a delivered template message will become disabled after the amount of time indicated by the template’s code_expiration_minutes value, if present (or after 10 minutes, if not pres...

## October 2, 2023

- [x] **#153** [Message Templates] Cloud API Added new limited time offer templates and new limited_time_offer template component.

## October 1, 2023

- [x] **#152** [Initial release of the WhatsApp Flows.] Introduces support for Flow JSON version 2.1

## September 27, 2023

- [x] **#151** [Webhook Subscriptions] Cloud API Added ctwa_clid property to referral object in messages webhooks. Indicates the click ID generated when the user taps an ad that clicks to WhatsApp in order to send the message.

## September 18, 2023

- [x] **#150** [Message Templates] Cloud API, On-Premises API Legacy authentication templates (authentication templates without one-time password buttons) can continue to be sent, edited, and appealed until April 1, 204 (extended from October 2, 2023).

## September 12, 2023

- [x] **#149** [Phone Number ManagementWhatsApp Business AccountPhone Numbers] Business Management API GET request responses on authentication templates now include add_security_recommendation and code_expiration_minutes template components in component value.
- [x] **#148** [Added new WhatsApp Business Account Access levels for more granular control.] GET requests on WhatsApp Business Account > Phone Numbers and WhatsApp Business Account > Message Templates now return error code 200 if the user identified by token has not been granted appropriate WhatsApp Business Account Access. Added Template Migration.
- [x] **#147** [Cloud API] Added throughput and platform_type fields to WhatsApp Business Phone Numbers. Added Carousel Templates.
- [x] **#146** [Cloud API, On-Premises API] Migrating business phone numbers that have multiconnect running 2 or more shards from On-Premises API to Cloud API automatically upgrades the numbers to higher Cloud API throughput.

## August 28, 2023

- [x] **#145** [Embedded Signup] Added a new boolean field, override_default_response_type. When set to true, any response types passed in response_type will take precedence over the default types.

## August 15, 2023

- [x] **#144** [Business Management API] Added template_analytics (in beta).

## August 9, 2023

- [x] **#143** [Embedded Signup] Added granular business tokens that exist at the client business level as an opt-in feature to help partners improve account security. In addition, we have updated the creation screens for Pre Filled Data.

## August 8, 2023

- [x] **#142** [Cloud API] Added Cloud API localized storage status to WhatsApp Business API Status⁠ page.
- [x] **#141** [Business Management API] Added copy code button component for use with coupon code templates. Increased template button component total limit to 10, quick reply buttons can now be mixed with other button types, and URL button limit increased to 2. Added template bulk management. Added template previews for previewing template text in multiple languages.
- [x] **#140** [Embedded Signup] Added ability to bypass phone number selection in Embedded Signup. Added business phone number programmatic/bulk registration. Added pre-verified business phone numbers bulk registration. Added pre-verified business phone number sharing.

## August 2, 2023

- [x] **#139** [Pre-Verified Phone Numbers] Business Management API Pre-verified business phone numbers now have a VERIFIED status of 28 days (up from 14).

## July 11, 2023

- [x] **#138** [Cloud API] Scheduling and performing an upgrade to a business phone number’s throughput no longer requires a live call. You can now specify an upgrade time when submitting a Direct Support ticket to request an upgrade to a business phone number’s throughput. Downtime for business phone numbers undergoing a throughput upgrade reduced to 5 minutes or less.

## July 7, 2023

- [x] **#137** [Message Templates] Business Management API Authentication template copy code button text and autofill button text are now optional upon creation.

## July 6, 2023

- [x] **#136** [Embedded Signup] We are requiring Solution Partners to request the whatsapp_business_messaging permission to use the API calls on the Cloud API, hosted by Meta. There is now a permissions acknowledgement screen businesses must go through in order to complete Embedded Signup.

## June 13, 2023

- [x] **#135** [MessagesMessage Templates] Cloud API Added latency to the WhatsApp Business API Status Page⁠.
- [x] **#134** [Business Management API] Added Business Management API error code 2494100 that indicates a business phone number is temporarily in maintenance mode.
- [x] **#133** [Cloud API] Added identity change check feature.
- [x] **#132** [Added catalog messages.] Added catalog templates.

## May 26, 2023

- [x] **#131** [Message Templates] Cloud API Added error signals that can help debug authentication templates with one-time password autofill buttons.

## May 23, 2023

- [x] **#130** [Message Templates] Cloud API Attempting to send a paused template in a template message using v17 or later now returns error code 132015 instead of 132001. Attempting to send a disabled template in a template message using v17 or later now returns error code 132016 instead of 132001.
- [x] **#129** [On-Premises API] Attempting to send a paused template in a template message now returns error code 2061. Attempting to send a disabled template in a template message now returns error code 2062.

## May 9, 2023

- [x] **#128** [MessagesMessage Templates] Business Management API
- [x] **#127** [Added multi-product message templates.] Cloud API
- [x] **#126** [Added Stripe payments (Singapore only).] Added address messages for requesting customer addresses (Singapore and India only). Added 1,000 messages per second throughput.
- [x] **#125** [On-Premises API] Added Stripe payments (Singapore only). Added address messages for requesting customer addresses (Singapore and India only).

## May 1, 2023

- [x] **#124** [Webhook SubscriptionsMessage Templates] Business Management API Added new webhooks notifying you of denials of messaging limit increases to the account_alerts webhooks field. All templates must now be categorized as AUTHENTICATION, MARKETING, or UTILITY.

## April 26, 2023

- [x] **#123** [Message Templates] Business Management API Added hsm_id field to DELETE WhatsApp Business Account > Message Templates endpoint. If included, deletes a single template that matches the supplied ID (instead of deleting all templates that match the supplied name).

## April 18, 2023

- [x] **#122** [Phone Numbers] Cloud API Added last_onboarded_time to WhatsApp Business Phone Number node. Indicates when a user created a business phone number on their WhatsApp Business Account by completing the Embedded Signup flow.

## April 17, 2023

- [x] **#121** [Phone Numbers] Business Management API Added last_onboarded_time field to the GET /<WHATSAPP_BUSINESS_PHONE_NUMBER_ID> and GET <WABA_ID>/phone_numbers endpoints to enable sorting results by when a user last onboarded the Embedded Signup flow. If this parameter is not specified, the results are sorted in descending order.

## April 11, 2023

- [x] **#120** [Pre-Verified Phone Numbers] Cloud API Added WhatsApp Business Phone Number > Business Compliance Info endpoint for adding/updating a business phone number’s India-based compliance information.
- [x] **#119** [Embedded Signup] Added the following endpoints to support pre-verified business phone numbers for Embedded Signup users:
- [x] **#118** [WhatsApp Business Pre-Verified Phone Number] WhatsApp Business Pre-Verified Phone Number > Request Code WhatsApp Business Pre-Verified Phone Number > Verify Code Business > Add Phone Numbers In Version 2 of the Embedded Signup Flow, you can now retrieve both the phone number and WABA ID you selected by specifying the sessionInfoVersion inside the extras object at the end of the flow.

## April 4, 2023

- [x] **#117** [Message Templates] Business Management AI, Cloud API, On-Premises API The first template category migration is complete. Category validation is now part of the template review process for newly created templates. Applies to version v16.0+. API responses to template creation or editing requests now include template status and template category. Applies to all API versions. Added allow_category_change parameter to POST WhatsApp Business Account > Message Templates endpoint.
- [x] **#116** [Added INCORRECT_CATEGORY as a new rejection reason value for template status webhooks.] Templates that rely on variables now require sample values upon creation or editing. Applies to all versions.
- [x] **#115** [Added previous_category field to WhatsApp Message Templates.] Business-initiated conversations are no longer eligible for free tier conversations. If your WhatsApp Business Account relies on the services of a Solution Partner or a Meta partner, you are exempt from these changes until June 1, 2023.

## March 17, 2023

- [x] **#114** [Webhook SubscriptionsMessage Templates] Business Management API Added a new template_category_update webhook subscription field. If subscribed to this field, anytime a template’s category changes you will receive a webhook indicating the template’s previous and new category. API responses to template creation and editing requests now include the template’s status and category.

## March 14, 2023

- [x] **#113** [MessagesMessage Templates] Cloud API You can now share location information with users by adding a Location Header in your template.
- [x] **#112** [On-Premises API] Conversely, users can now share their location information with businesses via Location Request Messages.

## March 1, 2023

- [x] **#111** [Cloud API, On-Premises API] Migrating an India-based business phone number from On-Premises API to Cloud API no longer deletes its online selling compliance data⁠, so you no longer have to manually repopulate this data after migration.

## February 15, 2023

- [x] **#110** [Message Templates] Business Management API Added a new template comparison endpoint that allows you to compare template send counts and block ratios.

## February 3, 2023

- [x] **#109** [Cloud API, On-Premises API] Added a new WhatsApp Business Phone Number > Commerce Settings endpoint to enable/disable the shopping cart and product catalog on individual business phone numbers. See Set Commerce Settings for Cloud API and Set Commerce Settings for On-Premises API for usage instructions and to learn how these settings can help you sell products and services.

## February 2, 2023

- [x] **#108** [Webhook SubscriptionsMessage Templates] Business Management API, Cloud API Graph API version 16 is now available. Changes to message template categories, API error responses, and webhooks have been introduced as part of this version.
- [x] **#107** [Cloud API] Templates created or edited using v16.0 must now be categorized using one of the following categories; all other categories are no longer supported. Applies to Cloud API v16.0+. Will apply to all versions May 1, 2023. This change has been introduced to support our June 1, 2023 switch to a new conversation-based pricing model.
- [x] **#106** [AUTHENTICATION] MARKETING
- [x] **#105** [UTILITY] Error subcodes, which are rarely used and should not be relied upon, will no longer be included in v16.0+ error responses. Use code and details instead. Error code 100 ("code":100) had multiple unique titles which indicated the nature of a given 100 error. All code 100 errors will now use Invalid parameter as their title. Old titles that described the nature of a given code 100 error have been moved to the details property. This change is also now reflected in webhooks payloads that describe a c...
- [x] **#104** [Cloud API Webhooks] The errors object in webhooks triggered by v16.0+ request errors now include message and error_data.details properties, and title values have changed for multiple error codes. Now, errors objects have the following structure and data: [ { "code": <CODE>, "title" : "<TITLE>", "message": "<MESSAGE>", "error_data": { "details": "<DETAILS>" } }, ... ] The title property value has been updated for the following error codes. Their old values now appear in error_data.details. 130470 new title is now Re...
- [x] **#103** [These changes are reflected in the following errors properties in error-related webhooks:] entry.changes.value.errors entry.changes.value.messages.errors entry.changes.value.statuses.errors

## January 30, 2023

- [x] **#102** [Cloud API] Unverified businesses can now initiate up to 250 conversations in a rolling 24-hour period.

## January 10, 2023

- [x] **#101** [Embedded Signup] We have started rolling out the new embedded signup UI.

## December 13, 2022

- [x] **#100** [Phone Numbers] Cloud API Added new optional phone_number_id field to the Media endpoint. If you include this parameter and a business phone number ID, the operation will only be processed if the phone number ID matches the ID of the phone number upon which the media was uploaded.

## December 8, 2022

- [x] **#99** [MessagesWebhook Subscriptions] Cloud API
- [x] **#98** [Cloud API HTTP media caching is out of beta and available to everyone.] Cloud API will now reattempt to deliver failed webhooks notifications for up to 7 days instead of up to 30 days. See Webhooks Delivery Failure.

## November 23, 2022

- [x] **#97** [Webhook Subscriptions] Business Management API Added a new template_performance_metrics field. Notifies you weekly of all template performance metrics, including messages sent count, messages opened count, and top reasons for blocks.

## November 22, 2022

- [x] **#96** [Webhook SubscriptionsWhatsApp Business AccountPhone Numbers] Cloud API, Business Management API, Webhooks
- [x] **#95** [Webhooks] New account_alerts field: Added a new account_alerts field. Notifies you of Business, WhatsApp Business Account, and business phone number alerts. New account_update field values: Added a new account_update.events value: ACCOUNT_DELETED. Indicates that a phone number has been de-registered or deleted from a WhatsApp Business Account. Added a new message_template_status_update.events value: PENDING_DELETION. Indicates a message template has been marked for deletion.
- [x] **#94** [Sample Webhooks notifications that are sent when these new events are triggered:] ACCOUNT_DELETED : WhatsApp Business Account Deleted PENDING_DELETION : Template Message Pending Deletion
- [x] **#93** [New WhatsApp Business Account endpoint fields] Added the following WhatsApp Business Account node fields: country (applies to v15.0+) ownership_type (applies to v15.0+) business_verification_status (applies to all versions)
- [x] **#92** [New Business portfolio endpoint filters] Added the following filter options to the Business Client Whatsapp Business Accounts endpoint: Filter by WhatsApp Business Account creation_time field using GREATER_THAN, LESS_THAN, or IN_RANGE operators.
- [x] **#91** [Filter by WhatsApp Business Account ownership_type using EQUAL or IN operators.] Added the following filter options to the Business Owned WhatsApp Business Accounts endpoint: Filter by WhatsApp Business Account creation_time using GREATER_THAN, LESS_THAN, or IN_RANGE operators.
- [x] **#90** [Filter by WhatsApp Business Account ownership_type using EQUAL or IN operators.] Filter by WhatsApp Business Account country using EQUAL or IN operators. Applies to v15.0 and newer.
- [x] **#89** [New business phone number node fields] Added the following WhatsApp Business Phone Number node fields: is_official_business_account messaging_limit_tier In addition, you can filter WhatsApp Business Account Phone Numbers endpoint by is_official_business_account. Applies to v15.0 and newer.

## November 3, 2022

- [x] **#88** [Messages] Cloud API
- [x] **#87** [Messages Per Second] Cloud API now supports up to 500 (up from 350) messages per second (mps) of combined text and media messages, by request. See Throughput for details. If you already have 350 mps it will be increased to 500 mps automatically. If you already requested 350 mps but the process has not been completed, you will receive 500 mps upon completion.
- [x] **#86** [Media HTTP Caching] We are now beta testing Cloud API media HTTP caching. If you are a Solution Partner, see Media HTTP Caching to learn how to use headers in your server responses that instruct us to cache your media assets for reuse with future messages.
- [x] **#85** [Document Captions] Cloud API now supports captions on documents sent to and received from customers. See Media Object in the Media reference.

## October 25, 2022

- [x] **#84** [Message Templates] Business Management API
- [x] **#83** [Message Template Limit Increased] WhatsApp Business Accounts can now have up to 6,000 message templates if their parent business has been verified⁠ and at least one of the parent business’s WhatsApp Business Accounts has a business phone number with an approved display name⁠. As part of this change, translated versions of a message template now count against a WhatsApp Business Account’s template limit.

## October 20, 2022

- [x] **#82** [Cloud API] Businesses in India can now use a credit card to pay for messages sent using the platform. See Add a Credit Card to Your WhatsApp Business Platform Account⁠.

## October 12, 2022

- [x] **#81** [Phone Numbers] Business Management API You can now migrate a business phone number to and from Cloud API WhatsApp Business Accounts. See Migrate Phone Number to a Different WABA.

## October 11, 2022

- [x] **#80** [On-Premises API] v2.43 Starting in v2.43, there will be changes to the behavior of the contacts endpoint Responses for status will change. Regardless of whether a user has WhatsApp, it will always return valid for status in the response and a wa_id. There is no guarantee that the returned wa_id will be valid. These changes are applicable for both direct responses, as well as webhook responses for non-blocking calls Ensure your code avoids relying on status and wa_id returned in the contacts node. In addition, se...

## October 6, 2022

- [x] **#79** [Webhook SubscriptionsMessage Templates] Cloud API You can now use different callback URLs for each of your WhatsApp Business Accounts without having to create a unique app for each WhatsApp Business Account. See Overriding the Callback URL for details.
- [x] **#78** [All Cloud API endpoints now support version 15 calls.] Text parameters (components.parameters.text) for message templates that only use a body component (components.type:body) can now total up to 32,768 characters. See Parameters object. Cloud API now supports up to 350 (up from 250) messages per second (mps) of combined text and media messages, by request. See Throughput for details. If you already have 250 mps it will be increased to 350 mps automatically. If you already requested 250 mps but the process has not been completed, you will receive 35...
- [x] **#77** [Embedded Signup] Embedded Signup now supports mobile web browsers. The user interface will automatically optimize for a mobile experience when it detects that the viewer is using a mobile web browser.

## September 30, 2022

- [x] **#76** [Embedded Signup] Businesses that have been onboarded by a Solution Partner through the Embedded Signup or “On Behalf Of” process can now initiate up to 250 conversations with unique customers in a rolling 24-hour period, immediately.

## September 22, 2022

- [x] **#75** [MessagesWhatsApp Business Profile] Cloud API Reactions are now supported. See Send Messages - Reaction Messages to learn how to send and receive reactions and Payload Examples - Reaction Messages for webhook payload notification examples.

## September 19, 2022

- [x] **#74** [On-Premises API] v2.41.3 The v2.41.3 version of our Business API client added a new table index on message_receipt_log that could benefit partners with high throughput needs. For instance, this improvement allows partners to send more than 200 messages/second.

## September 7, 2022

- [x] **#73** [Cloud API] Latest documentation for requesting migration from 80 messages per second to 250 messages per second of combined sending and receiving of text and media messages is now available. See Throughput.

## August 25, 2022

- [x] **#72** [Messages] Cloud API You can now include animated stickers in outbound, business-initiated messages and receive message webhooks describing those messages the same way you would if you were sending a non-animated sticker. Refer to the Message object’s sticker property and for animated sticker asset requirements. You can now include products and services in messages sent to customers, and customers can add them to shopping carts without having to leave the chat thread. Refer to the Share Products guide to l...

## July 21, 2022

- [x] **#71** [Messages] Cloud API Businesses can now reply to any message in a conversation thread. Replies will include a contextual bubble referencing the replied-to message. Refer to the Send Messages guide to learn how to reply to a message. Cloud API now supports up to 250 messages per second of combined sending and receiving (inclusive of text and media messages), by request. If you are an enterprise partner you can open a Direct Support⁠ ticket to request 250 MPS throughput by selecting Question Topic: “Cloud AP...

## June 27, 2022

- [x] **#70** [Webhook SubscriptionsMessage Templates] On-Premises API Best practices for a seamless upgrade to v2.41.2 In v2.41.2, we are introducing DB schema changes to improve the performance of the system. As a result, upgrades from v2.37.2 and v2.39.x for set ups with large databases which have millions of message and contact entries will take longer than usual. Generally, perform upgrades during off-peak hours and upgrade lower-throughput setups first. For large databases, follow these steps: Run garbage collection via the /services/message/g...

## May 19, 2022

- [x] **#69** [Message Templates] Cloud API Starting today, the WhatsApp Business Cloud API is open to all developers building products or services for themselves or their organizations. To get started, see our guide. If you are interested in offering API access to your customers, please join our waitlist⁠.
- [x] **#68** [Business Management API] The following values for the category parameter for the /WHATSAPP-BUSINESS-ACCOUNT-ID/message_template endpoint have been deprecated for v14.0 and later:
- [x] **#67** [ACCOUNT_UPDATE] ALERT_UPDATE
- [x] **#66** [APPOINTMENT_UPDATE] AUTO_REPLY
- [x] **#65** [ISSUE_RESOLUTION] PAYMENT_UPDATE
- [x] **#64** [PERSONAL_FINANCE_UPDATE] RESERVATION_UPDATE
- [x] **#63** [SHIPPING_UPDATE] TICKET_UPDATE
- [x] **#62** [TRANSPORTATION_UPDATE] The following values have been added:
- [x] **#61** [TRANSACTIONAL] MARKETING

## May 10, 2022

- [x] **#60** [On-Premises API] v2.39.4 This client version contains all features and fixes shipped with v2.39.1. Additionally, this release: Fixes a bug that prevented video messages from being sent under certain circumstances. This fix was also included in v2.39.2. Fixes a bug that prevented businesses from sending messages to a customer, if the customer was the first to initiate an interaction between the two parties on WhatsApp, and that initiation happened more than 7 days ago. This fix was also included in v2.39.3. Fixes...

## May 4, 2022

- [x] **#59** [On-Premises API] v2.3.8 AWS Service Templates and Template URLs: Enterprise: https://wa-biz-cfn.s3-us-west-2.amazonaws.com/wa_ent.yml?versionId=0pACuWHFUL7U1RjxGcTkAsza7rj._5tK DB: https://wa-biz-cfn.s3-us-west-2.amazonaws.com/wa_ent_db.yml?versionId=4BtYzof0_z0yl7Pbat9mln8Xj5CYS07Z Lambda: https://wa-biz-cfn.s3-us-west-2.amazonaws.com/wa_ent_lambda.yml?versionId=o1JUcpuOHKfTU_hRExFxhib5YCeXeZx. Network: https://wa-biz-cfn.s3-us-west-2.amazonaws.com/wa_ent_net.yml?versionId=_D2yaFcS1zEqRLf23t2Wesnh3M.Qw1UF Monit...

## May 3, 2022

- [x] **#58** [Cloud API] Fixed an issue related to disappearing messages from users. Better determination of thumbnail quality for media messages.

## April 26, 2022

- [x] **#57** [On-Premises API] v2.3.7
- [x] **#56** [AWS Service Templates and Template URLs] Enterprise: https://wa-biz-cfn.s3-us-west-2.amazonaws.com/wa_ent.yml?versionId=bNECfwPYZZNGlhzkfCyheoQugydIiui4 DB: https://wa-biz-cfn.s3-us-west-2.amazonaws.com/wa_ent_db.yml?versionId=RRa0vGtuodHnWNyww8uLyZUAWFOfQ7hN Lambda: https://wa-biz-cfn.s3-us-west-2.amazonaws.com/wa_ent_lambda.yml?versionId=Sp2BO2LgxkVWH2XTxZ6pgOx3yf1xEqUQ Network: https://wa-biz-cfn.s3-us-west-2.amazonaws.com/wa_ent_net.yml?versionId=uNubDzGLs1WddCGB0EgEa6OMSF1vw4Mn Monitoring: https://wa-biz-cfn.s3-us-west-2.amazonaws...

## April 14, 2022

- [x] **#55** [Embedded Signup] We’re making it easier for businesses and partners to scale on the WhatsApp Business Platform with an improved onboarding experience. Starting May 2, 2022, businesses will be able to message customers immediately after signup and only need to complete Business Verification when they’re ready to scale business-initiated conversations or request to become an Official Business Account. The changes mean that onboarded businesses will be able to: Respond to unlimited customer-initiated conversations....

## April 5, 2022

- [x] **#54** [Cloud API] Starting today, the Cloud API is generally available to all existing Solution Partners and direct clients. Additionally, we’re releasing the following features for Cloud API developers: Messages with Stickers: Send media messages containing third-party static stickers. See the following documentation for more details: Reference, Messages and Reference, Media. We support inbound both and outbound stickers. For outbound, we only support static third-party stickers. For inbound, we support all type...

## March 26, 2022

- [x] **#53** [On-Premises API] v2.37.2 This version contains the same features as v2.37.1, but there’s a different expiration date. v2.37.2 expires on Sep 22, 2022. Known Issues: Some Kubernetes developers may see CrashLoopBackOff for their webapp container and their container may fail to start. To fix that, add following line in the Kubernetes deployment YML file under webapp configuration: command: ["/opt/whatsapp/bin/wait_on_mysql.sh", "/opt/whatsapp/bin/launch_within_docker.sh"]

## March 25, 2022

- [x] **#52** [Webhook Subscriptions] On-Premises API v2.39.3 The v2.39.3 version of our Business API client is available for developers today. The new client includes two fixes and additional logs to support debugging. The two fixes are: Fixed a bug that prevented businesses from sending messages to a customer, if the customer was the first to initiate an interaction between the two parties on WhatsApp, and that initiation happened more than 7 days ago. Fixed a bug that prevented businesses from receiving disappearing messages from...

## March 15, 2022

- [x] **#51** [MessagesWebhook Subscriptions] Cloud API
- [x] **#50** [List Messages and Reply Buttons] Starting today, Cloud API beta users can start sending and list and reply button messages. See the following documentation for more details:
- [x] **#49** [Reference, Messages] Webhooks: List Messages and Reply Button
- [x] **#48** [Webhooks, Components] Preview URL Starting today, Cloud API beta users can add a preview URL box to text messages that include a URL. See the following documentation for more details:
- [x] **#47** [Reference, Messages] New Documentation Guides

## March 4, 2022

- [x] **#46** [On-Premises API] v2.39.2 We just released the On-Premises API v2.39.2. This version fixes a bug that prevented video messages from being sent under certain circumstances. Known Issues: A bug exists that prevents businesses from sending messages to a customer, if the customer was the first to initiate an interaction between the two parties on WhatsApp, and that initiation happened more than 7 days ago. A bug exists that prevents businesses from receiving disappearing messages from customers.

## March 1, 2022

- [x] **#45** [MessagesWebhook Subscriptions] Cloud API Cloud API beta users can start sending and receiving video messages. The following documentation provides more information:
- [x] **#44** [Media, Upload Media] Supported Media Types
- [x] **#43** [Messages, Examples, Media Messages] Webhooks, Components

## February 1, 2022

- [x] **#42** [Messages] Cloud API Starting today, WhatsApp has switched from a notification-based pricing model to a conversation-based pricing model. Businesses are charged per conversation, which includes all messages delivered in a 24 hour session. See Conversation-Based Pricing for information. Starting today, Cloud API beta users can start sending and receiving location and contact messages. See the documentation below for more information: Reference, Messages: Location and Contacts
- [x] **#41** [Webhooks, Examples: Received Messages] We now support 80 messages per second peak throughput per phone number. This includes incoming and outgoing messages, as well as text, template and media messages.
- [x] **#40** [On-Premises API] v2.39.1 The 2.39.1 version of our Business API client is available for developers starting today. The new client includes: New field for the Set Shards API. New hostname added to network requirements. New error code 1031. Deprecations of the hsm type and the webhook_payload_conversation_pricingmodel_disabled application setting.
- [x] **#39** [Set Shards API] Starting with the new API client version, you may provide your phone’s certificate when you are setting up multiconnect. That means that, when calling the /v1/account/shards endpoint, you can add the Base64-encoded certificate in the cert field. See Scale Your API Client With Multiconnect for information.
- [x] **#38** [New Hostname] We have added graph.whatsapp.com to the list of WhatsApp server hostnames that the Business API client requires connectivity to. See Set Up and Debug Your Network, Hostnames for information.
- [x] **#37** [Error Code Updates] With v2.39, we have added error code 1031. You will get this error if your account has been locked and can’t send any messages due to an integrity policy violation. See Error and Status Messages and Policy Enforcement for information.
- [x] **#36** [Deprecations] Messages API: The hsm type has been deprecated with v2.39. You should use the template type instead. Application Setting: The application setting webhook_payload_conversation_pricingmodel_disabled has been deprecated.
- [x] **#35** [Known Issues] Some video messages fail to send under certain circumstances.

## November 15, 2021

- [x] **#34** [MessagesWebhook Subscriptions] Cloud API
- [x] **#33** [Audio Messages] Starting today, Cloud API beta users can start sending audio messages to their customers. For supported audio types, see our media documentation.
- [x] **#32** [Webhooks] We have updated our webhooks documentation to clarify the following: if you receive a message type that is not yet supported by Cloud API, you will be notified via an unknown message webhook. This means that, for the current API beta release, you will get an unknown message webhook if you receive any of the following message types: Media Messages (Video), Contact Messages, Location Messages, Stickers, Stickerpacks.

## October 21, 2021

- [x] **#31** [Cloud API] Feature Availability We have updated the list of features that will be available for the Cloud API Beta release. This is an updated snapshot of the features and their availability: Available for beta:
- [x] **#30** [Text Messages] Text-Based Message Templates Media Messages (Images and Documents)
- [x] **#29** [Media-Based Message Templates (Images and Documents)] Interactive Message Templates Not available for beta: Media Messages (Audio and Video)
- [x] **#28** [Media-Based Message Templates (Audio and Video)] Contact Messages
- [x] **#27** [Location Messages] Stickers and Stickerpacks
- [x] **#26** [List Messages] Dynamic Reply Buttons
- [x] **#25** [Multi-Product Messages] Endpoint Availability:
- [x] **#24** [The following endpoints will not be available for the Cloud API Beta release:] /PHONE_NUMBER_ID/deregister /PHONE_NUMBER_ID/application_settings Staged Onboarding: We’ve added specific instructions for each stage of the beta implementation. See more information here.
- [x] **#23** [Migrating Between On-Premises and Cloud API:] We’ve added instructions to migrate from the Cloud API back to On-Premises, if needed. See more information here.
- [x] **#22** [Filter] Marketing Messages
- [x] **#21** [MM Lite Onboarding] WhatsApp Business Account
- [x] **#20** [Message Templates] Messages
- [x] **#19** [Phone Numbers] WhatsApp Business Account On-Behalf Requests
- [x] **#18** [Conversational Automation] WhatsApp Business Account Users
- [x] **#17** [WhatsApp Business Profile] Multi-Partner Solutions
- [x] **#16** [Solution Migration] Calls
- [x] **#15** [Business Encryption] Official Business Account
- [x] **#14** [Webhook Subscriptions] Pre-Verified Phone Numbers
- [x] **#13** [Call Permissions] Phone Number Registration
- [x] **#12** [Phone Number Management] Phone Number Verification
- [x] **#11** [Pre-Verified Phone Number Sharing] Build with Meta AI
- [x] **#10** [Meta Horizon] Social technologies
- [x] **#9** [Wearables] News
- [x] **#8** [Meta for Developers] Blog
- [x] **#7** [Success stories] Support
- [x] **#6** [Developer Support] Bug tool
- [x] **#5** [Platform status] Developer community forum
- [x] **#4** [Report an incident] About us
- [x] **#3** [About] Careers
- [x] **#2** [Terms and policies] Responsible platform initiatives
- [x] **#1** [Platform terms] Developer policies
- [x] **#0** [Privacy policy] Cookies English (US)

---

**Progress: 411/412 (100%)**
