import { readEnv } from './runtime';

export function printLogo() {
    // Skip logo output in test environment
    if (
        readEnv('NODE_ENV') === 'test' ||
        readEnv('VITEST') === 'true' ||
        (typeof global !== 'undefined' && (global as any).__VITEST__)
    ) {
        return;
    }

    console.log(
        '\x1b[36m%s\x1b[0m',
        `
██████╗ ██╗       ██████╗  ██╗   ██╗ ██████╗       █████╗  ██████╗  ██╗
██╔════╝ ██║      ██╔═══██╗ ██║   ██║ ██╔══██╗     ██╔══██╗ ██╔══██╗ ██║
██║      ██║      ██║   ██║ ██║   ██║ ██║  ██║     ███████║ ██████╔╝ ██║
██║      ██║      ██║   ██║ ██║   ██║ ██║  ██║     ██╔══██║ ██╔═══╝  ██║
╚██████╗ ███████╗ ╚██████╔╝ ╚██████╔╝ ██████╔╝     ██║  ██║ ██║      ██║
 ╚═════╝ ╚══════╝  ╚═════╝   ╚═════╝  ╚═════╝      ╚═╝  ╚═╝ ╚═╝      ╚═╝
`,
    );
}
