/**
 * Engagements API DTOs
 * NestJS DTOs for Engagements API request/response validation
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
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  IEngagement,
  EngagementChannel,
  EngagementType,
  EngagementSubType,
  EngagementSource,
  AvailabilityPolicy,
  RenderingType,
  ConversationType,
} from './engagements.interfaces';

/**
 * Display instance DTO
 */
export class DisplayInstanceDto {
  @ApiProperty({ description: 'Display instance type' })
  @IsNumber()
  displayInstanceType: number;

  @ApiProperty({ description: 'Whether enabled' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Display settings' })
  @IsOptional()
  displaySettings?: Record<string, unknown>;
}

/**
 * Zone DTO
 */
export class ZoneDto {
  @ApiProperty({ description: 'Zone ID' })
  @IsNumber()
  zoneId: number;

  @ApiPropertyOptional({ description: 'Zone type' })
  @IsOptional()
  @IsString()
  zoneType?: string;
}

/**
 * Engagement query parameters
 */
export class EngagementQueryDto {
  @ApiPropertyOptional({ description: 'API version', example: '3.4' })
  @IsOptional()
  @IsString()
  v?: string;

  @ApiPropertyOptional({ description: 'Fields to return' })
  @IsOptional()
  fields?: string | string[];

  @ApiPropertyOptional({
    description: 'Field set: all or summary',
    enum: ['all', 'summary'],
  })
  @IsOptional()
  @IsString()
  field_set?: 'all' | 'summary';

  @ApiPropertyOptional({ description: 'Select expression' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Filter expression' })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiPropertyOptional({ description: 'Include deleted engagements' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  include_deleted?: boolean;
}

/**
 * Engagement create request DTO
 */
export class EngagementCreateDto {
  @ApiProperty({ description: 'Engagement name', example: 'My Engagement' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Engagement description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Channel (1=Web, 2=Mobile)',
    enum: EngagementChannel,
    default: EngagementChannel.WEB,
  })
  @IsOptional()
  @IsEnum(EngagementChannel)
  channel?: EngagementChannel;

  @ApiProperty({
    description: 'Engagement type',
    enum: EngagementType,
  })
  @IsEnum(EngagementType)
  type: EngagementType;

  @ApiPropertyOptional({
    description: 'Engagement sub-type',
    enum: EngagementSubType,
  })
  @IsOptional()
  @IsEnum(EngagementSubType)
  subType?: EngagementSubType;

  @ApiPropertyOptional({
    description: 'Engagement source',
    enum: EngagementSource,
  })
  @IsOptional()
  @IsEnum(EngagementSource)
  source?: EngagementSource;

  @ApiPropertyOptional({ description: 'Whether enabled', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Language code', example: 'en-US' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Onsite location IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  onsiteLocations?: number[];

  @ApiPropertyOptional({ description: 'Visitor behavior IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  visitorBehaviors?: number[];

  @ApiPropertyOptional({ description: 'Display instances', type: [DisplayInstanceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisplayInstanceDto)
  displayInstances?: DisplayInstanceDto[];

  @ApiPropertyOptional({ description: 'Time in queue (seconds)' })
  @IsOptional()
  @IsNumber()
  timeInQueue?: number;

  @ApiPropertyOptional({ description: 'Pop out window' })
  @IsOptional()
  @IsBoolean()
  isPopOut?: boolean;

  @ApiPropertyOptional({ description: 'Use unified window' })
  @IsOptional()
  @IsBoolean()
  isUnifiedWindow?: boolean;

  @ApiPropertyOptional({ description: 'App installation ID (UUID)' })
  @IsOptional()
  @IsString()
  appInstallationId?: string;

  @ApiPropertyOptional({ description: 'Use system routing' })
  @IsOptional()
  @IsBoolean()
  useSystemRouting?: boolean;

  @ApiPropertyOptional({ description: 'Allow unauthenticated messaging' })
  @IsOptional()
  @IsBoolean()
  allowUnauthMsg?: boolean;

  @ApiPropertyOptional({ description: 'Zones', type: [ZoneDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ZoneDto)
  zones?: ZoneDto[];

  @ApiPropertyOptional({ description: 'Connector ID' })
  @IsOptional()
  @IsNumber()
  connectorId?: number;

  @ApiPropertyOptional({
    description: 'Availability policy',
    enum: AvailabilityPolicy,
  })
  @IsOptional()
  @IsEnum(AvailabilityPolicy)
  availabilityPolicy?: AvailabilityPolicy;

  @ApiPropertyOptional({
    description: 'Rendering type',
    enum: RenderingType,
  })
  @IsOptional()
  @IsEnum(RenderingType)
  renderingType?: RenderingType;

  @ApiPropertyOptional({
    description: 'Conversation type',
    enum: ConversationType,
  })
  @IsOptional()
  @IsEnum(ConversationType)
  conversationType?: ConversationType;

  @ApiPropertyOptional({ description: 'Skill ID' })
  @IsOptional()
  @IsNumber()
  skillId?: number;

  @ApiPropertyOptional({ description: 'Window configuration ID' })
  @IsOptional()
  @IsNumber()
  windowId?: number;

  @ApiPropertyOptional({ description: 'Survey ID' })
  @IsOptional()
  @IsNumber()
  surveyId?: number;
}

/**
 * Engagement update request DTO
 */
export class EngagementUpdateDto {
  @ApiPropertyOptional({ description: 'Engagement name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Engagement description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Channel', enum: EngagementChannel })
  @IsOptional()
  @IsEnum(EngagementChannel)
  channel?: EngagementChannel;

  @ApiPropertyOptional({ description: 'Engagement type', enum: EngagementType })
  @IsOptional()
  @IsEnum(EngagementType)
  type?: EngagementType;

  @ApiPropertyOptional({ description: 'Whether enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Language code' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Onsite location IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  onsiteLocations?: number[];

  @ApiPropertyOptional({ description: 'Visitor behavior IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  visitorBehaviors?: number[];

  @ApiPropertyOptional({ description: 'Display instances', type: [DisplayInstanceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisplayInstanceDto)
  displayInstances?: DisplayInstanceDto[];

  @ApiPropertyOptional({ description: 'Time in queue (seconds)' })
  @IsOptional()
  @IsNumber()
  timeInQueue?: number;

  @ApiPropertyOptional({ description: 'Pop out window' })
  @IsOptional()
  @IsBoolean()
  isPopOut?: boolean;

  @ApiPropertyOptional({ description: 'Use unified window' })
  @IsOptional()
  @IsBoolean()
  isUnifiedWindow?: boolean;

  @ApiPropertyOptional({ description: 'App installation ID' })
  @IsOptional()
  @IsString()
  appInstallationId?: string;

  @ApiPropertyOptional({ description: 'Use system routing' })
  @IsOptional()
  @IsBoolean()
  useSystemRouting?: boolean;

  @ApiPropertyOptional({ description: 'Allow unauthenticated messaging' })
  @IsOptional()
  @IsBoolean()
  allowUnauthMsg?: boolean;

  @ApiPropertyOptional({ description: 'Zones', type: [ZoneDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ZoneDto)
  zones?: ZoneDto[];

  @ApiPropertyOptional({ description: 'Connector ID' })
  @IsOptional()
  @IsNumber()
  connectorId?: number;

  @ApiPropertyOptional({ description: 'Availability policy', enum: AvailabilityPolicy })
  @IsOptional()
  @IsEnum(AvailabilityPolicy)
  availabilityPolicy?: AvailabilityPolicy;

  @ApiPropertyOptional({ description: 'Rendering type', enum: RenderingType })
  @IsOptional()
  @IsEnum(RenderingType)
  renderingType?: RenderingType;

  @ApiPropertyOptional({ description: 'Conversation type', enum: ConversationType })
  @IsOptional()
  @IsEnum(ConversationType)
  conversationType?: ConversationType;

  @ApiPropertyOptional({ description: 'Skill ID' })
  @IsOptional()
  @IsNumber()
  skillId?: number;

  @ApiPropertyOptional({ description: 'Window configuration ID' })
  @IsOptional()
  @IsNumber()
  windowId?: number;

  @ApiPropertyOptional({ description: 'Survey ID' })
  @IsOptional()
  @IsNumber()
  surveyId?: number;
}

/**
 * Engagement response DTO
 */
export class EngagementResponseDto {
  @ApiProperty({ description: 'Engagement data' })
  data: IEngagement;
}

/**
 * Engagement list response DTO
 */
export class EngagementListResponseDto {
  @ApiProperty({ description: 'List of engagements', type: [Object] })
  data: IEngagement[];
}
