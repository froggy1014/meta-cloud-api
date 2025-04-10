import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import LinkItem from '@theme/Footer/LinkItem';
import type { Props } from '@theme/Footer/Links/MultiColumn';

type ColumnType = Props['columns'][number];
type ColumnItemType = ColumnType['items'][number];

function ColumnLinkItem({ item }: { item: ColumnItemType }) {
    return item.html ? (
        <li
            className={clsx('mb-2', item.className)}
            // Developer provided the HTML, so assume it's safe.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: item.html }}
        />
    ) : (
        <li className="mb-2">
            <LinkItem item={item} />
        </li>
    );
}

function Column({ column }: { column: ColumnType }) {
    return (
        <div className={clsx('column flex flex-col', column.className)}>
            <h2 className="mb-6 text-3xl font-bold text-white">{column.title}</h2>
            <ul className="p-0! list-none space-y-2">
                {column.items.map((item, i) => (
                    <ColumnLinkItem key={i} item={item} />
                ))}
            </ul>
        </div>
    );
}

export default function FooterLinksMultiColumn({ columns }: Props): ReactNode {
    return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {columns.map((column, i) => (
                <Column key={i} column={column} />
            ))}
        </div>
    );
}
