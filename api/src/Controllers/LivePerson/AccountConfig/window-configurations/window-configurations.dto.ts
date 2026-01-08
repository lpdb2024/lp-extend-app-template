/**
 * Window Configurations API DTOs
 * NestJS DTOs for Window Configurations API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IWindowConfiguration, IWindowConfigJson } from './window-configurations.interfaces';

/**
 * Window configuration query parameters
 */
export class WindowConfigurationQueryDto {
  @ApiPropertyOptional({ description: 'API version', example: '2.0' })
  @IsOptional()
  @IsString()
  v?: string;

  @ApiPropertyOptional({ description: 'Fields to return' })
  @IsOptional()
  fields?: string | string[];

  @ApiPropertyOptional({ description: 'Field set', enum: ['all', 'summary'] })
  @IsOptional()
  @IsString()
  field_set?: 'all' | 'summary';

  @ApiPropertyOptional({ description: 'Select expression' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  include_deleted?: boolean;
}

/**
 * Window configuration JSON DTO
 */
export class WindowConfigJsonDto {
  @ApiPropertyOptional({ description: 'Window scheme' })
  @IsOptional()
  @IsString()
  scheme?: string;

  @ApiPropertyOptional({ description: 'Enable agent chat survey' })
  @IsOptional()
  @IsBoolean()
  surveyAgentChatEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable pre-chat survey' })
  @IsOptional()
  @IsBoolean()
  surveyPreChatEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable post-chat survey' })
  @IsOptional()
  @IsBoolean()
  surveyPostChatEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable offline survey' })
  @IsOptional()
  @IsBoolean()
  surveyOfflineEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Custom style configuration' })
  @IsOptional()
  @IsObject()
  customStyle?: Record<string, unknown>;
}

/**
 * Window configuration create request DTO
 */
export class WindowConfigurationCreateDto {
  @ApiProperty({ description: 'Window configuration name', example: 'Default Window' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Window configuration description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is user default' })
  @IsOptional()
  @IsBoolean()
  isUserDefault?: boolean;

  @ApiPropertyOptional({ description: 'Window configuration JSON', type: WindowConfigJsonDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WindowConfigJsonDto)
  json?: IWindowConfigJson;
}

/**
 * Window configuration update request DTO
 */
export class WindowConfigurationUpdateDto {
  @ApiPropertyOptional({ description: 'Window configuration name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Window configuration description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is user default' })
  @IsOptional()
  @IsBoolean()
  isUserDefault?: boolean;

  @ApiPropertyOptional({ description: 'Window configuration JSON', type: WindowConfigJsonDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WindowConfigJsonDto)
  json?: IWindowConfigJson;
}

/**
 * Window configuration response DTO
 */
export class WindowConfigurationResponseDto {
  @ApiProperty({ description: 'Window configuration data' })
  data: IWindowConfiguration;
}

/**
 * Window configuration list response DTO
 */
export class WindowConfigurationListResponseDto {
  @ApiProperty({ description: 'List of window configurations', type: [Object] })
  data: IWindowConfiguration[];
}
