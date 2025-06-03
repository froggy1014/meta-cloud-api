import 'dotenv/config';
import express, { Request, Response } from 'express';
import router from './routes';

const app = express();

const PORT = process.env.PORT || 3000;

// Mount router directly - routes already have their own paths defined
app.use(router);

// Health check route - no body parser needed
app.get('/', (req: Request, res: Response) => {
    res.send('WhatsApp API Server is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
    console.log(`Flow URL: http://localhost:${PORT}/flow`);
});
