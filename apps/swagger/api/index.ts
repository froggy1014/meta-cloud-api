import express from 'express';

import dotenv from 'dotenv';
import path from 'path';
import { apidocsRouter, messagesRouter } from '../src/routes';
import { fileURLToPath } from 'url';

dotenv.config();

const PORT = process.env.LISTENER_PORT || 8080;
const app = express();

const __dirname = path.dirname(__filename);

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    if (req.url === '/api-docs/swagger-ui.css') {
        res.sendFile(path.join(__dirname, 'public') + '/css/swagger-ui.css');
    } else {
        next();
    }
});

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
