/**
 * Messaging Interactions (History) API DTOs
 * NestJS DTOs for Messaging History API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  ValidateNested,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  ConversationStatus,
  MessageSource,
  DeviceType,
  ContentToRetrieve,
  IConversation,
  IConversationSearchResponse,
} from './conversations.interfaces';

/**
 * Time range DTO
 */
export class TimeRangeDto {
  @ApiProperty({ description: 'Start time in epoch milliseconds', example: 1700000000000 })
  @IsNumber()
  from: number;

  @ApiProperty({ description: 'End time in epoch milliseconds', example: 1700100000000 })
  @IsNumber()
  to: number;
}

/**
 * Numeric range DTO
 */
export class NumericRangeDto {
  @ApiPropertyOptional({ description: 'Range start value' })
  @IsOptional()
  @IsNumber()
  from?: number;

  @ApiPropertyOptional({ description: 'Range end value' })
  @IsOptional()
  @IsNumber()
  to?: number;
}

/**
 * SDE search DTO
 */
export class SDESearchDto {
  @ApiProperty({ description: 'SDE type to search', example: 'customerInfo' })
  @IsString()
  sdeType: string;

  @ApiPropertyOptional({ description: 'Path within the SDE' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: 'Value to match' })
  @IsOptional()
  value?: string | number;
}

/**
 * Conversation search request body DTO
 */
export class ConversationSearchRequestDto {
  @ApiProperty({ description: 'Start time range (required)', type: TimeRangeDto })
  @ValidateNested()
  @Type(() => TimeRangeDto)
  start: TimeRangeDto;

  @ApiPropertyOptional({ description: 'End time range', type: TimeRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  end?: TimeRangeDto;

  @ApiPropertyOptional({
    description: 'Conversation statuses to filter',
    enum: ConversationStatus,
    isArray: true,
    example: ['OPEN', 'CLOSE'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ConversationStatus, { each: true })
  status?: ConversationStatus[];

  @ApiPropertyOptional({ description: 'Skill IDs to filter', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  skillIds?: number[];

  @ApiPropertyOptional({ description: 'Latest skill IDs to filter', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  latestSkillIds?: number[];

  @ApiPropertyOptional({ description: 'Agent IDs to filter', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  agentIds?: string[];

  @ApiPropertyOptional({ description: 'Latest agent IDs to filter', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  latestAgentIds?: string[];

  @ApiPropertyOptional({ description: 'Agent group IDs to filter', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  agentGroupIds?: number[];

  @ApiPropertyOptional({ description: 'Keyword to search in messages' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Summary text to search' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Duration range in seconds', type: NumericRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumericRangeDto)
  duration?: NumericRangeDto;

  @ApiPropertyOptional({ description: 'CSAT score range (1-5)', type: NumericRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumericRangeDto)
  csat?: NumericRangeDto;

  @ApiPropertyOptional({ description: 'MCS score range (0-100)', type: NumericRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumericRangeDto)
  mcs?: NumericRangeDto;

  @ApiPropertyOptional({ description: 'Alerted MCS values to filter', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  alertedMcsValues?: number[];

  @ApiPropertyOptional({
    description: 'Message sources to filter',
    enum: MessageSource,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(MessageSource, { each: true })
  source?: MessageSource[];

  @ApiPropertyOptional({
    description: 'Device types to filter',
    enum: DeviceType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DeviceType, { each: true })
  device?: DeviceType[];

  @ApiPropertyOptional({ description: 'SDE search criteria', type: SDESearchDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SDESearchDto)
  sdeSearch?: SDESearchDto;

  @ApiPropertyOptional({
    description: 'Content types to retrieve',
    type: [String],
    example: ['messageRecords', 'agentParticipants', 'consumerParticipants'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentToRetrieve?: ContentToRetrieve[];

  @ApiPropertyOptional({ description: 'Latest update time in epoch milliseconds' })
  @IsOptional()
  @IsNumber()
  latestUpdateTime?: number;

  @ApiPropertyOptional({ description: 'NPS score range', type: NumericRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumericRangeDto)
  nps?: NumericRangeDto;

  @ApiPropertyOptional({ description: 'Survey bot conversations filter' })
  @IsOptional()
  @IsBoolean()
  surveyBotConversations?: boolean;

  @ApiPropertyOptional({ description: 'Survey IDs to filter', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  surveyIds?: number[];

  @ApiPropertyOptional({ description: 'Response time range', type: NumericRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumericRangeDto)
  responseTime?: NumericRangeDto;
}

/**
 * Query parameters for conversation search
 */
export class ConversationSearchQueryDto {
  @ApiPropertyOptional({ description: 'Starting record position', default: 0 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ description: 'Maximum results per response', default: 50, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort order (e.g., start:desc)', example: 'start:desc' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: 'API version (1 or 2)', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  v?: number;

  @ApiPropertyOptional({ description: 'Source identifier (max 20 chars)', example: 'MyApp+History' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Include rollover account conversations', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  rollover?: boolean;
}

/**
 * Get conversation by ID request DTO
 */
export class GetConversationByIdRequestDto {
  @ApiPropertyOptional({ description: 'Single conversation ID' })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional({ description: 'Multiple conversation IDs (max 100)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conversationIds?: string[];

  @ApiPropertyOptional({
    description: 'Content types to retrieve',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentToRetrieve?: ContentToRetrieve[];
}

/**
 * Get conversations by consumer ID request DTO
 */
export class GetConversationsByConsumerRequestDto {
  @ApiProperty({ description: 'Consumer ID (participantId)' })
  @IsString()
  consumer: string;

  @ApiProperty({
    description: 'Conversation statuses to filter',
    enum: ConversationStatus,
    isArray: true,
    example: ['OPEN', 'CLOSE'],
  })
  @IsArray()
  @IsEnum(ConversationStatus, { each: true })
  status: ConversationStatus[];

  @ApiPropertyOptional({
    description: 'Content types to retrieve',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentToRetrieve?: ContentToRetrieve[];
}

/**
 * Query parameters for consumer search
 */
export class ConsumerSearchQueryDto {
  @ApiPropertyOptional({ description: 'Starting record position', default: 0, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  @Max(100)
  offset?: number;

  @ApiPropertyOptional({ description: 'Maximum results per response', default: 50, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Source identifier (max 20 chars)' })
  @IsOptional()
  @IsString()
  source?: string;
}

/**
 * Conversation search response DTO
 */
export class ConversationSearchResponseDto {
  @ApiProperty({ description: 'Response metadata' })
  _metadata: {
    count: number;
    self?: { rel: string; href: string };
    next?: { rel: string; href: string };
  };

  @ApiProperty({ description: 'Conversation records', type: [Object] })
  conversationHistoryRecords: IConversation[];
}

/**
 * Single/multiple conversation response DTO
 */
export class ConversationResponseDto {
  @ApiProperty({ description: 'Conversation records', type: [Object] })
  conversationHistoryRecords: IConversation[];
}
