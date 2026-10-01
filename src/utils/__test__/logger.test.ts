import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { LoggerInterface } from '../../types/logger';
import Logger from '../logger';

afterEach(() => vi.restoreAllMocks());

describe('Logger', () => {
    it('implements LoggerInterface, including debug()', () => {
        expectTypeOf(Logger).instance.toExtend<LoggerInterface>();
        expect(typeof new Logger('X').debug).toBe('function');
    });

    it('prints debug/log/info/warn only when debug is enabled', () => {
        const spies = (['debug', 'log', 'info', 'warn'] as const).map((m) =>
            vi.spyOn(console, m).mockImplementation(() => {}),
        );
        const quiet = new Logger('Q');
        quiet.debug('a');
        quiet.log('a');
        quiet.info('a');
        quiet.warn('a');
        for (const spy of spies) expect(spy).not.toHaveBeenCalled();

        const loud = new Logger('L', true);
        loud.debug('a');
        loud.log('a');
        loud.info('a');
        loud.warn('a');
        for (const spy of spies) expect(spy).toHaveBeenCalledOnce();
    });

    it('always prints errors and serializes objects and errors', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const circular: Record<string, unknown> = { a: 1 };
        circular.self = circular;
        new Logger('E').error('boom', circular, new Error('bad'));
        const printed = spy.mock.calls[0]?.join(' ') ?? '';
        expect(printed).toContain('ERROR - E');
        expect(printed).toContain('[Circular]');
        expect(printed).toContain('Error: bad');
    });
});
