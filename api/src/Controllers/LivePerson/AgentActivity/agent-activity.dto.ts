/**
 * Agent Activity API DTOs
 * NestJS DTOs for Agent Activity API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  IntervalDuration,
  IntervalGrouping,
  HandleTimeModel,
  IStatusChangesResponse,
  IIntervalMetricsResponse,
} from './agent-activity.interfaces';

/**
 * Status changes query DTO
 */
export class StatusChangesQueryDto {
  @ApiProperty({
    description: 'Originator of request',
    example: 'my-app',
  })
  @IsString()
  source: string;

  @ApiPropertyOptional({
    description: 'API version (1 or 2)',
    default: '2',
  })
  @IsOptional()
  @IsString()
  v?: string;

  @ApiPropertyOptional({
    description: 'Start time RFC 3339',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End time RFC 3339',
    example: '2024-01-02T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: 'Filter by agent ID' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  agentId?: number;

  @ApiPropertyOptional({ description: 'Filter by group ID' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  groupId?: number;

  @ApiPropertyOptional({ description: 'Filter by employee ID' })
  @IsOptional()
  @IsString()
  empId?: string;

  @ApiPropertyOptional({
    description: 'Max records (V1: max 100, V2: max 5000)',
    default: 1000,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(5000)
  limit?: number;

  @ApiPropertyOptional({ description: 'Pagination offset', default: 0 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  offset?: number;
}

/**
 * Interval metrics query DTO
 */
export class IntervalMetricsQueryDto {
  @ApiProperty({ description: 'API version', example: '1' })
  @IsString()
  v: string;

  @ApiProperty({
    description: 'Request source (max 20 chars)',
    example: 'my-app',
  })
  @IsString()
  @MaxLength(20)
  source: string;

  @ApiPropertyOptional({
    description: 'Start time RFC 3339',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End time RFC 3339',
    example: '2024-01-02T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: 'Start time epoch ms' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  fromL?: number;

  @ApiPropertyOptional({ description: 'End time epoch ms' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  toL?: number;

  @ApiPropertyOptional({
    description: 'Page size',
    default: 100,
    maximum: 500,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(500)
  pageSize?: number;

  @ApiPropertyOptional({ description: 'Page key from previous response' })
  @IsOptional()
  @IsString()
  pageKey?: string;

  @ApiPropertyOptional({
    description: 'Interval duration in minutes',
    enum: IntervalDuration,
    default: IntervalDuration.FIFTEEN_MINUTES,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsEnum(IntervalDuration)
  intervalDuration?: IntervalDuration;

  @ApiPropertyOptional({
    description: 'Grouping level',
    enum: IntervalGrouping,
    default: IntervalGrouping.SKILL,
  })
  @IsOptional()
  @IsEnum(IntervalGrouping)
  grouping?: IntervalGrouping;

  @ApiPropertyOptional({ description: 'Filter by agent ID' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  agentId?: number;

  @ApiPropertyOptional({ description: 'Filter by skill ID' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  skillId?: number;

  @ApiPropertyOptional({ description: 'Filter by agent group ID' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  agentGroupId?: number;

  @ApiPropertyOptional({ description: 'Filter by conversation ID' })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiProperty({
    description: 'Handle time calculation model',
    enum: HandleTimeModel,
  })
  @IsEnum(HandleTimeModel)
  handleTimeModel: HandleTimeModel;

  @ApiProperty({
    description: 'Comma-separated metrics to retrieve',
    example: 'handleTime,handledConversations,closedConversations',
  })
  @IsString()
  metrics: string;

  @ApiPropertyOptional({
    description: 'Include bot skills',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeBotSkills?: boolean;
}

/**
 * Status changes response DTO
 */
export class StatusChangesResponseDto {
  @ApiProperty({ description: 'Status changes response data' })
  data: IStatusChangesResponse;
}

/**
 * Interval metrics response DTO
 */
export class IntervalMetricsResponseDto {
  @ApiProperty({ description: 'Interval metrics response data' })
  data: IIntervalMetricsResponse;
}
