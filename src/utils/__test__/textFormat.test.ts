import { describe, expect, it } from 'vitest';
import { bold, bulletList, inlineCode, italic, monospace, numberedList, quote, strikethrough } from '../textFormat';

describe('text formatting helpers', () => {
    it('wraps text in the WhatsApp inline markers', () => {
        expect(bold('Hello')).toBe('*Hello*');
        expect(italic('Hello')).toBe('_Hello_');
        expect(strikethrough('Hello')).toBe('~Hello~');
        expect(inlineCode('npm i')).toBe('`npm i`');
    });

    it('keeps surrounding whitespace outside the markers', () => {
        expect(bold('  Hello  ')).toBe('  *Hello*  ');
        expect(italic('\tHello')).toBe('\t_Hello_');
    });

    it('applies inline markers per line because they cannot span line breaks', () => {
        expect(bold('one\ntwo')).toBe('*one*\n*two*');
        expect(strikethrough('one\n\ntwo')).toBe('~one~\n\n~two~');
    });

    it('leaves empty and whitespace-only text untouched', () => {
        expect(bold('')).toBe('');
        expect(italic('   ')).toBe('   ');
        expect(monospace('')).toBe('');
    });

    it('nests markers', () => {
        expect(bold(italic('Hello'))).toBe('*_Hello_*');
    });

    it('wraps monospace blocks in triple backticks, spanning lines', () => {
        expect(monospace('a\nb')).toBe('```a\nb```');
    });

    it('prefixes every line of a quote', () => {
        expect(quote('one\ntwo')).toBe('> one\n> two');
    });

    it('builds bulleted and numbered lists', () => {
        expect(bulletList(['a', 'b'])).toBe('- a\n- b');
        expect(numberedList(['a', 'b', 'c'])).toBe('1. a\n2. b\n3. c');
        expect(bulletList([])).toBe('');
    });
});
