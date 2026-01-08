/**
 * Agent Metrics API Interfaces
 * TypeScript interfaces for LivePerson Agent Metrics (Operational Realtime) API
 * Use these interfaces in Vue frontend for type safety
 *
 * Service Domain: agentManagerWorkspace
 * Data Latency: Real-time
 * Purpose: Monitor agent status and performance in real-time
 */

/**
 * Agent status values
 */
export enum AgentStatus {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY',
  BACK_SOON = 'BACK_SOON',
  OFFLINE = 'OFFLINE',
}

/**
 * Agent state values
 */
export enum AgentState {
  AVAILABLE = 'AVAILABLE',
  IN_CONVERSATION = 'IN_CONVERSATION',
  OCCUPIED = 'OCCUPIED',
}

/**
 * Aggregation types for metrics
 */
export enum AggregationType {
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
  COUNT = 'COUNT',
}

/**
 * Interval types for time series data
 */
export enum IntervalType {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  ONE_DAY = '1d',
}

/**
 * Agent current state information
 */
export interface IAgentCurrentState {
  agentId: number;
  agentLoginName?: string;
  agentName?: string;
  agentGroupId?: number;
  agentGroupName?: string;
  status: AgentStatus;
  state?: AgentState;
  statusReasonId?: number;
  statusReasonText?: string;
  lastUpdatedTime?: number;
  loginTime?: number;
  statusDuration?: number;
}

/**
 * Skill assignment information
 */
export interface ISkillAssignment {
  skillId: number;
  skillName?: string;
  maxSlots?: number;
}

/**
 * Agent conversation load
 */
export interface IAgentConversationLoad {
  agentId: number;
  agentLoginName?: string;
  agentName?: string;
  currentConversations?: number;
  maxConversations?: number;
  availableSlots?: number;
  assignedSkills?: ISkillAssignment[];
  load?: number;
  status?: AgentStatus;
  state?: AgentState;
}

/**
 * Agent utilization metrics
 */
export interface IAgentUtilizationMetrics {
  agentId: number;
  agentLoginName?: string;
  agentName?: string;
  agentGroupId?: number;
  onlineTime?: number;
  awayTime?: number;
  backSoonTime?: number;
  totalLoggedTime?: number;
  utilizationRate?: number;
  activeConversationTime?: number;
  availableTime?: number;
}

/**
 * Agent activity metrics
 */
export interface IAgentActivityMetrics {
  agentId: number;
  agentLoginName?: string;
  agentName?: string;
  totalConversations?: number;
  activeConversations?: number;
  closedConversations?: number;
  messagesSent?: number;
  messagesReceived?: number;
  avgResponseTime?: number;
  avgConversationDuration?: number;
  csat?: number;
  csatCount?: number;
}

/**
 * Agent performance summary
 */
export interface IAgentPerformanceSummary {
  agentId: number;
  agentLoginName?: string;
  agentName?: string;
  agentGroupId?: number;
  agentGroupName?: string;
  currentState?: IAgentCurrentState;
  load?: IAgentConversationLoad;
  utilization?: IAgentUtilizationMetrics;
  activity?: IAgentActivityMetrics;
}

/**
 * Time series data point
 */
export interface ITimeSeriesDataPoint {
  timestamp: number;
  value: number;
  count?: number;
}

/**
 * Agent metric time series
 */
export interface IAgentMetricTimeSeries {
  agentId: number;
  agentLoginName?: string;
  metricName: string;
  aggregationType: AggregationType;
  interval: IntervalType;
  dataPoints: ITimeSeriesDataPoint[];
}

/**
 * Skill metrics
 */
export interface ISkillMetrics {
  skillId: number;
  skillName?: string;
  onlineAgents?: number;
  availableAgents?: number;
  occupiedAgents?: number;
  awayAgents?: number;
  totalCapacity?: number;
  usedCapacity?: number;
  availableCapacity?: number;
  utilizationRate?: number;
}

/**
 * Agent group metrics
 */
