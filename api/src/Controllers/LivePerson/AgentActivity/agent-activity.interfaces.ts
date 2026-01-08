/**
 * Agent Activity API Interfaces
 * TypeScript interfaces for LivePerson Agent Activity API
 * Use these interfaces in Vue frontend for type safety
 *
 * Service Domain: agentActivityDomain
 * Data Latency: 1 hour SLA
 * Note: Not intended for real-time routing decisions
 */

/**
 * Status type values for state changes
 */
export enum AgentStatusType {
  /** Agent status change within session */
  STATUS_CHANGE = 1,
  /** Agent login event */
  LOGIN = 3,
  /** Agent logout event */
  LOGOUT = 4,
}

/**
 * Status sub-type values
 */
export enum AgentStatusSubType {
  /** Offline status */
  OFFLINE = 1,
  /** Online/Available status */
  ONLINE = 2,
  /** Occupied/Busy status */
  OCCUPIED = 3,
  /** Away status */
  AWAY = 4,
}

/**
 * Interval duration options (minutes)
 */
export enum IntervalDuration {
  FIFTEEN_MINUTES = 15,
  THIRTY_MINUTES = 30,
  ONE_HOUR = 60,
  ONE_DAY = 1440,
}

/**
 * Grouping options for interval metrics
 */
export enum IntervalGrouping {
  SKILL = 'skill',
  AGENT_GROUP = 'agentGroup',
  AGENT = 'agent',
  CONVERSATION = 'conversation',
}

/**
 * Handle time calculation model
 */
export enum HandleTimeModel {
  /** Interactive Focus Time */
  IFT = 'IFT',
  /** Effective Handle Time */
  EHT = 'EHT',
}

/**
 * Available metrics for interval metrics endpoint
 */
export enum IntervalMetricName {
  HANDLE_TIME = 'handleTime',
  HANDLED_CONVERSATIONS = 'handledConversations',
  REPLIED_CONVERSATIONS = 'repliedConversations',
  CONSUMER_MESSAGES = 'consumerMessages',
  AGENT_MESSAGES = 'agentMessages',
  WORK_TIME = 'workTime',
  ARRIVALS = 'arrivals',
  CLOSED_CONVERSATIONS = 'closedConversations',
}

/**
 * Pagination reference link
 */
export interface IAgentActivityLink {
  rel: string;
  href: string;
}

/**
 * Timeframe for queries
 */
export interface IAgentActivityTimeframe {
  startTime?: string;
  endTime?: string;
  startTimeL?: number;
  endTimeL?: number;
  from?: string;
  to?: string;
  fromL?: number;
  toL?: number;
}

/**
 * State change record (V2 flat structure)
 */
export interface IAgentStateChange {
  /** Agent's LivePerson ID */
  agentId: number;
  /** Agent's employee ID */
  employeeId?: string;
  /** Agent's login name */
  agentLoginName?: string;
  /** Agent's display name */
  agentUserName?: string;
  /** Agent's group ID */
  agentGroupId?: number;
  /** RFC 3339 timestamp of state change */
  time: string;
  /** Session identifier */
  sessionId?: number;
  /** Sequence number (-1 for login, 1+ for subsequent) */
  sequenceNumber: number;
  /** Status type (1=change, 3=login, 4=logout) */
  statusType: AgentStatusType;
  /** Status sub-type (1=offline, 2=online, 3=occupied, 4=away) */
  statusSubType: AgentStatusSubType;
  /** Custom status reason ID */
  statusReasonId?: number;
  /** Custom status reason text */
  statusReasonText?: string;
  /** RFC 3339 timestamp of previous state change */
  prevStatusChangeTime?: string;
}

/**
 * Status changes response metadata
 */
export interface IStatusChangesMetadata {
  references?: IAgentActivityLink[];
}

/**
 * Status changes response (V2)
 */
export interface IStatusChangesResponse {
  _metadata?: IStatusChangesMetadata;
  timeframe: IAgentActivityTimeframe;
  stateChanges: IAgentStateChange[];
}

/**
 * Status changes query parameters
 */
