import path from 'path';
import * as OpenApiValidator from 'express-openapi-validator';

export const validator = OpenApiValidator.middleware({
    apiSpec: path.join(__dirname, '../schemas/openapi.json'),
    validateRequests: true,
    validateResponses: true,
    validateApiSpec: false,
    ignorePaths: /.*\/(api-docs).*/,
});
