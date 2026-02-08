import type { Application } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../../src/app.js';
import { buttonReplyWebhook, listReplyWebhook, textMessageWebhook } from '../../fixtures/webhooks.js';

describe('Webhook Routes', () => {
    let app: Application;

    beforeAll(() => {
        app = createApp();
    });

    describe('GET /webhook', () => {
        it('should verify webhook with correct token', async () => {
            const response = await request(app).get('/webhook').query({
                'hub.mode': 'subscribe',
                'hub.verify_token': 'test_verify_token',
                'hub.challenge': 'test_challenge',
            });

            expect(response.status).toBe(200);
            expect(response.text).toBe('test_challenge');
        });

        it('should reject webhook with incorrect token', async () => {
            const response = await request(app).get('/webhook').query({
                'hub.mode': 'subscribe',
                'hub.verify_token': 'wrong_token',
                'hub.challenge': 'test_challenge',
            });

            expect(response.status).toBe(403);
        });

        it('should reject webhook without required parameters', async () => {
            const response = await request(app).get('/webhook');

            expect(response.status).toBe(400);
        });
    });

    describe('POST /webhook', () => {
        it('should accept valid text message webhook', async () => {
            const response = await request(app).post('/webhook').send(textMessageWebhook);

            expect(response.status).toBe(200);
        });

        it('should accept valid button reply webhook', async () => {
            const response = await request(app).post('/webhook').send(buttonReplyWebhook);

            expect(response.status).toBe(200);
        });

        it('should accept valid list reply webhook', async () => {
            const response = await request(app).post('/webhook').send(listReplyWebhook);

            expect(response.status).toBe(200);
        });

        it('should reject invalid webhook payload', async () => {
            const response = await request(app).post('/webhook').send({ invalid: 'payload' });

            // Should still return 200 to acknowledge receipt
            // (WhatsApp requires 200 response)
            expect(response.status).toBe(200);
        });

        it('should handle empty webhook payload', async () => {
            const response = await request(app).post('/webhook').send({});

            expect(response.status).toBe(200);
        });
    });
});
