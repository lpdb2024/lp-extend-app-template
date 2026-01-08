/**
 * Messaging Operations API Interfaces
 * TypeScript interfaces for LivePerson Messaging Operations (Real-time) API
 * Use these interfaces in Vue frontend for type safety
 */

/**
 * User type filter options
 */
export enum UserType {
  HUMAN = 'human',
  BOT = 'bot',
  ALL = 'all',
}

/**
 * Metrics type options for current queue health
 */
export enum QueueHealthMetricsType {
  QUEUE = 'queue',
  WAITTIMES = 'waittimes',
  OVERDUE = 'overdue',
  ALL = 'all',
}

/**
 * Integration source types
 */
export enum IntegrationSource {
  APP = 'APP',
  FACEBOOK = 'FACEBOOK',
  WHATSAPP = 'WHATSAPP',
  APPLE_BUSINESS_CHAT = 'APPLE_BUSINESS_CHAT',
  SMS = 'SMS',
  WEB = 'WEB',
  ALL = 'all',
}

// ============================================
// Messaging Conversation Types
// ============================================

/**
 * Conversation metrics per agent
 */
export interface IConversationMetrics {
  resolvedConversations_byCCP?: number;
  resolvedConversations_byConsumer?: number;
  resolvedConversations_bySystem?: number;
  totalResolvedConversations?: number;
  totalHandlingTime_resolvedConversations_byCCP?: number;
  totalHandlingTime_resolvedConversations_byConsumer?: number;
  totalHandlingTime_resolvedConversations_bySystem?: number;
  totalHandlingTime_resolvedConversations?: number;
  avgTime_resolvedConversations_byCCP?: number;
  avgTime_resolvedConversations_byConsumer?: number;
  avgTime_resolvedConversations_bySystem?: number;
  avgTime_resolvedConversations?: number;
  timestamp?: number;
}

/**
 * Skills metrics with per-agent breakdown
 */
export interface ISkillsMetricsPerAgent {
  metricsPerSkill?: {
    [skillId: string]: {
      metricsPerAgent?: {
        [agentId: string]: IConversationMetrics;
      };
      metricsTotals?: IConversationMetrics;
    };
  };
  metricsTotals?: IConversationMetrics;
}

/**
 * Agents metrics
 */
export interface IAgentsMetrics {
  metricsPerAgent?: {
    [agentId: string]: IConversationMetrics;
  };
  metricsTotals?: IConversationMetrics;
}

/**
 * Messaging conversation response
 */
export interface IMessagingConversationResponse {
  skillsMetricsPerAgent?: ISkillsMetricsPerAgent;
  agentsMetrics?: IAgentsMetrics;
  metricsTotals?: IConversationMetrics;
}

// ============================================
// Queue Health Types
// ============================================

/**
 * Queue health metrics
 */
export interface IQueueHealthMetrics {
  time?: number;
  unassignedConversations?: number;
  actionableConversations?: number;
  notActionableConversations?: number;
  actionableAndManualSla?: number;
  actionableAndDuringTransfer?: number;
  actionableAndConsumerLastMessage?: number;
  notActionableDuringTransfer?: number;
  notActionableAndManualSla?: number;
  unassignedConversationsAndFirstTimeConsumer?: number;
  avgWaitTimeForAgentAssignment_NewConversation?: number;
  avgWaitTimeForAgentAssignment_AfterTransfer?: number;
  maxWaitTimeForAgentAssignment?: number;
  waitTimeForAgentAssignment_50thPercentile?: number;
  waitTimeForAgentAssignment_90thPercentile?: number;
  overdueConversationsInQueue?: number;
  overdueConversationsAssigned?: number;
  overdueConversationsTotal?: number;
}

/**
 * Queue health response
 */
export interface IQueueHealthResponse {
  skillsMetrics?: {
    [skillId: string]: IQueueHealthMetrics;
  };
  metricsTotal?: IQueueHealthMetrics;
  metricsByIntervals?: IQueueHealthMetrics[];
  timeframeSummary?: IQueueHealthMetrics;
}

// ============================================
// CSAT Distribution Types
// ============================================

/**
 * CSAT metrics
 */
export interface ICSATMetrics {
  csat_score1_answers?: number;
  csat_score2_answers?: number;
  csat_score3_answers?: number;
  csat_score4_answers?: number;
  csat_score5_answers?: number;
  total_answers?: number;
  positive_answers?: number;
  csat_score?: number;
}

/**
 * CSAT skills metrics
 */
export interface ICSATSkillsMetrics {
  metricsPerSkill?: {
    [skillId: string]: {
      metricsPerAgent?: {
        [agentId: string]: ICSATMetrics;
      };
      metricsTotals?: ICSATMetrics;
    };
  };
  metricsTotals?: ICSATMetrics;
}

/**
 * CSAT agents metrics
 */
