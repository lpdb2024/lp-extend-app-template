/**
 * Goals API DTOs
 * NestJS DTOs for Goals API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { IGoal, GoalType, GoalIndicatorType } from './goals.interfaces';

/**
 * Goal query parameters
 */
export class GoalQueryDto {
  @ApiPropertyOptional({ description: 'API version', example: '3.0' })
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

  @ApiPropertyOptional({ description: 'Include deleted goals' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  include_deleted?: boolean;
}

/**
 * Goal create request DTO
 */
export class GoalCreateDto {
  @ApiProperty({ description: 'Goal name', example: 'Purchase Completion' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Goal description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Goal type', enum: GoalType })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiProperty({ description: 'Indicator type', enum: GoalIndicatorType })
  @IsEnum(GoalIndicatorType)
  indicatorType: GoalIndicatorType;
}

/**
 * Goal update request DTO
 */
export class GoalUpdateDto {
  @ApiPropertyOptional({ description: 'Goal name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Goal description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Goal type', enum: GoalType })
  @IsOptional()
  @IsEnum(GoalType)
  type?: GoalType;

  @ApiPropertyOptional({ description: 'Indicator type', enum: GoalIndicatorType })
  @IsOptional()
  @IsEnum(GoalIndicatorType)
  indicatorType?: GoalIndicatorType;
}

/**
 * Goal response DTO
 */
export class GoalResponseDto {
  @ApiProperty({ description: 'Goal data' })
  data: IGoal;
}

/**
 * Goal list response DTO
 */
export class GoalListResponseDto {
  @ApiProperty({ description: 'List of goals', type: [Object] })
  data: IGoal[];
}
