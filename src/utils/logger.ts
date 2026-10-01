// @ts-nocheck
import type { LoggerInterface } from '../types/logger';

export default class Logger implements LoggerInterface {
    private name: string;
    private debug: boolean;

    constructor(name: string, debug: boolean = false) {
        this.name = name;
        this.debug = debug;
    }

    private formatData(data: any[]): string {
        return data.map((item) => (typeof item === 'object' && item !== null ? stringify(item) : item)).join(' ');
    }

    log(...data: any[]) {
        if (this.debug) {
            let prefix = `[ ${Date.now()} ]`;
            if (this.name) {
                prefix += ` - ${this.name}`;
            }
            console.log(prefix, ': ', this.formatData(data));
        }
    }

    error(...data: any[]) {
        let prefix = `[ ${Date.now()} ] - ERROR`;
        if (this.name) {
            prefix += ` - ${this.name}`;
        }
        console.error(prefix, ': ', this.formatData(data));
    }

    warn(...data: any[]) {
        if (this.debug) {
            let prefix = `[ ${Date.now()} ] - WARN`;
            if (this.name) {
                prefix += ` - ${this.name}`;
            }
            console.warn(prefix, ': ', this.formatData(data));
        }
    }

    info(...data: any[]) {
        if (this.debug) {
            let prefix = `[ ${Date.now()} ] - INFO`;
            if (this.name) {
                prefix += ` - ${this.name}`;
            }
            console.info(prefix, ': ', this.formatData(data));
        }
    }
}

/**
 * Serialize log data without `node:util` so logging works on every runtime.
 * Errors keep their message and stack; circular references are marked.
 */
function stringify(value: object): string {
    if (value instanceof Error) {
        return value.stack || `${value.name}: ${value.message}`;
    }
    const seen = new WeakSet<object>();
    try {
        return JSON.stringify(
            value,
            (_key, val) => {
                if (val instanceof Error) {
                    return { name: val.name, message: val.message, stack: val.stack };
                }
                if (typeof val === 'bigint') return val.toString();
                if (typeof val === 'object' && val !== null) {
                    if (seen.has(val)) return '[Circular]';
                    seen.add(val);
                }
                return val;
            },
            2,
        );
    } catch {
        return String(value);
    }
}
