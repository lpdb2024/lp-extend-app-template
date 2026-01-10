/**
 * Campaigns API DTOs
 * NestJS DTOs for Campaigns API request/response validation
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
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { LPCampaign } from '@lpextend/client-sdk';
import { CampaignType, CampaignStatus } from './campaigns.interfaces';

/**
 * Control group DTO
 */
export class ControlGroupDto {
  @ApiProperty({ description: 'Control group percentage', example: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;
}

/**
 * Campaign query parameters
 */
export class CampaignQueryDto {
  @ApiPropertyOptional({ description: 'API version', example: '3.4' })
  @IsOptional()
  @IsString()
  v?: string;

  @ApiPropertyOptional({
    description: 'Fields to return (comma-separated or array)',
    example: 'id,name,status',
  })
  @IsOptional()
  fields?: string | string[];

  @ApiPropertyOptional({
    description: 'Field set: all or summary',
    enum: ['all', 'summary'],
  })
  @IsOptional()
  @IsString()
  field_set?: 'all' | 'summary';

  @ApiPropertyOptional({ description: 'Select expression for filtering' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Filter expression' })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiPropertyOptional({ description: 'Include deleted campaigns' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  include_deleted?: boolean;
}

/**
 * Campaign create request DTO
 */
export class CampaignCreateDto {
  @ApiProperty({ description: 'Campaign name', example: 'My Campaign' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Campaign type (0=Web, 1=Broadcast)',
    enum: CampaignType,
    default: CampaignType.WEB,
  })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @ApiPropertyOptional({
    description: 'Start date (YYYY-MM-DD HH:mm:ss)',
    example: '2024-01-01 00:00:00',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Expiration date (YYYY-MM-DD HH:mm:ss)',
    example: '2024-12-31 23:59:59',
  })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiPropertyOptional({ description: 'Goal ID' })
  @IsOptional()
  @IsNumber()
  goalId?: number;

  @ApiPropertyOptional({ description: 'Line of Business ID' })
  @IsOptional()
  @IsNumber()
  lobId?: number;

  @ApiPropertyOptional({
    description: 'Campaign status',
    enum: CampaignStatus,
    default: CampaignStatus.UNPUBLISHED,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ description: 'Priority (0-1)', example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  priority?: number;

  @ApiPropertyOptional({ description: 'Weight (0-1)', example: 0.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Timezone',
    example: 'America/New_York',
  })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiPropertyOptional({ description: 'Control group settings' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ControlGroupDto)
  controlGroup?: ControlGroupDto;

  @ApiPropertyOptional({
    description: 'Engagement IDs',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  engagementIds?: number[];

  @ApiPropertyOptional({
    description: 'Visitor profile IDs',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  visitorProfiles?: number[];

  @ApiPropertyOptional({ description: 'Operation hours ID' })
  @IsOptional()
  @IsNumber()
  operationHours?: number;
}

/**
 * Campaign update request DTO
 */
export class CampaignUpdateDto {
  @ApiPropertyOptional({ description: 'Campaign name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Campaign type',
    enum: CampaignType,
  })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Expiration date' })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiPropertyOptional({ description: 'Goal ID' })
  @IsOptional()
  @IsNumber()
  goalId?: number;

  @ApiPropertyOptional({ description: 'Line of Business ID' })
  @IsOptional()
  @IsNumber()
  lobId?: number;

  @ApiPropertyOptional({
    description: 'Campaign status',
    enum: CampaignStatus,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ description: 'Priority (0-1)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  priority?: number;

  @ApiPropertyOptional({ description: 'Weight (0-1)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  weight?: number;

  @ApiPropertyOptional({ description: 'Timezone' })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiPropertyOptional({ description: 'Control group settings' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ControlGroupDto)
  controlGroup?: ControlGroupDto;

  @ApiPropertyOptional({ description: 'Engagement IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  engagementIds?: number[];

  @ApiPropertyOptional({ description: 'Visitor profile IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  visitorProfiles?: number[];

  @ApiPropertyOptional({ description: 'Operation hours ID' })
  @IsOptional()
  @IsNumber()
  operationHours?: number;
}

/**
 * Campaign response DTO
 */
export interface CampaignResponseDto {
  data: LPCampaign;
  revision?: string;
}

/**
 * Campaign list response DTO
 */
export interface CampaignListResponseDto {
  data: LPCampaign[];
  revision?: string;
}