export interface IAgentGroupMetrics {
  groupId: number;
  groupName?: string;
  totalAgents?: number;
  onlineAgents?: number;
  availableAgents?: number;
  occupiedAgents?: number;
  awayAgents?: number;
  offlineAgents?: number;
  activeConversations?: number;
  avgLoad?: number;
  avgUtilization?: number;
}

// ============================================
// Response Types
// ============================================

/**
 * Agent states response
 */
export interface IAgentStatesResponse {
  agents?: IAgentCurrentState[];
  timestamp?: number;
  count?: number;
}

/**
 * Agent load response
 */
export interface IAgentLoadResponse {
  agents?: IAgentConversationLoad[];
  timestamp?: number;
  count?: number;
}

/**
 * Agent utilization response
 */
export interface IAgentUtilizationResponse {
  agents?: IAgentUtilizationMetrics[];
  timeframe?: {
    from: number;
    to: number;
  };
  count?: number;
}

/**
 * Agent activity response
 */
export interface IAgentActivityResponse {
  agents?: IAgentActivityMetrics[];
  timeframe?: {
    from: number;
    to: number;
  };
  count?: number;
}

/**
 * Agent performance response
 */
export interface IAgentPerformanceResponse {
  agents?: IAgentPerformanceSummary[];
  timestamp?: number;
  count?: number;
}

/**
 * Agent time series response
 */
export interface IAgentTimeSeriesResponse {
  timeSeries?: IAgentMetricTimeSeries[];
  timeframe?: {
    from: number;
    to: number;
  };
  count?: number;
}

/**
 * Skill metrics response
 */
export interface ISkillMetricsResponse {
  skills?: ISkillMetrics[];
  timestamp?: number;
  count?: number;
}

/**
 * Agent group metrics response
 */
export interface IAgentGroupMetricsResponse {
  groups?: IAgentGroupMetrics[];
  timestamp?: number;
  count?: number;
}

// ============================================
// Request Query Types
// ============================================

/**
 * Base query parameters
 */
export interface IAgentMetricsBaseQuery {
  v?: number;
  source?: string;
}

/**
 * Agent states query parameters
 */
export interface IAgentStatesQuery extends IAgentMetricsBaseQuery {
  agentIds?: string;
  skillIds?: string;
  groupIds?: string;
  status?: AgentStatus;
  state?: AgentState;
}

/**
 * Agent load query parameters
 */
export interface IAgentLoadQuery extends IAgentMetricsBaseQuery {
  agentIds?: string;
  skillIds?: string;
  groupIds?: string;
  minLoad?: number;
  maxLoad?: number;
}

/**
 * Agent utilization query parameters
 */
export interface IAgentUtilizationQuery extends IAgentMetricsBaseQuery {
  agentIds?: string;
  groupIds?: string;
  fromMillis?: number;
  toMillis?: number;
  timeframe?: number;
}

/**
 * Agent activity query parameters
 */
export interface IAgentActivityQuery extends IAgentMetricsBaseQuery {
  agentIds?: string;
  skillIds?: string;
  groupIds?: string;
  fromMillis?: number;
  toMillis?: number;
  timeframe?: number;
  includeMetrics?: string;
}

/**
 * Agent performance query parameters
 */
export interface IAgentPerformanceQuery extends IAgentMetricsBaseQuery {
  agentIds?: string;
  groupIds?: string;
  timeframe?: number;
  includeLoad?: boolean;
  includeUtilization?: boolean;
  includeActivity?: boolean;
}

/**
 * Agent time series query parameters
 */
export interface IAgentTimeSeriesQuery extends IAgentMetricsBaseQuery {
  agentIds?: string;
  metricName: string;
  aggregation?: AggregationType;
  interval?: IntervalType;
  fromMillis?: number;
  toMillis?: number;
  timeframe?: number;
}

/**
 * Skill metrics query parameters
 */
export interface ISkillMetricsQuery extends IAgentMetricsBaseQuery {
  skillIds?: string;
  includeAgentBreakdown?: boolean;
}

/**
 * Agent group metrics query parameters
 */
export interface IAgentGroupMetricsQuery extends IAgentMetricsBaseQuery {
  groupIds?: string;
  includeAgentBreakdown?: boolean;
}
