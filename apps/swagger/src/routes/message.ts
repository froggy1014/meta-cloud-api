import WhatsApp from 'meta-cloud-api';
import express from 'express';

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const whatsapp = new WhatsApp(Number(process.env.WA_PHONE_NUMBER_ID));

router.post('/audio', async (req, res) => {
    const { body, recipient, replyMessageId } = req.body;
    try {
        const response = await whatsapp.messages.audio(body, recipient, replyMessageId);
        res.status(200).json(response.json());
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

router.post('/contacts', async (req, res) => {
    const { body, recipient, replyMessageId } = req.body;
    try {
        const response = await whatsapp.messages.contacts(body, recipient, replyMessageId);
        res.status(200).json(response.json());
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

router.post('/document', async (req, res) => {
    const { body, recipient, replyMessageId } = req.body;
    try {
        const response = await whatsapp.messages.document(body, recipient, replyMessageId);
        res.status(200).json(response.json());
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

router.post('/image', async (req, res) => {
    const { body, recipient, replyMessageId } = req.body;
    try {
        const response = await whatsapp.messages.image(body, recipient, replyMessageId);
        res.status(200).json(response.json());
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

router.post('/interactive', async (req, res) => {
    const { body, recipient, replyMessageId } = req.body;
    try {
        const response = await whatsapp.messages.interactive(body, recipient, replyMessageId);
        res.status(200).json(response.json());
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

router.post('/location', async (req, res) => {
    const { body, recipient, replyMessageId } = req.body;
    try {
        const response = await whatsapp.messages.location(body, recipient, replyMessageId);
        res.status(200).json(response.json());
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

router.post('/sticker', async (req, res) => {
    const { body, recipient, replyMessageId } = req.body;
    try {
        const response = await whatsapp.messages.sticker(body, recipient, replyMessageId);
        res.status(200).json(response.json());
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

router.post('/template', async (req, res) => {
    const { body, recipient, replyMessageId } = req.body;
    try {
        const response = await whatsapp.messages.template(body, recipient, replyMessageId);
        res.status(200).json(response.json());
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

router.post('/text', async (req, res) => {
    const { body, recipient, replyMessageId } = req.body;
    try {
        const response = await whatsapp.messages.text(body, recipient, replyMessageId);
        res.status(200).json(response.json());
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

router.post('/video', async (req, res) => {
    const { body, recipient, replyMessageId } = req.body;
    try {
        const response = await whatsapp.messages.video(body, recipient, replyMessageId);
        res.status(200).json(response.json());
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
});

export default router;
