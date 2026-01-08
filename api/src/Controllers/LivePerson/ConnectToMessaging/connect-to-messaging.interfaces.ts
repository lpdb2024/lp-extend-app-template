/**
 * Connect to Messaging API Interfaces
 * TypeScript interfaces for LivePerson Connect to Messaging (C2M) API
 * Enables transferring IVR/voice calls to messaging conversations
 * Use these interfaces in Vue frontend for type safety
 */

/**
 * Channel types for messaging handoff
 */
export enum ChannelType {
  MESSAGING = 'MESSAGING',
  TELEPHONY = 'TELEPHONY',
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
  MANAGER = 'MANAGER',
}

/**
 * Campaign information
 */
export interface ICampaignInfo {
  campaignId?: number;
  engagementId?: number;
  campaignName?: string;
  engagementName?: string;
  lobId?: number;
  lobName?: string;
}

/**
 * Consumer participant details
 */
export interface IConsumerParticipant {
  participantId?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: ParticipantRole;
  email?: string;
  phone?: string;
}

/**
 * Structured content element (rich content)
 */
export interface IStructuredContentElement {
  type: string;
  elements?: IStructuredContentElement[];
  text?: string;
  tooltip?: string;
  url?: string;
  click?: {
    actions?: Array<{
      type: string;
      name: string;
      value?: string;
    }>;
  };
  style?: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
    'background-color'?: string;
    size?: string;
  };
}

/**
 * Conversation context data (SDEs)
 */
export interface IConversationContext {
  type: string;
  customer?: {
    customerId?: string;
    customerName?: string;
    customerType?: string;
  };
  personal?: {
    firstname?: string;
    lastname?: string;
    gender?: string;
    language?: string;
    company?: string;
  };
  cart?: {
    total?: number;
    currency?: string;
    products?: Array<{
      product?: {
        name?: string;
        category?: string;
        sku?: string;
        price?: number;
      };
      quantity?: number;
    }>;
  };
  service?: {
    service?: {
      topic?: string;
      status?: number;
      category?: string;
      serviceId?: string;
    };
  };
  lead?: {
    lead?: {
      topic?: string;
      value?: number;
      currency?: string;
      leadId?: string;
    };
  };
  [key: string]: any;
}

/**
 * Skill routing configuration
 */
export interface ISkillRouting {
  skillId: number;
  skillName?: string;
  priority?: number;
}

/**
 * Consumer authentication
 */
export interface IConsumerAuth {
  type?: string;
  jwt?: string;
  code?: string;
}

// ============================================
// Request Types
// ============================================

/**
 * Request to create a new messaging conversation from IVR/voice
 */
export interface ICreateConversationRequest {
  campaignInfo?: ICampaignInfo;
  consumerParticipant?: IConsumerParticipant;
  context?: {
    type?: string;
    lang?: string;
    visitorId?: string;
    sessionId?: string;
    interactionContextId?: string;
    engagementAttributes?: IConversationContext[];
  };
  skill?: ISkillRouting;
  conversationContext?: {
    visitorId?: string;
    sessionId?: string;
    interactionContextId?: string;
    type?: ChannelType;
    lang?: string;
  };
  initialMessage?: {
    text?: string;
    structuredContent?: IStructuredContentElement;
  };
  authenticatedData?: IConsumerAuth;
  metadata?: Record<string, any>;
}

/**
 * Request to send a message to an existing conversation
 */
export interface ISendMessageRequest {
  conversationId: string;
  message: {
    text?: string;
    structuredContent?: IStructuredContentElement;
  };
  metadata?: Record<string, any>;
}

/**
 * Request to close a conversation
 */
export interface ICloseConversationRequest {
  conversationId: string;
  closeReason?: string;
  metadata?: Record<string, any>;
}

/**
 * Request to transfer conversation to skill
 */
export interface ITransferConversationRequest {
  conversationId: string;
  targetSkillId: number;
  targetSkillName?: string;
  transferReason?: string;
  metadata?: Record<string, any>;
}

// ============================================
// Response Types
// ============================================

/**
 * Conversation details in response
 */
export interface IConversationDetails {
  conversationId: string;
  state: ConversationState;
  stage?: string;
  startTs?: number;
  lastUpdateTs?: number;
  closeTs?: number;
  skillId?: number;
  agentId?: string;
  participants?: IConsumerParticipant[];
  metadata?: Record<string, any>;
}

/**
 * Message details in response
 */
export interface IMessageDetails {
  messageId: string;
  conversationId: string;
  sequence: number;
  type: string;
  text?: string;
  structuredContent?: IStructuredContentElement;
  timestamp: number;
  sentBy: string;
  role: ParticipantRole;
  metadata?: Record<string, any>;
}

/**
 * Response from creating a conversation
 */
export interface ICreateConversationResponse {
  conversationId: string;
  consumerId: string;
  state: ConversationState;
  skillId?: number;
  startTs: number;
  metadata?: Record<string, any>;
}

/**
 * Response from sending a message
 */
export interface ISendMessageResponse {
  messageId: string;
  conversationId: string;
  sequence: number;
  timestamp: number;
  state: string;
}

/**
 * Response from closing a conversation
 */
export interface ICloseConversationResponse {
  conversationId: string;
  state: ConversationState;
  closeTs: number;
  closeReason?: string;
}

/**
 * Response from transferring a conversation
 */
export interface ITransferConversationResponse {
  conversationId: string;
  transferTs: number;
  fromSkillId?: number;
  toSkillId: number;
  state: ConversationState;
}

/**
 * Response from getting conversation details
 */
export interface IGetConversationResponse {
  conversation: IConversationDetails;
  messages?: IMessageDetails[];
}

/**
 * Capability information
 */
export interface ICapabilityInfo {
  capability: string;
  enabled: boolean;
  version?: string;
}

/**
 * Response from getting account capabilities
 */
export interface IGetCapabilitiesResponse {
  accountId: string;
  capabilities: ICapabilityInfo[];
}
