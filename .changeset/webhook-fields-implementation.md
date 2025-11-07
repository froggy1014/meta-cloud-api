---
"meta-cloud-api": patch
---

Implement comprehensive webhook field support with type-safe handlers

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
