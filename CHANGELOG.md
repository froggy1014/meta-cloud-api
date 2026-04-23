# meta-cloud-api

## 2.5.0

### Minor Changes

- 0cfa459: feat: add production middleware layer (retry, validation, tests)

  **Retry/Exponential Backoff**

  - New `retry` option in `WhatsAppConfig` for automatic retry on throttling errors
  - `WhatsAppThrottlingError` triggers retry with exponential backoff (1s → 2s → 4s)
  - Configurable `maxAttempts` (default: 3), `backoff`, and `initialDelayMs`

  **Input Validation**

  - New `WhatsAppValidationError` for client-side validation errors
  - `assertPhoneNumber()` validates E.164 format on all `messages.*` calls
  - `assertNonEmpty()` validates arrays in `blockUsers.block/unblock` and `groups.removeParticipants`

  **Tests**

  - Added unit tests for `blockUsers` module (was the only untested module)
  - Added tests for `validate.ts` utility functions
  - Added retry loop integration tests

  **README**

  - Updated webhook example with real API usage and correct export names

## 2.4.0

### Minor Changes

- c16d4b5: feat: add onRaw handler with WebhookField filter support

  Add `onRaw(handler, fields?)` to `WebhookProcessor` for bypassing raw
  Meta webhook payloads to external URLs while preserving the original
  `WebhookPayload` interface.

  When `fields` is provided, only matching `entry.changes` entries are
  forwarded; if no changes match, the handler is skipped entirely.

  Add `WebhookField` as-const object and `WebhookFieldType` union type
  for type-safe field filtering, covering all 32 supported webhook fields.

  ```ts
  import { WebhookField } from "meta-cloud-api";

  processor.onRaw(
    async (whatsapp, payload) => {
      await fetch("https://your-service.com/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    [WebhookField.AccountUpdate, WebhookField.Calls]
  );
  ```

## 2.3.0

### Minor Changes

- e3df37e: feat: add Calls webhook types

  Add TypeScript interfaces for the `calls` webhook field, based on the
  official Meta webhook sample payload. Includes `CallEntry` with all
  lifecycle event types (connect, call_status, media_update, terminate),
  `CallsValue` with metadata and contacts, and supporting enums.

- a84749c: feat: add Group API webhook types

  Add TypeScript interfaces for all four group lifecycle webhook fields:

  - `group_lifecycle_update` (group_create, group_delete)
  - `group_participants_update` (add, remove, join requests)
  - `group_settings_update` (subject, description, profile picture)
  - `group_status_update` (suspend, suspend_cleared)

  All types are based on official Meta webhook sample payloads.

- 4ad4c46: feat: add Marketing webhook types

  Add TypeScript interfaces for marketing-related webhook fields:

  - `automatic_events`: Meta ML-detected lead gen / purchase events from
    Click-to-WhatsApp ads (requires Embedded Signup opt-in)
  - `tracking_events`: Message delivery and click tracking events, with
    `events[]` array containing `event_name`, `timestamp`, and `tracking_data`

- 3fb48f0: feat: add Messaging handover webhook types

  Add TypeScript interfaces for messaging handover webhook fields:

  - `messaging_handovers`: WhatsApp handover protocol events with
    `control_passed`, `sender`, and `recipient` fields
  - `standby`: Delivered when the app is not the current thread owner
  - `user_preferences`: User opt-out events with `user_preferences[]`
    array containing category, value ("stop"), and contact profile info

- 875a862: feat: add Partner and Payment webhook types

  Add TypeScript interfaces for partner and payment webhook fields:

  - `partner_solutions`: Partner solution lifecycle events with
    `event`, `solution_id`, and `solution_status`
  - `payment_configuration_update`: Payment provider configuration
    changes with provider name, MID, status, and timestamps

- 81e46eb: feat: add handlers for 17 missing webhook fields

  Wire up handlers for all previously unsupported webhook fields in
  `WebhookProcessor` and `processWebhookMessages`:

  Groups: group_lifecycle_update, group_participants_update,
  group_settings_update, group_status_update

  Calls: calls

  Account: account_settings_update

  Business: business_status_update

  Marketing: automatic_events, tracking_events

  Messaging: message_echoes, messaging_handovers, standby, user_preferences

  Template: message_template_components_update,
  template_correct_category_detection

  Partner/Payment: partner_solutions, payment_configuration_update

  Each field has a corresponding on\*() registration method and
  type-safe handler/processed types.

