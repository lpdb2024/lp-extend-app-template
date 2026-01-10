/**
 * Working Hours DTOs
 * NestJS DTOs for Working Hours (Workdays) API request/response validation
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
import type { LPWorkingHours } from '@lpextend/client-sdk';

/**
 * DateTime with timezone DTO
 */
export class DateTimeWithZoneDto {
  @ApiProperty({ description: 'Time in HH:mm:ss format', example: '09:00:00' })
  @IsString()
  dateTime: string;

  @ApiProperty({ description: 'IANA timezone', example: 'America/New_York' })
  @IsString()
  timeZone: string;
}

/**
 * Working hours item DTO
 */
export class WorkingHoursItemDto {
  @ApiProperty({ description: 'Start time', type: DateTimeWithZoneDto })
  @ValidateNested()
  @Type(() => DateTimeWithZoneDto)
  start: DateTimeWithZoneDto;

  @ApiProperty({ description: 'End time', type: DateTimeWithZoneDto })
  @ValidateNested()
  @Type(() => DateTimeWithZoneDto)
  end: DateTimeWithZoneDto;

  @ApiProperty({
    description: 'Recurrence rules (RRULE format)',
    example: ['RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  recurrence: string[];
}

/**
 * DTO for creating new working hours
 */
export class CreateWorkingHoursDto {
  @ApiPropertyOptional({ description: 'Name for this working hours configuration' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this is the default working hours', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: 'Working hours events/time slots', type: [WorkingHoursItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursItemDto)
  events: WorkingHoursItemDto[];
}

/**
 * DTO for updating working hours
 */
export class UpdateWorkingHoursDto {
  @ApiPropertyOptional({ description: 'Name for this working hours configuration' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this is the default working hours' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Working hours events/time slots', type: [WorkingHoursItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursItemDto)
  events?: WorkingHoursItemDto[];
}

/**
 * Query parameters for working hours list
 */
export class WorkingHoursQueryDto {
  @ApiPropertyOptional({ description: 'Fields to select (comma-separated)' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted working hours' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean;
}

/**
 * Working hours response DTO
 */
export interface WorkingHoursResponseDto {
  data: LPWorkingHours;
  revision?: string;
}

/**
 * Working hours list response DTO
 */
export interface WorkingHoursListResponseDto {
  data: LPWorkingHours[];
  revision?: string;
}
