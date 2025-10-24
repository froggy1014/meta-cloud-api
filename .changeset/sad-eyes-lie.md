---
'meta-cloud-api': patch
---

Improve Flow encryption utilities with validation and better logging

- Add validation for required environment variables (FLOW_API_PRIVATE_PEM, FLOW_API_PASSPHRASE) in decryptFlowRequest
- Enhance all log messages with function context prefixes ([generateEncryption], [decryptFlowRequest], [encryptFlowResponse])
- Remove sensitive information (PEM preview) from error logs for better security
- Clean up and standardize logging messages throughout encryption utilities
