import { FlowEndpointRequest } from 'meta-cloud-api';

import { CompleteScreenType, NextScreenType, completeScreen, nextScreen } from '../type';

const recommendationOptions = [
    { id: '0_Yes', title: 'Yes' },
    { id: '1_No', title: 'No' },
];

const ratingOptions = [
    { id: '0_Excellent', title: '★★★★★ • Excellent (5/5)' },
    { id: '1_Good', title: '★★★★☆ • Good (4/5)' },
    { id: '2_Average', title: '★★★☆☆ • Average (3/5)' },
    { id: '3_Poor', title: '★★☆☆☆ • Poor (2/5)' },
    { id: '4_Very_Poor', title: '★☆☆☆☆ • Very Poor (1/5)' },
];

type ScreenResponse = NextScreenType | CompleteScreenType;

export const getFeedbackNextScreen = async (decryptedBody: FlowEndpointRequest): Promise<ScreenResponse> => {
    const { screen, data, action, flow_token } = decryptedBody;

    if (data?.error) {
        console.warn('Received client error:', data);
        return nextScreen({
            screen: 'RECOMMEND',
            flow_token: '',
            data: {
                acknowledged: true,
            },
        });
    }

    if (action === 'INIT') {
        return nextScreen({
            screen: 'RECOMMEND',
            flow_token: '',
            data: {
                recommendation_options: recommendationOptions,
            },
        });
    }

    if (action === 'data_exchange') {
        switch (screen) {
            case 'RECOMMEND':
                return nextScreen({
                    screen: 'RATE',
                    flow_token: '',
                    data: {
                        rating_options: ratingOptions,
                        screen_0_Choose_one_0: data?.screen_0_Choose_one_0,
                        screen_0_Leave_a_comment_1: data?.screen_0_Leave_a_comment_1,
                        ...data,
                    },
                });

            case 'RATE':
                return completeScreen({
                    screen: 'SUCCESS',
                    data: {
                        extension_message_response: {
                            params: {
                                flow_token,
                                ...data,
                                submitted_at: new Date().toISOString(),
                                feedback_type: 'customer_satisfaction',
                            },
                        },
                    },
                });

            default:
                break;
        }
    }

    console.error('Unhandled request body:', decryptedBody);
    throw new Error('Unhandled endpoint request. Make sure you handle the request action & screen logged above.');
};
