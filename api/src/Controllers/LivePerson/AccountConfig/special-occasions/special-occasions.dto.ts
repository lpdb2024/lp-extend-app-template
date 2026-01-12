/**
 * Special Occasions DTOs
 * NestJS DTOs for Special Occasions API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { LPSpecialOccasion } from '@lpextend/node-sdk';
import { ISpecialOccasionItem, ISpecialOccasionMeta } from './special-occasions.interfaces';

/**
 * DateTime with timezone DTO
 */
export class SpecialOccasionDateTimeDto {
  @ApiProperty({ description: 'DateTime in ISO format', example: '2024-12-25T00:00:00' })
  @IsString()
  dateTime: string;

  @ApiProperty({ description: 'IANA timezone', example: 'America/New_York' })
  @IsString()
  timeZone: string;
}

/**
 * Special occasion meta DTO
 */
export class SpecialOccasionMetaDto implements ISpecialOccasionMeta {
  @ApiProperty({ description: 'Whether this is a working day', example: false })
  @IsBoolean()
  working: boolean;

  @ApiProperty({ description: 'Name of the occasion', example: 'Christmas Day' })
  @IsString()
  name: string;
}

/**
 * Special occasion event item DTO
 */
export class SpecialOccasionItemDto implements ISpecialOccasionItem {
  @ApiProperty({ description: 'Start datetime', type: SpecialOccasionDateTimeDto })
  @ValidateNested()
  @Type(() => SpecialOccasionDateTimeDto)
  start: SpecialOccasionDateTimeDto;

  @ApiProperty({ description: 'End datetime', type: SpecialOccasionDateTimeDto })
  @ValidateNested()
  @Type(() => SpecialOccasionDateTimeDto)
  end: SpecialOccasionDateTimeDto;

  @ApiPropertyOptional({
    description: 'Recurrence rules (RRULE format)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recurrence?: string[];

  @ApiProperty({ description: 'Occasion metadata', type: SpecialOccasionMetaDto })
  @ValidateNested()
  @Type(() => SpecialOccasionMetaDto)
  meta: SpecialOccasionMetaDto;
}

/**
 * DTO for creating a new special occasion
 */
export class CreateSpecialOccasionDto {
  @ApiPropertyOptional({ description: 'Name for this special occasion configuration' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this is the default special occasion config', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: 'Special occasion events', type: [SpecialOccasionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecialOccasionItemDto)
  events: SpecialOccasionItemDto[];
}

/**
 * DTO for updating a special occasion
 */
export class UpdateSpecialOccasionDto {
  @ApiPropertyOptional({ description: 'Name for this special occasion configuration' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this is the default special occasion config' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Special occasion events', type: [SpecialOccasionItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecialOccasionItemDto)
  events?: SpecialOccasionItemDto[];
}

/**
 * Query parameters for special occasions list
 */
export class SpecialOccasionsQueryDto {
  @ApiPropertyOptional({ description: 'Fields to select (comma-separated)' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted special occasions' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean;
}

/**
 * Special occasion response DTO
 */
export interface SpecialOccasionResponseDto {
  data: LPSpecialOccasion;
  revision?: string;
}

/**
 * Special occasions list response DTO
 */
export interface SpecialOccasionsListResponseDto {
  data: LPSpecialOccasion[];
  revision?: string;
}
