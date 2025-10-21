---
"meta-cloud-api": minor
---

# Flow Webhook Handler Enhancements

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
  nextjsWebhookHandler
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
