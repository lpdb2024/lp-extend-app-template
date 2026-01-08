/**
 * Connect to Messaging API DTOs
 * NestJS DTOs for Connect to Messaging API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsObject,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ChannelType,
  ConversationState,
  ParticipantRole,
  ICreateConversationResponse,
  ISendMessageResponse,
  ICloseConversationResponse,
  ITransferConversationResponse,
  IGetConversationResponse,
  IGetCapabilitiesResponse,
} from './connect-to-messaging.interfaces';

// ============================================
// Nested DTOs for Complex Objects
// ============================================

/**
 * Campaign info DTO
 */
export class CampaignInfoDto {
  @ApiPropertyOptional({ description: 'Campaign ID', example: 12345 })
  @IsOptional()
  @IsNumber()
  campaignId?: number;

  @ApiPropertyOptional({ description: 'Engagement ID', example: 67890 })
  @IsOptional()
  @IsNumber()
  engagementId?: number;

  @ApiPropertyOptional({ description: 'Campaign name' })
  @IsOptional()
  @IsString()
  campaignName?: string;

  @ApiPropertyOptional({ description: 'Engagement name' })
  @IsOptional()
  @IsString()
  engagementName?: string;

  @ApiPropertyOptional({ description: 'Line of business ID' })
  @IsOptional()
  @IsNumber()
  lobId?: number;

  @ApiPropertyOptional({ description: 'Line of business name' })
  @IsOptional()
  @IsString()
  lobName?: string;
}

/**
 * Consumer participant DTO
 */
export class ConsumerParticipantDto {
  @ApiPropertyOptional({ description: 'Participant ID' })
  @IsOptional()
  @IsString()
  participantId?: string;

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Participant role', enum: ParticipantRole })
  @IsOptional()
  @IsEnum(ParticipantRole)
  role?: ParticipantRole;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;
}

/**
 * Skill routing DTO
 */
export class SkillRoutingDto {
  @ApiProperty({ description: 'Target skill ID', example: 123 })
  @IsNumber()
  skillId: number;

  @ApiPropertyOptional({ description: 'Skill name' })
  @IsOptional()
  @IsString()
  skillName?: string;

  @ApiPropertyOptional({ description: 'Routing priority', example: 1 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}

/**
 * Conversation context DTO
 */
export class ConversationContextDto {
  @ApiPropertyOptional({ description: 'Visitor ID' })
  @IsOptional()
  @IsString()
  visitorId?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Interaction context ID' })
  @IsOptional()
  @IsString()
  interactionContextId?: string;

  @ApiPropertyOptional({ description: 'Channel type', enum: ChannelType })
  @IsOptional()
  @IsEnum(ChannelType)
  type?: ChannelType;

  @ApiPropertyOptional({ description: 'Language code', example: 'en-US' })
  @IsOptional()
  @IsString()
  lang?: string;

  @ApiPropertyOptional({ description: 'Engagement attributes (SDEs)' })
  @IsOptional()
  @IsArray()
  engagementAttributes?: any[];
}

/**
 * Initial message DTO
 */
export class InitialMessageDto {
  @ApiPropertyOptional({ description: 'Message text', example: 'Hello, I need help' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'Structured content (rich content)' })
  @IsOptional()
  @IsObject()
  structuredContent?: any;
}

/**
 * Message DTO
 */
export class MessageDto {
  @ApiPropertyOptional({ description: 'Message text' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'Structured content (rich content)' })
  @IsOptional()
  @IsObject()
  structuredContent?: any;
}

/**
 * Consumer authentication DTO
 */
export class ConsumerAuthDto {
  @ApiPropertyOptional({ description: 'Authentication type', example: 'jwt' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'JWT token for authentication' })
  @IsOptional()
  @IsString()
  jwt?: string;

  @ApiPropertyOptional({ description: 'Authentication code' })
  @IsOptional()
  @IsString()
  code?: string;
}

// ============================================
// Request DTOs
// ============================================

/**
 * Create conversation request DTO
 */
export class CreateConversationDto {
  @ApiPropertyOptional({ description: 'Campaign information' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignInfoDto)
  campaignInfo?: CampaignInfoDto;

  @ApiPropertyOptional({ description: 'Consumer participant details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConsumerParticipantDto)
  consumerParticipant?: ConsumerParticipantDto;

  @ApiPropertyOptional({ description: 'Conversation context' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConversationContextDto)
  conversationContext?: ConversationContextDto;

  @ApiPropertyOptional({ description: 'Skill routing configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SkillRoutingDto)
  skill?: SkillRoutingDto;

  @ApiPropertyOptional({ description: 'Initial message to send' })
  @IsOptional()
  @ValidateNested()
  @Type(() => InitialMessageDto)
  initialMessage?: InitialMessageDto;

  @ApiPropertyOptional({ description: 'Consumer authentication data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConsumerAuthDto)
  authenticatedData?: ConsumerAuthDto;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Send message request DTO
 */
export class SendMessageDto {
  @ApiProperty({ description: 'Message content' })
  @ValidateNested()
  @Type(() => MessageDto)
  message: MessageDto;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Close conversation request DTO
 */
export class CloseConversationDto {
  @ApiPropertyOptional({ description: 'Reason for closing', example: 'Resolved' })
  @IsOptional()
  @IsString()
  closeReason?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Transfer conversation request DTO
 */
export class TransferConversationDto {
  @ApiProperty({ description: 'Target skill ID to transfer to', example: 456 })
  @IsNumber()
  targetSkillId: number;

  @ApiPropertyOptional({ description: 'Target skill name' })
  @IsOptional()
  @IsString()
  targetSkillName?: string;

  @ApiPropertyOptional({ description: 'Reason for transfer', example: 'Escalation required' })
  @IsOptional()
  @IsString()
  transferReason?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// ============================================
// Response DTOs
// ============================================

/**
 * Create conversation response DTO
 */
export class CreateConversationResponseDto {
  @ApiProperty({ description: 'Created conversation data' })
  data: ICreateConversationResponse;
}

/**
 * Send message response DTO
 */
export class SendMessageResponseDto {
  @ApiProperty({ description: 'Message send result' })
  data: ISendMessageResponse;
}

/**
 * Close conversation response DTO
 */
export class CloseConversationResponseDto {
  @ApiProperty({ description: 'Close conversation result' })
  data: ICloseConversationResponse;
}

/**
 * Transfer conversation response DTO
 */
export class TransferConversationResponseDto {
  @ApiProperty({ description: 'Transfer conversation result' })
  data: ITransferConversationResponse;
}

/**
 * Get conversation response DTO
 */
export class GetConversationResponseDto {
  @ApiProperty({ description: 'Conversation details' })
  data: IGetConversationResponse;
}

/**
 * Get capabilities response DTO
 */
export class GetCapabilitiesResponseDto {
  @ApiProperty({ description: 'Account capabilities' })
  data: IGetCapabilitiesResponse;
}