- 50725c0: feat: expand existing webhook type definitions

  Update existing webhook type files based on official Meta API docs:

  - `account.ts`: Expand `account_update` with 10 new event types
    (ACCOUNT_OFFBOARDED, PARTNER_CLIENT_CERTIFICATION_STATUS_UPDATE,
    VOLUME_BASED_PRICING_TIER_UPDATE, etc.) and add
    `account_settings_update` with phone number calling configuration
  - `business.ts`: Add `business_status_update` webhook type
  - `messageEchoes.ts`: Add `message_echoes` types (distinct from
    `smb_message_echoes`)
  - `template.ts`: Add `message_template_components_update` and
    `template_correct_category_detection` webhook types

## 2.1.0

### Minor Changes

- Add comprehensive JSDoc with @see reference links to all 17 API modules, fix type safety issues (as any casts, showTypingIndicator status, MediaApi method call, config NaN), and add missing WABA account fields from official Graph API reference.

## 2.0.0

### Major Changes

- 8174951: # v2.0.0 - Complete Documentation Site & Production Examples

  This major release introduces a comprehensive documentation website, production-ready examples, and improved project structure with pnpm workspace.

  ## 🚨 Breaking Changes

  - **Workspace Migration**: Project now uses pnpm workspace for better monorepo management
  - **Examples Structure**: `express-example` renamed to `express-simple` for clarity

  ## ✨ New Features

  ### 📚 Complete Documentation Site (37 pages)

  - **Getting Started**: Installation, quick start, configuration guides
  - **API Reference**: Complete documentation for all 17 API modules
  - **Webhook Guides**: Express, Next.js, and custom webhook implementations
  - **Framework Guides**: Express, Next.js App/Pages Router integration
  - **Type Reference**: TypeScript types, enums, and interfaces
  - Built with Astro + Starlight theme
  - Full-text search with Pagefind
  - Mobile responsive design

  ### 🏗️ Production-Ready Express Example

  - Complete customer support bot with conversation flows
  - PostgreSQL database with Prisma ORM
  - Redis session management
  - BullMQ background job processing
  - Comprehensive error handling and logging
  - Full test suite (unit, integration, e2e)
  - Docker deployment ready
  - 57 files, 4,500+ lines of production code

  ### 🔄 CI/CD Workflows

  - Automated documentation deployment to Vercel
  - Example validation on pull requests
  - Type checking and build verification

  ### 📦 Improved Package Structure

  - pnpm workspace for efficient dependency management
  - Examples use `workspace:*` protocol for local SDK linking
  - Shared tooling configuration across packages

  ## 🎯 Documentation

  Visit the new documentation site at https://meta-cloud-api.site

  ## 📝 Examples

  - `express-simple`: Basic Express.js integration
  - `express-production`: Production-ready example with full features
  - `nextjs-app-router-example`: Next.js 15 App Router
  - `nextjs-page-router-example`: Next.js Pages Router

  ## 🙏 Credits

  Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

## 1.7.3

### Patch Changes

- a926c52: Improve PKCS#1 private key handling with automatic format conversion
  - Add automatic conversion of PKCS#1 format keys to PKCS#8 format when decryption fails
  - Support legacy keys encrypted with DES-EDE3-CBC algorithm by converting to AES-256-CBC
  - Export additional encryption utilities: `decryptFlowRequest` and `encryptFlowResponse`
  - Enhance error logging with detailed format detection and conversion attempt tracking
  - Improve error messages with helpful instructions for manual key conversion

## 1.7.2

### Patch Changes

- c0ed913: Implement comprehensive webhook field support with type-safe handlers

  Add full support for Meta Cloud API webhook fields with granular field-level type definitions and handler registration. This update introduces a robust webhook processing system that allows developers to handle specific webhook fields (messages, account updates, flows, etc.) with complete type safety.

  **Features:**

  - Add WebhookProcessor class for field-specific handler registration and processing
  - Add comprehensive type definitions for all webhook fields:
    - Account updates (account_update, account_alerts)
    - App state sync (app_state_sync)
    - Business updates (business_capability_update, business_account_review_update, business_status_update)
    - Flows (flows)
    - Message history (history)
    - Messages (messages)
    - Message echoes (message_echoes)
    - Phone number updates (phone_number_name_update, phone_number_quality_update)
    - Security (security)
    - Status updates (statuses)
    - Template updates (message_template_status_update, template_category_update)
  - Add webhook field type guards and utilities for runtime validation
  - Add example implementations for account updates, flows, and message history handlers

  **Type System Improvements:**

  - Organize webhook types into modular files by field category
  - Add detailed TypeScript interfaces for all webhook notification structures
  - Add proper type exports and re-exports for better developer experience
  - Improve type safety with discriminated unions for different field types

  **Examples:**

  - Add Express example demonstrating field-specific webhook handler registration
  - Add handler implementations for common webhook scenarios
  - Show best practices for processing different webhook field types

  **Breaking Changes:**
  None - this is an additive change that maintains backward compatibility with existing webhook handlers.

