/**
 * Actual Handle Time API Interfaces
 * TypeScript interfaces for LivePerson Actual Handle Time API
 * Use these interfaces in Vue frontend for type safety
 *
 * Service Domain: agentActivityDomain
 * Status: Beta - subject to adjustments
 * Data Availability: Up to 24 hours from segment close
 */

/**
 * Segment end reasons
 */
export enum SegmentEndReason {
  CLOSED_BY_CONSUMER = 'closedByConsumer',
  CLOSED_BY_AGENT = 'closedByAgent',
  CLOSED_BY_SYSTEM = 'closedBySystem',
  AGENT_TRANSFER = 'agentTransfer',
  SKILL_TRANSFER = 'skillTransfer',
  BACK_TO_QUEUE = 'backToQueue',
  OTHER = 'other',
}

/**
 * Sort options for agent segments
 */
export enum SegmentSortField {
  DATE = 'Date',
  CONVERSATION = 'Conversation',
  AGENT = 'Agent',
  EMPLOYEE = 'Employee',
  SKILL = 'Skill',
  GROUP = 'Group',
}

/**
 * HTU (Handle Time Unit) start/end reasons
 */
export enum HTUStartReason {
  AGENT_FOCUSED = 'agentFocused',
  CONSUMER_MESSAGE = 'consumerMessage',
  AGENT_TYPING = 'agentTyping',
}

export enum HTUEndReason {
  AGENT_UNFOCUSED = 'agentUnfocused',
  IDLE_TIMEOUT = 'idleTimeout',
  SEGMENT_END = 'segmentEnd',
}

/**
 * Pagination reference link
 */
export interface IAHTLink {
  rel: 'self' | 'next' | 'previous' | 'first' | 'last';
  href: string;
}

/**
 * Timeframe object
 */
export interface IAHTTimeframe {
  startTime: string;
  startTimeL: number;
  endTime: string;
  endTimeL: number;
}

/**
 * Agent segment record
 */
export interface IAgentSegment {
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
  endReason: SegmentEndReason;
  /** Total handle time in milliseconds */
  totalHandleTimeMillis: number;
}

/**
 * Pagination info
 */
export interface IAHTPagination {
  count: number;
  references: IAHTLink[];
}

/**
 * Agent segments response
 */
export interface IAgentSegmentsResponse {
  timeframe: IAHTTimeframe;
  segments: IAgentSegment[];
  pagination: IAHTPagination;
}

/**
 * Agent segments query parameters
 */
export interface IAgentSegmentsQuery {
  /** Request source (required, max 20 chars, alphanumeric+underscore) */
  source: string;
  /** Max records (default: 100, max: 500) */
  limit?: number;
  /** Pagination offset */
  offset?: number;
  /** Sort field */
  sort?: SegmentSortField;
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
 * Breakdown files list response
 */
export interface IBreakdownFilesResponse {
  timeframe: IAHTTimeframe;
  /** Array of file paths */
  files: string[];
}

/**
 * Breakdown files query parameters
 */
export interface IBreakdownFilesQuery {
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
 * Handle Time Unit (HTU) breakdown record
 */
export interface IHTUBreakdownRecord {
  /** Segment identifier */
  segmentId: string;
  /** Event sequence number */
  sequence: string;
  /** HTU start trigger */
  startReason: string;
  /** HTU end reason */
  endReason: string;
  /** Start time epoch ms */
  startTimestamp: number;
  /** End time epoch ms */
  endTimestamp: number;
  /** Duration in milliseconds */
  handleTimeMillis: string;
  /** Record insertion time epoch ms */
  insertTimestamp: number;
}

/**
 * Breakdown file query parameters
 */
export interface IBreakdownFileQuery {
  /** Request source (required) */
  source: string;
  /** File path from breakdown files list */
  path: string;
}
