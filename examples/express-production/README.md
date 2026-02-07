# WhatsApp Support Bot - Production Ready Express.js Example

A complete, production-ready WhatsApp customer support bot built with Express.js and meta-cloud-api. Features conversation flows, ticket management, queue processing, and comprehensive observability.

## Features

- **Conversation State Machine**: Guided multi-step conversation flows for ticket creation
- **Ticket Management**: Full CRUD operations with status tracking and categorization
- **Queue Processing**: Background job processing with BullMQ for notifications and ticket handling
- **Session Management**: Redis-based session storage with automatic cleanup
- **Database Integration**: PostgreSQL with Prisma ORM for data persistence
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Observability**: Structured logging with Winston, health checks, and metrics
- **Type Safety**: Full TypeScript with strict mode and comprehensive type definitions
- **Testing**: Unit, integration, and E2E tests with Vitest
- **Docker Support**: Multi-stage Dockerfile and docker-compose for easy deployment

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  WhatsApp   │────────>│  Express.js  │────────>│  PostgreSQL │
│   Business  │         │     API      │         │   Database  │
│    API      │<────────│   (Webhook)  │<────────│   (Prisma)  │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              │
                              v
                        ┌──────────┐
                        │  Redis   │
                        │ Sessions │
                        │  Cache   │
                        └──────────┘
                              │
                              │
                              v
                        ┌──────────┐
                        │  BullMQ  │
                        │  Queues  │
                        └──────────┘
                              │
                              v
                        ┌──────────┐
                        │ Workers  │
                        │  - Notifications │
                        │  - Tickets       │
                        └──────────┘
```

## Conversation Flow

The bot guides users through a structured conversation to create support tickets:

```
1. User sends "Hi"
   → Bot sends welcome message with "New Issue" button

2. User clicks "New Issue"
   → Bot asks: "What's your name?"
   → State: COLLECTING_NAME

3. User replies: "John Doe"
   → Bot asks: "Please describe your issue"
   → State: COLLECTING_ISSUE

4. User replies: "Payment failed"
   → Bot shows category list (Technical Support, Billing, etc.)
   → State: SELECTING_CATEGORY

5. User selects: "Billing & Payment"
   → Bot shows summary with Confirm/Cancel buttons
   → State: CONFIRMING_TICKET

6. User clicks "Confirm"
   → Bot creates ticket and sends ticket number
   → State: COMPLETED
   → Ticket stored in database
   → Notification sent to support team
```

### State Machine Transitions

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> COLLECTING_NAME: New Issue
    COLLECTING_NAME --> COLLECTING_ISSUE: Name provided
    COLLECTING_ISSUE --> SELECTING_CATEGORY: Issue described
    SELECTING_CATEGORY --> CONFIRMING_TICKET: Category selected
    CONFIRMING_TICKET --> COMPLETED: Confirmed
    CONFIRMING_TICKET --> CANCELLED: Cancelled
    COMPLETED --> IDLE: Reset
    CANCELLED --> IDLE: Reset
```

## Project Structure

