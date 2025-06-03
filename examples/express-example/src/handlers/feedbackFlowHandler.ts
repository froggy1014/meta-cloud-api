import { FlowTypeEnum, isFlowDataExchangeRequest, isFlowErrorRequest } from 'meta-cloud-api';
import { webhookHandler as wa } from '../instance';
import { getFeedbackNextScreen } from '../screen/feedback';

// Handle Ping request - Verify that Flow is in active state
wa.onFlow(FlowTypeEnum.Ping, async (_, request) => {
    console.log('Feedback Flow Ping received:', request);
    const response = {
        data: {
            status: 'active',
        },
    };
    return response;
});

// Handle Error request - Acknowledge error situation
wa.onFlow(FlowTypeEnum.Error, async (_, request) => {
    console.log('Feedback Flow Error received:', request);
    return {
        data: {
            acknowledged: true,
        },
    };
});

// Handle Change request - Execute actual Flow logic
wa.onFlow(FlowTypeEnum.Change, async (_, request) => {
    console.log('Feedback Flow Change received:', request);

    if (isFlowDataExchangeRequest(request) || isFlowErrorRequest(request)) {
        try {
            // Call feedback screen processing logic
            const response = await getFeedbackNextScreen(request);
            console.log('Feedback Flow response:', response);
            return response;
        } catch (error) {
            console.error('Error processing feedback flow:', error);
            return {
                data: {
                    acknowledged: true,
                },
            };
        }
    }

    // Default response
    return {
        data: {
            acknowledged: true,
        },
    };
});

export { getFeedbackNextScreen };
