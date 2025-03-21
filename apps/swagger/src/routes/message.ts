/**
 * @openapi
 * openapi: 3.0.0
 * info:
 *   title: Meta Cloud API - Messages
 *   version: 1.0.0
 *   description: API documentation for WhatsApp messages
 *
 * servers:
 *   - url: http://localhost:8080
 *
 */

import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import WhatsApp from 'meta-cloud-api';
import {
    AudioMessageRequestBody as AudioBody,
    ContactsMessageRequestBody as ContactsBody,
    DocumentMessageRequestBody as DocBody,
    ImageMessageRequestBody as ImageBody,
    InteractiveMessageRequestBody as InteractiveBody,
    LocationMessageRequestBody as LocationBody,
    StickerMessageRequestBody as StickerBody,
    TemplateMessageRequestBody as TemplateBody,
    TextMessageRequestBody as TextBody,
    VideoMessageRequestBody as VideoBody,
} from '../types/message';

dotenv.config();

const router = express.Router();

/**
 * @openapi
 * /messages/audio:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Send an audio message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - recipient
 *             properties:
 *               body:
 *                 type: object
 *                 oneOf:
 *                   - type: object
 *                     required: [id]
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The media object ID from Meta servers
 *                   - type: object
 *                     required: [link]
 *                     properties:
 *                       link:
 *                         type: string
 *                         description: HTTP/HTTPS URL of the audio file. Content-Type must be audio/aac, audio/mp4, audio/mpeg, audio/amr, or audio/ogg
 *                         example: "https://example.com/audio.mp3"
 *               recipient:
 *                 type: number
 *               replyMessageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/audio', async (req: Request<{}, {}, AudioBody>, res: Response) => {
    try {
        const { body, recipient, replyMessageId } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.messages.audio(body, recipient, replyMessageId);
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
 * /messages/contacts:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Send a contacts message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - recipient
 *             properties:
 *               body:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                   properties:
 *                     addresses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           street:
 *                             type: string
 *                             example: "123 Main St"
 *                           city:
 *                             type: string
 *                             example: "Seoul"
 *                           state:
 *                             type: string
 *                             example: "SL"
 *                           zip:
 *                             type: string
 *                             example: "04524"
 *                           country:
 *                             type: string
 *                             example: "South Korea"
 *                           country_code:
 *                             type: string
 *                             example: "KR"
 *                           type:
 *                             type: string
 *                             enum: [HOME, WORK]
 *                             example: "HOME"
 *                     birthday:
 *                       type: string
 *                       pattern: '^\d{4}-\d{2}-\d{2}$'
 *                       example: "1990-01-15"
 *                     emails:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                             example: "john.doe@personal.com"
 *                           type:
 *                             type: string
 *                             enum: [HOME, WORK]
 *                             example: "HOME"
 *                     name:
 *                       type: object
 *                       required:
 *                         - formatted_name
 *                       properties:
 *                         formatted_name:
 *                           type: string
 *                           example: "John Doe"
 *                         first_name:
 *                           type: string
 *                           example: "John"
 *                         last_name:
 *                           type: string
 *                           example: "Doe"
 *                         middle_name:
 *                           type: string
 *                           example: "William"
 *                         suffix:
 *                           type: string
 *                           example: "Jr."
 *                         prefix:
 *                           type: string
 *                           example: "Mr."
 *                     org:
 *                       type: object
 *                       properties:
 *                         company:
 *                           type: string
 *                           example: "Tech Company Ltd."
 *                         department:
 *                           type: string
 *                           example: "Engineering"
 *                         title:
 *                           type: string
 *                           example: "Senior Software Engineer"
 *                     phones:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           phone:
 *                             type: string
 *                             example: "+82101234567"
 *                           type:
 *                             type: string
 *                             enum: [CELL, MAIN, IPHONE, HOME, WORK]
 *                             example: "CELL"
 *                           wa_id:
 *                             type: string
 *                             example: "82101234567"
 *                     urls:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: "https://personal-website.com"
 *                           type:
 *                             type: string
 *                             enum: [HOME, WORK]
 *                             example: "HOME"
 *               recipient:
 *                 type: number
 *                 example: 821089791169
 *               replyMessageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/contacts', async (req: Request<{}, {}, ContactsBody>, res: Response) => {
    try {
        const { body, recipient, replyMessageId } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.messages.contacts(body, recipient, replyMessageId);
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
 * /messages/document:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Send a document message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - recipient
 *             properties:
 *               body:
 *                 type: object
 *                 oneOf:
 *                   - type: object
 *                     required: [id]
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The media object ID from Meta servers
 *                       caption:
 *                         type: string
 *                       filename:
 *                         type: string
 *                   - type: object
 *                     required: [link]
 *                     properties:
 *                       link:
 *                         type: string
 *                         description: HTTP/HTTPS URL of the document. Content-Type must be text/plain, application/pdf, application/vnd.ms-powerpoint, application/msword, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.presentationml.presentation, or application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 *                         example: "https://example.com/document.pdf"
 *                       caption:
 *                         type: string
 *                       filename:
 *                         type: string
 *               recipient:
 *                 type: number
 *               replyMessageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/document', async (req: Request<{}, {}, DocBody>, res: Response) => {
    try {
        const { body, recipient, replyMessageId } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.messages.document(body, recipient, replyMessageId);
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
 * /messages/image:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Send an image message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - recipient
 *             properties:
 *               body:
 *                 type: object
 *                 oneOf:
 *                   - type: object
 *                     required: [id]
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The media object ID from Meta servers
 *                       caption:
 *                         type: string
 *                   - type: object
 *                     required: [link]
 *                     properties:
 *                       link:
 *                         type: string
 *                         description: HTTP/HTTPS URL of the image. Content-Type must be image/jpeg, image/png, or image/webp
 *                         example: "https://example.com/image.jpg"
 *                       caption:
 *                         type: string
 *               recipient:
 *                 type: number
 *               replyMessageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/image', async (req: Request<{}, {}, ImageBody>, res: Response) => {
    try {
        const { body, recipient, replyMessageId } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.messages.image(body, recipient, replyMessageId);
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
 * /messages/interactive:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Send an interactive message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - recipient
 *             properties:
 *               body:
 *                 type: object
 *                 required:
 *                   - type
 *                   - body
 *                   - action
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [button, list, product, product_list]
 *                   body:
 *                     type: object
 *                     required:
 *                       - text
 *                     properties:
 *                       text:
 *                         type: string
 *                   footer:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                   header:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [document, image, text, video]
 *                       document:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: The media object ID from Meta servers
 *                           link:
 *                             type: string
 *                             description: HTTP/HTTPS URL of the document. Content-Type must be text/plain, application/pdf, application/vnd.ms-powerpoint, application/msword, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.presentationml.presentation, or application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 *                             example: "https://example.com/document.pdf"
 *                       image:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: The media object ID from Meta servers
 *                           link:
 *                             type: string
 *                             description: HTTP/HTTPS URL of the image. Content-Type must be image/jpeg, image/png, or image/webp
 *                             example: "https://example.com/image.jpg"
 *                       text:
 *                         type: string
 *                       video:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: The media object ID from Meta servers
 *                           link:
 *                             type: string
 *                             description: HTTP/HTTPS URL of the video. Content-Type must be video/mp4, video/3gp
 *                             example: "https://example.com/video.mp4"
 *                   action:
 *                     type: object
 *                     properties:
 *                       button:
 *                         type: string
 *                       buttons:
 *                         type: array
 *                         items:
 *                           type: object
 *                           required:
 *                             - type
 *                             - reply
 *                           properties:
 *                             type:
 *                               type: string
 *                               enum: [reply]
 *                             reply:
 *                               type: object
 *                               required:
 *                                 - title
 *                                 - id
 *                               properties:
 *                                 title:
 *                                   type: string
 *                                 id:
 *                                   type: string
 *                       catalog_id:
 *                         type: string
 *                       product_retailer_id:
 *                         type: string
 *                       sections:
 *                         type: object
 *                         oneOf:
 *                           - type: object
 *                             required: [product_items]
 *                             properties:
 *                               product_items:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   required: [product_retailer_id]
 *                                   properties:
 *                                     product_retailer_id:
 *                                       type: string
 *                               title:
 *                                 type: string
 *                           - type: object
 *                             required: [rows]
 *                             properties:
 *                               rows:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   required:
 *                                     - id
 *                                     - title
 *                                   properties:
 *                                     id:
 *                                       type: string
 *                                     title:
 *                                       type: string
 *                                     description:
 *                                       type: string
 *                               title:
 *                                 type: string
 *               recipient:
 *                 type: number
 *               replyMessageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/interactive', async (req: Request<{}, {}, InteractiveBody>, res: Response) => {
    try {
        const { body, recipient, replyMessageId } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.messages.interactive(body, recipient, replyMessageId);
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
 * /messages/location:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Send a location message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - recipient
 *             properties:
 *               body:
 *                 type: object
 *                 required:
 *                   - longitude
 *                   - latitude
 *                 properties:
 *                   longitude:
 *                     type: number
 *                     example: -122.1484785
 *                   latitude:
 *                     type: number
 *                     example: 37.4847285
 *                   name:
 *                     type: string
 *                     example: "Meta Headquarters"
 *                   address:
 *                     type: string
 *                     example: "1 Hacker Way, Menlo Park, CA 94025"
 *               recipient:
 *                 type: number
 *                 example: 821089791169
 *               replyMessageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/location', async (req: Request<{}, {}, LocationBody>, res: Response) => {
    try {
        const { body, recipient, replyMessageId } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.messages.location(body, recipient, replyMessageId);
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
 * /messages/sticker:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Send a sticker message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - recipient
 *             properties:
 *               body:
 *                 type: object
 *                 oneOf:
 *                   - type: object
 *                     required: [id]
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The media object ID from Meta servers
 *                   - type: object
 *                     required: [link]
 *                     properties:
 *                       link:
 *                         type: string
 *                         description: HTTP/HTTPS URL of the sticker. Content-Type must be image/webp for static stickers or video/webm for animated stickers
 *                         example: "https://example.com/sticker.webp"
 *               recipient:
 *                 type: number
 *               replyMessageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/sticker', async (req: Request<{}, {}, StickerBody>, res: Response) => {
    try {
        const { body, recipient, replyMessageId } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.messages.sticker(body, recipient, replyMessageId);
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
 * /messages/template:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Send a template message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - recipient
 *             properties:
 *               body:
 *                 type: object
 *                 required:
 *                   - name
 *                   - language
 *                 properties:
 *                   name:
 *                     type: string
 *                   language:
 *                     type: object
 *                     required:
 *                       - policy
 *                       - code
 *                     properties:
 *                       policy:
 *                         type: string
 *                         enum: [deterministic]
 *                       code:
 *                         type: string
 *                   components:
 *                     type: array
 *                     items:
 *                       oneOf:
 *                         - type: object
 *                           required:
 *                             - type
 *                             - parameters
 *                           properties:
 *                             type:
 *                               type: string
 *                             parameters:
 *                               type: array
 *                               items:
 *                                 oneOf:
 *                                   - type: object
 *                                     required:
 *                                       - type
 *                                       - text
 *                                     properties:
 *                                       type:
 *                                         type: string
 *                                         enum: [text]
 *                                       text:
 *                                         type: string
 *                                   - type: object
 *                                     required:
 *                                       - type
 *                                       - currency
 *                                     properties:
 *                                       type:
 *                                         type: string
 *                                         enum: [currency]
 *                                       currency:
 *                                         type: object
 *                                         required:
 *                                           - fallback_value
 *                                           - code
 *                                           - amount_1000
 *                                         properties:
 *                                           fallback_value:
 *                                             type: string
 *                                           code:
 *                                             type: string
 *                                           amount_1000:
 *                                             type: number
 *                                   - type: object
 *                                     required:
 *                                       - type
 *                                       - date_time
 *                                     properties:
 *                                       type:
 *                                         type: string
 *                                         enum: [date_time]
 *                                       date_time:
 *                                         type: object
 *                                         required:
 *                                           - fallback_value
 *                                         properties:
 *                                           fallback_value:
 *                                             type: string
 *                                   - type: object
 *                                     required:
 *                                       - type
 *                                     properties:
 *                                       type:
 *                                         type: string
 *                                         enum: [document, image, video]
 *                                       document:
 *                                         type: object
 *                                         properties:
 *                                           id:
 *                                             type: string
 *                                             description: The media object ID from Meta servers
 *                                           link:
 *                                             type: string
 *                                             description: HTTP/HTTPS URL of the document. Content-Type must be text/plain, application/pdf, application/vnd.ms-powerpoint, application/msword, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.presentationml.presentation, or application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 *                                             example: "https://example.com/document.pdf"
 *                                       image:
 *                                         type: object
 *                                         properties:
 *                                           id:
 *                                             type: string
 *                                             description: The media object ID from Meta servers
 *                                           link:
 *                                             type: string
 *                                             description: HTTP/HTTPS URL of the image. Content-Type must be image/jpeg, image/png, or image/webp
 *                                             example: "https://example.com/image.jpg"
 *                                       video:
 *                                         type: object
 *                                         properties:
 *                                           id:
 *                                             type: string
 *                                             description: The media object ID from Meta servers
 *                                           link:
 *                                             type: string
 *                                             description: HTTP/HTTPS URL of the video. Content-Type must be video/mp4, video/3gp
 *                                             example: "https://example.com/video.mp4"
 *                         - type: object
 *                           required:
 *                             - type
 *                             - parameters
 *                             - sub_type
 *                             - index
 *                           properties:
 *                             type:
 *                               type: string
 *                               enum: [button]
 *                             parameters:
 *                               oneOf:
 *                                 - type: object
 *                                   required:
 *                                     - type
 *                                     - payload
 *                                   properties:
 *                                     type:
 *                                       type: string
 *                                       enum: [payload]
 *                                     payload:
 *                                       type: string
 *                                 - type: object
 *                                   required:
 *                                     - type
 *                                     - text
 *                                   properties:
 *                                     type:
 *                                       type: string
 *                                       enum: [text]
 *                                     text:
 *                                       type: string
 *                             sub_type:
 *                               type: string
 *                               enum: [quick_reply, url]
 *                             index:
 *                               type: number
 *                               enum: [0, 1, 2]
 *               recipient:
 *                 type: number
 *               replyMessageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/template', async (req: Request<{}, {}, TemplateBody>, res: Response) => {
    try {
        const { body, recipient, replyMessageId } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.messages.template(body, recipient, replyMessageId);
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
 * /messages/text:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Send a text message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - recipient
 *             properties:
 *               body:
 *                 type: object
 *                 required:
 *                   - body
 *                 properties:
 *                   body:
 *                     type: string
 *                   preview_url:
 *                     type: boolean
 *               recipient:
 *                 type: number
 *               replyMessageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/text', async (req: Request<{}, {}, TextBody>, res: Response) => {
    try {
        const { body, recipient, replyMessageId } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.messages.text(body, recipient, replyMessageId);
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
 * /messages/video:
 *   post:
 *     security:
 *       - AccessToken: []
 *     summary: Send a video message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - recipient
 *             properties:
 *               body:
 *                 type: object
 *                 oneOf:
 *                   - type: object
 *                     required:
 *                       - id
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The media object ID from Meta servers
 *                       caption:
 *                         type: string
 *                         description: Optional caption for the video
 *                       link:
 *                         type: string
 *                         description: Should not be used with id
 *                   - type: object
 *                     required:
 *                       - link
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Should not be used with link
 *                       link:
 *                         type: string
 *                         description: The URL where the video is hosted
 *                       caption:
 *                         type: string
 *                         description: Optional caption for the video
 *               recipient:
 *                 type: number
 *                 description: The WhatsApp ID (phone number) of the recipient
 *               replyMessageId:
 *                 type: string
 *                 description: Optional message ID to reply to
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/video', async (req: Request<{}, {}, VideoBody>, res: Response) => {
    try {
        const { body, recipient, replyMessageId } = req.body;
        const whatsapp = new WhatsApp();
        const response = await whatsapp.messages.video(body, recipient, replyMessageId);
        res.status(200).json(await response.json());
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

export { router };
