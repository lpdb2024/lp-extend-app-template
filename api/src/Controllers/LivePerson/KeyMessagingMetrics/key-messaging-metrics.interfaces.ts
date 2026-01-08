/**
 * Key Messaging Metrics API Interfaces
 * TypeScript interfaces for LivePerson Key Messaging Metrics API
 * Use these interfaces in Vue frontend for type safety
 *
 * Service Domain: agentManagerWorkspace
 * Data Retention: 14 days (24-hour query window for metrics/agent-view)
 */

/**
 * User types for filtering
 */
export enum KMMUserType {
  HUMAN = 'HUMAN',
  BOT = 'BOT',
}

/**
 * Agent status values
 */
export enum KMMAgentStatus {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY',
  BACK_SOON = 'BACK_SOON',
}

/**
 * Group by options for metrics
 */
export enum KMMGroupBy {
  SKILL_ID = 'skillId',
  AGENT_GROUP_ID = 'agentGroupId',
}

/**
 * Response sections for metrics
 */
export enum KMMResponseSection {
  ALL = 'all',
  GROUP_BY = 'groupBy',
}

/**
 * Sort order
 */
export enum KMMSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Time-based metrics available
 */
export enum KMMTimeMetric {
  AVG_WAIT_TIME = 'avg_wait_time',
  AVG_TIME_TO_RESPONSE = 'avg_time_to_response',
  AVG_TIME_TO_FIRST_RESPONSE_FIRST_ASSIGNMENT = 'avg_time_to_first_response_first_assignment',
  AVG_TIME_TO_FIRST_RESPONSE_ALL_ASSIGNMENTS = 'avg_time_to_first_response_all_assignments',
  CLOSED_CONVERSATIONS = 'closed_conversations',
  CLOSED_CONVERSATIONS_BY_AGENT = 'closed_conversations_by_agent',
  CLOSED_CONVERSATIONS_BY_CONSUMER = 'closed_conversations_by_consumer',
  CLOSED_CONVERSATIONS_BY_SYSTEM = 'closed_conversations_by_system',
  CONCLUDED_CONVERSATIONS = 'concluded_conversations',
  TRANSFERS = 'transfers',
  TRANSFER_RATE = 'transfer_rate',
  FCR = 'fcr',
  CSAT = 'csat',
  NPS = 'nps',
  ABANDONED_IN_QUEUE = 'abandoned_in_queue',
  QUEUE_TIME_UNTIL_ASSIGNMENT = 'queue_time_until_assignment',
  INTERACTIVE_CONVERSATIONS = 'interactive_conversations',
  NON_INTERACTIVE_CONVERSATIONS = 'non_interactive_conversations',
  HANDLED_CONVERSATIONS = 'handled_conversations',
  AUTO_CLOSED = 'auto_closed',
}

/**
 * Current value metrics available
 */
export enum KMMCurrentMetric {
  ASSIGNED_CONVERSATIONS = 'assigned_conversations',
  ACTIVE_CONVERSATIONS = 'active_conversations',
  AGENT_LOAD = 'agent_load',
  ONLINE_AGENTS = 'online_agents',
  AWAY_AGENTS = 'away_agents',
  BACK_SOON_AGENTS = 'back_soon_agents',
  OPEN_CONVERSATIONS = 'open_conversations',
  OVERDUE_CONVERSATIONS_IN_QUEUE = 'overdue_conversations_in_queue',
  OVERDUE_CONVERSATIONS_ASSIGNED = 'overdue_conversations_assigned',
  OVERDUE_CONVERSATIONS_TOTAL = 'overdue_conversations_total',
  UNASSIGNED_CONVERSATIONS = 'unassigned_conversations',
  QUEUE_WAIT_TIME_50TH_PERCENTILE = 'queue_wait_time_50th_percentile',
  QUEUE_WAIT_TIME_90TH_PERCENTILE = 'queue_wait_time_90th_percentile',
  PENDING_AGENT_RESPONSE = 'pending_agent_response',
  PENDING_CONSUMER_RESPONSE = 'pending_consumer_response',
}

/**
 * Time range filter
 */
export interface IKMMTimeFilter {
  /** Start time in epoch milliseconds */
  from: number;
  /** End time in epoch milliseconds */
  to: number;
}

/**
 * Common filters for all KMM endpoints
 */
export interface IKMMFilters {
  /** Required time range (max 24 hours for metrics/agent-view) */
  time: IKMMTimeFilter;
  /** Agent IDs to filter by */
  agentIds?: string[];
  /** Agent group IDs to filter by */
  agentGroupIds?: string[];
  /** Skill IDs to filter by */
  skillIds?: string[];
  /** User types: HUMAN, BOT */
  userTypes?: KMMUserType[];
  /** Include sub-groups when filtering by group */
  includeSubGroups?: boolean;
}

/**
 * Agent view specific filters
 */
export interface IKMMAgentViewFilters extends IKMMFilters {
  /** Agent skill IDs to filter by */
  agentSkillIds?: string[];
  /** Effective agent status filter */
  effectiveAgentStatus?: KMMAgentStatus[];
}

/**
 * Metrics request body
 */
export interface IKMMMetricsRequest {
  filters: IKMMFilters;
  /** Time-based metrics to retrieve */
  metricsToRetrieveByTime?: string[];
  /** Current value metrics to retrieve */
  metricsToRetrieveCurrentValue?: string[];
  /** Group results by field */
  groupBy?: KMMGroupBy;
  /** Response sections to include */
  responseSections?: KMMResponseSection[];
}

