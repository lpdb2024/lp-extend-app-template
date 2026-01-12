/**
 * Users API DTOs
 * NestJS class-based DTOs with validation decorators
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import type { LPUser } from '@lpextend/node-sdk';

/**
 * User Profile DTO
 */
export class UserProfileDto {
  @ApiProperty({ description: 'Profile ID' })
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ description: 'Profile name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Role type ID' })
  @IsOptional()
  @IsNumber()
  roleTypeId?: number;
}

/**
 * Group Membership DTO
 */
export class UserGroupMembershipDto {
  @ApiProperty({ description: 'Agent group ID' })
  @IsString()
  agentGroupId: string;

  @ApiProperty({ description: 'Assignment date' })
  @IsString()
  assignmentDate: string;
}

/**
 * User DTO
 */
export class UserDto {
  @ApiProperty({ description: 'Unique identifier' })
  @IsString()
  id: string;

  @ApiPropertyOptional({ description: 'Whether user is deleted' })
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @ApiProperty({ description: 'Login name / username' })
  @IsString()
  loginName: string;

  @ApiPropertyOptional({ description: 'Full display name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Nickname' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: 'Whether user is enabled' })
  @IsBoolean()
  isEnabled: boolean;

  @ApiPropertyOptional({ description: 'Maximum concurrent chats' })
  @IsOptional()
  @IsNumber()
  maxChats?: number;

  @ApiPropertyOptional({ description: 'Maximum async conversations' })
  @IsOptional()
  @IsNumber()
  maxAsyncChats?: number;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @IsOptional()
  @IsString()
  pictureUrl?: string;

  @ApiPropertyOptional({ description: 'Whether manually disabled' })
  @IsOptional()
  @IsBoolean()
  disabledManually?: boolean;

