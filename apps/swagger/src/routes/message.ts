import express from 'express';
import dotenv from 'dotenv';
import { whatsappAuth } from '../middleware/whatsappAuth';
import { createMessageHandler } from '../middleware/whatsappMessageHandler';

dotenv.config();

const router = express.Router();

router.post('/audio', whatsappAuth, createMessageHandler('audio'));
router.post('/contacts', whatsappAuth, createMessageHandler('contacts'));
router.post('/document', whatsappAuth, createMessageHandler('document'));
router.post('/image', whatsappAuth, createMessageHandler('image'));
router.post('/interactive', whatsappAuth, createMessageHandler('interactive'));
router.post('/location', whatsappAuth, createMessageHandler('location'));
router.post('/sticker', whatsappAuth, createMessageHandler('sticker'));
router.post('/template', whatsappAuth, createMessageHandler('template'));
router.post('/text', whatsappAuth, createMessageHandler('text'));
router.post('/video', whatsappAuth, createMessageHandler('video'));

export default router;
