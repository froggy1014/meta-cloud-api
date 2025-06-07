export function buildFieldsQueryString(fields?: string[] | string): string {
    if (!fields) return '';

    let fieldParams = '';

    if (Array.isArray(fields)) {
        fieldParams = fields.join(',');
    } else if (typeof fields === 'string') {
        fieldParams = fields;
    } else {
        fieldParams = Object.entries(fields)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .join(',');
    }

    return fieldParams ? `?fields=${fieldParams}` : '';
}
