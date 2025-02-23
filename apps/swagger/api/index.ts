import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
// import messageRoutes from './routes/message';

import dotenv from 'dotenv';
import path from 'path';

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
    apis: [path.join(__dirname, 'src', 'routes', '*.js'), path.join(__dirname, 'src', 'spec', '*.yaml')],
};
console.log(
    "🚀 ~ options.path.join(__dirname, 'src', 'routes', '*.js':",
    path.join(__dirname, 'src', 'routes', '*.js'),
);
console.log(
    "🚀 ~ options.path.join(__dirname, 'src', 'spec', '*.yaml':",
    path.join(__dirname, 'src', 'spec', '*.yaml'),
);

const swaggerDocs = swaggerJsDoc(options);
console.log('🚀 ~ swaggerDocs:', swaggerDocs);

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
