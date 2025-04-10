import React, { type ReactNode } from 'react';
import type { Props } from '@theme/Footer/Copyright';

export default function FooterCopyright({ copyright }: Props): ReactNode {
    // Override the copyright content to match the desired format
    const currentYear = new Date().getFullYear();
    const customCopyright = `© ${currentYear} Meta Cloud API. Built with Docusaurus.`;

    return (
        <div
            className="footer__copyright mt-8 text-center text-gray-400"
            // Developer provided the HTML, so assume it's safe.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: customCopyright }}
        />
    );
}
