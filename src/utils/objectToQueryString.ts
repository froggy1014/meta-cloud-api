export const objectToQueryString = (params: Record<string, any>): string => {
    if (!params || Object.keys(params).length === 0) {
        return '';
    }

    const queryParts: string[] = [];

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
            const encodedKey = encodeURIComponent(key);
            const encodedValue = encodeURIComponent(String(value));
            queryParts.push(`${encodedKey}=${encodedValue}`);
        }
    }

    return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
};
