/**
 * Agent Metrics API DTOs
 * NestJS DTOs for Agent Metrics (Operational Realtime) API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  AgentStatus,
  AgentState,
  AggregationType,
  IntervalType,
  IAgentStatesResponse,
  IAgentLoadResponse,
  IAgentUtilizationResponse,
  IAgentActivityResponse,
  IAgentPerformanceResponse,
  IAgentTimeSeriesResponse,
  ISkillMetricsResponse,
  IAgentGroupMetricsResponse,
} from './agent-metrics.interfaces';

/**
 * Base query parameters for agent metrics APIs
 */
export class AgentMetricsBaseQueryDto {
  @ApiPropertyOptional({ description: 'API version', example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  v?: number;

  @ApiPropertyOptional({ description: 'Request source identifier', example: 'myApp' })
  @IsOptional()
  @IsString()
  source?: string;
}

/**
 * Agent states query parameters
 */
export class AgentStatesQueryDto extends AgentMetricsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Agent IDs (comma-separated)', example: '123,456,789' })
  @IsOptional()
  @IsString()
  agentIds?: string;

  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated)', example: '1,2,3' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Agent group IDs (comma-separated)', example: '10,20' })
  @IsOptional()
  @IsString()
  groupIds?: string;

  @ApiPropertyOptional({ description: 'Filter by agent status', enum: AgentStatus })
  @IsOptional()
  @IsEnum(AgentStatus)
  status?: AgentStatus;

  @ApiPropertyOptional({ description: 'Filter by agent state', enum: AgentState })
  @IsOptional()
  @IsEnum(AgentState)
  state?: AgentState;
}

/**
 * Agent load query parameters
 */
