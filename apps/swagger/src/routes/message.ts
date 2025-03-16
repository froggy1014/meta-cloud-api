import express from 'express';
import dotenv from 'dotenv';
import { whatsappAuth } from '../middleware/whatsappAuth';
import { createMessageHandler } from '../middleware/whatsappMessageHandler';

dotenv.config();

const messageRoutes = express.Router();

messageRoutes.post('/audio', whatsappAuth, createMessageHandler('audio'));
messageRoutes.post('/contacts', whatsappAuth, createMessageHandler('contacts'));
messageRoutes.post('/document', whatsappAuth, createMessageHandler('document'));
messageRoutes.post('/image', whatsappAuth, createMessageHandler('image'));
messageRoutes.post('/interactive', whatsappAuth, createMessageHandler('interactive'));
messageRoutes.post('/location', whatsappAuth, createMessageHandler('location'));
messageRoutes.post('/sticker', whatsappAuth, createMessageHandler('sticker'));
messageRoutes.post('/template', whatsappAuth, createMessageHandler('template'));
messageRoutes.post('/text', whatsappAuth, createMessageHandler('text'));
messageRoutes.post('/video', whatsappAuth, createMessageHandler('video'));

export default messageRoutes;
