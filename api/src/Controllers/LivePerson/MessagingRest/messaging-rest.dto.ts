/**
 * Messaging REST API DTOs
 * NestJS DTOs for Messaging REST API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsObject,
  ValidateNested,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  MessageContentType,
  MessageEventType,
  ChatState,
  AcceptStatus,
  ConversationState,
  ParticipantRole,
  IEvent,
  ICreateConversationResponse,
  IGetConversationResponse,
  IMessagingResponse,
  ISendMessageResponse,
  IConsumerProfileResponse,
} from './messaging-rest.interfaces';

// ============================================
// Event DTOs
// ============================================

/**
 * Base event DTO
 */
export class EventDto {
  @ApiProperty({ description: 'Event type', enum: MessageEventType })
  @IsEnum(MessageEventType)
  type: MessageEventType;

  @ApiPropertyOptional({ description: 'Sequence ID' })
  @IsOptional()
  @IsNumber()
  sequenceId?: number;

  @ApiPropertyOptional({ description: 'Dialog ID' })
  @IsOptional()
  @IsString()
  dialogId?: string;
}

/**
 * Content event DTO
 */
export class ContentEventDto extends EventDto {
  @ApiProperty({ description: 'Event type', enum: [MessageEventType.CONTENT_EVENT] })
  @IsEnum([MessageEventType.CONTENT_EVENT])
  type: MessageEventType.CONTENT_EVENT;

