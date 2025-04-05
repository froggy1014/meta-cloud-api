/**
 * @openapi
 * openapi: 3.0.0
 * info:
 *   title: Meta Cloud API - Phone Numbers
 *   version: 1.0.0
 *   description: API documentation for WhatsApp phone numbers
 *
 * servers:
 *   - url: http://localhost:8080
 *
 * components:
 *   schemas:
 *     QualityScore:
 *       type: object
 *       properties:
 *         score:
 *           type: string
 *           enum: [GREEN, YELLOW, RED, NA]
 *
 *     Throughput:
 *       type: object
 *       properties:
 *         level:
 *           type: string
 *           enum: [STANDARD, HIGH, NOT_APPLICABLE]
 *
 *     HealthStatusEntity:
 *       type: object
 *       properties:
 *         entity_type:
 *           type: string
 *         id:
 *           type: string
 *         can_send_message:
 *           type: string
 *         additional_info:
 *           type: array
 *           items:
 *             type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               error_code:
 *                 type: number
 *               error_description:
 *                 type: string
 *               possible_solution:
 *                 type: string
 *
 *     HealthStatus:
 *       type: object
 *       properties:
 *         can_send_message:
 *           type: string
 *         entities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HealthStatusEntity'
 *
 *     PhoneNumber:
 *       type: object
 *       properties:
 *         display_phone_number:
 *           type: string
 *         id:
 *           type: string
 *         quality_rating:
 *           type: string
 *           enum: [GREEN, YELLOW, RED, NA]
 *         verified_name:
 *           type: string
 *         account_mode:
 *           type: string
 *           enum: [LIVE, SANDBOX]
 *         code_verification_status:
 *           type: string
 *           enum: [NOT_VERIFIED, VERIFIED, EXPIRED, PENDING, DELETED, MIGRATED, BANNED, RESTRICTED, RATE_LIMITED, FLAGGED, CONNECTED, DISCONNECTED, UNKNOWN, UNVERIFIED]
 *         health_status:
 *           $ref: '#/components/schemas/HealthStatus'
 *         is_official_business_account:
 *           type: boolean
 *         is_on_biz_app:
 *           type: boolean
 *         messaging_limit_tier:
 *           type: string
 *           enum: [TIER_50, TIER_250, TIER_1K, TIER_10K, TIER_100K, TIER_UNLIMITED]
 *         platform_type:
 *           type: string
 *           enum: [CLOUD_API, ON_PREMISE, NOT_APPLICABLE]
 *         quality_score:
 *           $ref: '#/components/schemas/QualityScore'
 *         throughput:
 *           $ref: '#/components/schemas/Throughput'
 *
 *     PhoneNumbersResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PhoneNumber'
 *         paging:
 *           type: object
 *           properties:
 *             cursors:
 *               type: object
 *               properties:
 *                 before:
 *                   type: string
 *                 after:
 *                   type: string
 *
 *     RequestCodeRequest:
 *       type: object
 *       required:
 *         - code_method
 *         - language
 *       properties:
 *         code_method:
 *           type: string
 *           enum: [SMS, VOICE]
 *         language:
 *           type: string
 *
 *     VerifyCodeRequest:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import WhatsApp from 'meta-cloud-api';
import { RequestVerificationCodeRequest, VerifyCodeRequest } from 'meta-cloud-api/types';

dotenv.config();

const router = express.Router();

/**
 * @openapi
 * /phone-numbers:
 *   get:
 *     security:
 *       - AccessToken: []
 *     summary: Get all phone numbers
 *     tags: [Phone Numbers]
 *     responses:
 *       200:
 *         description: Successfully retrieved phone numbers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PhoneNumbersResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const whatsapp = new WhatsApp();
        const response = await whatsapp.phoneNumber.getPhoneNumbers();
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /phone-numbers/{businessNumberId}:
 *   get:
 *     security:
 *       - AccessToken: []
 *     summary: Get details for the specified phone number
 *     tags: [Phone Numbers]
 *     parameters:
 *       - in: path
 *         name: businessNumberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business phone number
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to retrieve
 *         example: "id,account_mode,certificate,code_verification_status,display_phone_number,health_status,quality_score,throughput"
 *     responses:
 *       200:
 *         description: Successfully retrieved phone number details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PhoneNumber'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Phone number not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:businessNumberId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fields = req.query.fields as string | undefined;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.phoneNumber.getPhoneNumberById(fields);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /phone-numbers/{businessNumberId}/request-code:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Request verification code for phone number
 *     tags: [Phone Numbers]
 *     parameters:
 *       - in: path
 *         name: businessNumberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business phone number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestCodeRequest'
 *     responses:
 *       200:
 *         description: Successfully requested verification code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/:businessNumberId/request-code',
    async (req: Request<any, any, RequestVerificationCodeRequest>, res: Response, next: NextFunction) => {
        try {
            const { code_method, language } = req.body;
            if (!code_method || !language) {
                res.status(400).json({ error: 'Code method and language are required' });
                return;
            }

            const whatsapp = new WhatsApp();
            const response = await whatsapp.phoneNumber.requestVerificationCode(req.body);
            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    },
);

/**
 * @openapi
 * /phone-numbers/{businessNumberId}/verify-code:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Verify code for phone number
 *     tags: [Phone Numbers]
 *     parameters:
 *       - in: path
 *         name: businessNumberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business phone number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyCodeRequest'
 *     responses:
 *       200:
 *         description: Successfully verified code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/:businessNumberId/verify-code',
    async (req: Request<any, any, VerifyCodeRequest>, res: Response, next: NextFunction) => {
        try {
            const { code } = req.body;
            if (!code) {
                res.status(400).json({ error: 'Verification code is required' });
                return;
            }

            const whatsapp = new WhatsApp();
            const response = await whatsapp.phoneNumber.verifyCode(req.body);
            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    },
);

export { router };
