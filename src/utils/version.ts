import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Get SDK version from package.json
 */
export function getVersion(): string {
    try {
        const packagePath = join(__dirname, '../../package.json');
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
        return packageJson.version;
    } catch (error) {
        return 'unknown';
    }
}

/**
 * Generate User-Agent string following official SDK pattern
 */
export function getUserAgent(): string {
    const version = getVersion();
    const nodeVersion = process.version;
    return `WhatsApp-Nodejs-SDK/${version} (Node.js ${nodeVersion})`;
}
