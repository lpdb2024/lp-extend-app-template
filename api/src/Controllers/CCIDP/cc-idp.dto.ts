import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { HelperService } from 'src/utils/HelperService';
import { UserData } from 'src/Controllers/users/users.interfaces';
import { ConvCloudAppKeyBasic } from '../ConversationalCloud/conversation-cloud.dto';

export class AppAuthRequest {
  @ApiProperty()
  @IsString()
  redirect: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  appname: string;
}
export class TokenDetails {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  ccs_token: string;

  @ApiProperty()
  @IsString()
  cb_auth_token: string;
}
export class AppExchangeToken {
  @ApiProperty()
  @IsString()
  access_token: string;

  @ApiProperty()
  @IsString()
  token_type: string;

  @ApiProperty()
  @IsString()
  refresh_token: string;

  @ApiProperty()
  @IsString()
  id_token: string;

  @ApiProperty()
  @IsNumber()
  expires_in: number;

  @ApiPropertyOptional()
  @IsObject()
  UserData?: UserData;

  @ApiPropertyOptional()
  @IsString()
  expiry: string;

  @ApiPropertyOptional()
  @IsString()
  timestamp: string;
}

export class Token {
  static collectionName = 'lp_tokens';
  @ApiProperty()
  @IsString()
  id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idToken: string;

  @ApiProperty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsString()
  accessToken: string;

  @ApiProperty()
  @IsString()
  refreshToken: string;

  @ApiProperty()
  @IsNumber()
  expiresIn: number;

  @ApiPropertyOptional()
  @IsNumber()
  expiry: number;

  @ApiPropertyOptional()
  @IsString()
  cbToken: string;

  @ApiPropertyOptional()
  @IsString()
  cbOrg: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountId?: string;
}
class UserSkill {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  id: number;
}
export class Profile {
  roleTypeId: number;
  name: string;
  id: number;
}
export class ManagerOf {
  agentGroupId: string;
  assignmentDate: string;
}
export class MemberOf {
  agentGroupId: string;
  assignmentDate: string;
}
export class UserDto {
  @ApiProperty()
  @IsString()
  id: string;
  deleted: boolean;
  loginName: string;
  fullName: string;
  nickname: string;
  passwordSh: string;
  isEnabled: boolean;
  maxChats: number;
  email: string;
  pictureUrl?: string;
  disabledManually: boolean;
  skillIds: number[];
  profiles: Profile[];
  profileIds: number[];
  lobIds: number[];
  changePwdNextLogin: boolean;
  memberOf: MemberOf;
  managerOf: ManagerOf[];
  permissionGroups: string[];
  description: string;
  mobileNumber: string;
  employeeId: string;
  maxAsyncChats: number;
  backgndImgUri: string;
  pnCertName: string;
  dateUpdated: string;
  lastPwdChangeDate: string;
  isApiUser: boolean;
  userTypeId: number;
}

export class CCUserDto {
  static collectionName = 'users';

  @ApiProperty()
  @IsInt()
  userTypeId: number;

  @ApiProperty()
  @IsBoolean()
  isApiUser: boolean;

  @ApiProperty()
  @IsArray()
  profileIds: number[];

  @ApiProperty()
  @IsArray()
  permissionGroups: number[];

  @ApiProperty()
  @IsString()
  pid: string;

  @ApiProperty()
  @IsString()
  allowedAppKeys: string;

  @ApiProperty()
  @IsArray()
  skills: UserSkill[];

  @ApiProperty()
  @IsString()
  dateCreated: string;

  @ApiProperty()
  @IsNumber()
  maxChats: number;

  @ApiProperty()
  @IsArray()
  skillIds: number[];

  @ApiProperty()
  @IsString()
  loginName: string;

  @ApiProperty()
  @IsString()
  nickname: string;

  @ApiProperty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsArray()
  memberOf: any;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsArray()
  lobs: string[];

  @ApiProperty()
  @IsArray()
  managerOf: any;

  @ApiProperty()
  @IsString()
  pictureUrl: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsArray()
  managedAgentGroups: any;

  @ApiProperty()
  @IsString()
  dateUpdated: string;

  @ApiProperty()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;
}

export class AppUserDto extends UserDto {
  static collectionName = 'users';

  @ApiProperty()
  @IsString()
  createdBy: string;

  @ApiProperty()
  @IsString()
  updatedBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  createdAt: number;

  @ApiProperty()
  @IsNumber()
  updatedAt: number;

  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Primary LP account ID (first account user logged in with)' })
  @IsString()
  accountId: string;

  @ApiPropertyOptional({ description: 'Default LP account ID for auto-login after Firebase auth' })
  @IsOptional()
  @IsString()
  defaultAccountId?: string;

  @ApiPropertyOptional({ description: 'List of LP account IDs the user has access to' })
  @IsOptional()
  @IsArray()
  linkedAccountIds?: string[];

  @ApiProperty()
  @IsString()
  displayName: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsArray()
  roles: string[];

  @ApiProperty()
  @IsArray()
  permissions: string[];

  @ApiProperty()
  @IsString()
  photoUrl: string;

  @ApiProperty()
  @IsBoolean()
  isLPA: boolean;

  @ApiProperty()
  @IsBoolean()
  termsAgreed: boolean;

  @ApiProperty()
  @IsArray()
  installedApps: string[];

  @ApiProperty()
  @IsArray()
  appPermissions: string[];
}

export class RecordBasic {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  created_by?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  updated_by?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  created_at?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  updated_at?: number;
}

export interface ApplicationSettingDto {
  name: string;
  value: string | number | boolean | object | ConvCloudAppKeyBasic | CCUserDto;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

export class ApplicationSettingsDto extends RecordBasic {
  static collectionName = 'application_settings';

  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty()
  @IsArray()
  settings: ApplicationSettingDto[];
}
