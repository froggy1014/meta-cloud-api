# 개선된 import 방식 예시 코드

이 문서에서는 앞서 제안한 트리 쉐이킹 개선 방안을 적용한 예시 코드를 제시합니다. 현재 barrel 파일을 통한 import 방식에서 트리 쉐이킹이 효과적으로 작동하는 방식으로 변경하는 방법을 단계별로 설명합니다.

## 1. 명시적 export 방식으로 변경

### 현재 방식 (barrel 파일)

현재 프로젝트에서는 다음과 같이 barrel 파일을 통해 모든 내용을 export하고 있습니다:

**src/features/messages/index.ts**
```typescript
export * from './types';
export { default, default as MessagesApi } from './MessageApi';
export type {
    AudioMediaObject,
    ContactObject,
    DocumentMediaObject,
    ImageMediaObject,
    InteractiveObject,
    LocationObject,
    MessageRequestParams,
    MessagesResponse,
    MessageTemplateObject,
    ReactionParams,
    StatusParams,
    StickerMediaObject,
    TextMessageParams,
    TextObject,
    VideoMediaObject,
} from './types';
```

**src/features/index.ts**
```typescript
// Messages
export * from './messages';

// Media
export * from './media';

// Business features
export * from './profile';

// 기타 모듈들...
```

**src/index.ts**
```typescript
// Core exports
import { IRequest, IResponse, WebhookHandler } from './core/webhook';
import { WhatsApp } from './core/whatsapp';

// Default export
export default WhatsApp;

// Core exports
export { WebhookHandler, type IRequest, type IResponse };

// Feature exports
export * from './features';

// Shared exports
export * from './shared';
```

### 개선된 방식 (명시적 export)

트리 쉐이킹을 효과적으로 적용하기 위해 명시적 export 방식으로 변경합니다:

**src/features/messages/index.ts**
```typescript
import MessageApi from './MessageApi';

// 기본 export 유지
export default MessageApi;

// 명시적 named export
export { MessageApi };

// 필요한 타입만 명시적으로 export
export type {
    AudioMediaObject,
    ContactObject,
    DocumentMediaObject,
    ImageMediaObject,
    InteractiveObject,
    LocationObject,
    MessageRequestParams,
    MessagesResponse,
    MessageTemplateObject,
    ReactionParams,
    StatusParams,
    StickerMediaObject,
    TextMessageParams,
    TextObject,
    VideoMediaObject,
} from './types';
```

**src/features/index.ts**
```typescript
// Messages - 명시적 export
export { default as MessagesApi } from './messages';
export type {
    MessageRequestParams,
    MessagesResponse,
    TextMessageParams,
    // 필요한 타입들...
} from './messages';

// Media - 명시적 export
export { default as MediaApi } from './media';
export type {
    MediaObject,
    MediaResponse,
    // 필요한 타입들...
} from './media';

// 다른 모듈들도 동일하게 명시적 export로 변경
```

**src/index.ts**
```typescript
// Core exports - 명시적 import 및 export
import { WebhookHandler } from './core/webhook';
import { WhatsApp } from './core/whatsapp';

// Default export
export default WhatsApp;

// Core exports - 명시적 export
export { WebhookHandler };
export type { IRequest, IResponse } from './core/webhook';

// Feature exports - 명시적 export
export { MessagesApi } from './features/messages';
export { MediaApi } from './features/media';
export { ProfileApi } from './features/profile';
// 기타 필요한 API 클래스들...

// 필요한 타입들만 명시적으로 export
export type { MessageRequestParams, MessagesResponse } from './features/messages';
export type { MediaObject, MediaResponse } from './features/media';
// 기타 필요한 타입들...

// Shared exports - 필요한 것만 명시적으로 export
export { HttpClient } from './shared/http';
export { formatUrl, parseResponse } from './shared/utils';
export type { ApiConfig, ApiResponse } from './shared/types';
```

## 2. 경로 별칭(Path Aliases) 설정 및 사용

### tsconfig.json 설정

