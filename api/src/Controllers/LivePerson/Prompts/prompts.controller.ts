/**
 * Prompts Controller
 * REST API endpoints for LivePerson Prompt Library
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PromptsService } from './prompts.service';
import {
  CreatePromptDto,
  UpdatePromptDto,
  PromptsQueryDto,
  SystemPromptsResponseDto,
  AccountPromptsResponseDto,
  PromptResponseDto,
  LLMProvidersResponseDto,
} from './prompts.dto';

@ApiTags('Prompts')
@ApiBearerAuth()
@Controller('api/v2/prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  // ============================================
  // System Prompts (Read-only)
  // ============================================

  @Get('system')
  @ApiOperation({
    summary: 'Get system prompts',
    description: 'Retrieves all system prompts (read-only, provided by LivePerson)',
  })
  @ApiResponse({ status: 200, description: 'List of system prompts', type: SystemPromptsResponseDto })
  async getSystemPrompts(
    @Headers('authorization') authorization: string,
    @Headers('x-account-id') accountId: string,
    @Query() query: PromptsQueryDto,
  ): Promise<SystemPromptsResponseDto> {
    const token = this.extractToken(authorization);

    if (!accountId) {
      throw new BadRequestException('x-account-id header is required');
    }

    const response = await this.promptsService.getSystemPrompts(accountId, token, {
      source: query.source,
    });

    return {
      data: response.data,
    };
  }

  // ============================================
  // Account Prompts (CRUD)
  // ============================================

  @Get(':accountId')
  @ApiOperation({
    summary: 'Get account prompts',
    description: 'Retrieves all prompts for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of account prompts', type: AccountPromptsResponseDto })
  async getAccountPrompts(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: PromptsQueryDto,
  ): Promise<AccountPromptsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.promptsService.getAccountPrompts(accountId, token, {
      source: query.source,
    });

    return {
      data: response.data,
    };
  }

  // ============================================
  // LLM Providers (MUST be before :accountId/:promptId to avoid route conflict)
  // ============================================

  @Get(':accountId/llm-providers')
  @ApiOperation({
    summary: 'Get LLM providers',
    description: 'Retrieves LLM provider subscriptions for the account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of LLM providers', type: LLMProvidersResponseDto })
  async getLLMProviders(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<LLMProvidersResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.promptsService.getLLMProviders(accountId, token);

    return {
      data: response.data,
    };
  }

  @Get(':accountId/:promptId')
  @ApiOperation({
    summary: 'Get account prompt by ID',
    description: 'Retrieves a single prompt by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'promptId', description: 'Prompt ID' })
  @ApiResponse({ status: 200, description: 'The prompt', type: PromptResponseDto })
  async getAccountPromptById(
    @Param('accountId') accountId: string,
    @Param('promptId') promptId: string,
    @Headers('authorization') authorization: string,
  ): Promise<PromptResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.promptsService.getAccountPromptById(accountId, promptId, token);

    return {
      data: response.data,
    };
  }

  @Post(':accountId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create account prompt',
    description: 'Creates a new prompt for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Prompt created', type: PromptResponseDto })
  async createAccountPrompt(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: CreatePromptDto,
  ): Promise<PromptResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.promptsService.createAccountPrompt(accountId, token, body);

    return {
      data: response.data,
    };
  }

  @Put(':accountId/:promptId')
  @ApiOperation({
    summary: 'Update account prompt',
    description: 'Updates an existing prompt',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'promptId', description: 'Prompt ID to update' })
  @ApiResponse({ status: 200, description: 'Prompt updated', type: PromptResponseDto })
  async updateAccountPrompt(
    @Param('accountId') accountId: string,
    @Param('promptId') promptId: string,
    @Headers('authorization') authorization: string,
    @Body() body: UpdatePromptDto,
  ): Promise<PromptResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.promptsService.updateAccountPrompt(
      accountId,
      promptId,
      token,
      body,
    );

    return {
      data: response.data,
    };
  }

  @Delete(':accountId/:promptId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete account prompt',
    description: 'Deletes a prompt by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'promptId', description: 'Prompt ID to delete' })
  @ApiResponse({ status: 204, description: 'Prompt deleted' })
  async deleteAccountPrompt(
    @Param('accountId') accountId: string,
    @Param('promptId') promptId: string,
    @Headers('authorization') authorization: string,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    await this.promptsService.deleteAccountPrompt(accountId, promptId, token);
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