## 1.6.1

### Patch Changes

- 219650b: Improve Flow encryption utilities with validation and better logging
  - Add validation for required environment variables (FLOW_API_PRIVATE_PEM, FLOW_API_PASSPHRASE) in decryptFlowRequest
  - Enhance all log messages with function context prefixes ([generateEncryption], [decryptFlowRequest], [encryptFlowResponse])
  - Remove sensitive information (PEM preview) from error logs for better security
  - Clean up and standardize logging messages throughout encryption utilities

## 1.6.0

### Minor Changes

- 0677594: ## Features

  ### Type-Safe Specialized Handlers

  Add 13 specialized handler methods for better type safety and developer experience:

  - `onText()`, `onImage()`, `onVideo()`, `onAudio()`, `onDocument()`, `onSticker()`
  - `onInteractive()`, `onButton()`, `onLocation()`, `onContacts()`
  - `onReaction()`, `onOrder()`, `onSystem()`

  These methods provide automatic type narrowing, eliminating the need for optional chaining.

  **Example:**

  ```typescript
  bot.processor.onText(async (whatsapp, processed) => {
    const { message } = processed;
    console.log(message.text.body); // ✅ No optional chaining needed!
  });
  ```

  ### Consistent Message ID Access

  Add `messageId` property to `ProcessedMessage` type for consistent message ID access across all message types:

  - Automatically extracts ID from the correct location based on message type
  - For most messages: uses `message.id`
  - For interactive/button replies (e.g., `nfm_reply`): uses `message.context.id`

  **Example:**

  ```typescript
  bot.processor.onMessagePreProcess(async (whatsapp, processed) => {
    // Works for all message types, including nfm_reply
    await whatsapp.messages.markAsRead({ messageId: processed.messageId });
  });
  ```

  ### Flow Response Support

  Add support for WhatsApp Flow responses (`nfm_reply` message type):

  - New `InteractiveNfmReplyMessage` type for Flow response messages
  - Proper type definitions for Flow webhook data

  ## Documentation

  - Update README with comprehensive examples of specialized handlers
  - Add examples showing messageId usage across different message types
  - Document TypeScript discriminated union approach for type narrowing

  console.log("🚀 ~ ## Features

  ### Type-Safe Specialized Handlers

  Add 13 specialized handler methods for better type safety and developer experience:

  - `onText()`, `onImage()`, `onVideo()`, `onAudio()`, `onDocument()`, `onSticker()`
  - `onInteractive()`, `onButton()`, `onLocation()`, `onContacts()`
  - `onReaction()`, `onOrder()`, `onSystem()`

  These methods provide automatic type narrowing, eliminating the need for optional chaining.

  **Example:**

  ```typescript
  bot.processor.onText(async (whatsapp, processed) => {
    const { message } = processed;
    console.log(message.text.body); // ✅ No optional chaining needed!
  });
  ```

  ### Consistent Message ID Access

  Add `messageId` property to `ProcessedMessage` type for consistent message ID access across all message types:

  - Automatically extracts ID from the correct location based on message type
  - For most messages: uses `message.id`
  - For interactive/button replies (e.g., `nfm_reply`): uses `message.context.id`

  **Example:**

  ```typescript
  bot.processor.onMessagePreProcess(async (whatsapp, processed) => {
    // Works for all message types, including nfm_reply
    await whatsapp.messages.markAsRead({ messageId: processed.messageId });
  });
  ```

  ### Flow Response Support

  Add support for WhatsApp Flow responses (`nfm_reply` message type):

  - New `InteractiveNfmReplyMessage` type for Flow response messages
  - Proper type definitions for Flow webhook data

  ## Documentation

  - Update README with comprehensive examples of specialized handlers
  - Add examples showing messageId usage across different message types
  - Document TypeScript discriminated union approach for type narrowing
    :", ## Features

  ### Type-Safe Specialized Handlers

  Add 13 specialized handler methods for better type safety and developer experience:

  - `onText()`, `onImage()`, `onVideo()`, `onAudio()`, `onDocument()`, `onSticker()`
  - `onInteractive()`, `onButton()`, `onLocation()`, `onContacts()`
  - `onReaction()`, `onOrder()`, `onSystem()`

  These methods provide automatic type narrowing, eliminating the need for optional chaining.

  **Example:**

  ```typescript
  bot.processor.onText(async (whatsapp, processed) => {
    const { message } = processed;
    console.log(message.text.body); // ✅ No optional chaining needed!
  });
  ```

  ### Consistent Message ID Access

  Add `messageId` property to `ProcessedMessage` type for consistent message ID access across all message types:

  - Automatically extracts ID from the correct location based on message type
  - For most messages: uses `message.id`
  - For interactive/button replies (e.g., `nfm_reply`): uses `message.context.id`

  **Example:**

  ```typescript
  bot.processor.onMessagePreProcess(async (whatsapp, processed) => {
    // Works for all message types, including nfm_reply
    await whatsapp.messages.markAsRead({ messageId: processed.messageId });
  });
  ```

  ### Flow Response Support

  Add support for WhatsApp Flow responses (`nfm_reply` message type):

  - New `InteractiveNfmReplyMessage` type for Flow response messages
  - Proper type definitions for Flow webhook data

  ## Documentation

  - Update README with comprehensive examples of specialized handlers
  - Add examples showing messageId usage across different message types
  - Document TypeScript discriminated union approach for type narrowing
    )

