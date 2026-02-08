import * as crypto from 'node:crypto';

export const generateXHub256Sig = (body: string, appSecret: string) => {
    return crypto.createHmac('sha256', appSecret).update(body, 'utf-8').digest('hex');
};
