/**
 * Outbound Reporting API DTOs
 * NestJS DTOs for Outbound Reporting API request/response validation
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
  OutboundCampaignStatus,
  CampaignType,
  MessageChannel,
  OutboundMessageStatus,
  SortOrder,
  ICampaignListResponse,
  ICampaignDetailsResponse,
  IMessageDeliveriesResponse,
  ICampaignPerformanceResponse,
  IAgentOutboundActivityResponse,
  ISkillOutboundMetricsResponse,
} from './outbound-reporting.interfaces';

/**
 * Campaign list query DTO
 */
export class CampaignListQueryDto {
  @ApiProperty({
    description: 'Request source identifier',
    example: 'my-app',
  })
  @IsString()
  @MaxLength(50)
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
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Start time epoch milliseconds',
    example: 1704067200000,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  fromL?: number;

  @ApiPropertyOptional({
    description: 'End time epoch milliseconds',
    example: 1706745599000,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  toL?: number;

  @ApiPropertyOptional({
    description: 'Filter by campaign status',
    enum: OutboundCampaignStatus,
  })
  @IsOptional()
  @IsEnum(OutboundCampaignStatus)
  status?: OutboundCampaignStatus;

  @ApiPropertyOptional({
    description: 'Filter by campaign type',
    enum: CampaignType,
  })
  @IsOptional()
  @IsEnum(CampaignType)
  campaignType?: CampaignType;

  @ApiPropertyOptional({
    description: 'Filter by message channel',
    enum: MessageChannel,
  })
  @IsOptional()
  @IsEnum(MessageChannel)
  channel?: MessageChannel;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Page size',
    default: 50,
    maximum: 500,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(500)
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'startTime',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}

/**
 * Campaign details query DTO
 */
export class CampaignDetailsQueryDto {
  @ApiProperty({
    description: 'Request source identifier',
    example: 'my-app',
  })
  @IsString()
  @MaxLength(50)
  source: string;

  @ApiPropertyOptional({
    description: 'Include detailed metrics breakdown',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeBreakdown?: boolean;
}

/**
 * Message deliveries query DTO
 */
export class MessageDeliveriesQueryDto {
  @ApiProperty({
    description: 'Request source identifier',
    example: 'my-app',
  })
  @IsString()
  @MaxLength(50)
  source: string;

  @ApiPropertyOptional({
    description: 'Filter by campaign ID',
  })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({
    description: 'Filter by message status',
    enum: OutboundMessageStatus,
  })
  @IsOptional()
  @IsEnum(OutboundMessageStatus)
  status?: OutboundMessageStatus;

  @ApiPropertyOptional({
    description: 'Filter by message channel',
    enum: MessageChannel,
  })
  @IsOptional()
  @IsEnum(MessageChannel)
  channel?: MessageChannel;

  @ApiPropertyOptional({
    description: 'Start time RFC 3339',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End time RFC 3339',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Start time epoch milliseconds',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  fromL?: number;

  @ApiPropertyOptional({
    description: 'End time epoch milliseconds',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  toL?: number;

  @ApiPropertyOptional({
    description: 'Filter by consumer ID',
  })
  @IsOptional()
  @IsString()
  consumerId?: string;

  @ApiPropertyOptional({
    description: 'Only return failed messages',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  failedOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number;

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

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'sentTime',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}

/**
 * Campaign performance query DTO
 */
export class CampaignPerformanceQueryDto {
  @ApiProperty({
    description: 'Request source identifier',
    example: 'my-app',
  })
  @IsString()
  @MaxLength(50)
  source: string;

  @ApiProperty({
    description: 'Start time RFC 3339',
    example: '2024-01-01T00:00:00Z',
  })
  @IsString()
  from: string;

  @ApiProperty({
    description: 'End time RFC 3339',
    example: '2024-01-31T23:59:59Z',
  })
  @IsString()
  to: string;

  @ApiPropertyOptional({
    description: 'Interval duration (hourly, daily, weekly)',
    default: 'daily',
  })
  @IsOptional()
  @IsString()
  interval?: string;
}

/**
 * Agent outbound activity query DTO
 */
export class AgentOutboundActivityQueryDto {
  @ApiProperty({
    description: 'Request source identifier',
    example: 'my-app',
  })
  @IsString()
  @MaxLength(50)
  source: string;

  @ApiProperty({
    description: 'Start time RFC 3339',
    example: '2024-01-01T00:00:00Z',
  })
  @IsString()
  from: string;

  @ApiProperty({
    description: 'End time RFC 3339',
    example: '2024-01-31T23:59:59Z',
  })
  @IsString()
  to: string;

  @ApiPropertyOptional({
    description: 'Filter by agent ID',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  agentId?: number;

  @ApiPropertyOptional({
    description: 'Filter by agent group ID',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  agentGroupId?: number;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number;

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
}

/**
 * Skill outbound metrics query DTO
 */
export class SkillOutboundMetricsQueryDto {
  @ApiProperty({
    description: 'Request source identifier',
    example: 'my-app',
  })
  @IsString()
  @MaxLength(50)
  source: string;

  @ApiProperty({
    description: 'Start time RFC 3339',
    example: '2024-01-01T00:00:00Z',
  })
  @IsString()
  from: string;

  @ApiProperty({
    description: 'End time RFC 3339',
    example: '2024-01-31T23:59:59Z',
  })
  @IsString()
  to: string;

  @ApiPropertyOptional({
    description: 'Filter by skill ID',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  skillId?: number;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number;

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
}

/**
 * Campaign list response DTO
 */
export class CampaignListResponseDto {
  @ApiProperty({ description: 'Campaign list response data' })
  data: ICampaignListResponse;
}

/**
 * Campaign details response DTO
 */
export class CampaignDetailsResponseDto {
  @ApiProperty({ description: 'Campaign details response data' })
  data: ICampaignDetailsResponse;
}

/**
 * Message deliveries response DTO
 */
export class MessageDeliveriesResponseDto {
  @ApiProperty({ description: 'Message deliveries response data' })
  data: IMessageDeliveriesResponse;
}

/**
 * Campaign performance response DTO
 */
export class CampaignPerformanceResponseDto {
  @ApiProperty({ description: 'Campaign performance response data' })
  data: ICampaignPerformanceResponse;
}

/**
 * Agent outbound activity response DTO
 */
export class AgentOutboundActivityResponseDto {
  @ApiProperty({ description: 'Agent outbound activity response data' })
  data: IAgentOutboundActivityResponse;
}

/**
 * Skill outbound metrics response DTO
 */
export class SkillOutboundMetricsResponseDto {
  @ApiProperty({ description: 'Skill outbound metrics response data' })
  data: ISkillOutboundMetricsResponse;
}