## 1.5.0

### Minor Changes

- 0bf91c0: ## Features

  ### Type-Safe Specialized Handlers

  Add 13 specialized handler methods for better type safety and developer experience:

  - `onText()`, `onImage()`, `onVideo()`, `onAudio()`, `onDocument()`, `onSticker()`
  - `onInteractive()`, `onButton()`, `onLocation()`, `onContacts()`
  - `onReaction()`, `onOrder()`, `onSystem()`

  These methods provide automatic type narrowing, eliminating the need for optional chaining.

  **Example:**

  ```typescript
  bot.processor.onText(async (whatsapp, processed) => {
    const { message } = processed;
    console.log(message.text.body); // ✅ No optional chaining needed!
  });
  ```

  ### Consistent Message ID Access

  Add `messageId` property to `ProcessedMessage` type for consistent message ID access across all message types:

  - Automatically extracts ID from the correct location based on message type
  - For most messages: uses `message.id`
  - For interactive/button replies (e.g., `nfm_reply`): uses `message.context.id`

  **Example:**

  ```typescript
  bot.processor.onMessagePreProcess(async (whatsapp, processed) => {
    // Works for all message types, including nfm_reply
    await whatsapp.messages.markAsRead({ messageId: processed.messageId });
  });
  ```

  ### Flow Response Support

  Add support for WhatsApp Flow responses (`nfm_reply` message type):

  - New `InteractiveNfmReplyMessage` type for Flow response messages
  - Proper type definitions for Flow webhook data

  ## Documentation

  - Update README with comprehensive examples of specialized handlers
  - Add examples showing messageId usage across different message types
  - Document TypeScript discriminated union approach for type narrowing

## 1.4.1

### Patch Changes

- 49d462f: Consolidate encryption utilities and clean up verbose logging

  - Merge generateEncryption into flowEncryptionUtils for better code organization
  - Remove duplicate encryption functions from webhookUtils
  - Remove verbose debug logging from webhook processing

- 49d462f: Add dedicated status handler with improved type system

  **New Feature:**

  - Add `onStatus(handler)` method to WebhookProcessor for handling status updates
  - Introduce new types: `ProcessedMessage`, `ProcessedStatus`, `StatusHandler`

  **Breaking Change:**

  - `MessageTypesEnum.Statuses` is now deprecated
  - Using `onMessage(MessageTypesEnum.Statuses, handler)` will throw an error
  - Migrate to `onStatus(handler)` for better type safety

  **Migration:**

  ```typescript
  // Before (deprecated)
  processor.onMessage(MessageTypesEnum.Statuses, (whatsapp, message) => {
    // handle status
  });

  // After (recommended)
  processor.onStatus((whatsapp, processed) => {
    // processed.status: StatusWebhook
    console.log(processed.status);
  });
  ```

## 1.4.0

### Minor Changes

