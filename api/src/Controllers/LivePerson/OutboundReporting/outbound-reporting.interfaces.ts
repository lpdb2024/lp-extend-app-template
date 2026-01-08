/**
 * Outbound Reporting API Interfaces
 * TypeScript interfaces for LivePerson Outbound Reporting API
 * Use these interfaces in Vue frontend for type safety
 *
 * Service Domain: leDataReporting
 * The Outbound Reporting API provides reporting data for outbound campaigns
 */

/**
 * Outbound campaign status
 */
export enum OutboundCampaignStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SCHEDULED = 'scheduled',
}

/**
 * Outbound message status
 */
export enum OutboundMessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  PENDING = 'pending',
  QUEUED = 'queued',
}

/**
 * Campaign type
 */
export enum CampaignType {
  PROMOTIONAL = 'promotional',
  TRANSACTIONAL = 'transactional',
  NOTIFICATION = 'notification',
  REMINDER = 'reminder',
}

/**
 * Message channel type
 */
export enum MessageChannel {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  RCS = 'rcs',
  FACEBOOK = 'facebook',
  APPLE_BUSINESS_CHAT = 'abc',
}

/**
 * Sort order
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Pagination link
 */
export interface IOutboundReportingLink {
  rel: 'self' | 'next' | 'previous' | 'first' | 'last';
  href: string;
}

/**
 * Timeframe object
 */
export interface IOutboundTimeframe {
  startTime: string;
  startTimeL?: number;
  endTime: string;
  endTimeL?: number;
}

/**
 * Campaign metrics
 */
export interface ICampaignMetrics {
  /** Total messages sent */
  totalSent: number;
  /** Total messages delivered */
  totalDelivered: number;
  /** Total messages read */
  totalRead: number;
  /** Total messages failed */
  totalFailed: number;
  /** Total messages pending */
  totalPending: number;
  /** Total conversations started */
  totalConversations: number;
  /** Delivery rate percentage */
  deliveryRate: number;
  /** Read rate percentage */
  readRate: number;
  /** Conversion rate percentage */
  conversionRate?: number;
  /** Average response time in seconds */
  avgResponseTime?: number;
}

/**
 * Campaign summary record
 */
export interface ICampaignSummary {
  /** Campaign identifier */
  campaignId: string;
  /** Campaign name */
  campaignName: string;
  /** Campaign type */
  campaignType: CampaignType;
  /** Campaign status */
  status: OutboundCampaignStatus;
  /** Channel used */
  channel: MessageChannel;
  /** Campaign start time RFC 3339 */
  startTime: string;
  /** Campaign end time RFC 3339 */
  endTime?: string;
  /** Target audience size */
  targetAudience: number;
  /** Campaign metrics */
  metrics: ICampaignMetrics;
  /** Created by user ID */
  createdBy?: string;
  /** Created timestamp */
  createdAt: string;
  /** Last updated timestamp */
  updatedAt: string;
}

/**
 * Message delivery record
 */
export interface IMessageDelivery {
  /** Message identifier */
  messageId: string;
  /** Campaign identifier */
  campaignId: string;
  /** Consumer identifier */
  consumerId: string;
  /** Consumer phone/identifier */
  consumerContact: string;
  /** Message status */
  status: OutboundMessageStatus;
  /** Message channel */
  channel: MessageChannel;
  /** Sent timestamp RFC 3339 */
  sentTime: string;
  /** Delivered timestamp RFC 3339 */
  deliveredTime?: string;
  /** Read timestamp RFC 3339 */
  readTime?: string;
  /** Failed timestamp RFC 3339 */
  failedTime?: string;
  /** Failure reason */
  failureReason?: string;
  /** Conversation ID if started */
  conversationId?: string;
  /** Response received */
  hasResponse?: boolean;
  /** Response timestamp */
  responseTime?: string;
}

/**
 * Campaign performance by time period
 */
export interface ICampaignPerformance {
  /** Time period start */
  periodStart: string;
  /** Time period end */
  periodEnd: string;
  /** Campaign ID */
  campaignId: string;
  /** Messages sent in period */
  messagesSent: number;
  /** Messages delivered in period */
  messagesDelivered: number;
  /** Messages read in period */
  messagesRead: number;
  /** Messages failed in period */
  messagesFailed: number;
  /** Conversations started in period */
  conversationsStarted: number;
  /** Delivery rate for period */
  deliveryRate: number;
  /** Read rate for period */
  readRate: number;
}

/**
 * Agent outbound activity
 */
export interface IAgentOutboundActivity {
  /** Agent ID */
  agentId: number;
  /** Agent name */
  agentName: string;
  /** Agent login name */
  agentLoginName?: string;
  /** Time period */
  timeframe: IOutboundTimeframe;
  /** Total outbound messages sent */
  totalMessagesSent: number;
  /** Total conversations from outbound */
  totalConversations: number;
  /** Total responses received */
  totalResponses: number;
  /** Average response time in seconds */
  avgResponseTime: number;
  /** Conversion rate */
  conversionRate: number;
}

/**
 * Skill outbound metrics
 */
export interface ISkillOutboundMetrics {
  /** Skill ID */
  skillId: number;
  /** Skill name */
  skillName: string;
  /** Time period */
  timeframe: IOutboundTimeframe;
  /** Campaign count for skill */
  campaignCount: number;
  /** Total messages sent */
  totalMessagesSent: number;
  /** Total conversations */
  totalConversations: number;
  /** Delivery rate */
  deliveryRate: number;
  /** Response rate */
  responseRate: number;
}

