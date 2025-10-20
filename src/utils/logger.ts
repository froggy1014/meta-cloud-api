// @ts-nocheck
import { inspect } from 'util';
import type { LoggerInterface } from '../types/logger';

export default class Logger implements LoggerInterface {
    private name: string;
    private debug: boolean;

    constructor(name: string, debug: boolean = false) {
        this.name = name;
        this.debug = debug;
    }

    private formatData(data: any[]): string {
        return data
            .map((item) => (typeof item === 'object' ? inspect(item, { depth: null, colors: true }) : item))
            .join(' ');
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
