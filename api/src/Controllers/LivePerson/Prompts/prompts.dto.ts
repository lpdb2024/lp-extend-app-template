/**
 * Prompts API DTOs
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
import {
  IPrompt,
  ILLMProviderSubscription,
  PromptClientType,
  PromptVariableSourceType,
} from './prompts.interfaces';

/**
 * Prompt Variable DTO
 */
export class PromptVariableDto {
  @ApiProperty({ description: 'Variable name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Source type for the variable' })
  @IsString()
  sourceType: PromptVariableSourceType;

  @ApiPropertyOptional({ description: 'Variable value' })
  @IsOptional()
  @IsString()
  value?: string;
}

/**
 * Generic Config DTO
 */
export class PromptGenericConfigDto {
  @ApiProperty({ description: 'LLM provider name' })
  @IsString()
  llmProvider: string;

  @ApiProperty({ description: 'LLM model name' })
  @IsString()
  llm: string;

  @ApiPropertyOptional({ description: 'Subscription name' })
  @IsOptional()
  @IsString()
  llmSubscriptionName?: string;

  @ApiPropertyOptional({ description: 'Sampling temperature' })
  @IsOptional()
  @IsNumber()
  samplingTemperature?: number;

  @ApiPropertyOptional({ description: 'Max response tokens' })
  @IsOptional()
  @IsNumber()
  maxResponseTokens?: number;

  @ApiPropertyOptional({ description: 'Max prompt tokens' })
  @IsOptional()
  @IsNumber()
  maxPromptTokens?: number;

  @ApiPropertyOptional({ description: 'Number of completions' })
  @IsOptional()
  @IsNumber()
  completionsNumber?: number;
}

/**
 * Client Config DTO
 */
export class PromptClientConfigDto {
  @ApiPropertyOptional({ description: 'Max conversation turns' })
  @IsOptional()
  @IsNumber()
  maxConversationTurns?: number;

  @ApiPropertyOptional({ description: 'Max conversation messages' })
  @IsOptional()
  @IsNumber()
  maxConversationMessages?: number;

  @ApiPropertyOptional({ description: 'Max conversation tokens' })
  @IsOptional()
  @IsNumber()
  maxConversationTokens?: number;

  @ApiPropertyOptional({ description: 'Include last user message' })
  @IsOptional()
  @IsBoolean()
  includeLastUserMessage?: boolean;

  @ApiPropertyOptional({ description: 'PII masking enabled' })
  @IsOptional()
  @IsBoolean()
  piiMaskingEnabled?: boolean;
}

/**
 * Prompt Configuration DTO
 */
export class PromptConfigurationDto {
  @ApiProperty({ type: PromptGenericConfigDto })
  @ValidateNested()
  @Type(() => PromptGenericConfigDto)
  genericConfig: PromptGenericConfigDto;

  @ApiProperty({ type: PromptClientConfigDto })
  @ValidateNested()
  @Type(() => PromptClientConfigDto)
  clientConfig: PromptClientConfigDto;

  @ApiProperty({ type: [PromptVariableDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromptVariableDto)
  variables: PromptVariableDto[];
}

/**
 * Create Prompt Request DTO
 */
export class CreatePromptDto {
  @ApiProperty({ description: 'Prompt name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Client type' })
  @IsString()
  clientType: PromptClientType;

  @ApiPropertyOptional({ description: 'Prompt description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Language code', default: 'en-US' })
  @IsOptional()
  @IsString()
  langCode?: string;

  @ApiProperty({ description: 'Prompt header/template' })
  @IsString()
  promptHeader: string;

  @ApiPropertyOptional({ description: 'Prompt status' })
  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';

  @ApiPropertyOptional({ description: 'Is default prompt' })
  @IsOptional()
  @IsBoolean()
  default?: boolean;

  @ApiProperty({ type: PromptConfigurationDto })
  @ValidateNested()
  @Type(() => PromptConfigurationDto)
  configuration: PromptConfigurationDto;
}

/**
 * Update Prompt Request DTO
 */
export class UpdatePromptDto {
  @ApiPropertyOptional({ description: 'Prompt name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Prompt description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Language code' })
  @IsOptional()
  @IsString()
  langCode?: string;

  @ApiPropertyOptional({ description: 'Prompt header/template' })
  @IsOptional()
  @IsString()
  promptHeader?: string;

  @ApiPropertyOptional({ description: 'Prompt status' })
  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';

  @ApiPropertyOptional({ description: 'Is default prompt' })
  @IsOptional()
  @IsBoolean()
  default?: boolean;

  @ApiPropertyOptional({ type: PromptConfigurationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PromptConfigurationDto)
  configuration?: PromptConfigurationDto;
}

/**
 * Query Parameters DTO
 */
export class PromptsQueryDto {
  @ApiPropertyOptional({ description: 'Source identifier', default: 'ccui' })
  @IsOptional()
  @IsString()
  source?: string;
}

/**
 * System Prompts Response DTO
 */
export class SystemPromptsResponseDto {
  @ApiProperty({ description: 'Array of system prompts' })
  data: IPrompt[];
}

/**
 * Account Prompts Response DTO
 */
export class AccountPromptsResponseDto {
  @ApiProperty({ description: 'Array of account prompts' })
  data: IPrompt[];
}

/**
 * Single Prompt Response DTO
 */
export class PromptResponseDto {
  @ApiProperty({ description: 'The prompt data' })
  data: IPrompt;
}

/**
 * LLM Providers Response DTO
 */
export class LLMProvidersResponseDto {
  @ApiProperty({ description: 'Array of LLM provider subscriptions' })
  data: ILLMProviderSubscription[];
}
