import { afterAll, afterEach, beforeAll, vi } from 'vitest';

/**
 * Test environment setup
 * Configures mocks and test utilities
 */

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.WHATSAPP_ACCESS_TOKEN = 'test_token';
process.env.WHATSAPP_PHONE_NUMBER_ID = '123456789012345';
process.env.WHATSAPP_WEBHOOK_VERIFICATION_TOKEN = 'test_verify_token';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests

/**
 * Mock external dependencies
 */

// Mock WhatsApp client
const mockWhatsAppClient = {
    messages: {
        text: vi.fn().mockResolvedValue({ messages: [{ id: 'msg_123' }] }),
        replyButtons: vi.fn().mockResolvedValue({ messages: [{ id: 'msg_123' }] }),
        list: vi.fn().mockResolvedValue({ messages: [{ id: 'msg_123' }] }),
        template: vi.fn().mockResolvedValue({ messages: [{ id: 'msg_123' }] }),
    },
    phone: {
        get: vi.fn().mockResolvedValue({ verified_name: 'Test Business' }),
    },
};

const mockWebhookProcessor = {
    onText: vi.fn(),
    onInteractive: vi.fn(),
    onImage: vi.fn(),
    onDocument: vi.fn(),
    onVideo: vi.fn(),
    onAudio: vi.fn(),
    onStatus: vi.fn(),
    onFlows: vi.fn(),
    on: vi.fn(),
};

vi.mock('meta-cloud-api', () => ({
    WhatsApp: vi.fn().mockImplementation(() => mockWhatsAppClient),
    expressWebhookHandler: vi.fn().mockImplementation((config) => ({
        client: mockWhatsAppClient,
        processor: mockWebhookProcessor,
        GET: vi.fn((req, res) => {
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];

            // Validate required parameters
            if (!mode || !token || !challenge) {
                return res.status(400).send('Missing required parameters');
            }

            // Verify token
            if (mode === 'subscribe' && token === config.webhookVerificationToken) {
                return res.status(200).send(challenge);
            }

            // Invalid token
            return res.status(403).send('Forbidden');
        }),
        POST: vi.fn((req, res) => res.status(200).json({ success: true })),
    })),
}));

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
    PrismaClient: vi.fn().mockImplementation(() => ({
        $connect: vi.fn().mockResolvedValue(undefined),
        $disconnect: vi.fn().mockResolvedValue(undefined),
        $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
        $on: vi.fn(),
        conversation: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        ticket: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
            groupBy: vi.fn(),
        },
    })),
    ConversationState: {
        IDLE: 'IDLE',
        COLLECTING_NAME: 'COLLECTING_NAME',
        COLLECTING_ISSUE: 'COLLECTING_ISSUE',
        SELECTING_CATEGORY: 'SELECTING_CATEGORY',
        CONFIRMING_TICKET: 'CONFIRMING_TICKET',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED',
    },
    TicketCategory: {
        TECHNICAL_SUPPORT: 'TECHNICAL_SUPPORT',
        BILLING_PAYMENT: 'BILLING_PAYMENT',
        ACCOUNT_ACCESS: 'ACCOUNT_ACCESS',
        PRODUCT_INQUIRY: 'PRODUCT_INQUIRY',
        FEATURE_REQUEST: 'FEATURE_REQUEST',
        BUG_REPORT: 'BUG_REPORT',
        GENERAL_INQUIRY: 'GENERAL_INQUIRY',
        OTHER: 'OTHER',
    },
    TicketStatus: {
        OPEN: 'OPEN',
        IN_PROGRESS: 'IN_PROGRESS',
        PENDING_USER: 'PENDING_USER',
        PENDING_INTERNAL: 'PENDING_INTERNAL',
        RESOLVED: 'RESOLVED',
        CLOSED: 'CLOSED',
        CANCELLED: 'CANCELLED',
    },
    TicketPriority: {
        LOW: 'LOW',
        MEDIUM: 'MEDIUM',
        HIGH: 'HIGH',
        URGENT: 'URGENT',
    },
}));

// Mock Redis client
const mockRedisClient = {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(-1),
    keys: vi.fn().mockResolvedValue([]),
    ping: vi.fn().mockResolvedValue('PONG'),
    quit: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn(),
    on: vi.fn(),
    status: 'ready',
};

vi.mock('ioredis', () => ({
    default: vi.fn(() => mockRedisClient),
}));

// Mock BullMQ
vi.mock('bullmq', () => ({
    Queue: vi.fn().mockImplementation(() => ({
        add: vi.fn().mockResolvedValue({ id: 'job_123' }),
        getJob: vi.fn().mockResolvedValue(null),
        getJobCounts: vi.fn().mockResolvedValue({ waiting: 0, active: 0, completed: 0, failed: 0 }),
        getWaitingCount: vi.fn().mockResolvedValue(0),
        getActiveCount: vi.fn().mockResolvedValue(0),
        getCompletedCount: vi.fn().mockResolvedValue(0),
        getFailedCount: vi.fn().mockResolvedValue(0),
        getDelayedCount: vi.fn().mockResolvedValue(0),
        pause: vi.fn().mockResolvedValue(undefined),
        resume: vi.fn().mockResolvedValue(undefined),
        clean: vi.fn().mockResolvedValue([]),
        close: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
    })),
    Worker: vi.fn().mockImplementation(() => ({
        close: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
        closing: false,
    })),
}));

/**
 * Global test setup
 */
beforeAll(() => {
    // Setup global test environment
});

/**
 * Clean up after each test
 */
afterEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
});

/**
 * Global test teardown
 */
afterAll(() => {
    // Cleanup
    vi.restoreAllMocks();
});
