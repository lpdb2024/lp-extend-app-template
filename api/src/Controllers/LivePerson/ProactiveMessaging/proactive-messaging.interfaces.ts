/**
 * Proactive Messaging API Interfaces
 * TypeScript interfaces for LivePerson Proactive Messaging API
 * Use these interfaces in Vue frontend for type safety
 *
 * Note: Types prefixed with PM to avoid conflicts with AccountConfig Campaign API
 */

/**
 * Proactive campaign status enum
 */
export enum PMCampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Proactive channel type enum
 */
export enum PMChannelType {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  INAPP = 'inapp',
  APPLE_BUSINESS_CHAT = 'abc',
  GOOGLE_BUSINESS_MESSAGES = 'gbm',
}

/**
 * Handoff type enum
 */
export enum PMHandoffType {
  CONVERSATION_CLOUD = 'conversationCloud',
  EXTERNAL = 'external',
}

/**
 * Consumer identifier for targeting
 */
export interface IPMConsumerIdentifier {
  type: 'phone' | 'email' | 'consumerId';
  value: string;
}

/**
 * Proactive campaign channel configuration
 */
export interface IPMCampaignChannel {
  type: PMChannelType;
  enabled: boolean;
  templateId?: string;
  handoffId?: string;
  message?: string;
  metadata?: Record<string, any>;
}

/**
 * Proactive campaign schedule configuration
 */
export interface IPMCampaignSchedule {
  startTime?: number; // Epoch milliseconds
  endTime?: number; // Epoch milliseconds
  timezone?: string;
  sendImmediately?: boolean;
}

/**
 * Proactive campaign targeting configuration
 */
export interface IPMCampaignTargeting {
  consumers: IPMConsumerIdentifier[];
  segmentId?: string;
  maxRecipients?: number;
}

/**
 * Proactive campaign throttling configuration
 */
export interface IPMCampaignThrottling {
  enabled: boolean;
  maxMessagesPerHour?: number;
  maxMessagesPerDay?: number;
}

/**
 * Create proactive campaign request body
 */
export interface IPMCreateCampaignRequest {
  name: string;
  description?: string;
  channels: IPMCampaignChannel[];
  targeting: IPMCampaignTargeting;
  schedule?: IPMCampaignSchedule;
  throttling?: IPMCampaignThrottling;
  skillId?: string;
  metadata?: Record<string, any>;
}

/**
 * Proactive campaign response
 */
export interface IPMCampaign {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  status: PMCampaignStatus;
  channels: IPMCampaignChannel[];
  targeting: IPMCampaignTargeting;
  schedule?: IPMCampaignSchedule;
  throttling?: IPMCampaignThrottling;
  skillId?: string;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  stats?: IPMCampaignStats;
}

/**
 * Proactive campaign statistics
 */
export interface IPMCampaignStats {
  totalTargeted: number;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  totalReplied: number;
}

/**
 * Update proactive campaign request
 */
export interface IPMUpdateCampaignRequest {
  name?: string;
  description?: string;
  status?: PMCampaignStatus;
  channels?: IPMCampaignChannel[];
  schedule?: IPMCampaignSchedule;
  throttling?: IPMCampaignThrottling;
  metadata?: Record<string, any>;
}

/**
 * Proactive handoff configuration
 */
export interface IPMHandoff {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  type: PMHandoffType;
  skillId?: string;
  conversationAttributes?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  enabled: boolean;
}

/**
 * Create proactive handoff request
 */
export interface IPMCreateHandoffRequest {
  name: string;
  description?: string;
  type: PMHandoffType;
  skillId?: string;
  conversationAttributes?: Record<string, any>;
}

/**
 * Update proactive handoff request
 */
export interface IPMUpdateHandoffRequest {
  name?: string;
  description?: string;
  skillId?: string;
  conversationAttributes?: Record<string, any>;
  enabled?: boolean;
}

/**
 * Proactive handoff list response
 */
export interface IPMHandoffListResponse {
  handoffs: IPMHandoff[];
  total: number;
}

/**
 * Proactive campaign list response
 */
export interface IPMCampaignListResponse {
  campaigns: IPMCampaign[];
  total: number;
  offset?: number;
  limit?: number;
}

/**
 * Proactive campaign query parameters
 */
export interface IPMCampaignQuery {
  status?: PMCampaignStatus;
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Send test message request
 */
export interface IPMSendTestMessageRequest {
  channel: PMChannelType;
  consumer: IPMConsumerIdentifier;
  templateId?: string;
  message?: string;
  handoffId?: string;
}

/**
 * Proactive test message response
 */
export interface IPMTestMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
