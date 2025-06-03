import { Request, Response } from 'express';
import { FlowTypeEnum, isFlowDataExchangeRequest, isFlowErrorRequest, WebhookHandler } from 'meta-cloud-api';
import { config } from '../config';

const wa = new WebhookHandler(config);

// Register flow handlers
wa.onFlow(FlowTypeEnum.Ping, async (_, request) => {
    return {
        data: {
            status: 'active',
        },
    };
});

wa.onFlow(FlowTypeEnum.Error, async (_, request) => {
    return {
        data: {
            acknowledged: true,
        },
    };
});

wa.onFlow(FlowTypeEnum.Change, async (_, request) => {
    if (isFlowDataExchangeRequest(request) || isFlowErrorRequest(request)) {
        const { flow_token } = request;
        console.log('🚀 ~ wa.onFlow ~ flow_token:', flow_token);
        // Handle the flow data exchange or error
        return {
            data: {
                // Add your response data here
                flow_token,
            },
        };
    }

    return {
        data: {},
    };
});

const handler = async (req: Request, res: Response) => {
    if (req.method === 'POST') {
        // Ensure rawBody is available - this should be set by middleware
        const reqWithRawBody = req as Request & { rawBody: string };

        if (!reqWithRawBody.rawBody) {
            res.status(400).send('Raw body is required for flow requests');
            return;
        }

        return await wa.handleFlowRequest(reqWithRawBody, res);
    }
};

export default handler;
