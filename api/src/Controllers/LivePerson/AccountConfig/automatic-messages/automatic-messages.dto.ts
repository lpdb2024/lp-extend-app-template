/**
 * Automatic Messages DTOs
 * NestJS DTOs for Automatic Messages API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { LPAutomaticMessage } from '@lpextend/client-sdk';
import {
  ILocalizedData,
  IAutoMessageAttributes,
  IAutoMessageContext,
} from '../../shared/lp-common.interfaces';

/**
 * Localized data DTO
 */
export class LocalizedDataDto implements ILocalizedData {
  @ApiProperty({ description: 'Language code', example: 'en-US' })
  @IsString()
  lang: string;

  @ApiPropertyOptional({ description: 'Message content' })
  @IsOptional()
  @IsString()
  msg?: string;

  @ApiPropertyOptional({ description: 'Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Text content' })
  @IsOptional()
  @IsString()
  text?: string;
}

/**
 * Message attributes DTO
 */
export class AutoMessageAttributesDto implements IAutoMessageAttributes {
  @ApiPropertyOptional({ description: 'Timer value' })
  @IsOptional()
  @IsString()
  timer?: string;

  @ApiPropertyOptional({ description: 'Timer unit (seconds, minutes, etc.)' })
  @IsOptional()
  @IsString()
  timerUnit?: string;
}

/**
 * DTO for creating a new automatic message
 */
export class CreateAutomaticMessageDto {
  @ApiProperty({ description: 'Whether the message is enabled', default: true })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Message event ID (e.g., CONVERSATION_STARTED)', example: 'CONVERSATION_STARTED' })
  @IsString()
  messageEventId: string;

  @ApiPropertyOptional({ description: 'Template ID' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ description: 'Localized message data', type: [LocalizedDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocalizedDataDto)
  data: LocalizedDataDto[];

  @ApiPropertyOptional({ description: 'Message attributes', type: AutoMessageAttributesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AutoMessageAttributesDto)
  attributes?: AutoMessageAttributesDto;

  @ApiPropertyOptional({ description: 'Context configuration (skills, accounts)' })
  @IsOptional()
  @IsObject()
  context?: IAutoMessageContext;

  @ApiPropertyOptional({ description: 'Channels this message applies to', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: string[];
}

/**
 * DTO for updating an automatic message
 */
export class UpdateAutomaticMessageDto {
  @ApiPropertyOptional({ description: 'Whether the message is enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Localized message data', type: [LocalizedDataDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocalizedDataDto)
  data?: LocalizedDataDto[];

  @ApiPropertyOptional({ description: 'Message attributes', type: AutoMessageAttributesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AutoMessageAttributesDto)
  attributes?: AutoMessageAttributesDto;

  @ApiPropertyOptional({ description: 'Context configuration' })
  @IsOptional()
  @IsObject()
  context?: IAutoMessageContext;

  @ApiPropertyOptional({ description: 'Channels this message applies to', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: string[];
}

/**
 * Query parameters for automatic messages list
 */
export class AutomaticMessagesQueryDto {
  @ApiPropertyOptional({ description: 'Fields to select (comma-separated)' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted messages' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean;

  @ApiPropertyOptional({ description: 'Filter by skill ID' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  skillId?: number;

  @ApiPropertyOptional({ description: 'Filter by message event ID' })
  @IsOptional()
  @IsString()
  messageEventId?: string;
}

/**
 * Automatic message response DTO
 */
export interface AutomaticMessageResponseDto {
  data: LPAutomaticMessage;
  revision?: string;
}

/**
 * Automatic messages list response DTO
 */
export interface AutomaticMessagesListResponseDto {
  data: LPAutomaticMessage[];
  revision?: string;
}

/**
 * Default automatic messages response DTO
 */
export interface DefaultAutomaticMessagesResponseDto {
  data: LPAutomaticMessage[];
}
