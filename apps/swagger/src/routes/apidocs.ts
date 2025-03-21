import express, { Router } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import openapiDoc from '../schemas/openapi.json';

export const router = Router();

const customCssUrl = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';

router.use('/', swaggerUi.serve);
router.get(
    '/',
    swaggerUi.setup(openapiDoc, {
        customCssUrl,
        customCss: `
        .opblock-summary-path-description-wrapper {
            align-items: center;
            display: flex;
            flex-wrap: wrap;
            gap: 0 10px;
            padding: 0 10px;
            width: 100%;
        }

        .opblock-control-arrow {
            background: none;
            border: none;
            box-shadow: none;
        }

        .copy-to-clipboard {
            height: 26px !important;
            position: static !important;
        }
            `,
    }),
);

router.use('/openapi.json', express.static(path.join(__dirname, '../schemas/openapi.json')));
