import path from 'path';
import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import openapiDoc from '../schemas/openapi.json';

export const router = Router();

const customCssUrl = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';
const customCss = `
    .swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }
`;

router.use('/', swaggerUi.serve);
router.get(
    '/',
    swaggerUi.setup(openapiDoc, {
        customCss,
        customCssUrl,
    }),
);

router.use('/openapi.json', express.static(path.join(__dirname, '../schemas/openapi.json')));
