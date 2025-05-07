export function buildFieldsQueryString(fields?: string[]): string {
    if (!fields) return '';

    let fieldParams = '';

    if (Array.isArray(fields)) {
        fieldParams = fields.join(',');
    } else {
        fieldParams = Object.entries(fields)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .join(',');
    }

    return fieldParams ? `?fields=${fieldParams}` : '';
}
