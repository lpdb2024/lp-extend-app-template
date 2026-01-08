/**
 * Actual Handle Time API DTOs
 * NestJS DTOs for Actual Handle Time API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Matches,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  SegmentSortField,
  IAgentSegmentsResponse,
  IBreakdownFilesResponse,
  IHTUBreakdownRecord,
} from './actual-handle-time.interfaces';

/**
 * Agent segments query DTO
 */
export class AgentSegmentsQueryDto {
  @ApiProperty({
    description: 'Request source (alphanumeric + underscore, max 20 chars)',
    example: 'my_app',
  })
  @IsString()
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'source must be alphanumeric with underscores only',
  })
  source: string;

  @ApiPropertyOptional({
    description: 'Max records',
    default: 100,
    maximum: 500,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number;

  @ApiPropertyOptional({ description: 'Pagination offset', default: 0 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: SegmentSortField,
  })
  @IsOptional()
  @IsEnum(SegmentSortField)
  sort?: SegmentSortField;

  @ApiPropertyOptional({
    description: 'Start time RFC 3339',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'Start time epoch ms' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  fromMillis?: number;

  @ApiPropertyOptional({
    description: 'End time RFC 3339',
    example: '2024-01-07T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: 'End time epoch ms' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  toMillis?: number;

  @ApiPropertyOptional({ description: 'Filter by conversation ID' })
  @IsOptional()
  @IsString()
  ConversationId?: string;

  @ApiPropertyOptional({ description: 'Filter by agent ID' })
  @IsOptional()
  @IsString()
  AgentId?: string;

  @ApiPropertyOptional({ description: 'Filter by employee ID' })
  @IsOptional()
  @IsString()
  EmployeeId?: string;

  @ApiPropertyOptional({ description: 'Filter by skill ID' })
  @IsOptional()
  @IsString()
  SkillId?: string;

  @ApiPropertyOptional({ description: 'Filter by group ID' })
  @IsOptional()
  @IsString()
  GroupId?: string;
}

/**
 * Breakdown files query DTO
 */
export class BreakdownFilesQueryDto {
  @ApiProperty({
    description: 'Request source (alphanumeric + underscore, max 20 chars)',
    example: 'my_app',
  })
  @IsString()
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'source must be alphanumeric with underscores only',
  })
  source: string;

  @ApiPropertyOptional({
    description: 'Start time RFC 3339',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'Start time epoch ms' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  fromMillis?: number;

  @ApiPropertyOptional({
    description: 'End time RFC 3339',
    example: '2024-01-07T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: 'End time epoch ms' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  toMillis?: number;
}

/**
 * Breakdown file query DTO
 */
export class BreakdownFileQueryDto {
  @ApiProperty({
    description: 'Request source (alphanumeric + underscore, max 20 chars)',
    example: 'my_app',
  })
  @IsString()
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'source must be alphanumeric with underscores only',
  })
  source: string;

  @ApiProperty({
    description: 'File path from breakdown files list',
    example: '/year=2024/month=1/day=15/hour=12/accountId=12345678/segments.json.gz',
  })
  @IsString()
  path: string;
}

/**
 * Agent segments response DTO
 */
export class AgentSegmentsResponseDto {
  @ApiProperty({ description: 'Agent segments response data' })
  data: IAgentSegmentsResponse;
}

/**
 * Breakdown files response DTO
 */
export class BreakdownFilesResponseDto {
  @ApiProperty({ description: 'Breakdown files list response data' })
  data: IBreakdownFilesResponse;
}

/**
 * Breakdown file response DTO
 */
export class BreakdownFileResponseDto {
  @ApiProperty({ description: 'HTU breakdown records' })
  data: IHTUBreakdownRecord[];
}
