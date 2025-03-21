/**
 * @openapi
 * openapi: 3.0.0
 * info:
 *   title: Meta Cloud API - Templates
 *   version: 1.0.0
 *   description: API documentation for WhatsApp message templates
 *
 * servers:
 *   - url: http://localhost:8080
 *
 * components:
 *   securitySchemes:
 *     AccessToken:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: Bearer access token
 *       scheme: Bearer
 *   schemas:
 *     TemplateRequest:
 *       type: object
 *       required:
 *         - name
 *         - language
 *       properties:
 *         name:
 *           type: string
 *           description: Template name
 *         language:
 *           $ref: '#/components/schemas/LanguagesEnum'
 *         category:
 *           $ref: '#/components/schemas/CategoryEnum'
 *         components:
 *           type: array
 *           items:
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - type
 *                   - format
 *                 properties:
 *                   type:
 *                     $ref: '#/components/schemas/ComponentTypesEnum'
 *                   format:
 *                     $ref: '#/components/schemas/MessageTypesEnum'
 *                   text:
 *                     type: string
 *                     maxLength: 60
 *                   example:
 *                     type: object
 *                     properties:
 *                       header_text:
 *                         type: array
 *                         items:
 *                           type: string
 *                       header_text_named_params:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             param_name:
 *                               type: string
 *                             example:
 *                               type: string
 *                       header_handle:
 *                         type: array
 *                         items:
 *                           type: string
 *               - type: object
 *                 required:
 *                   - type
 *                   - text
 *                 properties:
 *                   type:
 *                     $ref: '#/components/schemas/ComponentTypesEnum'
 *                   text:
 *                     type: string
 *                     maxLength: 1024
 *                   example:
 *                     type: object
 *                     properties:
 *                       body_text:
 *                         type: array
 *                         items:
 *                           type: array
 *                           items:
 *                             type: string
 *                       body_text_named_params:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             param_name:
 *                               type: string
 *                             example:
 *                               type: string
 *               - type: object
 *                 required:
 *                   - type
 *                   - text
 *                 properties:
 *                   type:
 *                     $ref: '#/components/schemas/ComponentTypesEnum'
 *                   text:
 *                     type: string
 *                     maxLength: 60
 *               - type: object
 *                 required:
 *                   - type
 *                   - text
 *                   - phone_number
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [PHONE_NUMBER]
 *                   text:
 *                     type: string
 *                     maxLength: 25
 *                   phone_number:
 *                     type: string
 *                     maxLength: 20
 *               - type: object
 *                 required:
 *                   - type
 *                   - text
 *                   - url
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [URL]
 *                   text:
 *                     type: string
 *                     maxLength: 25
 *                   url:
 *                     type: string
 *                     maxLength: 2000
 *                   example:
 *                     type: array
 *                     items:
 *                       type: string
 *               - type: object
 *                 required:
 *                   - type
 *                   - text
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [QUICK_REPLY]
 *                   text:
 *                     type: string
 *                     maxLength: 25
 *               - type: object
 *                 required:
 *                   - type
 *                   - example
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [COPY_CODE]
 *                   example:
 *                     type: string
 *                     maxLength: 15
 *               - type: object
 *                 required:
 *                   - type
 *                   - text
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [FLOW]
 *                   text:
 *                     type: string
 *                     maxLength: 25
 *                   flow_id:
 *                     type: string
 *                   flow_name:
 *                     type: string
 *                   flow_json:
 *                     type: string
 *                   flow_action:
 *                     type: string
 *                     enum: [navigate, data_exchange]
 *                   navigate_screen:
 *                     type: string
 *               - type: object
 *                 required:
 *                   - type
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [MPM]
 *               - type: object
 *                 required:
 *                   - type
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [OTP]
 *               - type: object
 *                 required:
 *                   - type
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [SPM]
 */

import express from 'express';
import dotenv from 'dotenv';
import WhatsApp from 'meta-cloud-api';
import { TemplateGetParams } from 'meta-cloud-api/types';

dotenv.config();

const templateRoutes = express.Router();

/**
 * @openapi
 * /templates:
 *   get:
 *     security:
 *       - AccessToken: []
 *     summary: Get a list of templates
 *     tags: [Templates]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of templates to return
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by template name
 *       - in: query
 *         name: language
 *         schema:
 *           $ref: '#/components/schemas/LanguagesEnum'
 *         description: Filter by language
 *       - in: query
 *         name: category
 *         schema:
 *           $ref: '#/components/schemas/CategoryEnum'
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/TemplateStatusEnum'
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TemplateResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
templateRoutes.get('/', async (req, res) => {
    try {
        const whatsapp = new WhatsApp();
        const params = req.query as TemplateGetParams;
        const response = await whatsapp.templates.getTemplates(params);
        res.status(200).json(await response.json());
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

/**
 * @openapi
 * /templates:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Create a new template
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TemplateRequest'
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - id
 *                 - status
 *                 - category
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "9533679340021041"
 *                 status:
 *                   $ref: '#/components/schemas/TemplateStatusEnum'
 *                   example: "APPROVED"
 *                 category:
 *                   $ref: '#/components/schemas/CategoryEnum'
 *                   example: "MARKETING"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
templateRoutes.post('/', async (req, res) => {
    try {
        const whatsapp = new WhatsApp();
        const template = req.body;
        const response = await whatsapp.templates.createTemplate(template);
        res.status(201).json(await response.json());
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

/**
 * @openapi
 * /templates/{templateId}:
 *   get:
 *     security:
 *       - AccessToken: []
 *     summary: Get a specific template by ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the template to retrieve
 *     responses:
 *       200:
 *         description: Template details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TemplateResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Template not found
 */
templateRoutes.get('/:templateId', async (req, res) => {
    try {
        const whatsapp = new WhatsApp();
        const { templateId } = req.params;
        const response = await whatsapp.templates.getTemplate(templateId);
        if (!response) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.status(200).json(await response.json());
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

/**
 * @openapi
 * /templates/{templateId}:
 *   put:
 *     security:
 *       - AccessToken: []
 *     summary: Update an existing template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the template to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TemplateRequest'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: string
 *                   example: "9533679340021041"
 *                 name:
 *                   type: string
 *                   example: "seasonal_promotion12"
 *                 category:
 *                   $ref: '#/components/schemas/CategoryEnum'
 *               required:
 *                 - success
 *                 - id
 *                 - name
 *                 - category
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Template not found
 */
templateRoutes.put('/:templateId', async (req, res) => {
    try {
        const whatsapp = new WhatsApp();
        const { templateId } = req.params;
        const template = req.body;
        const response = await whatsapp.templates.updateTemplate(templateId, template);
        if (!response) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.status(200).json(await response.json());
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

/**
 * @openapi
 * /templates/{templateId}:
 *   delete:
 *     security:
 *       - AccessToken: []
 *     summary: Delete a template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the template to delete
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the template to delete
 *     responses:
 *       200:
 *         description: Template deleted successfully
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
 *       404:
 *         description: Template not found
 */
templateRoutes.delete('/:templateId', async (req, res) => {
    try {
        const whatsapp = new WhatsApp();
        const { templateId } = req.params;
        const { name } = req.query;

        if (!templateId || !name) {
            return res.status(400).json({ error: 'Template ID and name are required' });
        }

        const params = { hsm_id: templateId, name: name as string };
        const response = await whatsapp.templates.deleteTemplate(params);

        if (!response) {
            return res.status(404).json({ error: 'Template not found' });
        }

        res.status(200).json(await response.json());
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

export default templateRoutes;
