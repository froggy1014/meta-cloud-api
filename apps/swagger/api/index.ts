import express, { Request, Response } from 'express';

import dotenv from 'dotenv';
import {
    apidocsRouter,
    messagesRouter,
    phoneNumberRouter,
    registrationRouter,
    qrCodeRouter,
    mediaRouter,
    twoStepVerificationRouter,
    encryptionRouter,
    wabaRouter,
} from '../src/routes';
import templateRoutes from '../src/routes/template';
import { errorHandler } from '../src/middleware/error';

dotenv.config();

const PORT = process.env.LISTENER_PORT || 8080;
const app = express();

app.use(express.json());
app.use('/api-docs', apidocsRouter);
app.use('/messages', messagesRouter);
app.use('/templates', templateRoutes);
app.use('/phone-numbers', phoneNumberRouter);
app.use('/registration', registrationRouter);
app.use('/qr-codes', qrCodeRouter);
app.use('/media', mediaRouter);
app.use('/two-step-verification', twoStepVerificationRouter);
app.use('/encryption', encryptionRouter);
app.use('/waba', wabaRouter);
app.use('/', (req: Request, res: Response) => res.redirect('/api-docs'));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

module.exports = app;
