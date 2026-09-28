import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { APIRoute } from 'astro';
import satori from 'satori';
import sharp from 'sharp';

// Generated at build time (static output) and served as /og-image-1200x630.png.
export const prerender = true;

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Hardcoded colors — the image renders outside the document, so CSS variables resolve to nothing.
 * Accent is TypeScript blue, the word "WhatsApp" uses WhatsApp green; neutrals mirror the dark theme tokens in src/styles/custom.css.
 */
const BRAND = {
    accent: '#3178c6', // TypeScript brand blue
    accentHigh: '#5ea2ef',
    whatsapp: '#25d366', // WhatsApp brand green
    bg: '#0d0f12', // --sl-color-black
    fg: '#f2f2f2', // --sl-color-white
    muted: '#9ea3ad', // --sl-color-gray-2
    terminalBg: '#0a0c0f', // --terminal-bg
    terminalBorder: '#2a2e33', // --terminal-border
} as const;

/** WhatsApp glyph, 24x24 viewBox. Satori can't render raw <path> children, so it's embedded as a data URI. */
const LOGO_PATH =
    'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';

function logoDataUri(size: number, fill = '#ffffff') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}"><path d="${LOGO_PATH}"/></svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Minimal element factory so the layout reads like JSX without pulling React into an endpoint.
type Node = { type: string; props: Record<string, unknown> };
function h(type: string, props: Record<string, unknown>, ...children: (Node | string)[]): Node {
    if (children.length === 0) return { type, props };
    return { type, props: { ...props, children: children.length === 1 ? children[0] : children } };
}

const require = createRequire(import.meta.url);
const font = (path: string) => readFileSync(require.resolve(path));

const sdkVersion: string = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf-8')).version;

export const GET: APIRoute = async () => {
    const headline = { fontSize: 76, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em' };

    const tree = h(
        'div',
        {
            style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 72,
                background: BRAND.bg,
                fontFamily: 'Inter',
            },
        },
        // Accent glow — mirrors the hero glow on the landing page
        h('div', {
            style: {
                position: 'absolute',
                top: -260,
                left: 300,
                width: 800,
                height: 520,
                background: `radial-gradient(circle, ${BRAND.accent}40 0%, ${BRAND.bg}00 70%)`,
            },
        }),
        // Wordmark
        h(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: 18 } },
            h(
                'div',
                {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: BRAND.accent,
                    },
                },
                h('img', { src: logoDataUri(38), width: 38, height: 38 }),
            ),
            h('div', { style: { fontSize: 34, fontWeight: 700, color: BRAND.fg } }, 'meta-cloud-api'),
            h(
                'div',
                {
                    style: {
                        display: 'flex',
                        padding: '8px 18px',
                        marginLeft: 6,
                        borderRadius: 999,
                        border: `1px solid ${BRAND.accent}66`,
                        background: `${BRAND.accent}1a`,
                        color: BRAND.accentHigh,
                        fontSize: 22,
                        fontWeight: 400,
                    },
                },
                `v${sdkVersion}`,
            ),
        ),
        // Headline
        h(
            'div',
            { style: { display: 'flex', flexDirection: 'column' } },
            h(
                'div',
                { style: { ...headline, display: 'flex', color: BRAND.fg } },
                h('span', { style: { color: BRAND.accentHigh, marginRight: '0.25em' } }, 'TypeScript'),
                h('span', {}, 'SDK for the'),
            ),
            h(
                'div',
                { style: { ...headline, display: 'flex', color: BRAND.fg } },
                h('span', { style: { color: BRAND.whatsapp, marginRight: '0.25em' } }, 'WhatsApp'),
                h('span', {}, 'Cloud API'),
            ),
            h(
                'div',
                { style: { marginTop: 26, fontSize: 30, color: BRAND.muted, lineHeight: 1.4 } },
                'Type-safe messaging, webhooks, and framework adapters.',
            ),
        ),
        // Install command
        h(
            'div',
            { style: { display: 'flex' } },
            h(
                'div',
                {
                    style: {
                        display: 'flex',
                        padding: '18px 26px',
                        borderRadius: 14,
                        border: `1px solid ${BRAND.terminalBorder}`,
                        background: BRAND.terminalBg,
                        fontFamily: 'JetBrains Mono',
                        fontSize: 26,
                    },
                },
                h('span', { style: { color: BRAND.muted, marginRight: 14 } }, '$'),
                h('span', { style: { color: BRAND.accentHigh } }, 'pnpm add meta-cloud-api'),
            ),
        ),
    );

    const svg = await satori(tree as Parameters<typeof satori>[0], {
        width: WIDTH,
        height: HEIGHT,
        fonts: [
            { name: 'Inter', data: font('@fontsource/inter/files/inter-latin-400-normal.woff'), weight: 400 },
            { name: 'Inter', data: font('@fontsource/inter/files/inter-latin-700-normal.woff'), weight: 700 },
            {
                name: 'JetBrains Mono',
                data: font('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff'),
                weight: 500,
            },
        ],
    });
    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
