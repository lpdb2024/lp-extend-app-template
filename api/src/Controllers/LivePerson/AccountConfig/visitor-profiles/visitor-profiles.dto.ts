/**
 * Visitor Profiles API DTOs
 * NestJS DTOs for Visitor Profiles API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { IVisitorProfile, VisitorProfileConditionBoxType } from './visitor-profiles.interfaces';

/**
 * Visitor profile query parameters
 */
export class VisitorProfileQueryDto {
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
 * Visitor profile create request DTO
 */
export class VisitorProfileCreateDto {
  @ApiProperty({ description: 'Profile name', example: 'Premium Customers' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Profile description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Condition box types', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsEnum(VisitorProfileConditionBoxType, { each: true })
  conditionBoxTypes?: VisitorProfileConditionBoxType[];
}

/**
 * Visitor profile update request DTO
 */
export class VisitorProfileUpdateDto {
  @ApiPropertyOptional({ description: 'Profile name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Profile description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Condition box types', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsEnum(VisitorProfileConditionBoxType, { each: true })
  conditionBoxTypes?: VisitorProfileConditionBoxType[];
}

/**
 * Visitor profile response DTO
 */
export class VisitorProfileResponseDto {
  @ApiProperty({ description: 'Visitor profile data' })
  data: IVisitorProfile;
}

/**
 * Visitor profile list response DTO
 */
export class VisitorProfileListResponseDto {
  @ApiProperty({ description: 'List of visitor profiles', type: [Object] })
  data: IVisitorProfile[];
}
