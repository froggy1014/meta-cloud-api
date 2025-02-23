import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import messageRoutes from '../src/routes/message';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());

app.use('/swagger-ui-assets', express.static(path.join(__dirname, '../node_modules/swagger-ui-dist')));

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Meta Cloud API',
            version: '1.0.0',
            description: 'API Documentation for Meta Cloud',
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
    apis: ['dist/src/routes/*.ts', 'dist/src/spec/*.spec.yaml'],
};

const swaggerDocs = swaggerJsDoc(options);

app.use(
    '/swagger-ui',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, {
        customCssUrl: '/swagger-ui-assets/swagger-ui.css',
        customSiteTitle: 'Meta Cloud API',
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
