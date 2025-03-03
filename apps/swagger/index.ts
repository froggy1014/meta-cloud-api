import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
// import messageRoutes from './routes/message';

import dotenv from 'dotenv';

dotenv.config();

const CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';
const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Meta Cloud API',
            version: '1.0.0',
            description: 'API Documentation for Meta Cloud API',
        },
        servers: [
            {
                url:
                    process.env.NODE_ENV === 'production'
                        ? `https://${process.env.VERCEL_URL}`
                        : 'http://localhost:8080',
                description: 'Production server',
            },
            {
                url: 'http://localhost:8080',
                description: 'Local server',
            },
        ],
    },
    apis: ['src/**/*.js', 'src/**/*.yaml'],
};

const swaggerDocs = swaggerJsDoc(options);

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, {
        customCssUrl: CSS_URL,
    }),
);

app.use('/swagger.json', (req: Request, res: Response) => {
    res.json(swaggerDocs);
});

app.get('/', (req, res) => res.send('Express on Vercel'));
app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

// app.use('/messages', messageRoutes);

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