경로 별칭을 사용하기 위해 tsconfig.json 파일을 다음과 같이 수정합니다:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"]
    },
    // 기존 설정 유지
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "node",
    // 기타 설정...
  }
}
```

### 경로 별칭을 사용한 import 예시

경로 별칭을 사용하면 다음과 같이 직접적인 import가 가능합니다:

**src/features/messages/MessageApi.ts**
```typescript
// 변경 전
import { HttpClient } from '@shared/http';
import { formatUrl } from '@shared/utils';
import { ApiConfig } from '@shared/types';

// 변경 후 - 경로 별칭 사용
import { HttpClient } from '@shared/http';
import { formatUrl } from '@shared/utils';
import { ApiConfig } from '@shared/types';
```

**사용자 코드 예시**
```typescript
// 변경 전 - barrel 파일을 통한 import
import { WhatsApp, MessagesApi, MediaApi } from 'meta-cloud-api';

// 변경 후 - 필요한 모듈만 직접 import
import WhatsApp from 'meta-cloud-api';
import { MessagesApi } from 'meta-cloud-api/messages';
import { MediaApi } from 'meta-cloud-api/media';
```

## 3. 서브패키지 구조 예시

대규모 프로젝트의 경우, 서브패키지 구조를 도입하여 각 기능을 독립적인 패키지로 분리할 수 있습니다.

### 프로젝트 구조 변경

```
meta-cloud-api/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── webhook/
│   │   │   ├── whatsapp/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── messages/
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── MessageApi.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── media/
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── MediaApi.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/
│       ├── src/
│       │   ├── http/
│       │   ├── types/
│       │   ├── utils/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── package.json
└── tsconfig.json
```

### 루트 package.json

```json
{
  "name": "meta-cloud-api",
  "version": "0.2.15",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

### 서브패키지 package.json 예시 (core)

```json
{
  "name": "@meta-cloud-api/core",
  "version": "0.2.15",
  "description": "Core functionality for Meta's Cloud API",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "tsup --clean",
    "test": "vitest run",
    "lint": "eslint ."
  },
  "dependencies": {
    "@meta-cloud-api/shared": "0.2.15"
  },
  "publishConfig": {
    "access": "public"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  }
}
```

### 서브패키지 index.ts 예시 (core)

```typescript
// packages/core/src/index.ts
import { WhatsApp } from './whatsapp';
import { WebhookHandler } from './webhook';

// Default export
export default WhatsApp;

// Named exports
export { WhatsApp, WebhookHandler };

// Type exports
export type { IRequest, IResponse } from './webhook';
```

### 서브패키지 사용 예시

```typescript
// 서브패키지 import 예시
import WhatsApp from '@meta-cloud-api/core';
import { MessagesApi } from '@meta-cloud-api/messages';
import { MediaApi } from '@meta-cloud-api/media';
import { formatUrl } from '@meta-cloud-api/shared';

// 사용 예시
const whatsapp = new WhatsApp({
  accessToken: 'your-access-token',
  phoneNumberId: 'your-phone-number-id',
});

const messagesApi = new MessagesApi(whatsapp);
const mediaApi = new MediaApi(whatsapp);
```

## 4. 번들러 설정 최적화 예시

### tsup.config.ts (단일 패키지 구조)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    core: 'src/core/index.ts',
    messages: 'src/features/messages/index.ts',
    media: 'src/features/media/index.ts',
    profile: 'src/features/profile/index.ts',
    // 각 기능별 엔트리 포인트 추가
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  splitting: true,
  treeshake: true,
  target: 'es2022',
  platform: 'node',
  external: ['node:*', 'crypto', 'fs', 'path', 'url', 'util'],
});
```

### package.json exports 필드 설정

```json
{
  "name": "meta-cloud-api",
  "version": "0.2.15",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./core": {
      "types": "./dist/core.d.ts",
      "import": "./dist/core.js",
      "default": "./dist/core.js"
    },
    "./messages": {
      "types": "./dist/messages.d.ts",
      "import": "./dist/messages.js",
      "default": "./dist/messages.js"
    },
    "./media": {
      "types": "./dist/media.d.ts",
      "import": "./dist/media.js",
      "default": "./dist/media.js"
    },
    "./profile": {
      "types": "./dist/profile.d.ts",
      "import": "./dist/profile.js",
      "default": "./dist/profile.js"
    },
    // 각 기능별 export 추가
    "./package.json": "./package.json"
  }
}
```

### 서브패키지 구조의 tsup.config.ts (예: messages 패키지)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  target: 'es2022',
  platform: 'node',
  external: [
    '@meta-cloud-api/core',
    '@meta-cloud-api/shared',
    'node:*',
    'crypto',
    'fs',
    'path',
    'url',
    'util'
  ],
});
```

