/**
 * Conversation Orchestrator DTOs
 * Data Transfer Objects for REST API request/response validation
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import {
  IKBRule,
  IBotRule,
  IAgentPreferences,
  IKBRuleAddon,
  IBotRuleAddon,
} from './conversation-orchestrator.interfaces';

// ============================================
// Query DTOs
// ============================================

export class RulesQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  size?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by minimum confidence score' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  filterConfidenceScoreMin?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum confidence score' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  filterConfidenceScoreMax?: number;
}

// ============================================
// Request DTOs
// ============================================

export class CreateKBRuleDto {
  @ApiProperty({ description: 'Rule name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Rule status (enabled/disabled)' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty({ description: 'Skill IDs the rule applies to', type: [Number] })
  @IsArray()
  skills: number[];

  @ApiProperty({ description: 'Rule addons configuration' })
  @IsArray()
  addons: IKBRuleAddon[];

  @ApiPropertyOptional({ description: 'Conversation type (e.g., messaging)' })
  @IsOptional()
  @IsString()
  conversationType?: string;
}

export class UpdateKBRuleDto {
  @ApiPropertyOptional({ description: 'Rule name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Rule status (enabled/disabled)' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({ description: 'Skill IDs the rule applies to', type: [Number] })
  @IsOptional()
  @IsArray()
  skills?: number[];

  @ApiPropertyOptional({ description: 'Rule addons configuration' })
  @IsOptional()
  @IsArray()
  addons?: IKBRuleAddon[];

  @ApiPropertyOptional({ description: 'Conversation type (e.g., messaging)' })
  @IsOptional()
  @IsString()
  conversationType?: string;
}

export class CreateBotRuleDto {
  @ApiProperty({ description: 'Rule name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Rule status (enabled/disabled)' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty({ description: 'Skill IDs the rule applies to', type: [Number] })
  @IsArray()
  skills: number[];

  @ApiProperty({ description: 'Rule addons configuration' })
  @IsArray()
  addons: IBotRuleAddon[];

  @ApiPropertyOptional({ description: 'Conversation type (e.g., messaging)' })
  @IsOptional()
  @IsString()
  conversationType?: string;

  @ApiPropertyOptional({ description: 'Message when bot joins conversation' })
  @IsOptional()
  @IsString()
  joinBotPhrase?: string;

  @ApiPropertyOptional({ description: 'Message when bot leaves conversation' })
  @IsOptional()
  @IsString()
  removeBotPhrase?: string;
}

export class UpdateBotRuleDto {
  @ApiPropertyOptional({ description: 'Rule name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Rule status (enabled/disabled)' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({ description: 'Skill IDs the rule applies to', type: [Number] })
  @IsOptional()
  @IsArray()
  skills?: number[];

  @ApiPropertyOptional({ description: 'Rule addons configuration' })
  @IsOptional()
  @IsArray()
  addons?: IBotRuleAddon[];

  @ApiPropertyOptional({ description: 'Conversation type (e.g., messaging)' })
  @IsOptional()
  @IsString()
  conversationType?: string;

  @ApiPropertyOptional({ description: 'Message when bot joins conversation' })
  @IsOptional()
  @IsString()
  joinBotPhrase?: string;

  @ApiPropertyOptional({ description: 'Message when bot leaves conversation' })
  @IsOptional()
  @IsString()
  removeBotPhrase?: string;
}

// ============================================
// Response DTOs
// ============================================

export class KBRulesResponseDto {
  @ApiProperty({ description: 'List of KB rules', type: 'array' })
  data: IKBRule[];

  @ApiProperty({ description: 'Total number of rules' })
  total: number;

  @ApiProperty({ description: 'Number of enabled rules' })
  enabledCount: number;
}

export class KBRuleResponseDto {
  @ApiProperty({ description: 'The KB rule' })
  data: IKBRule;
}

export class BotRulesResponseDto {
  @ApiProperty({ description: 'List of Bot rules', type: 'array' })
  data: IBotRule[];

  @ApiProperty({ description: 'Total number of rules' })
  total: number;

  @ApiProperty({ description: 'Number of enabled rules' })
  enabledCount: number;
}

export class BotRuleResponseDto {
  @ApiProperty({ description: 'The Bot rule' })
  data: IBotRule;
}

export class AgentPreferencesResponseDto {
  @ApiProperty({ description: 'Agent preferences' })
  data: IAgentPreferences;
}
