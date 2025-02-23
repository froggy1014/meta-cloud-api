import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import messageRoutes from './routes/message';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Swagger setup
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
                url: process.env.VERCEL_URL || 'http://localhost:8080',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/spec/*.spec.yaml'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/messages', messageRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
