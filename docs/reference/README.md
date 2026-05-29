# Meta OpenAPI Reference

This directory vendors Meta's official WhatsApp Business Platform OpenAPI snapshot so SDK changes can be checked without relying on a live browser session.

- Source: `https://raw.githubusercontent.com/facebook/openapi/main/business-messaging-api_v23.0.yaml`
- Local snapshot: `docs/reference/business-messaging-api_v23.0.yaml`
- Captured: 2026-05-29

Do not edit the YAML by hand. Refresh it from the official source, then review the diff before changing SDK behavior.

```sh
curl -L https://raw.githubusercontent.com/facebook/openapi/main/business-messaging-api_v23.0.yaml \
    -o docs/reference/business-messaging-api_v23.0.yaml
```

Useful checks:

```sh
rg -n "operationId: createFlow|InteractiveObject:|MarketingMessageRequestPayload:" docs/reference/business-messaging-api_v23.0.yaml
```
