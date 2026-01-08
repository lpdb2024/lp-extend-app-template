/**
 * Messaging REST API Interfaces
 * TypeScript interfaces for LivePerson Messaging REST API (Connector API)
 * Use these interfaces in Vue frontend for type safety
 *
 * Documentation:
 * https://developers.liveperson.com/messaging-rest-api-overview.html
 * https://developers.liveperson.com/messaging-rest-api-api-reference.html
 */

/**
 * Message content types
 */
export enum MessageContentType {
  TEXT_PLAIN = 'text/plain',
  TEXT_HTML = 'text/html',
  STRUCTURED_CONTENT = 'application/json',
}

/**
 * Message event types
 */
export enum MessageEventType {
  CONTENT_EVENT = 'ContentEvent',
  RICH_CONTENT_EVENT = 'RichContentEvent',
  ACCEPT_STATUS_EVENT = 'AcceptStatusEvent',
  CHAT_STATE_EVENT = 'ChatStateEvent',
}

/**
 * Chat state values
 */
export enum ChatState {
  ACTIVE = 'ACTIVE',
  COMPOSING = 'COMPOSING',
  PAUSE = 'PAUSE',
  INACTIVE = 'INACTIVE',
  GONE = 'GONE',
  BACKGROUND = 'BACKGROUND',
}

/**
 * Accept status values
 */
export enum AcceptStatus {
  ACCEPT = 'ACCEPT',
  READ = 'READ',
  ACTION = 'ACTION',
}

/**
 * Conversation state
 */
export enum ConversationState {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
}

/**
 * Participant role
 */
export enum ParticipantRole {
  CONSUMER = 'CONSUMER',
  AGENT = 'AGENT',
  ASSIGNED_AGENT = 'ASSIGNED_AGENT',
  MANAGER = 'MANAGER',
  CONTROLLER = 'CONTROLLER',
}

/**
 * Close conversation reason codes
 */
export enum CloseReason {
  AGENT = 'AGENT',
  CONSUMER = 'CONSUMER',
  SYSTEM = 'SYSTEM',
  TRANSFER = 'TRANSFER',
}

// ============================================
// Message Content Types
// ============================================

/**
 * Base message content
 */
export interface IMessageContent {
  type: MessageContentType;
  message?: string;
}

/**
 * Text message content
 */
export interface ITextMessageContent extends IMessageContent {
  type: MessageContentType.TEXT_PLAIN | MessageContentType.TEXT_HTML;
  message: string;
}

/**
 * Structured content message
 */
export interface IStructuredContentMessage extends IMessageContent {
  type: MessageContentType.STRUCTURED_CONTENT;
  structuredContent?: any;
  quickReplies?: IQuickReply;
}

/**
 * Quick reply structure
 */
export interface IQuickReply {
  type: string;
  itemsPerRow: number;
  replies: IReply[];
}

/**
 * Individual reply button
 */
export interface IReply {
  type: string;
  tooltip: string;
  title: string;
  click: IClickAction;
}

/**
 * Click action for buttons
 */
export interface IClickAction {
  actions: IAction[];
  metadata?: IActionMetadata[];
}

/**
 * Action definition
 */
export interface IAction {
  type: string;
  name?: string;
  text?: string;
}

/**
 * Action metadata
 */
export interface IActionMetadata {
  type: string;
  id: string;
}

// ============================================
// Event Types
// ============================================

/**
 * Base event structure
 */
export interface IEvent {
  type: MessageEventType;
  sequenceId?: number;
  dialogId?: string;
}

/**
 * Content event (text message)
 */
export interface IContentEvent extends IEvent {
  type: MessageEventType.CONTENT_EVENT;
  message: string;
  contentType?: MessageContentType;
}

/**
 * Rich content event (structured content)
 */
export interface IRichContentEvent extends IEvent {
  type: MessageEventType.RICH_CONTENT_EVENT;
  content: any;
}

/**
 * Accept status event (read receipts)
 */
export interface IAcceptStatusEvent extends IEvent {
  type: MessageEventType.ACCEPT_STATUS_EVENT;
  status: AcceptStatus;
  sequenceList?: number[];
}

/**
 * Chat state event (typing indicators)
 */
export interface IChatStateEvent extends IEvent {
  type: MessageEventType.CHAT_STATE_EVENT;
  chatState: ChatState;
}

// ============================================
// Conversation Management Types
// ============================================

/**
 * Consumer information
 */
export interface IConsumerInfo {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  personalInfo?: IPersonalInfo;
}

/**
 * Personal information
 */
export interface IPersonalInfo {
  firstname?: string;
  lastname?: string;
  age?: IAge;
  contacts?: IContact[];
  gender?: string;
  company?: string;
  language?: string;
}

/**
 * Age information
 */
export interface IAge {
  age: number;
  year: number;
  month: number;
  day: number;
}

/**
 * Contact information
 */
export interface IContact {
  email?: string;
  phone?: string;
  phoneType?: string;
  address?: IAddress;
}

/**
 * Address information
 */
export interface IAddress {
  country?: string;
  region?: string;
}

/**
 * Conversation participant
 */
export interface IParticipant {
  id: string;
  role: ParticipantRole;
}

/**
 * Conversation context data
 */
export interface IConversationContext {
  type?: string;
  lang?: string;
  visitorId?: string;
  sessionId?: string;
  interactionContextId?: string;
  skillId?: string;
  campaignId?: string;
  engagementId?: string;
}

/**
 * Set conversation field request
 */
export interface ISetConversationField {
  conversationField?: {
    field: string;
    value: string;
  }[];
}

