import path from 'path';
import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import openapiDoc from '../schemas/openapi.json';

export const router = Router();

const CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openapiDoc, { customCssUrl: CSS_URL }));

router.use('/openapi.json', express.static(path.join(__dirname, '../schemas/openapi.json')));
