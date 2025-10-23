# meta-cloud-api

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
    import { TextMessage, ImageMessage, WhatsAppMessage } from 'meta-cloud-api';

    client.onMessage((message: WhatsAppMessage) => {
        if (message.type === 'text') {
            // TypeScript now knows this is a TextMessage
            console.log(message.text.body);
        } else if (message.type === 'image') {
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
    import { nextjsWebhookHandler } from 'meta-cloud-api';

    // After
    import { nextjsPagesWebhookHandler } from 'meta-cloud-api';
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
    flowHandler.processor.onFlow(FlowTypeEnum.Change, async (_whatsapp, request) => {
        // Custom logic
    });
    ```

    **After:**

    ```typescript
    // Ping and Error are automatically handled!
    flowHandler.processor.onFlow(FlowTypeEnum.Change, async (_whatsapp, request) => {
        // Only implement your business logic
    });
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
    } from 'meta-cloud-api';

    // After
    import { nextjsPagesWebhookHandler } from 'meta-cloud-api';
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
