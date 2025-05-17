import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['CLOUD_API_ACCESS_TOKEN', 'WA_PHONE_NUMBER_ID', 'VERIFY_TOKEN'];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Create a .env file with these variables or set them in your environment');
    process.exit(1);
}
// Constants
export const PORT = Number(process.env.PORT || 3000);
export const WEBHOOK_PATH = '/webhook';
export const VERIFY_TOKEN = process.env.VERIFY_TOKEN!;
export const ACCESS_TOKEN = process.env.CLOUD_API_ACCESS_TOKEN!;
export const PHONE_NUMBER_ID = Number(process.env.WA_PHONE_NUMBER_ID!);

export const CALLBACK_URL = process.env.CALLBACK_URL || `https://your-ngrok-url${WEBHOOK_PATH}`;