```
express-production/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data
├── src/
│   ├── config/                # Configuration
│   │   ├── index.ts          # Environment validation
│   │   ├── logger.ts         # Winston logger
│   │   ├── database.ts       # Prisma client
│   │   └── redis.ts          # Redis client
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.ts  # Global error handling
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   ├── requestLogger.ts # HTTP logging
│   │   ├── validator.ts     # Zod validation
│   │   └── security.ts      # Helmet & CORS
│   ├── services/             # Business logic
│   │   ├── whatsapp/
│   │   │   ├── client.ts    # WhatsApp client singleton
│   │   │   ├── sender.ts    # Message sending with retry
│   │   │   └── templates.ts # Message templates
│   │   ├── conversation/
│   │   │   ├── stateMachine.ts  # State transitions
│   │   │   ├── sessionStore.ts  # Redis sessions
│   │   │   └── flows.ts         # Conversation flows
│   │   ├── tickets/
│   │   │   ├── ticketService.ts # Ticket CRUD
│   │   │   └── categories.ts    # Category metadata
│   │   └── queue/
│   │       ├── queueManager.ts  # BullMQ setup
│   │       └── workers/
│   │           ├── notificationWorker.ts
│   │           └── ticketWorker.ts
│   ├── handlers/             # Message & webhook handlers
│   │   ├── messages/
│   │   │   ├── text.ts      # Text message handler
│   │   │   ├── interactive.ts # Button/list handler
│   │   │   ├── media.ts     # Media handlers
│   │   │   └── index.ts
│   │   └── webhooks/
│   │       ├── status.ts    # Status updates
│   │       ├── flows.ts     # Flow webhooks
│   │       └── index.ts
│   ├── routes/               # Express routes
│   │   ├── webhook.ts       # WhatsApp webhook
│   │   ├── health.ts        # Health checks
│   │   ├── api/
│   │   │   └── tickets.ts   # Ticket REST API
│   │   └── index.ts
│   ├── utils/                # Utilities
│   │   ├── responses.ts     # Response builders
│   │   ├── validation.ts    # Validators
│   │   ├── formatters.ts    # Formatters
│   │   └── errors.ts        # Custom errors
│   ├── types/                # Type definitions
│   │   ├── index.ts
│   │   ├── conversation.ts
│   │   └── ticket.ts
│   ├── app.ts                # Express app factory
│   ├── server.ts             # HTTP server
│   └── workers/
│       └── index.ts          # Worker process
├── tests/                     # Tests
│   ├── setup.ts              # Test setup
│   ├── fixtures/             # Test data
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # E2E tests
├── Dockerfile                # Multi-stage build
├── docker-compose.yml        # Full stack setup
├── .env.example              # Environment template
├── .gitignore
├── tsconfig.json             # TypeScript config
├── vitest.config.ts          # Vitest config
├── package.json
└── README.md
```

## Setup & Installation

### Prerequisites

- Node.js >= 18
- pnpm >= 10
- PostgreSQL >= 14
- Redis >= 7
- WhatsApp Business Account with Cloud API access

### 1. Clone and Install

```bash
cd examples/express-production
pnpm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

```env
# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFICATION_TOKEN=your_webhook_token

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whatsapp_bot

# Redis
REDIS_URL=redis://localhost:6379

# Optional: Support team notifications
SUPPORT_TEAM_PHONE=14155552671
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed sample data (optional)
pnpm prisma:seed

# View database in Prisma Studio
pnpm prisma:studio
```

### 4. Development

```bash
# Start API server
pnpm dev

# Start worker process (in another terminal)
pnpm worker

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Docker Deployment

### Development with Docker Compose

```bash
# Start all services (PostgreSQL, Redis, App, Worker)
pnpm docker:up

# Stop all services
pnpm docker:down

# View logs
docker compose logs -f app
docker compose logs -f worker
```

### Production Deployment

```bash
# Build production image
pnpm docker:build

# Deploy to your container platform
# (Kubernetes, ECS, Cloud Run, etc.)
```

## API Endpoints

### Webhook Endpoints

- `GET /webhook` - Webhook verification
- `POST /webhook` - Receive WhatsApp events

### Health Check Endpoints

- `GET /health` - Overall health status
- `GET /health/ready` - Readiness probe (K8s)
- `GET /health/live` - Liveness probe (K8s)

### REST API Endpoints

- `GET /api/tickets` - List tickets (with filtering)
- `GET /api/tickets/:id` - Get ticket by ID
- `GET /api/tickets/number/:ticketNumber` - Get ticket by number
- `GET /api/tickets/user/:userId` - Get user's tickets
- `GET /api/tickets/stats` - Get ticket statistics
- `PATCH /api/tickets/:id/status` - Update ticket status
- `PATCH /api/tickets/:id/assign` - Assign ticket
- `PATCH /api/tickets/:id/priority` - Update priority
- `PATCH /api/tickets/:id/tags` - Add tags
- `DELETE /api/tickets/:id` - Delete ticket