  @ApiProperty({ description: 'Message text' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Content type', enum: MessageContentType })
  @IsOptional()
  @IsEnum(MessageContentType)
  contentType?: MessageContentType;
}

/**
 * Rich content event DTO
 */
export class RichContentEventDto extends EventDto {
  @ApiProperty({ description: 'Event type', enum: [MessageEventType.RICH_CONTENT_EVENT] })
  @IsEnum([MessageEventType.RICH_CONTENT_EVENT])
  type: MessageEventType.RICH_CONTENT_EVENT;

  @ApiProperty({ description: 'Structured content' })
  @IsObject()
  content: any;
}

/**
 * Accept status event DTO
 */
export class AcceptStatusEventDto extends EventDto {
  @ApiProperty({ description: 'Event type', enum: [MessageEventType.ACCEPT_STATUS_EVENT] })
  @IsEnum([MessageEventType.ACCEPT_STATUS_EVENT])
  type: MessageEventType.ACCEPT_STATUS_EVENT;

  @ApiProperty({ description: 'Accept status', enum: AcceptStatus })
  @IsEnum(AcceptStatus)
  status: AcceptStatus;

  @ApiPropertyOptional({ description: 'Sequence list', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  sequenceList?: number[];
}

/**
 * Chat state event DTO
 */
export class ChatStateEventDto extends EventDto {
  @ApiProperty({ description: 'Event type', enum: [MessageEventType.CHAT_STATE_EVENT] })
  @IsEnum([MessageEventType.CHAT_STATE_EVENT])
  type: MessageEventType.CHAT_STATE_EVENT;

  @ApiProperty({ description: 'Chat state', enum: ChatState })
  @IsEnum(ChatState)
  chatState: ChatState;
}

// ============================================
// Consumer Info DTOs
// ============================================

/**
 * Consumer personal info DTO
 */
export class PersonalInfoDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiPropertyOptional({ description: 'Gender' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Company' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Language' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone' })
  @IsOptional()
  @IsString()
  phone?: string;
}

/**
 * Consumer info DTO
 */
export class ConsumerInfoDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Personal information', type: PersonalInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo?: PersonalInfoDto;
}

// ============================================
// Conversation Context DTOs
// ============================================

/**
 * Campaign info DTO
 */
export class CampaignInfoDto {
  @ApiPropertyOptional({ description: 'Campaign ID' })
  @IsOptional()
  @IsNumber()
  campaignId?: number;

  @ApiPropertyOptional({ description: 'Engagement ID' })
  @IsOptional()
  @IsNumber()
  engagementId?: number;
}

/**
 * Conversation context DTO
 */
export class ConversationContextDto {
  @ApiPropertyOptional({ description: 'Context type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Language code' })
  @IsOptional()
  @IsString()
  lang?: string;

  @ApiPropertyOptional({ description: 'Visitor ID' })
  @IsOptional()
  @IsString()
  visitorId?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Skill ID' })
  @IsOptional()
  @IsString()
  skillId?: string;

  @ApiPropertyOptional({ description: 'Campaign ID' })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Engagement ID' })
  @IsOptional()
  @IsString()
  engagementId?: string;
}

// ============================================
// Request DTOs
// ============================================

/**
 * Create conversation body DTO
 */
export class CreateConversationBodyDto {
  @ApiPropertyOptional({ description: 'Brand ID (account ID)' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Skill ID to route to' })
  @IsOptional()
  @IsString()
  skillId?: string;

  @ApiPropertyOptional({ description: 'Campaign information', type: CampaignInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignInfoDto)
  campaignInfo?: CampaignInfoDto;

  @ApiPropertyOptional({ description: 'Conversation context', type: ConversationContextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConversationContextDto)
  conversationContext?: ConversationContextDto;

  @ApiPropertyOptional({ description: 'Channel type', example: 'MESSAGING' })
  @IsOptional()
  @IsString()
  channelType?: string;

  @ApiPropertyOptional({ description: 'Consumer information', type: ConsumerInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConsumerInfoDto)
  consumerInfo?: ConsumerInfoDto;

  @ApiPropertyOptional({ description: 'Authenticated SDEs' })
  @IsOptional()
  @IsArray()
  authenticatedSdes?: any[];

  @ApiPropertyOptional({ description: 'Unauthenticated SDEs' })
  @IsOptional()
  @IsArray()
  unAuthenticatedSdes?: any[];
}

/**
 * Send message DTO
 */
export class SendMessageDto {
  @ApiProperty({ description: 'Dialog ID from conversation' })
  @IsString()
  dialogId: string;

  @ApiProperty({ description: 'Event data', type: EventDto })
  @ValidateNested()
  @Type(() => EventDto)
  event: IEvent;
}

/**
 * Send text message DTO
 */
export class SendTextMessageDto {
  @ApiProperty({ description: 'Dialog ID from conversation' })
  @IsString()
  dialogId: string;

  @ApiProperty({ description: 'Message text' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Content type', enum: MessageContentType, default: MessageContentType.TEXT_PLAIN })
  @IsOptional()
  @IsEnum(MessageContentType)
  contentType?: MessageContentType;
}

/**
 * Send structured content DTO
 */
export class SendStructuredContentDto {
  @ApiProperty({ description: 'Dialog ID from conversation' })
  @IsString()
  dialogId: string;

  @ApiProperty({ description: 'Structured content object' })
  @IsObject()
  content: any;
}

/**
 * Send chat state DTO
 */
export class SendChatStateDto {
  @ApiProperty({ description: 'Dialog ID from conversation' })
  @IsString()
  dialogId: string;

  @ApiProperty({ description: 'Chat state', enum: ChatState })
  @IsEnum(ChatState)
  chatState: ChatState;
}

/**
 * Send accept status DTO
 */
export class SendAcceptStatusDto {
  @ApiProperty({ description: 'Dialog ID from conversation' })
  @IsString()
  dialogId: string;

  @ApiProperty({ description: 'Accept status', enum: AcceptStatus })
  @IsEnum(AcceptStatus)
  status: AcceptStatus;

  @ApiProperty({ description: 'Sequence numbers to acknowledge', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  sequenceList: number[];
}

/**
 * Close conversation DTO
 */
export class CloseConversationDto {
  @ApiPropertyOptional({ description: 'Close reason', example: 'Resolved by agent' })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Update conversation field DTO
 */
export class UpdateConversationFieldDto {
  @ApiProperty({ description: 'Field name to update' })
  @IsString()
  field: string;

  @ApiProperty({ description: 'Field value' })
  value: any;
}

/**
 * Transfer conversation DTO
 */
export class TransferConversationDto {
  @ApiProperty({ description: 'Target skill ID' })
  @IsString()
  skillId: string;
}

/**
 * Subscribe messaging events DTO
 */
export class SubscribeMessagingEventsDto {
  @ApiPropertyOptional({ description: 'Dialog ID to subscribe to' })
  @IsOptional()
  @IsString()
  dialogId?: string;

  @ApiPropertyOptional({ description: 'Starting sequence number' })
  @IsOptional()
  @IsNumber()
  fromSeq?: number;
}

// ============================================
// Query Parameter DTOs
// ============================================

/**
 * Get conversations query DTO
 */
export class GetConversationsQueryDto {
  @ApiPropertyOptional({ description: 'API version', default: 2 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  v?: number;

  @ApiPropertyOptional({ description: 'Filter by conversation state', enum: ConversationState, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ConversationState, { each: true })
  status?: ConversationState[];

  @ApiPropertyOptional({ description: 'Sort field and order', example: 'startTs:desc' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: 'Number of results to skip', default: 0 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ description: 'Maximum number of results', default: 50, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * Get conversation query DTO
 */
export class GetConversationQueryDto {
  @ApiPropertyOptional({ description: 'API version', default: 2 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  v?: number;
}

// ============================================
// Response DTOs
// ============================================

/**
 * Create conversation response DTO
 */
export class CreateConversationResponseDto {
  @ApiProperty({ description: 'Conversation ID' })
  conversationId: string;

  @ApiPropertyOptional({ description: 'Consumer ID' })
  consumerId?: string;
}

/**
 * Participant DTO
 */
export class ParticipantDto {
  @ApiProperty({ description: 'Participant ID' })
  id: string;

  @ApiProperty({ description: 'Participant role', enum: ParticipantRole })
  role: ParticipantRole;
}

/**
 * Dialog DTO
 */
export class DialogDto {
  @ApiProperty({ description: 'Dialog ID' })
  dialogId: string;

  @ApiProperty({ description: 'Dialog type' })
  dialogType: string;

  @ApiProperty({ description: 'Channel type' })
  channelType: string;

  @ApiPropertyOptional({ description: 'Dialog state' })
  state?: string;

  @ApiPropertyOptional({ description: 'Creation timestamp' })
  creationTs?: number;

  @ApiPropertyOptional({ description: 'End timestamp' })
  endTs?: number;
}

/**
 * Get conversation response DTO
 */
export class GetConversationResponseDto {
  @ApiProperty({ description: 'Conversation ID' })
  conversationId: string;

  @ApiProperty({ description: 'Conversation state', enum: ConversationState })
  state: ConversationState;

  @ApiPropertyOptional({ description: 'Start timestamp' })
  startTs?: number;

  @ApiPropertyOptional({ description: 'Close timestamp' })
  closeTs?: number;

  @ApiProperty({ description: 'Participants', type: [ParticipantDto] })
  participants: ParticipantDto[];

  @ApiPropertyOptional({ description: 'Dialogs', type: [DialogDto] })
  dialogs?: DialogDto[];

  @ApiPropertyOptional({ description: 'Brand ID' })
  brandId?: string;

  @ApiPropertyOptional({ description: 'Campaign info', type: CampaignInfoDto })
  campaignInfo?: CampaignInfoDto;

  @ApiPropertyOptional({ description: 'Conversation context', type: ConversationContextDto })
  conversationContext?: ConversationContextDto;
}

/**
 * Get conversations response DTO
 */
export class GetConversationsResponseDto {
  @ApiProperty({ description: 'Array of conversations', type: [GetConversationResponseDto] })
  conversations: GetConversationResponseDto[];

  @ApiPropertyOptional({ description: 'Total count' })
  totalCount?: number;
}

/**
 * Send message response DTO
 */
export class SendMessageResponseDto {
  @ApiProperty({ description: 'Message sequence number' })
  sequence: number;
}

/**
 * Generic messaging response DTO
 */
export class MessagingResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiPropertyOptional({ description: 'Response message' })
  message?: string;

  @ApiPropertyOptional({ description: 'Response data' })
  data?: any;
}

/**
 * Consumer profile response DTO
 */
export class ConsumerProfileResponseDto {
  @ApiPropertyOptional({ description: 'Authenticated data' })
  authenticatedData?: any;

  @ApiPropertyOptional({ description: 'Unauthenticated data' })
  unAuthenticatedData?: any;
}
