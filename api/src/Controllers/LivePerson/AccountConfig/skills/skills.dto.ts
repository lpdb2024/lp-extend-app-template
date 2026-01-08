/**
 * Skills API DTOs
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

/**
 * Skill Routing Configuration DTO
 */
export class SkillRoutingConfigurationDto {
  @ApiProperty({ description: 'Routing priority' })
  @IsNumber()
  priority: number;

  @ApiProperty({ description: 'Split percentage for routing' })
  @IsNumber()
  splitPercentage: number;

  @ApiProperty({ description: 'Target agent group ID' })
  @IsNumber()
  agentGroupId: number;
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
 * Skill DTO - represents a skill entity
 */
export class SkillDto {
  @ApiProperty({ description: 'Unique identifier for the skill' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Name of the skill' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the skill' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order of the skill' })
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

  @ApiPropertyOptional({ description: 'Whether the skill is deleted' })
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @ApiPropertyOptional({ description: 'Last update timestamp' })
  @IsOptional()
  @IsString()
  dateUpdated?: string;

  @ApiPropertyOptional({ description: 'Whether transfers are allowed' })
  @IsOptional()
  @IsBoolean()
  canTransfer?: boolean;

  @ApiPropertyOptional({ type: [SkillTransferEntryDto], description: 'List of skills that can be transferred to' })
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
export class SkillsResponseDto {
  @ApiProperty({ type: [SkillDto], description: 'Array of skills' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  data: SkillDto[];

  @ApiPropertyOptional({ description: 'Revision for optimistic locking' })
  @IsOptional()
  @IsString()
  revision?: string;
}

/**
 * Single Skill Response DTO
 */
export class SkillResponseDto {
  @ApiProperty({ type: SkillDto, description: 'The skill data' })
  @ValidateNested()
  @Type(() => SkillDto)
  data: SkillDto;

  @ApiPropertyOptional({ description: 'Revision for optimistic locking' })
  @IsOptional()
  @IsString()
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