/**
 * Agent view request body
 */
export interface IKMMAgentViewRequest {
  filters: IKMMAgentViewFilters;
  /** Time-based metrics to retrieve */
  metricsToRetrieveByTime?: string[];
  /** Current value metrics to retrieve */
  metricsToRetrieveCurrentValue?: string[];
  /** Include agent metadata in response */
  includeAgentMetadata?: boolean;
}

/**
 * Historical request body
 */
export interface IKMMHistoricalRequest {
  filters: IKMMFilters;
  /** Time-based metrics to retrieve for historical data */
  metricsToRetrieveByTime: string[];
}

/**
 * Pagination link
 */
export interface IKMMLink {
  rel: string;
  href: string;
}

/**
 * Response metadata with pagination
 */
export interface IKMMMetadata {
  count: number;
  first?: IKMMLink;
  prev?: IKMMLink;
  self?: IKMMLink;
  next?: IKMMLink;
  last?: IKMMLink;
}

/**
 * Metric values object
 */
export interface IKMMMetricValues {
  avgWaitTime?: number;
  avgTimeToResponse?: number;
  avgTimeToFirstResponseFirstAssignment?: number;
  avgTimeToFirstResponseAllAssignments?: number;
  closedConversations?: number;
  closedConversationsByAgent?: number;
  closedConversationsByConsumer?: number;
  closedConversationsBySystem?: number;
  concludedConversations?: number;
  transfers?: number;
  transferRate?: number;
  fcr?: number;
  csat?: number;
  nps?: number;
  abandonedInQueue?: number;
  queueTimeUntilAssignment?: number;
  interactiveConversations?: number;
  nonInteractiveConversations?: number;
  handledConversations?: number;
  autoClosed?: number;
  assignedConversations?: number;
  activeConversations?: number;
  agentLoad?: number;
  onlineAgents?: number;
  awayAgents?: number;
  backSoonAgents?: number;
  openConversations?: number;
  overdueConversationsInQueue?: number;
  overdueConversationsAssigned?: number;
  overdueConversationsTotal?: number;
  unassignedConversations?: number;
  queueWaitTime50thPercentile?: number;
  queueWaitTime90thPercentile?: number;
  pendingAgentResponse?: number;
  pendingConsumerResponse?: number;
  [key: string]: number | undefined;
}

/**
 * Group in grouped response
 */
export interface IKMMGroup {
  key: string;
  keyDescription?: string;
  metrics: IKMMMetricValues;
}

/**
 * GroupBy section in response
 */
export interface IKMMGroupBySection {
  groupByField: string;
  groups: IKMMGroup[];
}

/**
 * Metrics response
 */
export interface IKMMMetricsResponse {
  metadata: IKMMMetadata;
  groupBy?: IKMMGroupBySection;
  all?: IKMMMetricValues;
}

/**
 * Agent skill info
 */
export interface IKMMAgentSkill {
  skillId: number;
  skillName: string;
}

/**
 * Agent metadata
 */
export interface IKMMAgentMetadata {
  agentName: string;
  agentGroupName?: string;
  agentSkills?: IKMMAgentSkill[];
}

/**
 * Agent view record
 */
export interface IKMMAgentViewRecord {
  agentId: string;
  agentGroupId: number;
  agentCurrentStatus?: KMMAgentStatus;
  agentCurrentStatusStartTime?: number;
  agentCurrentStatusDuration?: number;
  activeConversations?: number;
  assignedConversations?: number;
  agentLoad?: number;
  maxSlots?: number;
  avgWaitTime?: number;
  avgTimeToResponse?: number;
  closedConversations?: number;
  concludedConversations?: number;
  transfers?: number;
  transferRate?: number;
  csat?: number;
  fcr?: number;
  nps?: number;
  pendingAgentResponseRate?: number;
  agentMetadata?: IKMMAgentMetadata;
}

/**
 * Agent view response
 */
export interface IKMMAgentViewResponse {
  metadata: IKMMMetadata;
  agentViewRecords: IKMMAgentViewRecord[];
}

/**
 * Historical interval values
 */
export interface IKMMHistoricalValues {
  transfers?: number;
  closedConversations?: number;
  concludedConversations?: number;
  [key: string]: number | undefined;
}

/**
 * Historical interval
 */
export interface IKMMHistoricalInterval {
  timestamp: number;
  values: IKMMHistoricalValues;
}

/**
 * Historical response
 */
export interface IKMMHistoricalResponse {
  historicalMetricsIntervals: IKMMHistoricalInterval[];
}

/**
 * Query parameters for metrics endpoint
 */
export interface IKMMMetricsQuery {
  /** Starting record position (default: 0) */
  offset?: number;
  /** Max results per page (default: 50, max: 50) */
  limit?: number;
  /** Sort by metric:asc or metric:desc */
  sort?: string;
}

/**
 * Query parameters for agent view endpoint
 */
export interface IKMMAgentViewQuery {
  /** Starting record position (default: 0) */
  offset?: number;
  /** Max results per page (default: 50, max: 1000 total with offset) */
  limit?: number;
  /** Sort by field:asc or field:desc */
  sort?: string;
}

/**
 * Query parameters for historical endpoint
 */
export interface IKMMHistoricalQuery {
  /** Interval in minutes between data points (auto-calculated if not set) */
  interval?: number;
}
