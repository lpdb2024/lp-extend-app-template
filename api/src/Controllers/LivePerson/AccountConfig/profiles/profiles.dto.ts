/**
 * Profiles DTOs
 * NestJS DTOs for Profiles API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  MaxLength,
  MinLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { IProfile, IProfilePermissions, IProfilePermission, IProfilePermissionGroup } from './profiles.interfaces';

/**
 * Permission DTO
 */
export class ProfilePermissionDto implements IProfilePermission {
  @ApiProperty({ description: 'Whether the permission is enabled' })
  @IsBoolean()
  isEnabled: boolean;

  @ApiPropertyOptional({ description: 'Whether assigned to all users' })
  @IsOptional()
  @IsBoolean()
  isAssignedToAllUsers?: boolean;

  @ApiPropertyOptional({ description: 'Agent group IDs this permission is enabled for', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  enabledForAgentGroupIds?: number[];

  @ApiPropertyOptional({ description: 'User IDs this permission is enabled for', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  enabledForUserIds?: number[];
}

/**
 * DTO for creating a new profile
 */
export class CreateProfileDto {
  @ApiProperty({ description: 'Profile name', example: 'Senior Agent' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Profile description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Role type ID (1=Agent, 2=Agent Manager, 3=Campaign Manager, 4=Admin, 5=LPA, 6=Custom)', example: 1 })
  @IsNumber()
  roleTypeId: number;

  @ApiPropertyOptional({ description: 'Profile permissions object' })
  @IsOptional()
  @IsObject()
  permissions?: IProfilePermissions;
}

/**
 * DTO for updating a profile
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Profile name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Profile description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Role type ID' })
  @IsOptional()
  @IsNumber()
  roleTypeId?: number;

  @ApiPropertyOptional({ description: 'Profile permissions object' })
  @IsOptional()
  @IsObject()
  permissions?: IProfilePermissions;
}

/**
 * Query parameters for profiles list
 */
export class ProfilesQueryDto {
  @ApiPropertyOptional({ description: 'Fields to select (comma-separated)' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted profiles' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean;
}

/**
 * Profile response DTO
 */
export class ProfileResponseDto {
  @ApiProperty({ description: 'Profile data' })
  data: IProfile;

  @ApiPropertyOptional({ description: 'Current revision for optimistic locking' })
  revision?: string;
}

/**
 * Profiles list response DTO
 */
export class ProfilesResponseDto {
  @ApiProperty({ description: 'List of profiles', type: [Object] })
  data: IProfile[];

  @ApiPropertyOptional({ description: 'Current revision for optimistic locking' })
  revision?: string;
}
