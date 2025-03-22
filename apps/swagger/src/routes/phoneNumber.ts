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
 */

import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import WhatsApp from 'meta-cloud-api';

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
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const whatsapp = new WhatsApp();
        const response = await whatsapp.phoneNumber.getPhoneNumbers();
        res.status(200).json(await response.json());
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
 *           type: number
 *         description: The ID of the business phone number
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to retrieve
 *         example: "id, account_mode, certificate, code_verification_status, conversational_automation, display_phone_number, eligibility_for_api_business_global_search, health_status, is_official_business_account, is_on_biz_app, is_pin_enabled, is_preverified_number, last_onboarded_time, messaging_limit_tier, name_status, new_certificate, new_name_status, platform_type, quality_score, search_visibility, status, throughput, verified_name"
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
 */
router.get('/:businessNumberId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessNumberId = req.params.businessNumberId;
        const fields = req.query.fields as string | undefined;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.phoneNumber.getPhoneNumberById(businessNumberId, fields);
        res.status(200).json(await response.json());
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
 *             type: object
 *             required:
 *               - code_method
 *               - language
 *             properties:
 *               code_method:
 *                 $ref: '#/components/schemas/RequestCodeMethodsEnum'
 *               language:
 *                 $ref: '#/components/schemas/LanguagesEnum'
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
 */
router.post('/:businessNumberId/request-code', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessNumberId = req.params.businessNumberId;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.phoneNumber.requestVerificationCode(businessNumberId, req.body);
        res.status(200).json(await response.json());
    } catch (error) {
        next(error);
    }
});

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
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
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
 */
router.post('/:businessNumberId/verify-code', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessNumberId = req.params.businessNumberId;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.phoneNumber.verifyCode(businessNumberId, req.body);
        res.status(200).json(await response.json());
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /phone-numbers/{businessNumberId}/register:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Register a phone number
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
 *             type: object
 *             required:
 *               - pin
 *             properties:
 *               pin:
 *                 type: string
 *               data_localization_region:
 *                 $ref: '#/components/schemas/DataLocalizationRegionEnum'
 *     responses:
 *       200:
 *         description: Successfully registered phone number
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
 */
router.post('/:businessNumberId/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessNumberId = req.params.businessNumberId;
        const { pin, data_localization_region } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.phoneNumber.register(businessNumberId, pin, data_localization_region);
        res.status(200).json(await response.json());
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /phone-numbers/{businessNumberId}/deregister:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Deregister a phone number
 *     tags: [Phone Numbers]
 *     parameters:
 *       - in: path
 *         name: businessNumberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business phone number
 *     responses:
 *       200:
 *         description: Successfully deregistered phone number
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
 */
router.post('/:businessNumberId/deregister', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessNumberId = req.params.businessNumberId;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.phoneNumber.deregister(businessNumberId);
        res.status(200).json(await response.json());
    } catch (error) {
        next(error);
    }
});

export { router };