- bc8b13d: Add Conversational Automation API support for WhatsApp Business Phone Numbers

  This release adds support for configuring conversational components on WhatsApp Business phone numbers:

  - **Welcome Messages**: Configure automatic welcome messages for first-time users
  - **Ice Breakers (Prompts)**: Set up to 4 tappable prompts (max 80 characters each) to help users start conversations
  - **Commands**: Define up to 30 slash commands (max 32 chars name, 256 chars description) for easy user interactions

  New API methods:

  - `phoneNumber.setConversationalAutomation()` - Configure conversational components (POST)
  - `phoneNumber.getConversationalAutomation()` - Retrieve current configuration (GET)

  New TypeScript types:

  - `ConversationalAutomationRequest` - Request payload for configuration
  - `ConversationalAutomationResponse` - Response with current settings
  - `ConversationalCommand` - Command configuration object
  - `ConversationalPrompt` - Ice breaker prompt string

  For more details, see: https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components

### Patch Changes

- 34c7fc6: Add getThroughput API for phone number throughput monitoring

  - Add `getThroughput()` method to PhoneNumberApi class
  - Returns current throughput level (STANDARD, HIGH, or NOT_APPLICABLE)
  - Add comprehensive unit tests for throughput API
  - Add example file demonstrating throughput monitoring and eligibility checking
  - Support for checking phone number messaging capacity (80 mps default, up to 1,000 mps)

- 8ccdaa4: Add block user API for managing blocked WhatsApp users

  - Add `blockUsers` API with block, unblock, and list methods
  - Support for blocking/unblocking users by phone number or WhatsApp ID
  - Pagination support for listing blocked users
  - Comprehensive unit tests and examples included

- 8144883: Enhanced type exports for improved type inference in onMessage webhook handler

  **Changes:**

  - Exported all specific message type interfaces (TextMessage, ImageMessage, VideoMessage, etc.) from the main package
  - Exported discriminated union types for webhook values (MessageWebhookValue, StatusWebhookValue, ErrorWebhookValue)
  - Exported complete webhook payload types (WebhookValue, StatusWebhook, WebhookPayload)

  **Benefits:**

  - Better TypeScript IntelliSense when working with `onMessage` callback parameters
  - Proper type narrowing based on message type discriminators
  - Users can now import and use specific message types for type annotations
  - Improved developer experience with autocomplete for all message properties

  **Example:**

  ```typescript
  import { TextMessage, ImageMessage, WhatsAppMessage } from "meta-cloud-api";

  client.onMessage((message: WhatsAppMessage) => {
    if (message.type === "text") {
      // TypeScript now knows this is a TextMessage
      console.log(message.text.body);
    } else if (message.type === "image") {
      // TypeScript now knows this is an ImageMessage
      console.log(message.image.id);
    }
  });
  ```

  **Migration:**
  No breaking changes - existing code continues to work. The new exports simply provide better type support for developers who want explicit type annotations.

- 82665d1: remove builder pattern for ease
- 0ebca06: Improve webhook types based on WhatsApp official documentation

  **Changes:**

  - Added discriminated union types for webhook values (MessageWebhookValue, StatusWebhookValue, ErrorWebhookValue)
  - Added specific message type interfaces for all WhatsApp message types (Text, Image, Video, Audio, Document, Sticker, Interactive, Button, Location, Contacts, Reaction, Order, System, Unsupported)
  - Added context types for forwarded messages, product inquiries, and interactive replies (ForwardedContext, ProductContext, ReplyContext)
  - Added Click to WhatsApp ad referral tracking support (ReferralInfo)
  - Added support for group messages with group_id field
  - Added Unsupported message type to MessageTypesEnum
  - Interactive messages now properly discriminated between list_reply and button_reply

  **Migration:**
  No changes required - existing code continues to work as before. The new types provide better IntelliSense and type checking internally.

## 1.3.0

### Minor Changes

