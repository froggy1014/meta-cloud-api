export const nextScreen = (parameter: NextScreenType) => {
    return parameter;
};

export const completeScreen = (parameter: CompleteScreenType) => {
    return parameter;
};

export interface NextScreenType {
    screen: string;
    flow_token?: string;
    version?: string;
    action?: string;
    data?: Record<string, any> & { error_message?: string | null };
}

export interface CompleteScreenType {
    screen: 'SUCCESS';
    data: {
        extension_message_response: {
            params: {
                flow_token?: string;
            } & Record<string, any>;
        };
    };
}
