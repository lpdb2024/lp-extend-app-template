/**
 * LOBs DTOs
 * NestJS DTOs for LOBs API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ILob } from './lobs.interfaces';

/**
 * DTO for creating a new LOB
 */
export class CreateLobDto {
  @ApiProperty({ description: 'LOB name', example: 'Sales' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'LOB description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

/**
 * DTO for updating a LOB
 */
export class UpdateLobDto {
  @ApiPropertyOptional({ description: 'LOB name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'LOB description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

/**
 * Query parameters for LOBs list
 */
export class LobsQueryDto {
  @ApiPropertyOptional({ description: 'Fields to select (comma-separated)' })
  @IsOptional()
  @IsString()
  select?: string;

  @ApiPropertyOptional({ description: 'Include deleted LOBs' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean;
}

/**
 * LOB response DTO
 */
export class LobResponseDto {
  @ApiProperty({ description: 'LOB data' })
  data: ILob;

  @ApiPropertyOptional({ description: 'Current revision for optimistic locking' })
  revision?: string;
}

/**
 * LOBs list response DTO
 */
export class LobsResponseDto {
  @ApiProperty({ description: 'List of LOBs', type: [Object] })
  data: ILob[];

  @ApiPropertyOptional({ description: 'Current revision for optimistic locking' })
  revision?: string;
}
