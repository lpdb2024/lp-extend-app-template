/**
 * Widgets API DTOs
 * NestJS class-based DTOs with validation decorators
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { IWidget } from './widgets.interfaces';

/**
 * Widget Parameter DTO
 */
export class WidgetParameterDto {
  @ApiProperty({ description: 'Parameter name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Parameter value' })
  @IsString()
  value: string;
}

/**
 * Create Widget Request DTO
 */
export class CreateWidgetDto {
  @ApiProperty({ description: 'Widget name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Widget description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Widget span' })
  @IsOptional()
  @IsString()
  span?: string;

  @ApiPropertyOptional({ enum: ['published', 'draft'], description: 'Widget mode' })
  @IsOptional()
  @IsString()
  mode?: 'published' | 'draft';

  @ApiPropertyOptional({ description: 'Widget URL (for iFrame type)' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ enum: ['iFrame', 'module'], description: 'Widget type' })
  @IsString()
  type: 'iFrame' | 'module';

  @ApiPropertyOptional({ type: [WidgetParameterDto], description: 'Widget parameters' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetParameterDto)
  parameters?: WidgetParameterDto[];

  @ApiPropertyOptional({ type: [Number], description: 'Skill IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  skillIds?: number[];

  @ApiPropertyOptional({ description: 'Whether widget is enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ type: [Number], description: 'Profile IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  profileIds?: number[];

  @ApiPropertyOptional({ description: 'Component name (for module type)' })
  @IsOptional()
  @IsString()
  componentName?: string;

  @ApiPropertyOptional({ description: 'Path to UMD JS file (for module type)' })
  @IsOptional()
  @IsString()
  path?: string;
}

/**
 * Update Widget Request DTO
 */
export class UpdateWidgetDto {
  @ApiPropertyOptional({ description: 'Widget name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Widget description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Widget span' })
  @IsOptional()
  @IsString()
  span?: string;

  @ApiPropertyOptional({ enum: ['published', 'draft'], description: 'Widget mode' })
  @IsOptional()
  @IsString()
  mode?: 'published' | 'draft';

  @ApiPropertyOptional({ description: 'Widget URL (for iFrame type)' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ type: [WidgetParameterDto], description: 'Widget parameters' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetParameterDto)
  parameters?: WidgetParameterDto[];

  @ApiPropertyOptional({ type: [Number], description: 'Skill IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  skillIds?: number[];

  @ApiPropertyOptional({ description: 'Whether widget is enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ type: [Number], description: 'Profile IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  profileIds?: number[];

  @ApiPropertyOptional({ description: 'Component name (for module type)' })
  @IsOptional()
  @IsString()
  componentName?: string;

  @ApiPropertyOptional({ description: 'Path to UMD JS file (for module type)' })
  @IsOptional()
  @IsString()
  path?: string;
}

/**
 * Query Parameters DTO
 */
export class WidgetsQueryDto {
  @ApiPropertyOptional({ description: 'API version', default: '2.0' })
  @IsOptional()
  @IsString()
  v?: string;

  @ApiPropertyOptional({ description: 'Select specific fields' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ enum: ['active', 'all'], description: 'Return active or all widgets' })
  @IsOptional()
  @IsString()
  return?: 'active' | 'all';
}

/**
 * Widgets Response DTO
 */
export class WidgetsResponseDto {
  @ApiProperty({ description: 'Array of widgets' })
  data: IWidget[];

  @ApiPropertyOptional({ description: 'Revision for optimistic locking' })
  revision?: string;
}

/**
 * Single Widget Response DTO
 */
export class WidgetResponseDto {
  @ApiProperty({ description: 'The widget data' })
  data: IWidget;

  @ApiPropertyOptional({ description: 'Revision for optimistic locking' })
  revision?: string;
}
