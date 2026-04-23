---
"meta-cloud-api": minor
---

feat: add Partner and Payment webhook types

Add TypeScript interfaces for partner and payment webhook fields:
- `partner_solutions`: Partner solution lifecycle events with
  `event`, `solution_id`, and `solution_status`
- `payment_configuration_update`: Payment provider configuration
  changes with provider name, MID, status, and timestamps
