/**
 * Messaging Operations API DTOs
 * NestJS DTOs for Messaging Operations (Real-time) API request/response validation
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
  UserType,
  QueueHealthMetricsType,
  IntegrationSource,
  IMessagingConversationResponse,
  IQueueHealthResponse,
  ICSATDistributionResponse,
  ISkillSegmentResponse,
  IAgentSegmentResponse,
} from './messaging-operations.interfaces';

/**
 * Base query parameters for operations APIs
 */
export class OperationsBaseQueryDto {
  @ApiPropertyOptional({ description: 'API version', example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : 1))
  @IsNumber()
  v: number = 1;

  @ApiPropertyOptional({ description: 'Time range in minutes (max 1440)', example: 60, default: 60 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : 60))
  @IsNumber()
  @Min(1)
  @Max(1440)
  timeframe: number = 60;

  @ApiPropertyOptional({ description: 'Start time in epoch milliseconds (for v2)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  fromMillis?: number;

  @ApiPropertyOptional({ description: 'End time in epoch milliseconds (for v2)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  toMillis?: number;
}

/**
 * Messaging conversation query parameters
 */
export class MessagingConversationQueryDto extends OperationsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated) or "all"', example: '1,2,3' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Agent IDs (comma-separated) or "all"', example: '123,456' })
  @IsOptional()
  @IsString()
  agentIds?: string;

  @ApiPropertyOptional({ description: 'Agent group IDs (comma-separated) or "all"' })
  @IsOptional()
  @IsString()
  groupIds?: string;

  @ApiPropertyOptional({ description: 'Interval size in minutes (must divide evenly into timeframe)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  interval?: number;
}

/**
 * Messaging conversation POST body
 */
export class MessagingConversationBodyDto {
  @ApiProperty({ description: 'Time range in minutes (max 1440)', example: '1440' })
  @IsString()
  timeframe: string;

  @ApiProperty({ description: 'API version', example: '1' })
  @IsString()
  v: string;

  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated)', example: '1,2' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Agent IDs (comma-separated)', example: '123,456' })
  @IsOptional()
  @IsString()
  agentIds?: string;

  @ApiPropertyOptional({ description: 'Interval size in minutes', example: '60' })
  @IsOptional()
  @IsString()
  interval?: string;
}

/**
 * Queue health query parameters
 */
export class QueueHealthQueryDto extends OperationsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated) or "all"' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Interval in minutes (min 5, must divide evenly into timeframe)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(5)
  interval?: number;
}

/**
 * Current queue health query parameters
 */
export class CurrentQueueHealthQueryDto {
  @ApiPropertyOptional({ description: 'API version', example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : 1))
  @IsNumber()
  v: number = 1;

  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated) or defaults to all' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Include overdue conversation metrics', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  overdueConversations?: boolean;

  @ApiPropertyOptional({ description: 'Include skills breakdown in response', default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  breakdown?: boolean;

  @ApiPropertyOptional({
    description: 'Metrics to return (comma-separated): queue, waittimes, overdue, all',
    example: 'queue,waittimes',
  })
  @IsOptional()
  @IsString()
  metrics?: string;

  @ApiPropertyOptional({ description: 'Agent group IDs (comma-separated) for filtering overdue metrics' })
  @IsOptional()
  @IsString()
  groupIds?: string;

  @ApiPropertyOptional({ description: 'Start time in epoch milliseconds (for v2)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  fromMillis?: number;

  @ApiPropertyOptional({ description: 'End time in epoch milliseconds (for v2)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  toMillis?: number;
}

/**
 * CSAT distribution query parameters
 */
export class CSATDistributionQueryDto extends OperationsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated) or "all"' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Agent IDs (comma-separated) or "all"' })
  @IsOptional()
  @IsString()
  agentIds?: string;
}

/**
 * Skill segment query parameters
 */
export class SkillSegmentQueryDto extends OperationsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated) or "all"' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Interval in minutes (min 5)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(5)
  interval?: number;

  @ApiPropertyOptional({ description: 'Filter by user type', enum: UserType })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;
}

/**
 * Agent segment query parameters
 */
export class AgentSegmentQueryDto extends OperationsBaseQueryDto {
  @ApiPropertyOptional({ description: 'Agent IDs (comma-separated) or "all"' })
  @IsOptional()
  @IsString()
  agentIds?: string;

  @ApiPropertyOptional({ description: 'Skill IDs (comma-separated) or "all"' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Agent group IDs (comma-separated) or "all"' })
  @IsOptional()
  @IsString()
  groupIds?: string;

  @ApiPropertyOptional({ description: 'Interval in minutes (min 5)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(5)
  interval?: number;

  @ApiPropertyOptional({ description: 'Filter by user type', enum: UserType })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @ApiPropertyOptional({ description: 'Filter by integration source', enum: IntegrationSource })
  @IsOptional()
  @IsEnum(IntegrationSource)
  source?: IntegrationSource;

  @ApiPropertyOptional({ description: 'Specific metrics to return (comma-separated) or "all"' })
  @IsOptional()
  @IsString()
  metrics?: string;
}

/**
 * Messaging conversation response DTO
 */
export class MessagingConversationResponseDto {
  @ApiProperty({ description: 'Messaging conversation metrics' })
  data: IMessagingConversationResponse;
}

/**
 * Queue health response DTO
 */
export class QueueHealthResponseDto {
  @ApiProperty({ description: 'Queue health metrics' })
  data: IQueueHealthResponse;
}

/**
 * CSAT distribution response DTO
 */
export class CSATDistributionResponseDto {
  @ApiProperty({ description: 'CSAT distribution metrics' })
  data: ICSATDistributionResponse;
}

/**
 * Skill segment response DTO
 */
export class SkillSegmentResponseDto {
  @ApiProperty({ description: 'Skill segment metrics' })
  data: ISkillSegmentResponse;
}

/**
 * Agent segment response DTO
 */
export class AgentSegmentResponseDto {
  @ApiProperty({ description: 'Agent segment metrics' })
  data: IAgentSegmentResponse;
}
