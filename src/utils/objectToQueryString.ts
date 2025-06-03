export const objectToQueryString = (params: Record<string, any>): string => {
    if (!params || Object.keys(params).length === 0) {
        return '';
    }

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
            searchParams.append(key, String(value));
        }
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
};
