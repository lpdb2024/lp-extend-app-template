/**
 * Proactive Messaging API DTOs
 * NestJS DTOs for Proactive Messaging API request/response validation
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
  PMCampaignStatus,
  PMChannelType,
  PMHandoffType,
  IPMCampaign,
  IPMCampaignListResponse,
  IPMHandoff,
  IPMHandoffListResponse,
  IPMTestMessageResponse,
} from './proactive-messaging.interfaces';

/**
 * Consumer identifier DTO
 */
export class ConsumerIdentifierDto {
  @ApiProperty({ description: 'Identifier type', enum: ['phone', 'email', 'consumerId'] })
  @IsString()
  type: 'phone' | 'email' | 'consumerId';

  @ApiProperty({ description: 'Identifier value', example: '+12345678900' })
  @IsString()
  value: string;
}

/**
 * Campaign channel DTO
 */
export class CampaignChannelDto {
  @ApiProperty({ description: 'Channel type', enum: PMChannelType })
  @IsEnum(PMChannelType)
  type: PMChannelType;

  @ApiProperty({ description: 'Channel enabled flag' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Template ID for channel' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Handoff configuration ID' })
  @IsOptional()
  @IsString()
  handoffId?: string;

  @ApiPropertyOptional({ description: 'Custom message text' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Channel metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Campaign schedule DTO
 */
export class CampaignScheduleDto {
  @ApiPropertyOptional({ description: 'Start time in epoch milliseconds' })
  @IsOptional()
  @IsNumber()
  startTime?: number;

  @ApiPropertyOptional({ description: 'End time in epoch milliseconds' })
  @IsOptional()
  @IsNumber()
  endTime?: number;

  @ApiPropertyOptional({ description: 'Timezone (e.g., America/New_York)' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Send immediately flag' })
  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}

/**
 * Campaign targeting DTO
 */
export class CampaignTargetingDto {
  @ApiProperty({ description: 'List of consumer identifiers', type: [ConsumerIdentifierDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsumerIdentifierDto)
  consumers: ConsumerIdentifierDto[];

  @ApiPropertyOptional({ description: 'Segment ID for audience targeting' })
  @IsOptional()
  @IsString()
  segmentId?: string;

  @ApiPropertyOptional({ description: 'Maximum number of recipients' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRecipients?: number;
}

/**
 * Campaign throttling DTO
 */
export class CampaignThrottlingDto {
  @ApiProperty({ description: 'Throttling enabled flag' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Max messages per hour' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMessagesPerHour?: number;

  @ApiPropertyOptional({ description: 'Max messages per day' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMessagesPerDay?: number;
}

/**
 * Create campaign DTO
 */
export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Campaign channels', type: [CampaignChannelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignChannelDto)
  channels: CampaignChannelDto[];

  @ApiProperty({ description: 'Campaign targeting configuration', type: CampaignTargetingDto })
  @ValidateNested()
  @Type(() => CampaignTargetingDto)
  targeting: CampaignTargetingDto;

  @ApiPropertyOptional({ description: 'Campaign schedule', type: CampaignScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignScheduleDto)
  schedule?: CampaignScheduleDto;

  @ApiPropertyOptional({ description: 'Throttling configuration', type: CampaignThrottlingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignThrottlingDto)
  throttling?: CampaignThrottlingDto;

  @ApiPropertyOptional({ description: 'Skill ID for routing' })
  @IsOptional()
  @IsString()
  skillId?: string;

  @ApiPropertyOptional({ description: 'Campaign metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Update campaign DTO
 */
export class UpdateCampaignDto {
  @ApiPropertyOptional({ description: 'Campaign name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Campaign status', enum: PMCampaignStatus })
  @IsOptional()
  @IsEnum(PMCampaignStatus)
  status?: PMCampaignStatus;

  @ApiPropertyOptional({ description: 'Campaign channels', type: [CampaignChannelDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignChannelDto)
  channels?: CampaignChannelDto[];

  @ApiPropertyOptional({ description: 'Campaign schedule', type: CampaignScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignScheduleDto)
  schedule?: CampaignScheduleDto;

  @ApiPropertyOptional({ description: 'Throttling configuration', type: CampaignThrottlingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignThrottlingDto)
  throttling?: CampaignThrottlingDto;

  @ApiPropertyOptional({ description: 'Campaign metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Campaign query parameters DTO
 */
export class CampaignQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: PMCampaignStatus })
  @IsOptional()
  @IsEnum(PMCampaignStatus)
  status?: PMCampaignStatus;

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

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

/**
 * Create handoff DTO
 */
export class CreateHandoffDto {
  @ApiProperty({ description: 'Handoff name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Handoff description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Handoff type', enum: PMHandoffType })
  @IsEnum(PMHandoffType)
  type: PMHandoffType;

  @ApiPropertyOptional({ description: 'Skill ID for routing' })
  @IsOptional()
  @IsString()
  skillId?: string;

  @ApiPropertyOptional({ description: 'Conversation attributes' })
  @IsOptional()
  @IsObject()
  conversationAttributes?: Record<string, any>;
}

/**
 * Update handoff DTO
 */
export class UpdateHandoffDto {
  @ApiPropertyOptional({ description: 'Handoff name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Handoff description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Skill ID for routing' })
  @IsOptional()
  @IsString()
  skillId?: string;

  @ApiPropertyOptional({ description: 'Conversation attributes' })
  @IsOptional()
  @IsObject()
  conversationAttributes?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Enabled flag' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

/**
 * Send test message DTO
 */
export class SendTestMessageDto {
  @ApiProperty({ description: 'Channel type', enum: PMChannelType })
  @IsEnum(PMChannelType)
  channel: PMChannelType;

  @ApiProperty({ description: 'Consumer identifier', type: ConsumerIdentifierDto })
  @ValidateNested()
  @Type(() => ConsumerIdentifierDto)
  consumer: ConsumerIdentifierDto;

  @ApiPropertyOptional({ description: 'Template ID' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Custom message text' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Handoff configuration ID' })
  @IsOptional()
  @IsString()
  handoffId?: string;
}

/**
 * Campaign response DTO
 */
export class PMCampaignResponseDto {
  @ApiProperty({ description: 'Campaign data' })
  data: IPMCampaign;
}

/**
 * Campaign list response DTO
 */
export class PMCampaignListResponseDto {
  @ApiProperty({ description: 'Campaign list data' })
  data: IPMCampaignListResponse;
}

/**
 * Handoff response DTO
 */
export class PMHandoffResponseDto {
  @ApiProperty({ description: 'Handoff data' })
  data: IPMHandoff;
}

/**
 * Handoff list response DTO
 */
export class PMHandoffListResponseDto {
  @ApiProperty({ description: 'Handoff list data' })
  data: IPMHandoffListResponse;
}

/**
 * Test message response DTO
 */
export class PMTestMessageResponseDto {
  @ApiProperty({ description: 'Test message response' })
  data: IPMTestMessageResponse;
}
