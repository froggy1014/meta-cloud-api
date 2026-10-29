/**
 * Helpers that produce WhatsApp text formatting markup for message bodies.
 *
 * WhatsApp renders `*bold*`, `_italic_`, `~strikethrough~`, ```` ```monospace``` ````,
 * `` `inline code` ``, `> quote`, `- bullet` and `1. numbered` lines. Inline markers must sit
 * directly against the text they wrap and cannot span a line break, so the inline helpers apply
 * their markers per line and keep leading and trailing whitespace outside the markers.
 *
 * @see {@link https://faq.whatsapp.com/539178204879377 | WhatsApp FAQ: How to format your messages}
 */

function wrapInline(text: string, marker: string): string {
    return text
        .split('\n')
        .map((line) => {
            const match = /^(\s*)(.*?)(\s*)$/s.exec(line);
            if (!match) return line;
            const [, leading, content, trailing] = match;
            if (!content) return line;
            return `${leading}${marker}${content}${marker}${trailing}`;
        })
        .join('\n');
}

/** Wrap text in `*` so WhatsApp renders it bold. Applied per line. */
export function bold(text: string): string {
    return wrapInline(text, '*');
}

/** Wrap text in `_` so WhatsApp renders it italic. Applied per line. */
export function italic(text: string): string {
    return wrapInline(text, '_');
}

/** Wrap text in `~` so WhatsApp renders it struck through. Applied per line. */
export function strikethrough(text: string): string {
    return wrapInline(text, '~');
}

/** Wrap text in `` ` `` so WhatsApp renders it as inline code. Applied per line. */
export function inlineCode(text: string): string {
    return wrapInline(text, '`');
}

/** Wrap text in triple backticks so WhatsApp renders it as a monospace block. May span lines. */
export function monospace(text: string): string {
    if (text.trim() === '') return text;
    return `\`\`\`${text}\`\`\``;
}

/** Prefix every line with `> ` so WhatsApp renders a block quote. */
export function quote(text: string): string {
    return text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
}

/** Render items as a WhatsApp bulleted list, one `- item` per line. */
export function bulletList(items: readonly string[]): string {
    return items.map((item) => `- ${item}`).join('\n');
}

/** Render items as a WhatsApp numbered list, `1. item`, `2. item`, and so on. */
export function numberedList(items: readonly string[]): string {
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}
