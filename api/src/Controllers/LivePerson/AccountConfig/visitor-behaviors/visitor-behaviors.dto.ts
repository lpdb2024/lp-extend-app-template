/**
 * Visitor Behaviors API DTOs
 * NestJS DTOs for Visitor Behaviors API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { IVisitorBehavior, ConditionBoxType } from './visitor-behaviors.interfaces';

/**
 * Visitor behavior query parameters
 */
export class VisitorBehaviorQueryDto {
  @ApiPropertyOptional({ description: 'API version', example: '2.0' })
  @IsOptional()
  @IsString()
  v?: string;

  @ApiPropertyOptional({ description: 'Fields to return' })
  @IsOptional()
  fields?: string | string[];

  @ApiPropertyOptional({ description: 'Field set', enum: ['all', 'summary'] })
  @IsOptional()
  @IsString()
  field_set?: 'all' | 'summary';

  @ApiPropertyOptional({ description: 'Select expression' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  include_deleted?: boolean;
}

/**
 * Visitor behavior create request DTO
 */
export class VisitorBehaviorCreateDto {
  @ApiProperty({ description: 'Behavior name', example: 'Cart value above $100' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Behavior description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Condition box types', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsEnum(ConditionBoxType, { each: true })
  conditionBoxTypes?: ConditionBoxType[];
}

/**
 * Visitor behavior update request DTO
 */
export class VisitorBehaviorUpdateDto {
  @ApiPropertyOptional({ description: 'Behavior name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Behavior description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Condition box types', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsEnum(ConditionBoxType, { each: true })
  conditionBoxTypes?: ConditionBoxType[];
}

/**
 * Visitor behavior response DTO
 */
export class VisitorBehaviorResponseDto {
  @ApiProperty({ description: 'Visitor behavior data' })
  data: IVisitorBehavior;
}

/**
 * Visitor behavior list response DTO
 */
export class VisitorBehaviorListResponseDto {
  @ApiProperty({ description: 'List of visitor behaviors', type: [Object] })
  data: IVisitorBehavior[];
}