/**
 * Transfer skill request
 */
export interface ITransferSkillRequest {
  skill: string | number;
}

/**
 * Conversation state request
 */
export interface IConversationStateRequest {
  conversationId: string;
  conversationState: ConversationState;
}

// ============================================
// Request Types
// ============================================

/**
 * Create conversation request
 */
export interface ICreateConversationRequest {
  kind: 'req';
  id: string;
  type: 'userprofile.SetUserProfile' | 'cm.ConsumerRequestConversation';
  body?: {
    authenticatedData?: {
      lp_sdes?: any[];
    };
    unAuthenticatedData?: {
      lp_sdes?: any[];
    };
    brandId?: string;
    skillId?: string;
    campaignInfo?: {
      campaignId?: number;
      engagementId?: number;
    };
    conversationContext?: IConversationContext;
    channelType?: string;
  };
}

/**
 * Send message request
 */
export interface ISendMessageRequest {
  kind: 'req';
  id: string;
  type: 'ms.PublishEvent';
  body: {
    dialogId: string;
    event: IEvent;
  };
}

/**
 * Close conversation request
 */
export interface ICloseConversationRequest {
  kind: 'req';
  id: string;
  type: 'cm.UpdateConversationField';
  body: {
    conversationId: string;
    conversationField: Array<{
      field: 'ConversationStateField';
      conversationState: ConversationState.CLOSE;
    }>;
  };
}

/**
 * Update conversation field request
 */
export interface IUpdateConversationFieldRequest {
  kind: 'req';
  id: string;
  type: 'cm.UpdateConversationField';
  body: {
    conversationId: string;
    conversationField: Array<{
      field: string;
      [key: string]: any;
    }>;
  };
}

/**
 * Subscribe messaging events request
 */
export interface ISubscribeMessagingEventsRequest {
  kind: 'req';
  id: string;
  type: 'ms.SubscribeMessagingEvents';
  body: {
    dialogId?: string;
    fromSeq?: number;
  };
}

/**
 * Unsubscribe messaging events request
 */
export interface IUnsubscribeMessagingEventsRequest {
  kind: 'req';
  id: string;
  type: 'ms.UnsubscribeMessagingEvents';
  body: {
    dialogId: string;
  };
}

/**
 * Get consumer profile request
 */
export interface IGetConsumerProfileRequest {
  kind: 'req';
  id: string;
  type: 'userprofile.GetUserProfile';
  body: {
    consumerId: string;
  };
}

// ============================================
// Response Types
// ============================================

/**
 * Generic success response
 */
export interface IMessagingResponse {
  kind: 'resp';
  reqId: string;
  code: number;
  body?: any;
  type?: string;
}

/**
 * Create conversation response
 */
export interface ICreateConversationResponse extends IMessagingResponse {
  body: {
    conversationId: string;
    consumerId?: string;
  };
}

/**
 * Get conversation response
 */
export interface IGetConversationResponse {
  conversationId: string;
  state: ConversationState;
  stage?: string;
  startTs?: number;
  closeTs?: number;
  metaDataLastUpdateTs?: number;
  participants: IParticipant[];
  dialogs?: IDialog[];
  brandId?: string;
  campaignInfo?: {
    campaignId?: number;
    engagementId?: number;
  };
  conversationContext?: IConversationContext;
}

/**
 * Dialog information
 */
export interface IDialog {
  dialogId: string;
  participantsDetails: IParticipantDetail[];
  dialogType: string;
  channelType: string;
  metaData?: any;
  state?: string;
  creationTs?: number;
  endTs?: number;
}

/**
 * Participant details
 */
export interface IParticipantDetail {
  id: string;
  role: ParticipantRole;
  state?: string;
}

/**
 * Consumer profile response
 */
export interface IConsumerProfileResponse {
  authenticatedData?: {
    lp_sdes?: any[];
  };
  unAuthenticatedData?: {
    lp_sdes?: any[];
  };
}

/**
 * Messaging event notification
 */
export interface IMessagingEventNotification {
  kind: 'notification';
  type: string;
  body: {
    changes: IConversationChange[];
  };
}

/**
 * Conversation change notification
 */
export interface IConversationChange {
  originatorId?: string;
  originatorClientProperties?: any;
  originatorMetadata?: any;
  serverTimestamp?: number;
  event?: IEvent;
  conversationId?: string;
  dialogId?: string;
  sequence?: number;
}

/**
 * Send message response
 */
export interface ISendMessageResponse extends IMessagingResponse {
  body: {
    sequence: number;
  };
}

/**
 * Error response
 */
export interface IMessagingErrorResponse {
  kind: 'resp';
  reqId: string;
  code: number;
  type?: string;
  body?: {
    title?: string;
    details?: string;
  };
}

// ============================================
// WebSocket Types
// ============================================

/**
 * WebSocket connection parameters
 */
export interface IWebSocketParams {
  accountId: string;
  token: string;
  userId?: string;
  v?: string;
}

/**
 * WebSocket message
 */
export interface IWebSocketMessage {
  kind: 'req' | 'resp' | 'notification';
  id?: string;
  reqId?: string;
  type: string;
  code?: number;
  body?: any;
}

// ============================================
// Query Parameters
// ============================================

/**
 * Get conversations query parameters
 */
export interface IGetConversationsQuery {
  v?: number;
  status?: ConversationState[];
  sort?: string;
  offset?: number;
  limit?: number;
}

/**
 * Get conversation by ID query parameters
 */
export interface IGetConversationQuery {
  v?: number;
}
