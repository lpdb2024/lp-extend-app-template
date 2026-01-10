/**
 * Skills API DTOs
 * NestJS class-based DTOs with validation decorators
 * Uses SDK types for responses
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
import type { LPSkill } from '@lpextend/client-sdk';

/**
 * Skill Routing Configuration DTO
 */
export class SkillRoutingConfigurationDto {
  @ApiPropertyOptional({ description: 'Routing priority' })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ description: 'Split percentage for routing' })
  @IsOptional()
  @IsNumber()
  splitPercentage?: number;

  @ApiPropertyOptional({ description: 'Target agent group ID' })
  @IsOptional()
  @IsNumber()
  agentGroupId?: number;
}

/**
 * Skill Transfer Entry DTO
 */
export class SkillTransferEntryDto {
  @ApiProperty({ description: 'Skill ID that can be transferred to' })
  @IsNumber()
  id: number;
}

/**
 * Alias for SDK skill type for response compatibility
 */
export type SkillDto = LPSkill;

/**
 * Create Skill Request DTO
 */
export class CreateSkillDto {
  @ApiProperty({ description: 'Name of the skill (required)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the skill' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  skillOrder?: number;

  @ApiPropertyOptional({ description: 'Working hours schedule ID' })
  @IsOptional()
  @IsNumber()
  workingHoursId?: number;

  @ApiPropertyOptional({ description: 'Special occasion schedule ID' })
  @IsOptional()
  @IsNumber()
  specialOccasionId?: number;

  @ApiPropertyOptional({ description: 'Maximum wait time in seconds' })
  @IsOptional()
  @IsNumber()
  maxWaitTime?: number;

  @ApiPropertyOptional({ description: 'Whether transfers are allowed' })
  @IsOptional()
  @IsBoolean()
  canTransfer?: boolean;

  @ApiPropertyOptional({ type: [SkillTransferEntryDto], description: 'List of skill IDs that can be transferred to' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillTransferEntryDto)
  skillTransferList?: SkillTransferEntryDto[];

  @ApiPropertyOptional({ type: [Number], description: 'Line of business IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  lobIds?: number[];

  @ApiPropertyOptional({ type: [SkillRoutingConfigurationDto], description: 'Routing configuration' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillRoutingConfigurationDto)
  skillRoutingConfiguration?: SkillRoutingConfigurationDto[];
}

/**
 * Update Skill Request DTO
 */
export class UpdateSkillDto {
  @ApiPropertyOptional({ description: 'Name of the skill' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the skill' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  skillOrder?: number;

  @ApiPropertyOptional({ description: 'Working hours schedule ID' })
  @IsOptional()
  @IsNumber()
  workingHoursId?: number;

  @ApiPropertyOptional({ description: 'Special occasion schedule ID' })
  @IsOptional()
  @IsNumber()
  specialOccasionId?: number;

  @ApiPropertyOptional({ description: 'Maximum wait time in seconds' })
  @IsOptional()
  @IsNumber()
  maxWaitTime?: number;

  @ApiPropertyOptional({ description: 'Whether transfers are allowed' })
  @IsOptional()
  @IsBoolean()
  canTransfer?: boolean;

  @ApiPropertyOptional({ type: [SkillTransferEntryDto], description: 'List of skill IDs that can be transferred to' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillTransferEntryDto)
  skillTransferList?: SkillTransferEntryDto[];

  @ApiPropertyOptional({ type: [Number], description: 'Line of business IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  lobIds?: number[];

  @ApiPropertyOptional({ type: [SkillRoutingConfigurationDto], description: 'Routing configuration' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillRoutingConfigurationDto)
  skillRoutingConfiguration?: SkillRoutingConfigurationDto[];
}

/**
 * Query Parameters DTO for listing skills
 */
export class SkillsQueryDto {
  @ApiPropertyOptional({ description: 'API version', default: '2.0' })
  @IsOptional()
  @IsString()
  v?: string;

  @ApiPropertyOptional({ description: 'Select specific fields (YOGA syntax)' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted skills', default: false })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}

/**
 * Skills Response DTO
 */
export interface SkillsResponseDto {
  data: LPSkill[];
  revision?: string;
}

/**
 * Single Skill Response DTO
 */
export interface SkillResponseDto {
  data: LPSkill;
  revision?: string;
}

/**
 * User dependency info for skill deletion
 */
export class SkillDependencyUserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User login name' })
  loginName: string;

  @ApiPropertyOptional({ description: 'User full name' })
  fullName?: string;
}

/**
 * Skill dependency check response
 */
export class SkillDependenciesDto {
  @ApiProperty({ description: 'Skill ID being checked' })
  skillId: number;

  @ApiProperty({ description: 'Skill name' })
  skillName: string;

  @ApiProperty({ description: 'Whether the skill has dependencies' })
  hasDependencies: boolean;

  @ApiProperty({ type: [SkillDependencyUserDto], description: 'Users assigned to this skill' })
  users: SkillDependencyUserDto[];

  @ApiPropertyOptional({ description: 'Count of other dependencies (for future expansion)' })
  otherDependencyCount?: number;
}

/**
 * Smart delete request DTO
 */
export class SmartDeleteSkillDto {
  @ApiProperty({
    description: 'Delete mode: check (discover dependencies), force (remove dependencies and delete), cancel (abort)',
    enum: ['check', 'force'],
  })
  @IsString()
  mode: 'check' | 'force';
}

/**
 * Smart delete response DTO
 */
export class SmartDeleteResponseDto {
  @ApiProperty({ description: 'Whether the operation was successful' })
  success: boolean;

  @ApiPropertyOptional({ description: 'Message describing the result' })
  message?: string;

  @ApiPropertyOptional({ type: SkillDependenciesDto, description: 'Dependencies found (when mode=check)' })
  dependencies?: SkillDependenciesDto;

  @ApiPropertyOptional({ description: 'Users successfully updated' })
  usersUpdated?: string[];

  @ApiPropertyOptional({ description: 'Users that failed to update' })
  usersFailed?: { userId: string; error: string }[];
}
