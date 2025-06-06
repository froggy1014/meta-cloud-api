import { MessageTypesEnum } from '../../types/enums';
import { MessageRequestBody } from './common';

// Reaction Message Types
type ReActionObject = {
    message_id: string;
    emoji: string;
};

export type ReactionMessageRequestBody = MessageRequestBody<MessageTypesEnum.Reaction> & ReActionObject;

export interface ReactionParams {
    messageId: string;
    emoji: string;
    to: string;
}
