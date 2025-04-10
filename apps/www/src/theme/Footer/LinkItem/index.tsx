import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import type { Props } from '@theme/Footer/LinkItem';

export default function FooterLinkItem({ item }: Props): ReactNode {
    const { to, href, label, prependBaseUrlToHref, className, ...props } = item;
    const toUrl = useBaseUrl(to);
    const normalizedHref = useBaseUrl(href, { forcePrependBaseUrl: true });

    return (
        <Link
            className={clsx(
                'text-gray-500! flex items-center font-semibold transition-colors hover:text-white',
                className,
            )}
            {...(href
                ? {
                      href: prependBaseUrlToHref ? normalizedHref : href,
                  }
                : {
                      to: toUrl,
                  })}
            {...props}
        >
            <span>{label}</span>
            {href && !isInternalUrl(href) && <IconExternalLink />}
        </Link>
    );
}