export interface IStatusChangesQuery {
  /** Originator of request (required) */
  source: string;
  /** API version (1 or 2, default: 1) */
  v?: string;
  /** Start time RFC 3339 */
  from?: string;
  /** End time RFC 3339 */
  to?: string;
  /** Filter by agent ID */
  agentId?: number;
  /** Filter by group ID */
  groupId?: number;
  /** Filter by employee ID */
  empId?: string;
  /** Max records (V1: 50 agents, V2: 1000 states) */
  limit?: number;
  /** Pagination offset */
  offset?: number;
}

/**
 * Interval metrics values
 */
export interface IIntervalMetrics {
  /** Handle time in seconds */
  handleTime?: number;
  /** Number of handled conversations */
  handledConversations?: number;
  /** Number of replied conversations */
  repliedConversations?: number;
  /** Number of consumer messages */
  consumerMessages?: number;
  /** Number of agent messages */
  agentMessages?: number;
  /** Work time */
  workTime?: number;
  /** Arrivals (skill grouping only) */
  arrivals?: number;
  /** Closed conversations */
  closedConversations?: number;
}

/**
 * Interval data record
 */
export interface IIntervalRecord {
  timeframe: IAgentActivityTimeframe;
  /** Skill ID (if grouping includes skill) */
  skillId?: number;
  /** Skill name */
  skillName?: string;
  /** Agent group ID (if grouping includes agentGroup) */
  agentGroupId?: number;
  /** Agent group name */
  agentGroupName?: string;
  /** Agent ID (if grouping includes agent) */
  agentId?: number;
  /** Agent display name */
  agentName?: string;
  /** Agent login name */
  agentLogin?: string;
  /** Conversation ID (if grouping includes conversation) */
  conversationId?: string;
  /** Metrics for this interval */
  metrics: IIntervalMetrics;
  /** Processing status (for 202 responses) */
  status?: 'Done' | 'In Progress';
}

/**
 * Interval metrics paging info
 */
export interface IIntervalPaging {
  pageSize: number;
  pageKey?: string;
  nextPageKey?: string;
  refs?: {
    first?: string;
    current?: string;
    next?: string;
  };
}

/**
 * Interval metrics query filters
 */
export interface IIntervalFilters {
  agentId?: number;
  skillId?: number;
  agentGroupId?: number;
  conversationId?: string;
}

/**
 * Interval metrics response metadata
 */
export interface IIntervalMetricsMetadata {
  v: number;
  timeframe: IAgentActivityTimeframe;
  paging: IIntervalPaging;
  query: {
    intervalDuration: number;
    grouping: string;
    handleTimeModel: string;
  };
  filters?: IIntervalFilters;
  count: number;
}

/**
 * Interval metrics response
 */
export interface IIntervalMetricsResponse {
  metadata: IIntervalMetricsMetadata;
  intervals: IIntervalRecord[];
}

/**
 * Interval metrics query parameters
 */
export interface IIntervalMetricsQuery {
  /** API version (required) */
  v: string;
  /** Request source (required, max 20 chars) */
  source: string;
  /** Start time RFC 3339 */
  from?: string;
  /** End time RFC 3339 */
  to?: string;
  /** Start time epoch ms */
  fromL?: number;
  /** End time epoch ms */
  toL?: number;
  /** Page size (default: 100, max: 500) */
  pageSize?: number;
  /** Page key from previous response */
  pageKey?: string;
  /** Interval duration in minutes (15, 30, 60, 1440) */
  intervalDuration?: IntervalDuration;
  /** Grouping level */
  grouping?: IntervalGrouping;
  /** Filter by agent ID */
  agentId?: number;
  /** Filter by skill ID */
  skillId?: number;
  /** Filter by agent group ID */
  agentGroupId?: number;
  /** Filter by conversation ID */
  conversationId?: string;
  /** Handle time model (IFT or EHT) */
  handleTimeModel: HandleTimeModel;
  /** Comma-separated metrics to retrieve */
  metrics: string;
  /** Include bot skills (default: false) */
  includeBotSkills?: boolean;
}
