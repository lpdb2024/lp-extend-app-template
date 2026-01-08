/**
 * Account Properties DTOs
 * NestJS class-based DTOs with validation decorators
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IAccountProperty } from './account-properties.interfaces';

/**
 * Property Value DTO
 */
export class PropertyValueDto {
  @ApiProperty({
    description: 'Property value - can be string, array, number, boolean, or object',
  })
  value: string | string[] | number | boolean | Record<string, unknown>;
}

/**
 * Create Account Property Request DTO
 */
export class CreateAccountPropertyDto {
  @ApiProperty({ description: 'Property ID (e.g., messaging.rich.content.valid.urls)' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Property type (1=Boolean, 2=String, 3=Array, 4=Object)' })
  @IsNumber()
  type: number;

  @ApiProperty({ type: PropertyValueDto, description: 'Property value object' })
  @ValidateNested()
  @Type(() => PropertyValueDto)
  propertyValue: PropertyValueDto;
}

/**
 * Update Account Property Request DTO
 */
export class UpdateAccountPropertyDto {
  @ApiPropertyOptional({ description: 'Property ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: 'Property type (1=Boolean, 2=String, 3=Array, 4=Object)' })
  @IsOptional()
  @IsNumber()
  type?: number;

  @ApiPropertyOptional({ type: PropertyValueDto, description: 'Property value object' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyValueDto)
  propertyValue?: PropertyValueDto;
}

/**
 * Account Properties Response DTO
 */
export class AccountPropertiesResponseDto {
  @ApiProperty({ description: 'Array of account properties', type: 'array' })
  data: IAccountProperty[];

  @ApiPropertyOptional({ description: 'Current revision for optimistic locking' })
  revision?: string;
}

/**
 * Single Account Property Response DTO
 */
export class AccountPropertyResponseDto {
  @ApiProperty({ description: 'Account property data' })
  data: IAccountProperty;

  @ApiPropertyOptional({ description: 'Current revision for optimistic locking' })
  revision?: string;
}
