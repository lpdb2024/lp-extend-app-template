/**
 * LivePerson Common DTOs
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
} from 'class-validator';

/**
 * Base request DTO with common LP API parameters
 */
export class LPBaseRequestDto {
  @ApiPropertyOptional({ description: 'API version' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ description: 'Select specific fields (YOGA syntax)' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted items' })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}

/**
 * Pagination request DTO
 */
export class LPPaginationRequestDto extends LPBaseRequestDto {
  @ApiPropertyOptional({ description: 'Number of items per page', default: 100 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset for pagination', default: 0 })
  @IsOptional()
  @IsNumber()
  offset?: number;
}

/**
 * Date range request DTO
 */
export class LPDateRangeDto {
  @ApiProperty({ description: 'Start timestamp in milliseconds' })
  @IsNumber()
  from: number;

  @ApiProperty({ description: 'End timestamp in milliseconds' })
  @IsNumber()
  to: number;
}

/**
 * Metadata response DTO
 */
export class LPMetadataDto {
  @ApiProperty({ description: 'Total count of items' })
  @IsNumber()
  count: number;

  @ApiPropertyOptional({ description: 'Self link' })
  @IsOptional()
  @IsObject()
  self?: { rel: string; href: string };

  @ApiPropertyOptional({ description: 'Next page link' })
  @IsOptional()
  @IsObject()
  next?: { rel: string; href: string };

  @ApiPropertyOptional({ description: 'Previous page link' })
  @IsOptional()
  @IsObject()
  prev?: { rel: string; href: string };
}

/**
 * Base URI DTO from domain resolution
 */
export class LPBaseUriDto {
  @ApiProperty({ description: 'Service name' })
  @IsString()
  service: string;

  @ApiProperty({ description: 'Account ID' })
  @IsString()
  account: string;

  @ApiProperty({ description: 'Base URI for the service' })
  @IsString()
  baseURI: string;
}

/**
 * Domain response DTO
 */
export class LPDomainResponseDto {
  @ApiProperty({ type: [LPBaseUriDto], description: 'List of base URIs' })
  @IsArray()
  baseURIs: LPBaseUriDto[];
}

/**
 * Error response DTO
 */
export class LPErrorResponseDto {
  @ApiProperty({ description: 'Error type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Error title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'HTTP status code' })
  @IsNumber()
  status: number;

  @ApiPropertyOptional({ description: 'Detailed error message' })
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiPropertyOptional({ description: 'Error instance identifier' })
  @IsOptional()
  @IsString()
  instance?: string;

  @ApiPropertyOptional({ description: 'Validation errors' })
  @IsOptional()
  @IsArray()
  errors?: LPValidationErrorDto[];
}

/**
 * Validation error DTO
 */
export class LPValidationErrorDto {
  @ApiProperty({ description: 'Field name with error' })
  @IsString()
  field: string;

  @ApiProperty({ description: 'Error message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Error code' })
  @IsOptional()
  @IsString()
  code?: string;
}

/**
 * DateTime with timezone DTO
 */
export class LPDateTimeWithZoneDto {
  @ApiProperty({ description: 'ISO datetime string' })
  @IsString()
  dateTime: string;

  @ApiProperty({ description: 'Timezone identifier' })
  @IsString()
  timeZone: string;
}

/**
 * Hotkey configuration DTO
 */
export class LPHotkeyDto {
  @ApiProperty({ description: 'Hotkey prefix character' })
  @IsString()
  prefix: string;

  @ApiProperty({ description: 'Hotkey suffix characters' })
  @IsString()
  suffix: string;
}

/**
 * Localized data entry DTO
 */
export class LPLocalizedDataDto {
  @ApiProperty({ description: 'Language code' })
  @IsString()
  lang: string;

  @ApiPropertyOptional({ description: 'Message content' })
  @IsOptional()
  @IsString()
  msg?: string;

  @ApiPropertyOptional({ description: 'Title content' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Text content' })
  @IsOptional()
  @IsString()
  text?: string;
}

/**
 * Bulk delete request DTO
 */
export class LPBulkDeleteRequestDto {
  @ApiProperty({ type: [Number], description: 'IDs to delete' })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @ApiProperty({ description: 'Revision for concurrency control' })
  @IsString()
  revision: string;
}

/**
 * Bulk operation response DTO
 */
export class LPBulkOperationResponseDto {
  @ApiProperty({ description: 'Number of successful operations' })
  @IsNumber()
  successCount: number;

  @ApiProperty({ description: 'Number of failed operations' })
  @IsNumber()
  failureCount: number;

  @ApiPropertyOptional({ type: [Object], description: 'Failed item details' })
  @IsOptional()
  @IsArray()
  failures?: { id: number | string; error: string }[];
}

/**
 * Group membership DTO
 */
export class LPGroupMembershipDto {
  @ApiProperty({ description: 'Agent group ID' })
  @IsString()
  agentGroupId: string;

  @ApiProperty({ description: 'Assignment date' })
  @IsString()
  assignmentDate: string;
}

/**
 * Skill routing configuration DTO
 */
export class LPSkillRoutingConfigDto {
  @ApiProperty({ description: 'Routing priority' })
  @IsNumber()
  priority: number;

  @ApiProperty({ description: 'Split percentage' })
  @IsNumber()
  splitPercentage: number;

  @ApiProperty({ description: 'Target agent group ID' })
  @IsNumber()
  agentGroupId: number;
}

/**
 * Permission package DTO
 */
export class LPPermissionPackageDto {
  @ApiProperty({ description: 'Package ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Is package enabled' })
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({ description: 'Is package displayed' })
  @IsBoolean()
  isDisplayed: boolean;

  @ApiPropertyOptional({ type: [String], description: 'Feature keys' })
  @IsOptional()
  @IsArray()
  featureKeys?: string[];
}
