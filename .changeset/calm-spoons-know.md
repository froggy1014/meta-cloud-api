---
'meta-cloud-api': patch
---

Improve PKCS#1 private key handling with automatic format conversion

- Add automatic conversion of PKCS#1 format keys to PKCS#8 format when decryption fails
- Support legacy keys encrypted with DES-EDE3-CBC algorithm by converting to AES-256-CBC
- Export additional encryption utilities: `decryptFlowRequest` and `encryptFlowResponse`
- Enhance error logging with detailed format detection and conversion attempt tracking
- Improve error messages with helpful instructions for manual key conversion
