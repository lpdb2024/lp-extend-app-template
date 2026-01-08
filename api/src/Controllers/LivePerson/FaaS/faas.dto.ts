/**
 * FaaS DTOs
 * Data Transfer Objects for REST API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsObject, IsNumber } from 'class-validator';
import {
  ILambda,
  IFaaSSchedule,
  IFaaSProxySetting,
  IEnvironmentVariable,
} from './faas.interfaces';

// ============================================
// Query DTOs
// ============================================

export class LambdasQueryDto {
  @ApiPropertyOptional({ description: 'User ID for filtering' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'API version', default: '1' })
  @IsOptional()
  @IsString()
  v?: string = '1';
}

export class ProxySettingsQueryDto {
  @ApiPropertyOptional({ description: 'Include default whitelist entries', default: true })
  @IsOptional()
  @IsBoolean()
  includeDefault?: boolean = true;
}

// ============================================
// Request DTOs
// ============================================

export class CreateLambdaDto {
  @ApiProperty({ description: 'Lambda function name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Lambda description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Runtime configuration (uuid required)' })
  @IsObject()
  runtime: { uuid: string };

  @ApiPropertyOptional({ description: 'Instance size', enum: ['S', 'M', 'L', 'XL'] })
  @IsOptional()
  @IsString()
  size?: 'S' | 'M' | 'L' | 'XL';

  @ApiPropertyOptional({ description: 'Minimum instances', default: 1 })
  @IsOptional()
  @IsNumber()
  minInstances?: number;

  @ApiPropertyOptional({ description: 'Skills that can invoke this function', type: [String] })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiPropertyOptional({ description: 'Event ID for event-triggered functions' })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiProperty({ description: 'Implementation (code, dependencies, env vars)' })
  @IsObject()
  implementation: {
    code: string;
    dependencies?: string[];
    environmentVariables?: IEnvironmentVariable[];
  };
}

export class UpdateLambdaDto {
  @ApiPropertyOptional({ description: 'Lambda function name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Lambda description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Runtime configuration (uuid required)' })
  @IsOptional()
  @IsObject()
  runtime?: { uuid: string };

  @ApiPropertyOptional({ description: 'Instance size', enum: ['S', 'M', 'L', 'XL'] })
  @IsOptional()
  @IsString()
  size?: 'S' | 'M' | 'L' | 'XL';

  @ApiPropertyOptional({ description: 'Minimum instances' })
  @IsOptional()
  @IsNumber()
  minInstances?: number;

  @ApiPropertyOptional({ description: 'Skills that can invoke this function', type: [String] })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiPropertyOptional({ description: 'Event ID for event-triggered functions' })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Implementation (code, dependencies, env vars)' })
  @IsOptional()
  @IsObject()
  implementation?: {
    code?: string;
    dependencies?: string[];
    environmentVariables?: IEnvironmentVariable[];
  };
}

export class CreateScheduleDto {
  @ApiProperty({ description: 'Lambda UUID to schedule' })
  @IsString()
  lambdaUUID: string;

  @ApiProperty({ description: 'Whether the schedule is active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Cron expression for scheduling' })
  @IsString()
  cronExpression: string;

  @ApiPropertyOptional({ description: 'Invocation body (payload and headers)' })
  @IsOptional()
  @IsObject()
  invocationBody?: {
    payload?: Record<string, unknown>;
    headers?: unknown[];
  };
}

export class UpdateScheduleDto {
  @ApiPropertyOptional({ description: 'Whether the schedule is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Cron expression for scheduling' })
  @IsOptional()
  @IsString()
  cronExpression?: string;

  @ApiPropertyOptional({ description: 'Invocation body (payload and headers)' })
  @IsOptional()
  @IsObject()
  invocationBody?: {
    payload?: Record<string, unknown>;
    headers?: unknown[];
  };
}

export class CreateProxySettingDto {
  @ApiProperty({ description: 'Domain to whitelist' })
  @IsString()
  domain: string;

  @ApiPropertyOptional({ description: 'Name/description for the whitelist entry' })
  @IsOptional()
  @IsString()
  name?: string;
}

// ============================================
// Response DTOs
// ============================================

export class LambdasResponseDto {
  @ApiProperty({ description: 'List of lambda functions', type: 'array' })
  data: ILambda[];
}

export class LambdaResponseDto {
  @ApiProperty({ description: 'The lambda function' })
  data: ILambda;
}

export class SchedulesResponseDto {
  @ApiProperty({ description: 'List of schedules', type: 'array' })
  data: IFaaSSchedule[];
}

export class ScheduleResponseDto {
  @ApiProperty({ description: 'The schedule' })
  data: IFaaSSchedule;
}

export class ProxySettingsResponseDto {
  @ApiProperty({ description: 'List of proxy settings (whitelisted domains)', type: 'array' })
  data: IFaaSProxySetting[];
}

export class ProxySettingResponseDto {
  @ApiProperty({ description: 'The proxy setting' })
  data: IFaaSProxySetting;
}
