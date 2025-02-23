import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import messageRoutes from '../src/routes/message';

import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());

// Swagger setupVERCEL_URL
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Meta Cloud API',
            version: '1.0.0',
            description: 'API documentation',
        },
        servers: [
            {
                url:
                    process.env.NODE_ENV === 'production'
                        ? `https://${process.env.VERCEL_URL}`
                        : 'http://localhost:8080',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/spec/*.spec.yaml'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/swagger.json', (req, res) => {
    res.json(swaggerDocs);
});

app.get('/', (req, res) => {
    res.redirect('/swagger-ui');
});

app.use('/messages', messageRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