export interface ICSATAgentsMetrics {
  metricsPerAgent?: {
    [agentId: string]: ICSATMetrics;
  };
  metricsTotals?: ICSATMetrics;
}

/**
 * CSAT distribution response
 */
export interface ICSATDistributionResponse {
  skillsMetrics?: ICSATSkillsMetrics;
  agentsMetrics?: ICSATAgentsMetrics;
  metricsTotals?: ICSATMetrics;
}

// ============================================
// Skill Segment Types
// ============================================

/**
 * Skill segment metrics
 */
export interface ISkillSegmentMetrics {
  totalSkillConversationSegments?: number;
  skillSegmentsAbandonedByConsumers?: number;
  skillSegmentsAbandonedByConsumersInQueue?: number;
  skillSegmentsWithNonResponsiveConsumers?: number;
  skillSegmentsWithNonResponsiveAgents?: number;
  interactiveSkillSegments?: number;
  avgTimetoFirstAgentMessageFromAgentAssignment?: number;
  timestamp?: number;
}

/**
 * Skill segment response
 */
export interface ISkillSegmentResponse {
  skillsMetrics?: {
    [skillId: string]: ISkillSegmentMetrics;
  };
  metricsTotal?: ISkillSegmentMetrics;
  metricsByIntervals?: ISkillSegmentMetrics[];
  timeframeSummary?: ISkillSegmentMetrics;
}

// ============================================
// Agent Segment Types
// ============================================

/**
 * Agent segment metrics
 */
export interface IAgentSegmentMetrics {
  totalAgentConversationSegments?: number;
  avgAgentMessagesinAgentSegment?: number;
  avgAgentSegmentDuration?: number;
  interactiveAgentSegments?: number;
  agentSegmentsAbandonedByConsumers?: number;
  avgTimetoFirstAgentMessageFromAgentAssignment?: number;
  avgTimeToResponseFromAgentAssignment?: number;
  timestamp?: number;
}

/**
 * Agent segment response
 */
export interface IAgentSegmentResponse {
  metricsPerAgent?: {
    [agentId: string]: IAgentSegmentMetrics;
  };
  metricsPerSkill?: {
    [skillId: string]: {
      metricsPerAgent?: {
        [agentId: string]: IAgentSegmentMetrics;
      };
      metricsTotals?: IAgentSegmentMetrics;
    };
  };
  agentsMetrics?: {
    metricsPerAgent?: {
      [agentId: string]: IAgentSegmentMetrics;
    };
    metricsTotals?: IAgentSegmentMetrics;
  };
  metricsTotal?: IAgentSegmentMetrics;
  metricsByIntervals?: IAgentSegmentMetrics[];
  timeframeSummary?: IAgentSegmentMetrics;
}

// ============================================
// Estimated Wait Time Types (Deprecated)
// ============================================

/**
 * Estimated wait time entry
 */
export interface IEstimatedWaitTimeEntry {
  skillId: number;
  estimatedWaitTime: number;
  timestamp: number;
}

/**
 * Estimated wait time response
 * @deprecated Deprecated as of May 1, 2024
 */
export interface IEstimatedWaitTimeResponse {
  estimatedWaitTimeResponse: IEstimatedWaitTimeEntry[];
}

// ============================================
// Request Types
// ============================================

/**
 * Base query parameters for operations APIs
 */
export interface IOperationsBaseQuery {
  v: number;
  timeframe?: number;
  fromMillis?: number;
  toMillis?: number;
}

/**
 * Messaging conversation query parameters
 */
export interface IMessagingConversationQuery extends IOperationsBaseQuery {
  skillIds?: string;
  agentIds?: string;
  groupIds?: string;
  interval?: number;
}

/**
 * Queue health query parameters
 */
export interface IQueueHealthQuery extends IOperationsBaseQuery {
  skillIds?: string;
  interval?: number;
}

/**
 * Current queue health query parameters
 */
export interface ICurrentQueueHealthQuery {
  v: number;
  skillIds?: string;
  overdueConversations?: boolean;
  breakdown?: boolean;
  metrics?: string;
  groupIds?: string;
  fromMillis?: number;
  toMillis?: number;
}

/**
 * CSAT distribution query parameters
 */
export interface ICSATDistributionQuery extends IOperationsBaseQuery {
  skillIds?: string;
  agentIds?: string;
}

/**
 * Skill segment query parameters
 */
export interface ISkillSegmentQuery extends IOperationsBaseQuery {
  skillIds?: string;
  interval?: number;
  userType?: UserType;
}

/**
 * Agent segment query parameters
 */
export interface IAgentSegmentQuery extends IOperationsBaseQuery {
  agentIds?: string;
  skillIds?: string;
  groupIds?: string;
  interval?: number;
  userType?: UserType;
  source?: IntegrationSource;
  metrics?: string;
}
