import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsInt,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { HelperService } from 'src/utils/HelperService';

const JS = new HelperService();
const { ToBoolean } = JS;

export class CCApp {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  redirect_uris?: string[];

  @ApiProperty()
  @IsArray()
  grant_types: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  client_id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  client_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  client_secret: string;

  @ApiProperty()
  @IsNumber()
  client_secret_expires_at: number;

  @ApiProperty()
  @IsNumber()
  client_id_issued_at: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  capabilities?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo_uri?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  quick_launch_enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  enabled_for_profiles?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  categories?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_internal?: boolean;
}

export class ApiKeyBasicDto {
  static collectionName = 'api_keys';
  id: number | string;
  app_target: string;
  account_id: number | string;
  encrypted_key: string;
}

export class EncryptedApiKeyDto {
  static collectionName = 'api_keys';
  id: number | string;
  app_target: string;
  account_id: number | string;
  encrypted_key: string;
  created_by: string;
  updated_by: string;
  created_at: number;
  updated_at: number;
}
