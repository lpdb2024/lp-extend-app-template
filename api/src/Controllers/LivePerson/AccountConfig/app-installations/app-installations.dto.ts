/**
 * App Installations API DTOs
 * NestJS class-based DTOs with validation decorators
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * App Installation DTO - represents an installed application entity
 */
export class AppInstallationDto {
  @ApiProperty({ description: 'Client ID (unique identifier)' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Client name' })
  @IsString()
  client_name: string;

  @ApiPropertyOptional({ description: 'Description of the application' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiPropertyOptional({ description: 'Whether the app is enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'OAuth redirect URIs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  redirect_uris?: string[];

  @ApiProperty({ type: [String], description: 'OAuth grant types' })
  @IsArray()
  @IsString({ each: true })
  grant_types: string[];

  @ApiPropertyOptional({ type: [String], description: 'OAuth response types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  response_types?: string[];

  @ApiPropertyOptional({ description: 'OAuth scope' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ description: 'Client secret (typically redacted)' })
  @IsOptional()
  @IsString()
  client_secret?: string;

  @ApiPropertyOptional({ description: 'Client secret expiration timestamp' })
  @IsOptional()
  @IsNumber()
  client_secret_expires_at?: number;

  @ApiPropertyOptional({ description: 'Client ID issued at timestamp' })
  @IsOptional()
  @IsNumber()
  client_id_issued_at?: number;

  @ApiPropertyOptional({ description: 'Logo URI' })
  @IsOptional()
  @IsString()
  logo_uri?: string;

  @ApiPropertyOptional({ description: 'Whether quick launch is enabled' })
  @IsOptional()
  @IsBoolean()
  quick_launch_enabled?: boolean;

  @ApiPropertyOptional({ type: [Number], description: 'Profiles that can use this app' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  enabled_for_profiles?: number[];

  @ApiPropertyOptional({ type: [String], description: 'App categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Whether this is an internal app' })
  @IsOptional()
  @IsBoolean()
  is_internal?: boolean;

  @ApiPropertyOptional({ description: 'App capabilities configuration' })
  @IsOptional()
  @IsObject()
  capabilities?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Entry URI for app launch' })
  @IsOptional()
  @IsString()
  entry_uri?: string;

  @ApiPropertyOptional({ description: 'Application overview' })
  @IsOptional()
  @IsString()
  overview?: string;
}

/**
 * Create App Installation Request DTO
 */
export class CreateAppInstallationDto {
  @ApiProperty({ description: 'Client name (required)' })
  @IsString()
  client_name: string;

  @ApiPropertyOptional({ description: 'Description of the application' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiPropertyOptional({ description: 'Whether the app is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'OAuth redirect URIs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  redirect_uris?: string[];

  @ApiProperty({ type: [String], description: 'OAuth grant types (required)' })
  @IsArray()
  @IsString({ each: true })
  grant_types: string[];

  @ApiPropertyOptional({ type: [String], description: 'OAuth response types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  response_types?: string[];

  @ApiPropertyOptional({ description: 'OAuth scope' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ description: 'Logo URI' })
  @IsOptional()
  @IsString()
  logo_uri?: string;

  @ApiPropertyOptional({ description: 'Whether quick launch is enabled' })
  @IsOptional()
  @IsBoolean()
  quick_launch_enabled?: boolean;

  @ApiPropertyOptional({ type: [Number], description: 'Profiles that can use this app' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  enabled_for_profiles?: number[];

  @ApiPropertyOptional({ type: [String], description: 'App categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'App capabilities configuration' })
  @IsOptional()
  @IsObject()
  capabilities?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Entry URI for app launch' })
  @IsOptional()
  @IsString()
  entry_uri?: string;

  @ApiPropertyOptional({ description: 'Application overview' })
  @IsOptional()
  @IsString()
  overview?: string;
}

/**
 * Update App Installation Request DTO
 */
export class UpdateAppInstallationDto {
  @ApiPropertyOptional({ description: 'Client name' })
  @IsOptional()
  @IsString()
  client_name?: string;

  @ApiPropertyOptional({ description: 'Description of the application' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiPropertyOptional({ description: 'Whether the app is enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'OAuth redirect URIs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  redirect_uris?: string[];

  @ApiPropertyOptional({ type: [String], description: 'OAuth grant types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grant_types?: string[];

  @ApiPropertyOptional({ type: [String], description: 'OAuth response types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  response_types?: string[];

  @ApiPropertyOptional({ description: 'OAuth scope' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ description: 'Logo URI' })
  @IsOptional()
  @IsString()
  logo_uri?: string;

  @ApiPropertyOptional({ description: 'Whether quick launch is enabled' })
  @IsOptional()
  @IsBoolean()
  quick_launch_enabled?: boolean;

  @ApiPropertyOptional({ type: [Number], description: 'Profiles that can use this app' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  enabled_for_profiles?: number[];

  @ApiPropertyOptional({ type: [String], description: 'App categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'App capabilities configuration' })
  @IsOptional()
  @IsObject()
  capabilities?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Entry URI for app launch' })
  @IsOptional()
  @IsString()
  entry_uri?: string;

  @ApiPropertyOptional({ description: 'Application overview' })
  @IsOptional()
  @IsString()
  overview?: string;
}

/**
 * Query Parameters DTO for listing app installations
 */
export class AppInstallationsQueryDto {
  @ApiPropertyOptional({ description: 'API version', default: '1.0' })
  @IsOptional()
  @IsString()
  v?: string;

  @ApiPropertyOptional({ description: 'Select specific fields' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted apps', default: false })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}

/**
 * App Installations Response DTO (list)
 */
export class AppInstallationsResponseDto {
  @ApiProperty({ type: [AppInstallationDto], description: 'Array of app installations' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppInstallationDto)
  data: AppInstallationDto[];

  @ApiPropertyOptional({ description: 'Revision for optimistic locking' })
  @IsOptional()
  @IsString()
  revision?: string;
}

/**
 * Single App Installation Response DTO
 */
export class AppInstallationResponseDto {
  @ApiProperty({ type: AppInstallationDto, description: 'The app installation data' })
  @ValidateNested()
  @Type(() => AppInstallationDto)
  data: AppInstallationDto;

  @ApiPropertyOptional({ description: 'Revision for optimistic locking' })
  @IsOptional()
  @IsString()
  revision?: string;
}
