import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import type { Props } from '@theme/Footer/Layout';

export default function FooterLayout({ style, links, logo, copyright }: Props): ReactNode {
    return (
        <footer
            className={clsx(
                'footer border-t border-gray-800 py-16',
                {
                    'footer--dark': style === 'dark',
                },
                'bg-[#111827]!',
            )}
        >
            <div className="container mx-auto px-4">
                {links}
                {copyright}
            </div>
        </footer>
    );
}
