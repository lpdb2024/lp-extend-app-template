/**
 * Connector API DTOs
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
  IsEnum,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IConnector, ConnectorType, GrantType, ResponseType } from './connector.interfaces';

/**
 * Connector Webhook DTO
 */
export class ConnectorWebhookDto {
  @ApiProperty({ description: 'Webhook endpoint URL' })
  @IsUrl()
  endpoint: string;

  @ApiPropertyOptional({ description: 'Custom headers for webhook' })
  @IsOptional()
  headers?: Record<string, string> | string[];

  @ApiPropertyOptional({ description: 'Maximum number of retries' })
  @IsOptional()
  @IsNumber()
  max_retries?: number;

  @ApiPropertyOptional({ description: 'Retry configuration' })
  @IsOptional()
  @IsObject()
  retry?: {
    retention_time: number;
  };
}

/**
 * Connector Engagement Capabilities DTO
 */
export class ConnectorEngagementCapabilitiesDto {
  @ApiPropertyOptional({ description: 'Whether custom engagement design is allowed' })
  @IsOptional()
  @IsBoolean()
  design_engagement?: boolean;

  @ApiPropertyOptional({ description: 'Whether custom window design is allowed' })
  @IsOptional()
  @IsBoolean()
  design_window?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'Allowed entry points' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entry_point?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Allowed visitor behaviors' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visitor_behavior?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Allowed target audience criteria' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  target_audience?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Allowed goal types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goal?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Allowed consumer identity types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  consumer_identity?: string[];

  @ApiPropertyOptional({ description: 'Whether language selection is allowed' })
  @IsOptional()
  @IsBoolean()
  language_selection?: boolean;
}

/**
 * Connector Configuration DTO
 */
export class ConnectorConfigurationDto {
  @ApiPropertyOptional({ description: 'JWT validation type' })
  @IsOptional()
  @IsString()
  jwtValidationType?: string;

  @ApiPropertyOptional({ description: 'JWKS endpoint URL' })
  @IsOptional()
  @IsUrl()
  jwksEndpoint?: string;

  @ApiPropertyOptional({ description: 'JWT public key' })
  @IsOptional()
  @IsString()
  jwtPublicKey?: string;

  @ApiPropertyOptional({ description: 'RFC compliance flag' })
  @IsOptional()
  @IsBoolean()
  rfcCompliance?: boolean;

  @ApiPropertyOptional({ description: 'Issuer display name' })
  @IsOptional()
  @IsString()
  issuerDisplayName?: string;

  @ApiPropertyOptional({ description: 'Issuer URL' })
  @IsOptional()
  @IsUrl()
  issuer?: string;

  @ApiPropertyOptional({ description: 'Whether this connector is preferred' })
  @IsOptional()
  @IsBoolean()
  preferred?: boolean;

  @ApiPropertyOptional({ description: 'Authorization endpoint URL' })
  @IsOptional()
  @IsUrl()
  authorizationEndpoint?: string;

  @ApiPropertyOptional({ description: 'JavaScript context' })
  @IsOptional()
  @IsString()
  jsContext?: string;

  @ApiPropertyOptional({ description: 'JavaScript method name' })
  @IsOptional()
  @IsString()
  jsMethodName?: string;

