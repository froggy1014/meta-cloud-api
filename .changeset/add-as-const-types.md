---
"meta-cloud-api": minor
---

Add `as const` object and union type alternatives for all enums

- Every enum in `enums.ts` now has a matching `as const` object and union type in `constants.ts`
- Available via `meta-cloud-api/types` import path
- Use whichever style you prefer: `CategoryEnum.Marketing` (enum) or `Category.Marketing` (as const)
- Union types available for type narrowing: `CategoryType`, `LanguagesType`, `MessageTypesType`, etc.
