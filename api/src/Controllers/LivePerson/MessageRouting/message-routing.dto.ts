/**
 * Message Routing API DTOs
 * NestJS DTOs for Message Routing API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  RoutingTaskStatus,
  RoutingPolicyType,
  PriorityLevel,
  RingType,
  AgentRoutingState,
  TransferType,
  IRoutingTask,
  IRoutingRule,
  ISkillRoutingConfig,
  IAgentRoutingAvailability,
  IQueueStatus,
  ITransferResponse,
} from './message-routing.interfaces';

// ============================================
// Routing Policy DTOs
// ============================================

export class RoutingPolicyDto {
  @ApiProperty({ description: 'Policy type', enum: RoutingPolicyType })
  @IsEnum(RoutingPolicyType)
  type: RoutingPolicyType;

  @ApiProperty({ description: 'Target ID (skill ID or agent ID)' })
  @IsString()
  targetId: string | number;

  @ApiPropertyOptional({ description: 'Priority level', enum: PriorityLevel })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;

  @ApiPropertyOptional({ description: 'Fallback skill ID if routing fails' })
  @IsOptional()
  @IsNumber()
  fallbackSkillId?: number;

  @ApiPropertyOptional({ description: 'Ring type', enum: RingType })
  @IsOptional()
  @IsEnum(RingType)
  ringType?: RingType;
}

// ============================================
// Routing Task DTOs
// ============================================

export class CreateRoutingTaskDto {
  @ApiProperty({ description: 'Conversation ID to route' })
  @IsString()
  conversationId: string;

  @ApiProperty({ description: 'Routing policy', type: RoutingPolicyDto })
  @ValidateNested()
  @Type(() => RoutingPolicyDto)
  policy: RoutingPolicyDto;

  @ApiPropertyOptional({ description: 'Priority level', enum: PriorityLevel })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateRoutingTaskDto {
  @ApiPropertyOptional({ description: 'Task status', enum: RoutingTaskStatus })
  @IsOptional()
  @IsEnum(RoutingTaskStatus)
  status?: RoutingTaskStatus;

  @ApiPropertyOptional({ description: 'Skill ID' })
  @IsOptional()
  @IsNumber()
  skillId?: number;

  @ApiPropertyOptional({ description: 'Agent ID' })
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiPropertyOptional({ description: 'Priority level', enum: PriorityLevel })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class GetRoutingTasksQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: RoutingTaskStatus })
  @IsOptional()
  @IsEnum(RoutingTaskStatus)
  status?: RoutingTaskStatus;

  @ApiPropertyOptional({ description: 'Filter by skill ID' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  skillId?: number;

  @ApiPropertyOptional({ description: 'Filter by agent ID' })
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiPropertyOptional({ description: 'Offset for pagination', default: 0 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ description: 'Limit for pagination', default: 50 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ============================================
// Routing Rule DTOs
// ============================================

export class RoutingRuleConditionDto {
  @ApiProperty({ description: 'Attribute to check' })
  @IsString()
  attribute: string;

  @ApiProperty({
    description: 'Comparison operator',
    enum: ['EQUALS', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'IN', 'NOT_IN'],
  })
  @IsEnum(['EQUALS', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'IN', 'NOT_IN'])
  operator: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN';

  @ApiProperty({ description: 'Value to compare against' })
  value: string | number | string[] | number[];
}

export class RoutingRuleActionDto {
  @ApiProperty({
    description: 'Action type',
    enum: ['ROUTE_TO_SKILL', 'ROUTE_TO_AGENT', 'SET_PRIORITY', 'ADD_METADATA'],
  })
  @IsEnum(['ROUTE_TO_SKILL', 'ROUTE_TO_AGENT', 'SET_PRIORITY', 'ADD_METADATA'])
  type: 'ROUTE_TO_SKILL' | 'ROUTE_TO_AGENT' | 'SET_PRIORITY' | 'ADD_METADATA';

  @ApiPropertyOptional({ description: 'Skill ID for ROUTE_TO_SKILL action' })
  @IsOptional()
  @IsNumber()
  skillId?: number;

  @ApiPropertyOptional({ description: 'Agent ID for ROUTE_TO_AGENT action' })
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiPropertyOptional({ description: 'Priority for SET_PRIORITY action', enum: PriorityLevel })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;

  @ApiPropertyOptional({ description: 'Metadata for ADD_METADATA action' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateRoutingRuleDto {
  @ApiProperty({ description: 'Rule name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether rule is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ description: 'Rule priority (lower number = higher priority)' })
  @IsNumber()
  @Min(0)
  priority: number;

  @ApiProperty({ description: 'Rule conditions', type: [RoutingRuleConditionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutingRuleConditionDto)
  conditions: RoutingRuleConditionDto[];

  @ApiProperty({ description: 'Rule actions', type: [RoutingRuleActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutingRuleActionDto)
  actions: RoutingRuleActionDto[];
}

export class UpdateRoutingRuleDto {
  @ApiPropertyOptional({ description: 'Rule name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether rule is enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Rule priority (lower number = higher priority)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ description: 'Rule conditions', type: [RoutingRuleConditionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutingRuleConditionDto)
  conditions?: RoutingRuleConditionDto[];

  @ApiPropertyOptional({ description: 'Rule actions', type: [RoutingRuleActionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutingRuleActionDto)
  actions?: RoutingRuleActionDto[];
}

// ============================================
// Skill Routing DTOs
// ============================================

export class UpdateSkillRoutingConfigDto {
  @ApiPropertyOptional({ description: 'Maximum wait time in seconds before fallback' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWaitTime?: number;

  @ApiPropertyOptional({ description: 'Fallback skill ID' })
  @IsOptional()
  @IsNumber()
  fallbackSkillId?: number;

  @ApiPropertyOptional({ description: 'Ring type', enum: RingType })
  @IsOptional()
  @IsEnum(RingType)
  ringType?: RingType;

  @ApiPropertyOptional({ description: 'Priority level', enum: PriorityLevel })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;

  @ApiPropertyOptional({ description: 'Whether skill routing is enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

// ============================================
// Agent Routing DTOs
// ============================================

export class UpdateAgentRoutingStateDto {
  @ApiProperty({ description: 'Agent routing state', enum: AgentRoutingState })
  @IsEnum(AgentRoutingState)
  state: AgentRoutingState;

  @ApiPropertyOptional({ description: 'Maximum concurrent conversations' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxConcurrentConversations?: number;
}

export class GetAgentsAvailabilityQueryDto {
  @ApiPropertyOptional({ description: 'Filter by skill ID' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  skillId?: number;

  @ApiPropertyOptional({ description: 'Filter by state', enum: AgentRoutingState })
  @IsOptional()
  @IsEnum(AgentRoutingState)
  state?: AgentRoutingState;

  @ApiPropertyOptional({ description: 'Only show agents with available slots' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  availableOnly?: boolean;
}

// ============================================
// Queue Management DTOs
// ============================================

export class GetQueueStatusQueryDto {
  @ApiPropertyOptional({ description: 'Include detailed queue entries' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeEntries?: boolean;

  @ApiPropertyOptional({ description: 'Maximum number of entries to return' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  maxEntries?: number;
}

export class GetQueuesStatusQueryDto {
  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated) or "all"' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Include detailed queue entries' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeEntries?: boolean;
}

// ============================================
// Transfer DTOs
// ============================================

export class TransferConversationDto {
  @ApiProperty({ description: 'Conversation ID to transfer' })
  @IsString()
  conversationId: string;

  @ApiProperty({ description: 'Transfer type', enum: TransferType })
  @IsEnum(TransferType)
  type: TransferType;

  @ApiPropertyOptional({ description: 'Target skill ID (required for SKILL transfer)' })
  @IsOptional()
  @IsNumber()
  targetSkillId?: number;

  @ApiPropertyOptional({ description: 'Target agent ID (required for AGENT transfer)' })
  @IsOptional()
  @IsString()
  targetAgentId?: string;

  @ApiPropertyOptional({ description: 'Transfer reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// ============================================
// Response DTOs
// ============================================

export class RoutingTaskResponseDto {
  @ApiProperty({ description: 'Routing task' })
  task: IRoutingTask;
}

export class RoutingTasksListResponseDto {
  @ApiProperty({ description: 'List of routing tasks' })
  tasks: IRoutingTask[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Offset' })
  offset: number;

  @ApiProperty({ description: 'Limit' })
  limit: number;
}

export class RoutingRuleResponseDto {
  @ApiProperty({ description: 'Routing rule' })
  rule: IRoutingRule;
}

export class RoutingRulesListResponseDto {
  @ApiProperty({ description: 'List of routing rules' })
  rules: IRoutingRule[];

  @ApiProperty({ description: 'Total count' })
  total: number;
}

export class SkillRoutingConfigResponseDto {
  @ApiProperty({ description: 'Skill routing configuration' })
  config: ISkillRoutingConfig;
}

export class AgentAvailabilityResponseDto {
  @ApiProperty({ description: 'Agent routing availability' })
  availability: IAgentRoutingAvailability;
}

export class AgentsAvailabilityListResponseDto {
  @ApiProperty({ description: 'List of agent availabilities' })
  agents: IAgentRoutingAvailability[];

  @ApiProperty({ description: 'Total count' })
  total: number;
}

export class QueueStatusResponseDto {
  @ApiProperty({ description: 'Queue status' })
  queue: IQueueStatus;
}

export class QueuesStatusResponseDto {
  @ApiProperty({ description: 'List of queue statuses' })
  queues: IQueueStatus[];
}

export class TransferResponseDto {
  @ApiProperty({ description: 'Transfer details' })
  transfer: ITransferResponse;
}
