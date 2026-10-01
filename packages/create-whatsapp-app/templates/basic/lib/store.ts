import { EventEmitter } from 'node:events';

/**
 * In-memory conversation store with a change feed for the browser (SSE).
 * Good enough for local dev and a single server. Swap for a database when you
 * deploy more than one instance.
 *
 * Kept on globalThis so Next.js hot reload does not wipe the chat.
 */

export interface ChatMessage {
    id: string;
    /** WhatsApp ID (phone number) of the customer this message belongs to. */
    contact: string;
    direction: 'in' | 'out';
    text: string;
    at: number;
    status?: 'sent' | 'delivered' | 'read' | 'failed';
    error?: string;
}

export interface Contact {
    waId: string;
    name: string;
    lastAt: number;
}

interface Store {
    messages: ChatMessage[];
    contacts: Map<string, Contact>;
    events: EventEmitter;
}

const g = globalThis as typeof globalThis & { __waStore?: Store };

function store(): Store {
    if (!g.__waStore) {
        const events = new EventEmitter();
        events.setMaxListeners(100);
        g.__waStore = { messages: [], contacts: new Map(), events };
    }
    return g.__waStore;
}

const MAX_MESSAGES = 500;

export function addMessage(msg: ChatMessage, contactName?: string): void {
    const s = store();
    s.messages.push(msg);
    if (s.messages.length > MAX_MESSAGES) s.messages.splice(0, s.messages.length - MAX_MESSAGES);
    const prev = s.contacts.get(msg.contact);
    const contact: Contact = { waId: msg.contact, name: contactName || prev?.name || msg.contact, lastAt: msg.at };
    s.contacts.set(msg.contact, contact);
    s.events.emit('change', { type: 'message', message: msg, contact });
}

export function updateStatus(id: string, status: ChatMessage['status'], error?: string): void {
    const s = store();
    const msg = s.messages.find((m) => m.id === id);
    if (!msg) return;
    msg.status = status;
    if (error) msg.error = error;
    s.events.emit('change', { type: 'message', message: msg, contact: s.contacts.get(msg.contact) });
}

export function snapshot(): { messages: ChatMessage[]; contacts: Contact[] } {
    const s = store();
    return {
        messages: s.messages,
        contacts: [...s.contacts.values()].sort((a, b) => b.lastAt - a.lastAt),
    };
}

export function subscribe(listener: (event: unknown) => void): () => void {
    const s = store();
    s.events.on('change', listener);
    return () => s.events.off('change', listener);
}
