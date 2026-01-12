/**
 * Predefined Content DTOs
 * NestJS DTOs for Predefined Content API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { LPPredefinedContent } from '@lpextend/node-sdk';
import { IHotkey } from '../../shared/lp-common.interfaces';

/**
 * Content data entry DTO
 */
export class PredefinedContentDataDto {
  @ApiProperty({ description: 'Message content' })
  @IsString()
  msg: string;

  @ApiProperty({ description: 'Language code (e.g., en-US)', example: 'en-US' })
  @IsString()
  lang: string;

  @ApiPropertyOptional({ description: 'Title for the content' })
  @IsOptional()
  @IsString()
  title?: string;
}

/**
 * Hotkey DTO
 */
export class HotkeyDto implements IHotkey {
  @ApiProperty({ description: 'Hotkey prefix', example: '!' })
  @IsString()
  prefix: string;

  @ApiProperty({ description: 'Hotkey suffix', example: 'greeting' })
  @IsString()
  suffix: string;
}

/**
 * DTO for creating new predefined content
 */
export class CreatePredefinedContentDto {
  @ApiProperty({ description: 'Whether the content is enabled', default: true })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Content type (0=text, 1=html)', default: 0 })
  @IsOptional()
  @IsNumber()
  type?: number;

  @ApiProperty({ description: 'Localized content data', type: [PredefinedContentDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PredefinedContentDataDto)
  data: PredefinedContentDataDto[];

  @ApiPropertyOptional({ description: 'Category IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categoriesIds?: number[];

  @ApiPropertyOptional({ description: 'Skill IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  skillIds?: number[];

  @ApiPropertyOptional({ description: 'Hotkey configuration', type: HotkeyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HotkeyDto)
  hotkey?: HotkeyDto;
}

/**
 * DTO for updating predefined content
 */
export class UpdatePredefinedContentDto {
  @ApiPropertyOptional({ description: 'Whether the content is enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Content type (0=text, 1=html)' })
  @IsOptional()
  @IsNumber()
  type?: number;

  @ApiPropertyOptional({ description: 'Localized content data', type: [PredefinedContentDataDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PredefinedContentDataDto)
  data?: PredefinedContentDataDto[];

  @ApiPropertyOptional({ description: 'Category IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categoriesIds?: number[];

  @ApiPropertyOptional({ description: 'Skill IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  skillIds?: number[];

  @ApiPropertyOptional({ description: 'Hotkey configuration', type: HotkeyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HotkeyDto)
  hotkey?: HotkeyDto;
}

/**
 * Query parameters for predefined content list
 */
export class PredefinedContentQueryDto {
  @ApiPropertyOptional({ description: 'Fields to select (comma-separated)' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted content' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean;

  @ApiPropertyOptional({ description: 'Filter by skill IDs (comma-separated)' })
  @IsOptional()
  @IsString()
  skillIds?: string;

  @ApiPropertyOptional({ description: 'Filter by category IDs (comma-separated)' })
  @IsOptional()
  @IsString()
  categoryIds?: string;

  @ApiPropertyOptional({ description: 'Filter by enabled status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  enabled?: boolean;
}

/**
 * Predefined content response DTO
 */
export interface PredefinedContentResponseDto {
  data: LPPredefinedContent;
  revision?: string;
}

/**
 * Predefined content list response DTO
 */
export interface PredefinedContentListResponseDto {
  data: LPPredefinedContent[];
  revision?: string;
}
