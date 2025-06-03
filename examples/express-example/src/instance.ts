import { config } from './config';

import { WebhookHandler } from 'meta-cloud-api';

export const webhookHandler = new WebhookHandler(config);
