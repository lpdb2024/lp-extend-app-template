/**
 * Onsite Locations API DTOs
 * NestJS DTOs for Onsite Locations API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { IOnsiteLocation, OnsiteLocationConditionBoxType } from './onsite-locations.interfaces';

/**
 * Onsite location query parameters
 */
export class OnsiteLocationQueryDto {
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

  @ApiPropertyOptional({ description: 'Include deleted' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  include_deleted?: boolean;
}

/**
 * Onsite location create request DTO
 */
export class OnsiteLocationCreateDto {
  @ApiProperty({ description: 'Location name', example: 'Checkout Page' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Location description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Condition box types', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsEnum(OnsiteLocationConditionBoxType, { each: true })
  conditionBoxTypes?: OnsiteLocationConditionBoxType[];

  @ApiPropertyOptional({ description: 'App installation ID (for messaging channels)' })
  @IsOptional()
  @IsString()
  appInstallationId?: string;
}

/**
 * Onsite location update request DTO
 */
export class OnsiteLocationUpdateDto {
  @ApiPropertyOptional({ description: 'Location name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Location description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Condition box types', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsEnum(OnsiteLocationConditionBoxType, { each: true })
  conditionBoxTypes?: OnsiteLocationConditionBoxType[];

  @ApiPropertyOptional({ description: 'App installation ID' })
  @IsOptional()
  @IsString()
  appInstallationId?: string;
}

/**
 * Onsite location response DTO
 */
export class OnsiteLocationResponseDto {
  @ApiProperty({ description: 'Onsite location data' })
  data: IOnsiteLocation;
}

/**
 * Onsite location list response DTO
 */
export class OnsiteLocationListResponseDto {
  @ApiProperty({ description: 'List of onsite locations', type: [Object] })
  data: IOnsiteLocation[];
}
