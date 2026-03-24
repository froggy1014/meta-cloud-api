import { getServerClient } from './supabase';

// ============================================================================
// Session management
// ============================================================================

export async function createOrUpdateSession(phoneNumber: string, displayName?: string) {
    const supabase = getServerClient();
    const windowExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('sessions')
        .upsert(
            {
                phone_number: phoneNumber,
                display_name: displayName || undefined,
                last_message_at: new Date().toISOString(),
                window_expires_at: windowExpires,
            },
            { onConflict: 'phone_number' },
        )
        .select()
        .single();

    if (error) {
        console.error('[event-store] Session upsert error:', error);
    }
    return data;
}

export async function getSession(sessionId: string) {
    const supabase = getServerClient();
    const { data, error } = await supabase.from('sessions').select('*').eq('id', sessionId).single();

    if (error) {
        console.error('[event-store] Get session error:', error);
        return null;
    }
    return data;
}

export async function getSessionByPhone(phoneNumber: string) {
    const supabase = getServerClient();
    const { data, error } = await supabase.from('sessions').select('*').eq('phone_number', phoneNumber).single();

    if (error) return null;
    return data;
}

// ============================================================================
// Message management
// ============================================================================

export async function addMessage(params: {
    waMessageId: string;
    direction: 'sent' | 'received';
    fromNumber?: string;
    toNumber?: string;
    type?: string;
    content?: Record<string, unknown>;
    status?: string;
    sessionId?: string;
}) {
    const supabase = getServerClient();
    const { data, error } = await supabase
        .from('messages')
        .upsert(
            {
                wa_message_id: params.waMessageId,
                direction: params.direction,
                from_number: params.fromNumber,
                to_number: params.toNumber,
                type: params.type || 'text',
                content: params.content || {},
                status: params.status || 'sending',
                session_id: params.sessionId,
            },
            { onConflict: 'wa_message_id' },
        )
        .select()
        .single();

    if (error) {
        console.error('[event-store] Insert message error:', error);
    }
    return data;
}

export async function updateMessageStatus(waMessageId: string, status: string) {
    const supabase = getServerClient();
    const { error } = await supabase.from('messages').update({ status }).eq('wa_message_id', waMessageId);

    if (error) {
        console.error('[event-store] Update status error:', error);
    }
}

// ============================================================================
// Webhook event logging
// ============================================================================

export async function addWebhookEvent(params: {
    eventType: string;
    waMessageId?: string;
    status?: string;
    rawPayload?: unknown;
}) {
    const supabase = getServerClient();
    const { error } = await supabase.from('webhook_events').insert({
        event_type: params.eventType,
        wa_message_id: params.waMessageId,
        status: params.status,
        raw_payload: params.rawPayload,
    });

    if (error) {
        console.error('[event-store] Insert webhook event error:', error);
    }
}
