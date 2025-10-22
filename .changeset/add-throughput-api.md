---
'meta-cloud-api': patch
---

Add getThroughput API for phone number throughput monitoring

- Add `getThroughput()` method to PhoneNumberApi class
- Returns current throughput level (STANDARD, HIGH, or NOT_APPLICABLE)
- Add comprehensive unit tests for throughput API
- Add example file demonstrating throughput monitoring and eligibility checking
- Support for checking phone number messaging capacity (80 mps default, up to 1,000 mps)