## Configuration

All configuration is managed through environment variables validated with Zod.

### Key Configuration Options

```env
# Server
PORT=3000
NODE_ENV=production

# Session
SESSION_TIMEOUT=1800  # 30 minutes
SESSION_CLEANUP_INTERVAL=600000  # 10 minutes

# Queue
QUEUE_ATTEMPTS=3
QUEUE_BACKOFF_DELAY=5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info  # error, warn, info, debug
LOG_FORMAT=json  # json, simple

# Security
CORS_ORIGIN=*
HELMET_ENABLED=true

# Features
ENABLE_ANALYTICS=true
ENABLE_AUTO_REPLIES=true
ENABLE_TICKET_REMINDERS=true
```

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm vitest run src/api/messages/__test__/unit.test.ts

# Run with coverage
pnpm test --coverage

# Run E2E tests
pnpm test:e2e
```

### Test Structure

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test handlers and routes with mocked dependencies
- **E2E Tests**: Test complete conversation flows

## Monitoring & Observability

### Logging

Structured JSON logging with Winston:

```typescript
logger.info('Ticket created', {
    ticketNumber: 'T-10001',
    userId: '14155552671',
    category: 'TECHNICAL_SUPPORT'
});
```

### Health Checks

- `/health` - Checks database, Redis, WhatsApp API, and queues
- `/health/ready` - Kubernetes readiness probe
- `/health/live` - Kubernetes liveness probe

### Metrics

Monitor these metrics:

- Message processing rate
- Ticket creation rate
- Queue depth and processing time
- Session count and TTL
- Error rates by type

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Rate Limiting**: Configured for webhook and API endpoints
3. **Input Validation**: All inputs validated with Zod
4. **SQL Injection**: Protected by Prisma ORM
5. **CORS**: Configurable allowed origins
6. **Helmet**: Security headers enabled
7. **Error Handling**: No sensitive info in error responses

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Set Redis URL with authentication
- [ ] Configure WhatsApp webhook URL
- [ ] Set webhook verification token
- [ ] Configure CORS allowed origins
- [ ] Set support team phone number
- [ ] Enable production logging (`LOG_FORMAT=json`)
- [ ] Configure health check endpoints
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Set resource limits (CPU, memory)
- [ ] Enable SSL/TLS
- [ ] Configure rate limits
- [ ] Test graceful shutdown
- [ ] Set up log aggregation

## Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check DATABASE_URL is correct
# Verify PostgreSQL is running
docker compose logs postgres
```

**Redis connection failed**
```bash
# Check REDIS_URL is correct
# Verify Redis is running
docker compose logs redis
```

**Webhook not receiving messages**
```bash
# Verify webhook URL is publicly accessible
# Check WHATSAPP_WEBHOOK_VERIFICATION_TOKEN matches
# View webhook logs
docker compose logs app | grep webhook
```

**Queue jobs not processing**
```bash
# Check worker is running
docker compose logs worker
# Verify Redis connection
```

## Contributing

This is an example project. For issues or improvements to meta-cloud-api itself, please visit the main repository.

## License

MIT License - See LICENSE file in the root repository.

## Support

For questions about this example:
- Review the code comments
- Check the main meta-cloud-api documentation
- Open an issue in the main repository

## Related Documentation

- [meta-cloud-api Documentation](../../README.md)
- [WhatsApp Business Platform API](https://developers.facebook.com/docs/whatsapp)
- [Prisma Documentation](https://www.prisma.io/docs)
- [BullMQ Documentation](https://docs.bullmq.io)
- [Express.js Documentation](https://expressjs.com)

---

Built with meta-cloud-api
