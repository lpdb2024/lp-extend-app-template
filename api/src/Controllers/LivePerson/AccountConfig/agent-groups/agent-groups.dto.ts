/**
 * Agent Groups API DTOs
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
import { Type } from 'class-transformer';
import type { LPAgentGroup } from '@lpextend/node-sdk';

/**
 * Agent Group DTO - represents an agent group entity
 */
export class AgentGroupDto {
  @ApiProperty({ description: 'Unique identifier for the agent group' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Name of the agent group (must be unique)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the agent group' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent group ID (null only for root group)' })
  @IsOptional()
  @IsNumber()
  parentGroupId?: number | null;

  @ApiPropertyOptional({ description: 'Whether the group is enabled' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Whether the group is deleted' })
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @ApiPropertyOptional({ description: 'Last update timestamp' })
  @IsOptional()
  @IsString()
  dateUpdated?: string;
}

/**
 * Agent Group with members DTO
 */
export class AgentGroupWithMembersDto extends AgentGroupDto {
  @ApiPropertyOptional({ type: [Number], description: 'Array of member user IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  members?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'Array of manager user IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  managers?: number[];
}

/**
 * Create Agent Group Request DTO
 */
export class CreateAgentGroupDto {
  @ApiProperty({ description: 'Name of the agent group (must be unique)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the agent group' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent group ID (required if other groups exist)' })
  @IsOptional()
  @IsNumber()
  parentGroupId?: number | null;

  @ApiPropertyOptional({ description: 'Whether the group is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

/**
 * Update Agent Group Request DTO
 */
export class UpdateAgentGroupDto {
  @ApiPropertyOptional({ description: 'Name of the agent group' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the agent group' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent group ID' })
  @IsOptional()
  @IsNumber()
  parentGroupId?: number | null;

  @ApiPropertyOptional({ description: 'Whether the group is enabled' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

/**
 * Update Agent Group with ID DTO (for bulk updates)
 */
export class UpdateAgentGroupWithIdDto extends UpdateAgentGroupDto {
  @ApiProperty({ description: 'Agent group ID to update' })
  @IsNumber()
  id: number;
}

/**
 * Bulk Update Agent Groups Request DTO
 */
export class BulkUpdateAgentGroupsDto {
  @ApiProperty({ type: [UpdateAgentGroupWithIdDto], description: 'Array of agent groups to update' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAgentGroupWithIdDto)
  agentGroups: UpdateAgentGroupWithIdDto[];
}

/**
 * Query Parameters DTO for listing agent groups
 */
export class AgentGroupsQueryDto {
  @ApiPropertyOptional({ description: 'API version', default: '2.0' })
  @IsOptional()
  @IsString()
  v?: string;

  @ApiPropertyOptional({ description: 'Include user members in response', default: false })
  @IsOptional()
  @IsBoolean()
  getUsers?: boolean;

  @ApiPropertyOptional({ description: 'Select specific fields (YOGA syntax)' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted groups', default: false })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}

/**
 * Bulk Delete Request DTO
 */
export class BulkDeleteAgentGroupsDto {
  @ApiProperty({ type: [Number], description: 'Array of agent group IDs to delete' })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}

/**
 * Agent Groups Response DTO
 */
export interface AgentGroupsResponseDto {
  data: LPAgentGroup[];
  revision?: string;
}

/**
 * Single Agent Group Response DTO
 */
export interface AgentGroupResponseDto {
  data: LPAgentGroup;
  revision?: string;
}
