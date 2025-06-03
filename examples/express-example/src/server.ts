import 'dotenv/config';
import express, { Request, Response } from 'express';
import { manualRawBodyMiddleware } from './middleware/rawBody';
import router from './routes';

const app = express();

// Apply manual raw body middleware that handles both raw and JSON parsing
app.use('/webhook', manualRawBodyMiddleware);
app.use('/flow', manualRawBodyMiddleware);

// For other endpoints, use regular JSON parsing
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(router);

app.get('/', (req: Request, res: Response) => {
    res.send('WhatsApp API Server is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
});