## 5. 사이드 이펙트 최소화 예시

### package.json에 sideEffects 필드 추가

```json
{
  "name": "meta-cloud-api",
  "version": "0.2.15",
  "sideEffects": false,
  // 또는 특정 파일에만 사이드 이펙트가 있는 경우
  "sideEffects": [
    "*.css",
    "src/features/registration/polyfills.ts"
  ]
}
```

### 모듈 내 사이드 이펙트 최소화

**변경 전 - 사이드 이펙트가 있는 코드**
```typescript
// src/features/registration/index.ts

// 모듈 로드 시 즉시 실행되는 코드 (사이드 이펙트)
console.log('Registration module loaded');
initializeRegistration();

// 내보내기
export * from './types';
export { default } from './RegistrationApi';
```

**변경 후 - 사이드 이펙트 제거**
```typescript
// src/features/registration/index.ts

// 사이드 이펙트 제거 - 필요한 경우에만 명시적으로 호출하도록 변경
export function initializeRegistration() {
  console.log('Registration initialized');
  // 초기화 로직...
}

// 명시적 export
export { default as RegistrationApi } from './RegistrationApi';
export type {
  RegistrationParams,
  RegistrationResponse,
  // 필요한 타입들...
} from './types';
```

## 6. 실제 사용 예시 비교

### 변경 전 (barrel 파일을 통한 import)

```typescript
// 사용자 코드
import { WhatsApp, MessagesApi, MediaApi } from 'meta-cloud-api';

const whatsapp = new WhatsApp({
  accessToken: 'your-access-token',
  phoneNumberId: 'your-phone-number-id',
});

const messagesApi = new MessagesApi(whatsapp);
const mediaApi = new MediaApi(whatsapp);

// 메시지 전송
await messagesApi.sendText({
  to: 'recipient-phone-number',
  text: 'Hello, World!',
});
```

### 변경 후 (최적화된 import)

**단일 패키지 구조**
```typescript
// 사용자 코드 - 필요한 모듈만 직접 import
import WhatsApp from 'meta-cloud-api';
import { MessagesApi } from 'meta-cloud-api/messages';
import { MediaApi } from 'meta-cloud-api/media';

const whatsapp = new WhatsApp({
  accessToken: 'your-access-token',
  phoneNumberId: 'your-phone-number-id',
});

const messagesApi = new MessagesApi(whatsapp);
const mediaApi = new MediaApi(whatsapp);

// 메시지 전송
await messagesApi.sendText({
  to: 'recipient-phone-number',
  text: 'Hello, World!',
});
```

**서브패키지 구조**
```typescript
// 사용자 코드 - 서브패키지 import
import WhatsApp from '@meta-cloud-api/core';
import { MessagesApi } from '@meta-cloud-api/messages';
import { MediaApi } from '@meta-cloud-api/media';

const whatsapp = new WhatsApp({
  accessToken: 'your-access-token',
  phoneNumberId: 'your-phone-number-id',
});

const messagesApi = new MessagesApi(whatsapp);
const mediaApi = new MediaApi(whatsapp);

// 메시지 전송
await messagesApi.sendText({
  to: 'recipient-phone-number',
  text: 'Hello, World!',
});
```

## 결론

이 문서에서는 트리 쉐이킹을 효과적으로 적용하기 위한 다양한 방식의 예시 코드를 제시했습니다. 명시적 export, 경로 별칭, 서브패키지 구조, 번들러 설정 최적화, 사이드 이펙트 최소화 등의 방법을 통해 트리 쉐이킹을 효과적으로 적용할 수 있습니다.

다음 섹션에서는 이러한 변경을 실제로 구현하기 위한 가이드라인과 마이그레이션 전략을 제시하겠습니다.

