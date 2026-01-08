/**
 * Automatic Messages Interfaces
 * TypeScript interfaces for LivePerson Automatic Messages API
 * Use these interfaces in Vue frontend for type safety
 */

import {
  ILPBaseEntity,
  ILocalizedData,
  IAutoMessageContext,
  IAutoMessageAttributes,
} from '../../shared/lp-common.interfaces';

/**
 * Automatic message types (event names)
 */
export enum AutomaticMessageType {
  // Messaging
  CONVERSATION_STARTED = 'CONVERSATION_STARTED',
  CONVERSATION_ENDED = 'CONVERSATION_ENDED',
  CONVERSATION_TRANSFERRED = 'CONVERSATION_TRANSFERRED',
  TRANSFER_FAILED = 'TRANSFER_FAILED',
  CONVERSATION_TIMED_OUT = 'CONVERSATION_TIMED_OUT',
  CONVERSATION_BACK_TO_QUEUE = 'CONVERSATION_BACK_TO_QUEUE',
  AGENT_JOINED = 'AGENT_JOINED',
  AGENT_LEFT = 'AGENT_LEFT',
  // Chat
  CHAT_STARTED = 'CHAT_STARTED',
  CHAT_ENDED = 'CHAT_ENDED',
  VISITOR_IDLE = 'VISITOR_IDLE',
  AGENT_IDLE = 'AGENT_IDLE',
  // Queue
  QUEUE_MESSAGE = 'QUEUE_MESSAGE',
  QUEUE_MESSAGE_FIRST = 'QUEUE_MESSAGE_FIRST',
  QUEUE_MESSAGE_PERIODIC = 'QUEUE_MESSAGE_PERIODIC',
  // Survey
  SURVEY_STARTED = 'SURVEY_STARTED',
  // Off hours
  OFF_HOURS = 'OFF_HOURS',
  // PCS
  PCS_SURVEY = 'PCS_SURVEY',
  PCS_CANCEL = 'PCS_CANCEL',
}

/**
 * Channel types
 */
export enum AutoMessageChannel {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  MESSAGING = 'MESSAGING',
  APPLE_BUSINESS_CHAT = 'APPLE_BUSINESS_CHAT',
  WHATSAPP = 'WHATSAPP',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  SMS = 'SMS',
  RCS = 'RCS',
  GOOGLE = 'GOOGLE',
  TWITTER = 'TWITTER',
  LINE = 'LINE',
  KAKAO = 'KAKAO',
}

/**
 * Automatic message entity returned by LivePerson API
 */
export interface IAutomaticMessage extends ILPBaseEntity {
  id: number;
  deleted?: boolean;
  enabled: boolean;
  messageEventId: string;
  templateId?: string;
  data: ILocalizedData[];
  attributes?: IAutoMessageAttributes;
  context?: IAutoMessageContext;
  channels?: string[];
  dateCreated?: string;
  dateUpdated?: string;
}

/**
 * Data for creating a new automatic message
 */
export interface ICreateAutomaticMessage {
  enabled: boolean;
  messageEventId: string;
  templateId?: string;
  data: ILocalizedData[];
  attributes?: IAutoMessageAttributes;
  context?: IAutoMessageContext;
  channels?: string[];
}

/**
 * Data for updating an automatic message
 */
export interface IUpdateAutomaticMessage {
  enabled?: boolean;
  data?: ILocalizedData[];
  attributes?: IAutoMessageAttributes;
  context?: IAutoMessageContext;
  channels?: string[];
}

/**
 * Query parameters for automatic messages list
 */
export interface IAutomaticMessagesQuery {
  select?: string;
  includeDeleted?: boolean;
  skillId?: number;
  messageEventId?: string;
}

/**
 * Response structure for automatic messages list
 */
export interface IAutomaticMessagesResponse {
  data: IAutomaticMessage[];
  revision?: string;
}

/**
 * Response structure for single automatic message
 */
export interface IAutomaticMessageResponse {
  data: IAutomaticMessage;
  revision?: string;
}

/**
 * Default automatic message from LP
 */
export interface IDefaultAutomaticMessage {
  messageEventId: string;
  templateId: string;
  data: ILocalizedData[];
  attributes?: IAutoMessageAttributes;
}

/**
 * Response for default automatic messages
 */
export interface IDefaultAutomaticMessagesResponse {
  data: IDefaultAutomaticMessage[];
}
