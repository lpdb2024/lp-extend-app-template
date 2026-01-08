/**
 * Net Handle Time API Interfaces
 * TypeScript interfaces for LivePerson Net Handle Time API
 * Use these interfaces in Vue frontend for type safety
 *
 * Service Domain: agentActivityDomain
 * Status: Beta - subject to adjustments
 * Data Availability: Up to 24 hours from segment close
 *
 * Note: Types prefixed with NHT to avoid conflicts with ActualHandleTime API
 */

/**
 * Segment end reasons for Net Handle Time
 */
export enum NHTSegmentEndReason {
  CLOSED_BY_CONSUMER = 'closedByConsumer',
  CLOSED_BY_AGENT = 'closedByAgent',
  CLOSED_BY_SYSTEM = 'closedBySystem',
  AGENT_TRANSFER = 'agentTransfer',
  SKILL_TRANSFER = 'skillTransfer',
  BACK_TO_QUEUE = 'backToQueue',
  OTHER = 'other',
}

/**
 * Sort options for Net Handle Time agent segments
 */
export enum NHTSegmentSortField {
  DATE = 'Date',
  CONVERSATION = 'Conversation',
  AGENT = 'Agent',
  EMPLOYEE = 'Employee',
  SKILL = 'Skill',
  GROUP = 'Group',
}

/**
 * NHU (Net Handle Unit) start/end reasons
 */
export enum NHUStartReason {
  AGENT_FOCUSED = 'agentFocused',
  CONSUMER_MESSAGE = 'consumerMessage',
  AGENT_TYPING = 'agentTyping',
}

export enum NHUEndReason {
  AGENT_UNFOCUSED = 'agentUnfocused',
  IDLE_TIMEOUT = 'idleTimeout',
  SEGMENT_END = 'segmentEnd',
}

/**
 * Pagination reference link
 */
export interface INHTLink {
  rel: 'self' | 'next' | 'previous' | 'first' | 'last';
  href: string;
}

/**
 * Timeframe object
 */
export interface INHTTimeframe {
  startTime: string;
  startTimeL: number;
  endTime: string;
  endTimeL: number;
}

/**
 * Net Handle Time agent segment record
 */
export interface INHTAgentSegment {
  /** Unique segment identifier */
  segmentId: string;
  /** Start time RFC 3339 */
  startTime: string;
  /** Start time epoch ms */
  startTimeL: number;
  /** End time RFC 3339 */
  endTime: string;
  /** End time epoch ms */
  endTimeL: number;
  /** Conversation ID */
  conversationId: string;
  /** Agent LivePerson ID */
  agentId: number;
  /** Brand-configured employee ID */
  employeeId?: string;
  /** Skill ID */
  skillId: number;
  /** Agent group ID */
  groupId: number;
  /** Reason segment ended */
  endReason: NHTSegmentEndReason;
  /** Total net handle time in milliseconds */
  totalNetHandleTimeMillis: number;
}

/**
 * Pagination info
 */
export interface INHTPagination {
  count: number;
  references: INHTLink[];
}

/**
 * Net Handle Time agent segments response
 */
export interface INHTAgentSegmentsResponse {
  timeframe: INHTTimeframe;
  segments: INHTAgentSegment[];
  pagination: INHTPagination;
}

/**
 * Net Handle Time agent segments query parameters
 */
export interface INHTAgentSegmentsQuery {
  /** Request source (required, max 20 chars, alphanumeric+underscore) */
  source: string;
  /** Max records (default: 100, max: 500) */
  limit?: number;
  /** Pagination offset */
  offset?: number;
  /** Sort field */
  sort?: NHTSegmentSortField;
  /** Start time RFC 3339 (default: 24h ago, max: 1 month ago) */
  from?: string;
  /** Start time epoch ms */
  fromMillis?: number;
  /** End time RFC 3339 (max 1 week span from 'from') */
  to?: string;
  /** End time epoch ms */
  toMillis?: number;
  /** Filter by conversation ID */
  ConversationId?: string;
  /** Filter by agent ID */
  AgentId?: string;
  /** Filter by employee ID */
  EmployeeId?: string;
  /** Filter by skill ID */
  SkillId?: string;
  /** Filter by group ID */
  GroupId?: string;
}

/**
 * Net Handle Time breakdown files list response
 */
export interface INHTBreakdownFilesResponse {
  timeframe: INHTTimeframe;
  /** Array of file paths */
  files: string[];
}

/**
 * Net Handle Time breakdown files query parameters
 */
export interface INHTBreakdownFilesQuery {
  /** Request source (required) */
  source: string;
  /** Start time RFC 3339 */
  from?: string;
  /** Start time epoch ms */
  fromMillis?: number;
  /** End time RFC 3339 */
  to?: string;
  /** End time epoch ms */
  toMillis?: number;
}

/**
 * Net Handle Unit (NHU) breakdown record
 */
export interface INHUBreakdownRecord {
  /** Segment identifier */
  segmentId: string;
  /** Event sequence number */
  sequence: string;
  /** NHU start trigger */
  startReason: string;
  /** NHU end reason */
  endReason: string;
  /** Start time epoch ms */
  startTimestamp: number;
  /** End time epoch ms */
  endTimestamp: number;
  /** Duration in milliseconds */
  netHandleTimeMillis: string;
  /** Record insertion time epoch ms */
  insertTimestamp: number;
}

/**
 * Net Handle Time breakdown file query parameters
 */
export interface INHTBreakdownFileQuery {
  /** Request source (required) */
  source: string;
  /** File path from breakdown files list */
  path: string;
}
