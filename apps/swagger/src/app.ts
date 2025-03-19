import express from 'express';

import dotenv from 'dotenv';
import { apidocsRouter, messagesRouter } from './routes';
import { validator } from './middleware/validator';

dotenv.config();

const PORT = process.env.LISTENER_PORT || 8080;
const app = express();

app.use(express.json());

app.use('/api-docs', apidocsRouter);
app.use('/messages', messagesRouter);

app.use('/', (req, res) => res.redirect('/api-docs'));
// app.use('/', templateRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Log error details in a structured format
    console.error('Error occurred:', {
        message: err.message,
        type: err.name,
        code: err.code || 500,
        error_data: {
            messaging_product: 'whatsapp',
            details: err.stack,
        },
        error_subcode: err.subcode || 0,
        fbtrace_id: req.headers['x-fb-trace-id'] || 'unknown',
    });

    // Send error response matching the schema
    res.status(500).json({
        error: {
            message: err.message || 'Internal server error',
            type: err.name || 'ServerError',
            code: err.code || 500,
            error_data: {
                messaging_product: 'whatsapp',
                details: 'An unexpected error occurred',
            },
            error_subcode: err.subcode || 0,
            fbtrace_id: req.headers['x-fb-trace-id'] || 'unknown',
        },
    });
});

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

module.exports = app;
