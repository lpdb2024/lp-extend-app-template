/**
 * Account Features DTOs
 * Data Transfer Objects for Account Features API
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export type FeatureValueType = 'LPBoolean' | 'LPString' | 'LPInteger';

export class FeatureValueDto {
  @ApiProperty({ enum: ['LPBoolean', 'LPString', 'LPInteger'], description: 'The type of the feature value' })
  @IsIn(['LPBoolean', 'LPString', 'LPInteger'])
  type: FeatureValueType;

  @ApiProperty({ description: 'The actual value as string' })
  @IsString()
  $: string;
}

export class AccountFeatureDto {
  @ApiProperty({ description: 'Feature ID (e.g., Common.AI_Assist_Widget)' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Start date of the feature grant' })
  @IsString()
  from: string;

  @ApiProperty({ description: 'End date of the feature grant' })
  @IsString()
  to: string;

  @ApiProperty({ description: 'Whether the feature is deleted' })
  @IsBoolean()
  deleted: boolean;

  @ApiProperty({ type: FeatureValueDto, description: 'The feature value' })
  @ValidateNested()
  @Type(() => FeatureValueDto)
  value: FeatureValueDto;
}

export class UpdateFeatureDto {
  @ApiProperty({ description: 'Feature ID to update' })
  @IsString()
  id: string;

  @ApiProperty({ type: FeatureValueDto, description: 'New value for the feature' })
  @ValidateNested()
  @Type(() => FeatureValueDto)
  value: FeatureValueDto;
}

export class UpdateFeaturesDto {
  @ApiProperty({ type: [UpdateFeatureDto], description: 'Array of features to update' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFeatureDto)
  grantedFeature: UpdateFeatureDto[];
}

export class GrantedFeaturesDto {
  @ApiProperty({ description: 'Revision number for optimistic locking' })
  revision: number;

  @ApiProperty({ type: [AccountFeatureDto], description: 'List of granted features' })
  grantedFeature: AccountFeatureDto[];
}

export class AccountFeaturesResponseDto {
  @ApiProperty({ type: GrantedFeaturesDto, description: 'Features data with revision' })
  data: GrantedFeaturesDto;

  @ApiPropertyOptional({ description: 'Revision header from response' })
  @IsOptional()
  revision?: string;
}

export class SingleFeatureResponseDto {
  @ApiProperty({ type: AccountFeatureDto, description: 'Single feature data' })
  data: AccountFeatureDto;

  @ApiPropertyOptional({ description: 'Revision header from response' })
  @IsOptional()
  revision?: string;
}