  @ApiPropertyOptional({ type: [Number], description: 'Assigned skill IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  skillIds?: number[];

  @ApiPropertyOptional({ type: [UserProfileDto], description: 'User profiles' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserProfileDto)
  profiles?: UserProfileDto[];

  @ApiPropertyOptional({ type: [Number], description: 'Profile IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  profileIds?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'Line of business IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  lobIds?: number[];

  @ApiPropertyOptional({ description: 'Force password change on next login' })
  @IsOptional()
  @IsBoolean()
  changePwdNextLogin?: boolean;

  @ApiPropertyOptional({ type: UserGroupMembershipDto, description: 'Group membership' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserGroupMembershipDto)
  memberOf?: UserGroupMembershipDto;

  @ApiPropertyOptional({ type: [UserGroupMembershipDto], description: 'Groups managed' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserGroupMembershipDto)
  managerOf?: UserGroupMembershipDto[];

  @ApiPropertyOptional({ type: [String], description: 'Permission group names' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionGroups?: string[];

  @ApiPropertyOptional({ description: 'User description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Mobile number' })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ description: 'Employee ID' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Last update timestamp' })
  @IsOptional()
  @IsString()
  dateUpdated?: string;

  @ApiPropertyOptional({ description: 'Whether this is an API user' })
  @IsOptional()
  @IsBoolean()
  isApiUser?: boolean;

  @ApiPropertyOptional({ description: 'User type ID' })
  @IsOptional()
  @IsNumber()
  userTypeId?: number;
}

/**
 * Create User Request DTO
 */
export class CreateUserDto {
  @ApiProperty({ description: 'Login name (required)' })
  @IsString()
  loginName: string;

  @ApiPropertyOptional({ description: 'Password (required for new users)' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'Full name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Nickname' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Whether user is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Maximum concurrent chats' })
  @IsOptional()
  @IsNumber()
  maxChats?: number;

  @ApiPropertyOptional({ description: 'Maximum async conversations' })
  @IsOptional()
  @IsNumber()
  maxAsyncChats?: number;

  @ApiPropertyOptional({ type: [Number], description: 'Assigned skill IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  skillIds?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'Profile IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  profileIds?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'Line of business IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  lobIds?: number[];

  @ApiPropertyOptional({ description: 'Force password change on next login' })
  @IsOptional()
  @IsBoolean()
  changePwdNextLogin?: boolean;

  @ApiPropertyOptional({ type: UserGroupMembershipDto, description: 'Group membership' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserGroupMembershipDto)
  memberOf?: UserGroupMembershipDto;

  @ApiPropertyOptional({ type: [String], description: 'Permission group names' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionGroups?: string[];

  @ApiPropertyOptional({ description: 'User description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Mobile number' })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ description: 'Employee ID' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'User type ID (0=human, 1=bot)' })
  @IsOptional()
  @IsNumber()
  userTypeId?: number;
}

/**
 * Update User Request DTO
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Full name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Nickname' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Whether user is enabled' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Maximum concurrent chats' })
  @IsOptional()
  @IsNumber()
  maxChats?: number;

  @ApiPropertyOptional({ description: 'Maximum async conversations' })
  @IsOptional()
  @IsNumber()
  maxAsyncChats?: number;

  @ApiPropertyOptional({ type: [Number], description: 'Assigned skill IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  skillIds?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'Profile IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  profileIds?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'Line of business IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  lobIds?: number[];

  @ApiPropertyOptional({ type: UserGroupMembershipDto, description: 'Group membership' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserGroupMembershipDto)
  memberOf?: UserGroupMembershipDto;

  @ApiPropertyOptional({ type: [String], description: 'Permission group names' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionGroups?: string[];

  @ApiPropertyOptional({ description: 'User description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Mobile number' })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ description: 'Employee ID' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @IsOptional()
  @IsString()
  pictureUrl?: string;
}

/**
 * Query Parameters DTO
 */
export class UsersQueryDto {
  @ApiPropertyOptional({ description: 'API version', default: '6.0' })
  @IsOptional()
  @IsString()
  v?: string;

  @ApiPropertyOptional({ description: 'Select specific fields' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted users', default: false })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}

/**
 * Users Response DTO
 */
export interface UsersResponseDto {
  data: LPUser[];
  revision?: string;
}

/**
 * Single User Response DTO
 */
export interface UserResponseDto {
  data: LPUser;
  revision?: string;
}

/**
 * Reset Password Request DTO
 */
export class ResetPasswordDto {
  @ApiProperty({ description: 'New password' })
  @IsString()
  newPassword: string;
}

/**
 * Batch Update Field DTO
 */
export class BatchUpdateFieldDto {
  @ApiProperty({ description: 'Field name to update (e.g., skillIds, profileIds)' })
  @IsString()
  name: string;

  @ApiProperty({ type: [Number], description: 'Values to add or remove' })
  @IsArray()
  value: (string | number)[];

  @ApiProperty({ enum: ['add', 'remove'], description: 'Operation type' })
  @IsString()
  operation: 'add' | 'remove';
}

/**
 * Batch Update Users Request DTO
 */
export class BatchUpdateUsersDto {
  @ApiProperty({ type: [Number], description: 'User IDs to update' })
  @IsArray()
  ids: (string | number)[];

  @ApiProperty({ type: [BatchUpdateFieldDto], description: 'Fields to update' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchUpdateFieldDto)
  fields: BatchUpdateFieldDto[];
}

/**
 * Batch Update Users Response DTO
 */
export class BatchUpdateUsersResponseDto {
  @ApiPropertyOptional({ description: 'Updated users' })
  users?: LPUser[];

  @ApiPropertyOptional({ description: 'Success status' })
  success?: boolean;
}

/**
 * Convenience DTO for removing skill from users
 */
export class BatchRemoveSkillDto {
  @ApiProperty({ description: 'Skill ID to remove' })
  @IsNumber()
  skillId: number;

  @ApiProperty({ type: [Number], description: 'User IDs to update' })
  @IsArray()
  userIds: (string | number)[];
}
