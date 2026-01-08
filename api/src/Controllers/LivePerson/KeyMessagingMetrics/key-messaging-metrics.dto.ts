/**
 * Key Messaging Metrics API DTOs
 * NestJS DTOs for Key Messaging Metrics API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  KMMUserType,
  KMMAgentStatus,
  KMMGroupBy,
  KMMResponseSection,
  IKMMMetricsResponse,
  IKMMAgentViewResponse,
  IKMMHistoricalResponse,
} from './key-messaging-metrics.interfaces';

/**
 * Time filter DTO
 */
export class KMMTimeFilterDto {
  @ApiProperty({ description: 'Start time in epoch milliseconds' })
  @IsNumber()
  from: number;

  @ApiProperty({ description: 'End time in epoch milliseconds' })
  @IsNumber()
  to: number;
}

/**
 * Common filters DTO
 */
export class KMMFiltersDto {
  @ApiProperty({ description: 'Time range filter', type: KMMTimeFilterDto })
  @ValidateNested()
  @Type(() => KMMTimeFilterDto)
  time: KMMTimeFilterDto;

  @ApiPropertyOptional({ description: 'Agent IDs to filter by', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  agentIds?: string[];

  @ApiPropertyOptional({ description: 'Agent group IDs to filter by', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  agentGroupIds?: string[];

  @ApiPropertyOptional({ description: 'Skill IDs to filter by', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillIds?: string[];

  @ApiPropertyOptional({
    description: 'User types: HUMAN, BOT',
    enum: KMMUserType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(KMMUserType, { each: true })
  userTypes?: KMMUserType[];

  @ApiPropertyOptional({ description: 'Include sub-groups when filtering by group' })
  @IsOptional()
  @IsBoolean()
  includeSubGroups?: boolean;
}

/**
 * Agent view filters DTO
 */
export class KMMAgentViewFiltersDto extends KMMFiltersDto {
  @ApiPropertyOptional({ description: 'Agent skill IDs to filter by', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  agentSkillIds?: string[];

  @ApiPropertyOptional({
    description: 'Effective agent status filter',
    enum: KMMAgentStatus,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(KMMAgentStatus, { each: true })
  effectiveAgentStatus?: KMMAgentStatus[];
}

/**
 * Metrics request DTO
 */
export class KMMMetricsRequestDto {
  @ApiProperty({ description: 'Query filters', type: KMMFiltersDto })
  @ValidateNested()
  @Type(() => KMMFiltersDto)
  filters: KMMFiltersDto;

  @ApiPropertyOptional({
    description: 'Time-based metrics to retrieve',
    type: [String],
    example: ['closed_conversations', 'avg_wait_time', 'csat'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricsToRetrieveByTime?: string[];

  @ApiPropertyOptional({
    description: 'Current value metrics to retrieve',
    type: [String],
    example: ['assigned_conversations', 'agent_load', 'online_agents'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricsToRetrieveCurrentValue?: string[];

  @ApiPropertyOptional({
    description: 'Group results by field',
    enum: KMMGroupBy,
  })
  @IsOptional()
  @IsEnum(KMMGroupBy)
  groupBy?: KMMGroupBy;

  @ApiPropertyOptional({
    description: 'Response sections to include',
    enum: KMMResponseSection,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(KMMResponseSection, { each: true })
  responseSections?: KMMResponseSection[];
}

/**
 * Agent view request DTO
 */
export class KMMAgentViewRequestDto {
  @ApiProperty({ description: 'Query filters', type: KMMAgentViewFiltersDto })
  @ValidateNested()
  @Type(() => KMMAgentViewFiltersDto)
  filters: KMMAgentViewFiltersDto;

  @ApiPropertyOptional({
    description: 'Time-based metrics to retrieve',
    type: [String],
    example: ['closed_conversations', 'avg_wait_time', 'transfer_rate'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricsToRetrieveByTime?: string[];

  @ApiPropertyOptional({
    description: 'Current value metrics to retrieve',
    type: [String],
    example: ['agent_load', 'active_conversations', 'assigned_conversations'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricsToRetrieveCurrentValue?: string[];

  @ApiPropertyOptional({
    description: 'Include agent metadata in response',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeAgentMetadata?: boolean;
}

/**
 * Historical request DTO
 */
export class KMMHistoricalRequestDto {
  @ApiProperty({ description: 'Query filters', type: KMMFiltersDto })
  @ValidateNested()
  @Type(() => KMMFiltersDto)
  filters: KMMFiltersDto;

  @ApiProperty({
    description: 'Time-based metrics to retrieve for historical data',
    type: [String],
    example: ['transfers', 'closed_conversations', 'concluded_conversations'],
  })
  @IsArray()
  @IsString({ each: true })
  metricsToRetrieveByTime: string[];
}

/**
 * Metrics query parameters DTO
 */
export class KMMMetricsQueryDto {
  @ApiPropertyOptional({ description: 'Starting record position', default: 0 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ description: 'Max results per page', default: 50, maximum: 50 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort by metric:asc or metric:desc',
    example: 'closedConversations:desc',
  })
  @IsOptional()
  @IsString()
  sort?: string;
}

/**
 * Agent view query parameters DTO
 */
export class KMMAgentViewQueryDto {
  @ApiPropertyOptional({ description: 'Starting record position', default: 0 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Max results per page (offset + limit <= 1000)',
    default: 50,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort by field:asc or field:desc',
    example: 'agentLoad:asc',
  })
  @IsOptional()
  @IsString()
  sort?: string;
}

/**
 * Historical query parameters DTO
 */
export class KMMHistoricalQueryDto {
  @ApiPropertyOptional({
    description: 'Interval in minutes between data points (auto-calculated if not set)',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  interval?: number;
}

/**
 * Metrics response DTO
 */
export class KMMMetricsResponseDto {
  @ApiProperty({ description: 'Metrics response data' })
  data: IKMMMetricsResponse;
}

/**
 * Agent view response DTO
 */
export class KMMAgentViewResponseDto {
  @ApiProperty({ description: 'Agent view response data' })
  data: IKMMAgentViewResponse;
}

/**
 * Historical response DTO
 */
export class KMMHistoricalResponseDto {
  @ApiProperty({ description: 'Historical response data' })
  data: IKMMHistoricalResponse;
}