/**
 * Pagination metadata
 */
export interface IOutboundPagination {
  /** Total number of records */
  total: number;
  /** Current page size */
  pageSize: number;
  /** Current page number */
  page: number;
  /** Total pages */
  totalPages: number;
  /** Pagination links */
  links?: IOutboundReportingLink[];
}

/**
 * Campaign list response
 */
export interface ICampaignListResponse {
  /** Response metadata */
  metadata: {
    timeframe: IOutboundTimeframe;
    pagination: IOutboundPagination;
  };
  /** Campaign summaries */
  campaigns: ICampaignSummary[];
}

/**
 * Campaign details response
 */
export interface ICampaignDetailsResponse {
  /** Campaign summary */
  campaign: ICampaignSummary;
  /** Detailed metrics breakdown */
  metricsBreakdown?: {
    byChannel?: Record<string, ICampaignMetrics>;
    byTimeOfDay?: ICampaignPerformance[];
    byDay?: ICampaignPerformance[];
  };
}

/**
 * Message deliveries response
 */
export interface IMessageDeliveriesResponse {
  /** Response metadata */
  metadata: {
    campaignId?: string;
    timeframe: IOutboundTimeframe;
    pagination: IOutboundPagination;
  };
  /** Message delivery records */
  messages: IMessageDelivery[];
}

/**
 * Campaign performance response
 */
export interface ICampaignPerformanceResponse {
  /** Response metadata */
  metadata: {
    campaignId: string;
    timeframe: IOutboundTimeframe;
    interval: string;
  };
  /** Performance data by period */
  performance: ICampaignPerformance[];
}

/**
 * Agent activity response
 */
export interface IAgentOutboundActivityResponse {
  /** Response metadata */
  metadata: {
    timeframe: IOutboundTimeframe;
    pagination: IOutboundPagination;
  };
  /** Agent activity records */
  agents: IAgentOutboundActivity[];
}

/**
 * Skill metrics response
 */
export interface ISkillOutboundMetricsResponse {
  /** Response metadata */
  metadata: {
    timeframe: IOutboundTimeframe;
    pagination: IOutboundPagination;
  };
  /** Skill metrics records */
  skills: ISkillOutboundMetrics[];
}

/**
 * Campaign list query parameters
 */
export interface ICampaignListQuery {
  /** Request source (required) */
  source: string;
  /** Start time RFC 3339 */
  from?: string;
  /** End time RFC 3339 */
  to?: string;
  /** Start time epoch ms */
  fromL?: number;
  /** End time epoch ms */
  toL?: number;
  /** Filter by campaign status */
  status?: OutboundCampaignStatus;
  /** Filter by campaign type */
  campaignType?: CampaignType;
  /** Filter by channel */
  channel?: MessageChannel;
  /** Page number (default: 1) */
  page?: number;
  /** Page size (default: 50, max: 500) */
  pageSize?: number;
  /** Sort by field */
  sortBy?: string;
  /** Sort order */
  sortOrder?: SortOrder;
}

/**
 * Campaign details query parameters
 */
export interface ICampaignDetailsQuery {
  /** Request source (required) */
  source: string;
  /** Include detailed metrics breakdown */
  includeBreakdown?: boolean;
}

/**
 * Message deliveries query parameters
 */
export interface IMessageDeliveriesQuery {
  /** Request source (required) */
  source: string;
  /** Filter by campaign ID */
  campaignId?: string;
  /** Filter by message status */
  status?: OutboundMessageStatus;
  /** Filter by channel */
  channel?: MessageChannel;
  /** Start time RFC 3339 */
  from?: string;
  /** End time RFC 3339 */
  to?: string;
  /** Start time epoch ms */
  fromL?: number;
  /** End time epoch ms */
  toL?: number;
  /** Filter by consumer ID */
  consumerId?: string;
  /** Only failed messages */
  failedOnly?: boolean;
  /** Page number */
  page?: number;
  /** Page size (max: 500) */
  pageSize?: number;
  /** Sort by field */
  sortBy?: string;
  /** Sort order */
  sortOrder?: SortOrder;
}

/**
 * Campaign performance query parameters
 */
export interface ICampaignPerformanceQuery {
  /** Request source (required) */
  source: string;
  /** Start time RFC 3339 */
  from: string;
  /** End time RFC 3339 */
  to: string;
  /** Interval duration (hourly, daily, weekly) */
  interval?: string;
}

/**
 * Agent activity query parameters
 */
export interface IAgentOutboundActivityQuery {
  /** Request source (required) */
  source: string;
  /** Start time RFC 3339 */
  from: string;
  /** End time RFC 3339 */
  to: string;
  /** Filter by agent ID */
  agentId?: number;
  /** Filter by agent group ID */
  agentGroupId?: number;
  /** Page number */
  page?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Skill metrics query parameters
 */
export interface ISkillOutboundMetricsQuery {
  /** Request source (required) */
  source: string;
  /** Start time RFC 3339 */
  from: string;
  /** End time RFC 3339 */
  to: string;
  /** Filter by skill ID */
  skillId?: number;
  /** Page number */
  page?: number;
  /** Page size */
  pageSize?: number;
}
