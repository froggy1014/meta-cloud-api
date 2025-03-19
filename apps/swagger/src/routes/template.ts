// /**
//  * @openapi
//  * openapi: 3.0.0
//  * info:
//  *   title: Meta Cloud API - Templates
//  *   version: 1.0.0
//  *   description: API documentation for WhatsApp message templates
//  *
//  * servers:
//  *   - url: http://localhost:8080
//  *
//  * components:
//  *   securitySchemes:
//  *     AccessToken:
//  *       type: apiKey
//  *       in: header
//  *       name: Authorization
//  *       description: Bearer access token
//  *       scheme: Bearer
//  */

// import express from 'express';
// import dotenv from 'dotenv';
// import WhatsApp from 'meta-cloud-api';
// import {
//     templateCreateParamsValidator,
//     templateDeleteParamsValidator,
//     templateGetParamsValidator,
//     templateUpdateParamsValidator,
// } from '../middleware/template.validator';
// import { TemplateGetParams } from 'meta-cloud-api/types';

// dotenv.config();

// const templateRoutes = express.Router();

// /**
//  * @openapi
//  * /{templateId}:
//  *   get:
//  *     security:
//  *       - AccessToken: []
//  *     summary: Get a specific template by ID
//  *     tags: [Templates]
//  *     parameters:
//  *       - in: path
//  *         name: templateId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID of the template to retrieve
//  *     responses:
//  *       200:
//  *         description: Template details
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/TemplateResponse'
//  *       400:
//  *         description: Invalid request
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// templateRoutes.get('/:templateId', async (req, res) => {
//     try {
//         const whatsapp = new WhatsApp();
//         const { templateId } = req.params;
//         const response = await whatsapp.templates.getTemplate(templateId);
//         res.json(response);
//     } catch (error) {
//         if (error instanceof Error) {
//             res.status(400).json({ error: error.message });
//         } else {
//             res.status(400).json({ error: 'Unknown error' });
//         }
//     }
// });

// /**
//  * @openapi
//  * /{templateId}:
//  *   post:
//  *     security:
//  *       - AccessToken: []
//  *     summary: Update an existing template
//  *     tags: [Templates]
//  *     parameters:
//  *       - in: path
//  *         name: templateId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID of the template to update
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/TemplateRequest'
//  *     responses:
//  *       200:
//  *         description: Template updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/SuccessResponse'
//  *       400:
//  *         description: Invalid request
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// templateRoutes.post('/:templateId', async (req, res) => {
//     try {
//         const whatsapp = new WhatsApp();
//         const { templateId } = req.params;
//         const template = req.body;
//         const response = await whatsapp.templates.updateTemplate(templateId, template);
//         res.json(response);
//     } catch (error) {
//         if (error instanceof Error) {
//             res.status(400).json({ error: error.message });
//         } else {
//             res.status(400).json({ error: 'Unknown error' });
//         }
//     }
// });

// /**
//  * @openapi
//  * /{waba-id}/message_templates:
//  *   get:
//  *     security:
//  *       - AccessToken: []
//  *     summary: Get a list of templates
//  *     tags: [Templates]
//  *     parameters:
//  *       - in: path
//  *         name: waba-id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: WhatsApp Business Account ID
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *         description: Maximum number of templates to return
//  *       - in: query
//  *         name: name
//  *         schema:
//  *           type: string
//  *         description: Filter by template name
//  *       - in: query
//  *         name: language
//  *         schema:
//  *           $ref: '#/components/schemas/LanguagesEnum'
//  *         description: Filter by language
//  *       - in: query
//  *         name: category
//  *         schema:
//  *           $ref: '#/components/schemas/CategoryEnum'
//  *         description: Filter by category
//  *       - in: query
//  *         name: status
//  *         schema:
//  *           $ref: '#/components/schemas/TemplateStatusEnum'
//  *         description: Filter by status
//  *     responses:
//  *       200:
//  *         description: List of templates
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/TemplateResponse'
//  *       400:
//  *         description: Invalid request
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// templateRoutes.get('/:wabaId/message_templates', async (req, res) => {
//     try {
//         const whatsapp = new WhatsApp();
//         const params = req.query as TemplateGetParams;
//         const response = await whatsapp.templates.getTemplates(params);
//         res.status(200).json(await response.json());
//     } catch (error) {
//         if (error instanceof Error) {
//             res.status(400).json({ error: error.message });
//         } else {
//             res.status(400).json({ error: 'Unknown error' });
//         }
//     }
// });

// /**
//  * @openapi
//  * /{waba-id}/message_templates:
//  *   post:
//  *     security:
//  *       - AccessToken: []
//  *     summary: Create a new template
//  *     tags: [Templates]
//  *     parameters:
//  *       - in: path
//  *         name: waba-id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: WhatsApp Business Account ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/TemplateRequest'
//  *     responses:
//  *       200:
//  *         description: Template created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/TemplateResponse'
//  *       400:
//  *         description: Invalid request
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// templateRoutes.post('/:wabaId/message_templates', async (req, res) => {
//     try {
//         const whatsapp = new WhatsApp();
//         const template = req.body;
//         const response = await whatsapp.templates.createTemplate(template);
//         res.json(response);
//     } catch (error) {
//         if (error instanceof Error) {
//             res.status(400).json({ error: error.message });
//         } else {
//             res.status(400).json({ error: 'Unknown error' });
//         }
//     }
// });

// /**
//  * @openapi
//  * /{waba-id}/message_templates:
//  *   delete:
//  *     security:
//  *       - AccessToken: []
//  *     summary: Delete a template
//  *     tags: [Templates]
//  *     parameters:
//  *       - in: path
//  *         name: waba-id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: WhatsApp Business Account ID
//  *       - in: query
//  *         name: hsm_id
//  *         schema:
//  *           type: string
//  *         description: HSM ID of the template to delete
//  *       - in: query
//  *         name: name
//  *         schema:
//  *           type: string
//  *         description: Name of the template to delete
//  *     responses:
//  *       200:
//  *         description: Template deleted successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/SuccessResponse'
//  *       400:
//  *         description: Invalid request
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// templateRoutes.delete('/:wabaId/message_templates', async (req, res) => {
//     try {
//         const whatsapp = new WhatsApp();
//         const params = req.query;
//         const response = await whatsapp.templates.deleteTemplate(params);
//         res.json(response);
//     } catch (error) {
//         if (error instanceof Error) {
//             res.status(400).json({ error: error.message });
//         } else {
//             res.status(400).json({ error: 'Unknown error' });
//         }
//     }
// });

// export default templateRoutes;
