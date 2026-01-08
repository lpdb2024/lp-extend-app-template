/**
 * Message Routing API Interfaces
 * TypeScript interfaces for LivePerson Message Routing API
 * Use these interfaces in Vue frontend for type safety
 */

/**
 * Routing task status
 */
export enum RoutingTaskStatus {
  PENDING = 'PENDING',
  ROUTING = 'ROUTING',
  ASSIGNED = 'ASSIGNED',
  TRANSFERRED = 'TRANSFERRED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Routing policy type
 */
export enum RoutingPolicyType {
  SKILL = 'SKILL',
  AGENT = 'AGENT',
}

/**
 * Priority level
 */
export enum PriorityLevel {
  URGENT = 'URGENT',
  NORMAL = 'NORMAL',
  LOW = 'LOW',
}

/**
 * Ring type
 */
export enum RingType {
  RING_ALL = 'RING_ALL',
  RING_FALLBACK = 'RING_FALLBACK',
}

// ============================================
// Routing Task Types
// ============================================

/**
 * Routing task details
 */
export interface IRoutingTask {
  taskId: string;
  conversationId: string;
  skillId?: number;
  agentId?: string;
  status: RoutingTaskStatus;
  priority?: PriorityLevel;
  createdAt: number;
  updatedAt: number;
  assignedAt?: number;
  failureReason?: string;
}

/**
 * Routing policy
 */
export interface IRoutingPolicy {
  type: RoutingPolicyType;
  targetId: string | number;
  priority?: PriorityLevel;
  fallbackSkillId?: number;
  ringType?: RingType;
}

/**
 * Create routing task request
 */
export interface ICreateRoutingTaskRequest {
  conversationId: string;
  policy: IRoutingPolicy;
  priority?: PriorityLevel;
  metadata?: Record<string, any>;
}

/**
 * Update routing task request
 */
export interface IUpdateRoutingTaskRequest {
  status?: RoutingTaskStatus;
  skillId?: number;
  agentId?: string;
  priority?: PriorityLevel;
  metadata?: Record<string, any>;
}

// ============================================
// Routing Rules Types
// ============================================

/**
 * Routing rule condition
 */
export interface IRoutingRuleCondition {
  attribute: string;
  operator: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN';
  value: string | number | string[] | number[];
}

/**
 * Routing rule action
 */
export interface IRoutingRuleAction {
  type: 'ROUTE_TO_SKILL' | 'ROUTE_TO_AGENT' | 'SET_PRIORITY' | 'ADD_METADATA';
  skillId?: number;
  agentId?: string;
  priority?: PriorityLevel;
  metadata?: Record<string, any>;
}

/**
 * Routing rule
 */
export interface IRoutingRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  conditions: IRoutingRuleCondition[];
  actions: IRoutingRuleAction[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Create routing rule request
 */
export interface ICreateRoutingRuleRequest {
  name: string;
  description?: string;
  enabled?: boolean;
  priority: number;
  conditions: IRoutingRuleCondition[];
  actions: IRoutingRuleAction[];
}

/**
 * Update routing rule request
 */
export interface IUpdateRoutingRuleRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
  priority?: number;
  conditions?: IRoutingRuleCondition[];
  actions?: IRoutingRuleAction[];
}

// ============================================
// Skill Routing Types
// ============================================

/**
 * Skill routing configuration
 */
export interface ISkillRoutingConfig {
  skillId: number;
  maxWaitTime?: number;
  fallbackSkillId?: number;
  ringType: RingType;
  priority: PriorityLevel;
  enabled: boolean;
}

/**
 * Update skill routing configuration request
 */
export interface IUpdateSkillRoutingConfigRequest {
  maxWaitTime?: number;
  fallbackSkillId?: number;
  ringType?: RingType;
  priority?: PriorityLevel;
  enabled?: boolean;
}

// ============================================
// Agent Routing Types
// ============================================

/**
 * Agent routing state
 */
export enum AgentRoutingState {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY',
  BACK_SOON = 'BACK_SOON',
  OFFLINE = 'OFFLINE',
}

/**
 * Agent routing availability
 */
export interface IAgentRoutingAvailability {
  agentId: string;
  state: AgentRoutingState;
  currentLoad: number;
  maxConcurrentConversations: number;
  availableSlots: number;
  skills: number[];
  lastStateChange: number;
}

/**
 * Update agent routing state request
 */
export interface IUpdateAgentRoutingStateRequest {
  state: AgentRoutingState;
  maxConcurrentConversations?: number;
}

// ============================================
// Queue Management Types
// ============================================

/**
 * Queue entry
 */
export interface IQueueEntry {
  conversationId: string;
  skillId: number;
  priority: PriorityLevel;
  position: number;
  waitTime: number;
  estimatedWaitTime?: number;
  enqueuedAt: number;
}

/**
 * Queue status
 */
export interface IQueueStatus {
  skillId: number;
  totalInQueue: number;
  averageWaitTime: number;
  longestWaitTime: number;
  entries: IQueueEntry[];
}

// ============================================
// Transfer Types
// ============================================

/**
 * Transfer type
 */
export enum TransferType {
  SKILL = 'SKILL',
  AGENT = 'AGENT',
  BACK_TO_QUEUE = 'BACK_TO_QUEUE',
}

/**
 * Transfer request
 */
export interface ITransferRequest {
  conversationId: string;
  type: TransferType;
  targetSkillId?: number;
  targetAgentId?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Transfer response
 */
export interface ITransferResponse {
  transferId: string;
  conversationId: string;
  type: TransferType;
  targetSkillId?: number;
  targetAgentId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  initiatedAt: number;
  completedAt?: number;
  failureReason?: string;
}

// ============================================
// Response Types
// ============================================

/**
 * Routing task response
 */
export interface IRoutingTaskResponse {
  task: IRoutingTask;
}

/**
 * Routing tasks list response
 */
export interface IRoutingTasksListResponse {
  tasks: IRoutingTask[];
  total: number;
  offset: number;
  limit: number;
}

/**
 * Routing rule response
 */
export interface IRoutingRuleResponse {
  rule: IRoutingRule;
}

/**
 * Routing rules list response
 */
export interface IRoutingRulesListResponse {
  rules: IRoutingRule[];
  total: number;
}

/**
 * Skill routing config response
 */
export interface ISkillRoutingConfigResponse {
  config: ISkillRoutingConfig;
}

/**
 * Agent availability response
 */
export interface IAgentAvailabilityResponse {
  availability: IAgentRoutingAvailability;
}

/**
 * Agents availability list response
 */
export interface IAgentsAvailabilityListResponse {
  agents: IAgentRoutingAvailability[];
  total: number;
}

/**
 * Queue status response
 */
export interface IQueueStatusResponse {
  queue: IQueueStatus;
}

/**
 * Multiple queues status response
 */
export interface IQueuesStatusResponse {
  queues: IQueueStatus[];
}
