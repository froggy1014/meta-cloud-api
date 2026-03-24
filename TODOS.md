# TODOS

## Playwright E2E Test Automation
**Priority:** Medium
**Added:** 2026-03-22 (plan-eng-review)
**Depends on:** Demo chat app completion + stabilization

Automate the full ping-pong E2E test (send message → webhook status → UI update) using Playwright against the demo-chat app. Requires solving the CI tunnel problem: GitHub Actions needs inbound webhook access, which means either running cloudflared in CI, using a custom runner with a public IP, or a webhook relay service.

**Start here:** Write Playwright tests locally first (against `next start` + manual ngrok), then solve CI networking.

## SDK Webhook Subpath Exports
**Priority:** Low
**Added:** 2026-03-22 (plan-eng-review)
**Depends on:** Nothing

Add dedicated subpath exports for webhook framework adapters:
- `meta-cloud-api/webhook/nextjs-app`
- `meta-cloud-api/webhook/express`
- `meta-cloud-api/webhook/nextjs-page`

Currently all webhook utilities are re-exported from the main entry point, which works but forces tree-shaking tools to parse the entire SDK. Subpath exports would allow `import { nextjsAppWebhookHandler } from 'meta-cloud-api/webhook/nextjs-app'` with zero bundle overhead from unrelated modules.

**Start here:** Add exports entries to `package.json` pointing to `./dist/core/webhook/frameworks/{adapter}/index.js`. Ensure types are co-exported.

## Supabase Data TTL — Auto-cleanup for Free Tier
**Priority:** Medium
**Added:** 2026-03-24 (plan-eng-review)
**Depends on:** Supabase 테이블 생성 + demo-chat Supabase 적용 완료

Supabase free tier는 DB 500MB 제한. `webhook_events` 테이블의 `raw_payload` JSONB가 누적되면 빠르게 용량 소모. 30일 이상 된 데이터를 자동 삭제하는 메커니즘 필요.

Options: (1) Supabase Edge Function을 cron으로 실행 (pg_cron은 free tier에서 제한적), (2) 앱 시작 시 오래된 데이터 정리, (3) Vercel cron job.

**Start here:** Supabase Edge Function으로

## DESIGN.md — Project Design System
**Priority:** Low
**Added:** 2026-03-24 (plan-design-review)
**Depends on:** demo-chat 구현 완료 + 안정화

프로젝트 전체 디자인 시스템(DESIGN.md) 생성. 현재 demo-chat 플랜에 미니 토큰을 정의했지만, 웹사이트와 데모 앱 간 일관된 디자인 언어가 필요할 때 `/design-consultation`으로 생성.

**Start here:** `/design-consultation` 실행. 기존 웹사이트(dark theme, WhatsApp green accents)와 demo-chat 토큰을 입력으로 활용.

## Supabase Data TTL — Auto-cleanup for Free Tier
**Priority:** Medium
**Added:** 2026-03-24 (plan-eng-review)
**Depends on:** Supabase 테이블 생성 + demo-chat Supabase 적용 완료

Supabase free tier는 DB 500MB 제한. `webhook_events` 테이블의 `raw_payload` JSONB가 누적되면 빠르게 용량 소모. 30일 이상 된 데이터를 자동 삭제하는 메커니즘 필요.

Options: (1) Supabase Edge Function을 cron으로 실행 (pg_cron은 free tier에서 제한적), (2) 앱 시작 시 오래된 데이터 정리, (3) Vercel cron job.

**Start here:** `DELETE FROM webhook_events WHERE created_at < NOW() - INTERVAL '30 days'` + `DELETE FROM messages WHERE created_at < NOW() - INTERVAL '30 days'`를 매일 실행.
