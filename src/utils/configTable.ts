import type { WabaConfigType } from '../types/config';
import { WabaConfigEnum } from '../types/enums';

/**
 * Formats configuration as a terminal table
 * @param config - The WABA configuration object
 * @param apiName - The name of the API being initialized
 * @returns Formatted table string
 */
export function formatConfigTable(config: WabaConfigType): string {
    const configData = [
        ['App ID', config[WabaConfigEnum.AppId] || 'Not Set'],
        ['Phone Number ID', config[WabaConfigEnum.PhoneNumberId]?.toString() || 'Not Set'],
        ['Business Account ID', config[WabaConfigEnum.BusinessAcctId] || 'Not Set'],
        ['API Version', config[WabaConfigEnum.APIVersion] || 'Not Set'],
        [
            'Access Token',
            config[WabaConfigEnum.AccessToken]
                ? `${config[WabaConfigEnum.AccessToken].substring(0, 20)}...`
                : 'Not Set',
        ],
        ['Webhook Endpoint', config[WabaConfigEnum.WebhookEndpoint] || 'Not Set'],
        [
            'Webhook Verification Token',
            config[WabaConfigEnum.WebhookVerificationToken]
                ? `${config[WabaConfigEnum.WebhookVerificationToken].substring(0, 10)}...`
                : 'Not Set',
        ],
        ['Listener Port', config[WabaConfigEnum.ListenerPort]?.toString() || 'Not Set'],
        ['Debug Mode', config[WabaConfigEnum.Debug] ? 'Enabled' : 'Disabled'],
        ['Max Retries', config[WabaConfigEnum.MaxRetriesAfterWait]?.toString() || 'Not Set'],
        [
            'Request Timeout',
            config[WabaConfigEnum.RequestTimeout] ? `${config[WabaConfigEnum.RequestTimeout]}ms` : 'Not Set',
        ],
        ['Private PEM', config[WabaConfigEnum.PrivatePem] ? 'Configured' : 'Not Set'],
        ['Passphrase', config[WabaConfigEnum.Passphrase] ? 'Configured' : 'Not Set'],
    ];

    // Calculate column widths
    const maxKeyLength = Math.max(...configData.map(([key]) => key?.length || 0));
    const maxValueLength = Math.max(...configData.map(([, value]) => value?.length || 0));

    const keyWidth = Math.max(maxKeyLength, 20);
    const valueWidth = Math.max(maxValueLength, 30);

    // Create table
    const horizontalLine = `┌${'─'.repeat(keyWidth + 2)}┬${'─'.repeat(valueWidth + 2)}┐`;
    const separator = `├${'─'.repeat(keyWidth + 2)}┼${'─'.repeat(valueWidth + 2)}┤`;
    const bottomLine = `└${'─'.repeat(keyWidth + 2)}┴${'─'.repeat(valueWidth + 2)}┘`;

    const header = `│ ${'Configuration'.padEnd(keyWidth)} │ ${'Value'.padEnd(valueWidth)} │`;

    const rows = configData.map(([key, value]) => `│ ${key?.padEnd(keyWidth)} │ ${value?.padEnd(valueWidth)} │`);

    return [horizontalLine, header, separator, ...rows, bottomLine].join('\n');
}