  @ApiPropertyOptional({ description: 'OAuth client ID' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ type: [String], description: 'ACR values' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  acrValues?: string[];

  @ApiPropertyOptional({ description: 'Whether PKCE is enabled' })
  @IsOptional()
  @IsBoolean()
  pkceEnabled?: boolean;

  @ApiPropertyOptional({ type: ConnectorEngagementCapabilitiesDto, description: 'Engagement capabilities' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectorEngagementCapabilitiesDto)
  engagement?: ConnectorEngagementCapabilitiesDto;

  @ApiPropertyOptional({ description: 'Webhook configurations' })
  @IsOptional()
  @IsObject()
  webhooks?: Record<string, ConnectorWebhookDto>;

  @ApiPropertyOptional({ description: 'Logo URI' })
  @IsOptional()
  @IsString()
  logo_uri?: string;
}

/**
 * Connector DTO
 */
export class ConnectorDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: number | string;

  @ApiPropertyOptional({ description: 'Whether connector is deleted' })
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @ApiProperty({ description: 'Connector name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Connector description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Connector type', enum: ConnectorType })
  @IsEnum(ConnectorType)
  type: ConnectorType;

  @ApiProperty({ type: ConnectorConfigurationDto, description: 'Connector configuration' })
  @ValidateNested()
  @Type(() => ConnectorConfigurationDto)
  configuration: ConnectorConfigurationDto;

  @ApiPropertyOptional({ description: 'Whether connector is enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'OAuth client ID' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Grant types', enum: GrantType })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grantTypes?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Response types', enum: ResponseType })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responseTypes?: string[];

  @ApiPropertyOptional({ description: 'OAuth scope' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ type: [String], description: 'Redirect URIs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  redirectUris?: string[];

  @ApiPropertyOptional({ description: 'Entry URI' })
  @IsOptional()
  @IsString()
  entryUri?: string;

  @ApiPropertyOptional({ description: 'Logo URI' })
  @IsOptional()
  @IsString()
  logoUri?: string;

  @ApiPropertyOptional({ description: 'Quick launch enabled' })
  @IsOptional()
  @IsBoolean()
  quickLaunchEnabled?: boolean;

  @ApiPropertyOptional({ type: [Number], description: 'Enabled for profiles' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  enabledForProfiles?: number[];

  @ApiPropertyOptional({ type: [String], description: 'Categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Overview' })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({ description: 'Whether internal connector' })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @ApiPropertyOptional({ description: 'Software statement JWT' })
  @IsOptional()
  @IsString()
  softwareStatement?: string;

  @ApiPropertyOptional({ description: 'Capabilities' })
  @IsOptional()
  @IsObject()
  capabilities?: Record<string, any>;
}

/**
 * Create Connector Request DTO
 */
export class CreateConnectorDto {
  @ApiProperty({ description: 'Connector name (required)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Connector description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Connector type', enum: ConnectorType })
  @IsEnum(ConnectorType)
  type: ConnectorType;

  @ApiProperty({ type: ConnectorConfigurationDto, description: 'Connector configuration' })
  @ValidateNested()
  @Type(() => ConnectorConfigurationDto)
  configuration: ConnectorConfigurationDto;

  @ApiPropertyOptional({ description: 'Whether connector is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ type: [String], description: 'Grant types', enum: GrantType })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grantTypes?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Response types', enum: ResponseType })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responseTypes?: string[];

  @ApiPropertyOptional({ description: 'OAuth scope' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ type: [String], description: 'Redirect URIs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  redirectUris?: string[];

  @ApiPropertyOptional({ description: 'Entry URI' })
  @IsOptional()
  @IsString()
  entryUri?: string;

  @ApiPropertyOptional({ description: 'Logo URI' })
  @IsOptional()
  @IsString()
  logoUri?: string;

  @ApiPropertyOptional({ description: 'Quick launch enabled' })
  @IsOptional()
  @IsBoolean()
  quickLaunchEnabled?: boolean;

  @ApiPropertyOptional({ type: [Number], description: 'Enabled for profiles' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  enabledForProfiles?: number[];

  @ApiPropertyOptional({ type: [String], description: 'Categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Overview' })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({ description: 'Capabilities' })
  @IsOptional()
  @IsObject()
  capabilities?: Record<string, any>;
}

/**
 * Update Connector Request DTO
 */
export class UpdateConnectorDto {
  @ApiPropertyOptional({ description: 'Connector name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Connector description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Connector type', enum: ConnectorType })
  @IsOptional()
  @IsEnum(ConnectorType)
  type?: ConnectorType;

  @ApiPropertyOptional({ type: ConnectorConfigurationDto, description: 'Connector configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectorConfigurationDto)
  configuration?: ConnectorConfigurationDto;

  @ApiPropertyOptional({ description: 'Whether connector is enabled' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ type: [String], description: 'Grant types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grantTypes?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Response types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responseTypes?: string[];

  @ApiPropertyOptional({ description: 'OAuth scope' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ type: [String], description: 'Redirect URIs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  redirectUris?: string[];

  @ApiPropertyOptional({ description: 'Entry URI' })
  @IsOptional()
  @IsString()
  entryUri?: string;

  @ApiPropertyOptional({ description: 'Logo URI' })
  @IsOptional()
  @IsString()
  logoUri?: string;

  @ApiPropertyOptional({ description: 'Quick launch enabled' })
  @IsOptional()
  @IsBoolean()
  quickLaunchEnabled?: boolean;

  @ApiPropertyOptional({ type: [Number], description: 'Enabled for profiles' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  enabledForProfiles?: number[];

  @ApiPropertyOptional({ type: [String], description: 'Categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Overview' })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({ description: 'Capabilities' })
  @IsOptional()
  @IsObject()
  capabilities?: Record<string, any>;
}

/**
 * Query Parameters DTO
 */
export class ConnectorsQueryDto {
  @ApiPropertyOptional({ description: 'API version', default: '1.0' })
  @IsOptional()
  @IsString()
  v?: string;

  @ApiPropertyOptional({ description: 'Select specific fields' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted connectors', default: false })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}

/**
 * Connectors Response DTO
 */
export class ConnectorsResponseDto {
  @ApiProperty({ description: 'Array of connectors' })
  data: IConnector[];

  @ApiPropertyOptional({ description: 'Revision for optimistic locking' })
  revision?: string;
}

/**
 * Single Connector Response DTO
 */
export class ConnectorResponseDto {
  @ApiProperty({ description: 'The connector data' })
  data: IConnector;

  @ApiPropertyOptional({ description: 'Revision for optimistic locking' })
  revision?: string;
}