export class AgentLoadQueryDto extends AgentMetricsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Agent IDs (comma-separated)', example: '123,456' })
  @IsOptional()
  @IsString()
  agentIds?: string;

  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated)', example: '1,2' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Agent group IDs (comma-separated)', example: '10,20' })
  @IsOptional()
  @IsString()
  groupIds?: string;

  @ApiPropertyOptional({ description: 'Minimum load threshold (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  @Max(100)
  minLoad?: number;

  @ApiPropertyOptional({ description: 'Maximum load threshold (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  @Max(100)
  maxLoad?: number;
}

/**
 * Agent utilization query parameters
 */
export class AgentUtilizationQueryDto extends AgentMetricsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Agent IDs (comma-separated)', example: '123,456' })
  @IsOptional()
  @IsString()
  agentIds?: string;

  @ApiPropertyOptional({ description: 'Agent group IDs (comma-separated)', example: '10,20' })
  @IsOptional()
  @IsString()
  groupIds?: string;

  @ApiPropertyOptional({ description: 'Start time in epoch milliseconds' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  fromMillis?: number;

  @ApiPropertyOptional({ description: 'End time in epoch milliseconds' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  toMillis?: number;

  @ApiPropertyOptional({ description: 'Time range in minutes (max 1440)', maximum: 1440 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(1440)
  timeframe?: number;
}

/**
 * Agent activity query parameters
 */
export class AgentActivityQueryDto extends AgentMetricsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Agent IDs (comma-separated)', example: '123,456' })
  @IsOptional()
  @IsString()
  agentIds?: string;

  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated)', example: '1,2' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Agent group IDs (comma-separated)', example: '10,20' })
  @IsOptional()
  @IsString()
  groupIds?: string;

  @ApiPropertyOptional({ description: 'Start time in epoch milliseconds' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  fromMillis?: number;

  @ApiPropertyOptional({ description: 'End time in epoch milliseconds' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  toMillis?: number;

  @ApiPropertyOptional({ description: 'Time range in minutes (max 1440)', maximum: 1440 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(1440)
  timeframe?: number;

  @ApiPropertyOptional({
    description: 'Comma-separated list of metrics to include',
    example: 'conversations,messages,responseTime,csat'
  })
  @IsOptional()
  @IsString()
  includeMetrics?: string;
}

/**
 * Agent performance query parameters
 */
export class AgentPerformanceQueryDto extends AgentMetricsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Agent IDs (comma-separated)', example: '123,456' })
  @IsOptional()
  @IsString()
  agentIds?: string;

  @ApiPropertyOptional({ description: 'Agent group IDs (comma-separated)', example: '10,20' })
  @IsOptional()
  @IsString()
  groupIds?: string;

  @ApiPropertyOptional({ description: 'Time range in minutes (max 1440)', maximum: 1440 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(1440)
  timeframe?: number;

  @ApiPropertyOptional({ description: 'Include conversation load metrics', default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeLoad?: boolean;

  @ApiPropertyOptional({ description: 'Include utilization metrics', default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeUtilization?: boolean;

  @ApiPropertyOptional({ description: 'Include activity metrics', default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeActivity?: boolean;
}

/**
 * Agent time series query parameters
 */
export class AgentTimeSeriesQueryDto extends AgentMetricsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Agent IDs (comma-separated)', example: '123,456' })
  @IsOptional()
  @IsString()
  agentIds?: string;

  @ApiProperty({
    description: 'Metric name to retrieve',
    example: 'activeConversations'
  })
  @IsString()
  metricName: string;

  @ApiPropertyOptional({ description: 'Aggregation type', enum: AggregationType, default: AggregationType.AVG })
  @IsOptional()
  @IsEnum(AggregationType)
  aggregation?: AggregationType;

  @ApiPropertyOptional({ description: 'Time interval', enum: IntervalType, default: IntervalType.FIVE_MINUTES })
  @IsOptional()
  @IsEnum(IntervalType)
  interval?: IntervalType;

  @ApiPropertyOptional({ description: 'Start time in epoch milliseconds' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  fromMillis?: number;

  @ApiPropertyOptional({ description: 'End time in epoch milliseconds' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  toMillis?: number;

  @ApiPropertyOptional({ description: 'Time range in minutes (max 1440)', maximum: 1440 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(1440)
  timeframe?: number;
}

/**
 * Skill metrics query parameters
 */
export class SkillMetricsQueryDto extends AgentMetricsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated)', example: '1,2,3' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Include per-agent breakdown', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeAgentBreakdown?: boolean;
}

/**
 * Agent group metrics query parameters
 */
export class AgentGroupMetricsQueryDto extends AgentMetricsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Agent group IDs (comma-separated)', example: '10,20' })
  @IsOptional()
  @IsString()
  groupIds?: string;

  @ApiPropertyOptional({ description: 'Include per-agent breakdown', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeAgentBreakdown?: boolean;
}

// ============================================
// Response DTOs
// ============================================

/**
 * Agent states response DTO
 */
export class AgentStatesResponseDto {
  @ApiProperty({ description: 'Agent state data' })
  data: IAgentStatesResponse;
}

/**
 * Agent load response DTO
 */
export class AgentLoadResponseDto {
  @ApiProperty({ description: 'Agent load data' })
  data: IAgentLoadResponse;
}

/**
 * Agent utilization response DTO
 */
export class AgentUtilizationResponseDto {
  @ApiProperty({ description: 'Agent utilization data' })
  data: IAgentUtilizationResponse;
}

/**
 * Agent activity response DTO
 */
export class AgentActivityResponseDto {
  @ApiProperty({ description: 'Agent activity data' })
  data: IAgentActivityResponse;
}

/**
 * Agent performance response DTO
 */
export class AgentPerformanceResponseDto {
  @ApiProperty({ description: 'Agent performance data' })
  data: IAgentPerformanceResponse;
}

/**
 * Agent time series response DTO
 */
export class AgentTimeSeriesResponseDto {
  @ApiProperty({ description: 'Agent time series data' })
  data: IAgentTimeSeriesResponse;
}

/**
 * Skill metrics response DTO
 */
export class SkillMetricsResponseDto {
  @ApiProperty({ description: 'Skill metrics data' })
  data: ISkillMetricsResponse;
}

/**
 * Agent group metrics response DTO
 */
export class AgentGroupMetricsResponseDto {
  @ApiProperty({ description: 'Agent group metrics data' })
  data: IAgentGroupMetricsResponse;
}
