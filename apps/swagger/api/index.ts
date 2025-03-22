import express, { Request, Response } from 'express';

import dotenv from 'dotenv';
import { apidocsRouter, messagesRouter, phoneNumberRouter } from '../src/routes';
import templateRoutes from '../src/routes/template';
import { errorHandler } from '../src/middleware/error';
import 'express-async-errors';

dotenv.config();

const PORT = process.env.LISTENER_PORT || 8080;
const app = express();

app.use(express.json());
app.use('/api-docs', apidocsRouter);
app.use('/messages', messagesRouter);
app.use('/templates', templateRoutes);
app.use('/phone-numbers', phoneNumberRouter);
app.use('/', (req: Request, res: Response) => res.redirect('/api-docs'));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

module.exports = app;