- 6c8d8df: # Flow Webhook Handler Enhancements

  ## 🎯 Major Features

  ### Flow Type-Specific Handler Registration

  Introduced granular Flow webhook handler registration with support for three distinct flow types:

  - **Ping (Health Check)**: Automatic endpoint health verification from WhatsApp
  - **Error Notification**: Error notifications from WhatsApp client
  - **Data Exchange**: Interactive flow data exchanges with end users

  Users can now register handlers for specific flow types using `FlowTypeEnum.Ping`, `FlowTypeEnum.Error`, and `FlowTypeEnum.Change`, enabling more organized and maintainable code structure.

  ### Automatic Default Handlers for Ping and Error

  Ping and Error handlers are now **automatically handled by default** if not explicitly registered. This significantly reduces boilerplate code - users only need to register the `FlowTypeEnum.Change` handler for their business logic. The library automatically returns standard-compliant responses for Ping and Error requests, while still allowing custom handlers to be registered when needed.

  ### TypeScript Type Safety Improvements

  Eliminated all `any` types from webhook handlers, replacing them with explicit `WebhookResponse` return types:

  - `handleGet`, `handlePost`, and `handleFlow` now return `Promise<WebhookResponse>`
  - Improved error handling with proper type propagation
  - Better IntelliSense and compile-time type checking

  ## 🏗️ Breaking Changes

  ### Framework Handler Naming Clarification

  Renamed framework-specific handlers for better clarity:

  - `nextjsWebhookHandler` → `nextjsPagesWebhookHandler` (Next.js Pages Router)
  - `nextjsAppWebhookHandler` remains unchanged (Next.js App Router)
  - `expressWebhookHandler` remains unchanged

  **Migration:**

  ```typescript
  // Before
  import { nextjsWebhookHandler } from "meta-cloud-api";

  // After
  import { nextjsPagesWebhookHandler } from "meta-cloud-api";
  ```

  ### Removed Backward Compatibility Aliases

  Removed `webhookHandler` aliases from all framework handlers to prevent confusion. Each framework now has a single, explicit handler name.

  ### Internal-Only Type Guards

  Removed public exports of flow type guard functions (`isFlowPingRequest`, `isFlowErrorRequest`, `isFlowDataExchangeRequest`). These are now internal implementation details as the library automatically handles flow type detection.

  ## 🐛 Bug Fixes

  ### Next.js API Handler Return Value Fix

  Fixed "API handler should not return a value" error in Next.js Pages Router. Handlers now properly send responses without returning values, conforming to Next.js API route specifications.

  ### Improved Error Handling

  Enhanced error handling across all webhook handlers:

  - Properly throw errors instead of returning response objects in catch blocks
  - Added response sending before throwing to ensure clients receive error responses
  - Consistent error response format across all frameworks

  ## 🧹 Code Quality Improvements

  ### Removed Debug Logging

  Cleaned up all `console.log` statements from production code, reducing noise in production environments while maintaining proper error logging through the Logger utility.

  ### Directory Structure Reorganization

  Renamed internal directory structure for consistency:

  - `src/core/webhook/frameworks/nextjs/` → `src/core/webhook/frameworks/nextjs-page/`
  - Corresponding file renames: `nextjs.ts` → `nextjs-page.ts`

  ## 📝 Developer Experience Improvements

  ### Simplified Flow Handler Registration

  **Before:**

  ```typescript
  flowHandler.processor.onFlow(FlowTypeEnum.Ping, createFlowPingResponse);
  flowHandler.processor.onFlow(FlowTypeEnum.Error, createFlowErrorResponse);
  flowHandler.processor.onFlow(
    FlowTypeEnum.Change,
    async (_whatsapp, request) => {
      // Custom logic
    }
  );
  ```

  **After:**

  ```typescript
  // Ping and Error are automatically handled!
  flowHandler.processor.onFlow(
    FlowTypeEnum.Change,
    async (_whatsapp, request) => {
      // Only implement your business logic
    }
  );
  ```

  ### Cleaner Imports

  Reduced necessary imports:

  ```typescript
  // Before
  import {
    createFlowErrorResponse,
    createFlowPingResponse,
    isFlowPingRequest,
    isFlowErrorRequest,
    nextjsWebhookHandler,
  } from "meta-cloud-api";

  // After
  import { nextjsPagesWebhookHandler } from "meta-cloud-api";
  ```

  ## 🔄 Handler Priority Logic

  Refined handler selection priority for better predictability:

  **For Ping and Error types:**

  1. Use registered specific handler if available
  2. Fallback to automatic default handler (does NOT fallback to `All` handler)

  **For Data Exchange (Change) type:**

  1. Use registered `Change` handler if available
  2. Fallback to `All` handler
  3. Return 404 if no handler found

  This ensures Ping and Error always receive proper responses while giving developers flexibility for data exchange handling.

  ## 📦 Internal Improvements

  - Enhanced type safety throughout the webhook processing pipeline
  - Improved code organization and readability
  - Better separation of concerns between framework-specific and core logic
  - Consistent error handling patterns across all implementations

## 1.2.0

### Minor Changes

- 34f780a: add missing debug check on logger class and parsing object correctly with inspect

## 1.1.0

### Minor Changes

- df83318: implement nextjs app router webhook handler and refactoring architecture of handlers

### Patch Changes

- bcccf06: export flow related types
