import { ConversationState, PrismaClient, TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script to populate the database with sample data
 * Run with: pnpm prisma:seed
 */
async function main() {
    console.log('🌱 Starting database seed...');

    // Clean existing data (optional - comment out to preserve data)
    console.log('🧹 Cleaning existing data...');
    await prisma.ticket.deleteMany();
    await prisma.conversation.deleteMany();

    // Create sample conversations
    console.log('📝 Creating sample conversations...');

    const conversation1 = await prisma.conversation.create({
        data: {
            userId: '14155552671',
            state: ConversationState.COMPLETED,
            userName: 'John Doe',
            issue: 'Unable to login to my account',
            category: TicketCategory.ACCOUNT_ACCESS,
            messageCount: 5,
            isActive: false,
        },
    });

    const conversation2 = await prisma.conversation.create({
        data: {
            userId: '14155552672',
            state: ConversationState.COLLECTING_ISSUE,
            userName: 'Jane Smith',
            messageCount: 2,
            isActive: true,
        },
    });

    const conversation3 = await prisma.conversation.create({
        data: {
            userId: '14155552673',
            state: ConversationState.COMPLETED,
            userName: 'Bob Johnson',
            issue: 'Payment declined',
            category: TicketCategory.BILLING_PAYMENT,
            messageCount: 6,
            isActive: false,
        },
    });

    console.log(`✅ Created ${3} conversations`);

    // Create sample tickets
    console.log('🎫 Creating sample tickets...');

    const ticket1 = await prisma.ticket.create({
        data: {
            ticketNumber: 'T-10001',
            conversationId: conversation1.id,
            userId: conversation1.userId,
            userName: conversation1.userName!,
            category: conversation1.category!,
            issue: conversation1.issue!,
            status: TicketStatus.RESOLVED,
            priority: TicketPriority.HIGH,
            assignedTo: 'support@example.com',
            resolution: 'Reset password link sent to user email',
            resolvedAt: new Date(),
            tags: ['account', 'password'],
            metadata: { source: 'whatsapp', channel: 'support-bot' },
        },
    });

    const ticket2 = await prisma.ticket.create({
        data: {
            ticketNumber: 'T-10002',
            conversationId: conversation3.id,
            userId: conversation3.userId,
            userName: conversation3.userName!,
            category: conversation3.category!,
            issue: conversation3.issue!,
            status: TicketStatus.IN_PROGRESS,
            priority: TicketPriority.URGENT,
            assignedTo: 'billing@example.com',
            tags: ['payment', 'billing'],
            metadata: { source: 'whatsapp', channel: 'support-bot' },
        },
    });

    // Create additional sample tickets for analytics
    const additionalTickets = await Promise.all([
        prisma.ticket.create({
            data: {
                ticketNumber: 'T-10003',
                conversationId: conversation1.id,
                userId: '14155552674',
                userName: 'Alice Williams',
                category: TicketCategory.TECHNICAL_SUPPORT,
                issue: 'App crashes on startup',
                status: TicketStatus.OPEN,
                priority: TicketPriority.HIGH,
                tags: ['bug', 'mobile'],
            },
        }),
        prisma.ticket.create({
            data: {
                ticketNumber: 'T-10004',
                conversationId: conversation1.id,
                userId: '14155552675',
                userName: 'Charlie Brown',
                category: TicketCategory.FEATURE_REQUEST,
                issue: 'Add dark mode support',
                status: TicketStatus.PENDING_INTERNAL,
                priority: TicketPriority.LOW,
                tags: ['feature', 'ui'],
            },
        }),
        prisma.ticket.create({
            data: {
                ticketNumber: 'T-10005',
                conversationId: conversation1.id,
                userId: '14155552676',
                userName: 'Diana Prince',
                category: TicketCategory.PRODUCT_INQUIRY,
                issue: 'What are the pricing plans?',
                status: TicketStatus.RESOLVED,
                priority: TicketPriority.MEDIUM,
                resolution: 'Sent pricing information',
                resolvedAt: new Date(Date.now() - 86400000), // 1 day ago
                tags: ['pricing', 'sales'],
            },
        }),
    ]);

    console.log(`✅ Created ${2 + additionalTickets.length} tickets`);

    console.log('✨ Database seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Conversations: ${await prisma.conversation.count()}`);
    console.log(`   - Tickets: ${await prisma.ticket.count()}`);
    console.log(`   - Open Tickets: ${await prisma.ticket.count({ where: { status: TicketStatus.OPEN } })}`);
    console.log(`   - Resolved Tickets: ${await prisma.ticket.count({ where: { status: TicketStatus.RESOLVED } })}`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
