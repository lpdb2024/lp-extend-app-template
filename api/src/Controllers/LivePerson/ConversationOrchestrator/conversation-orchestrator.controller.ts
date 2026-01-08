/**
 * Conversation Orchestrator Controller
 * REST API endpoints for LivePerson Conversation Orchestrator
 * - KB Rules (Knowledge Base Recommendations)
 * - Bot Rules (Bot Recommendations)
 * - Agent Preferences
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
import { ConversationOrchestratorService } from './conversation-orchestrator.service';
import {
  RulesQueryDto,
  CreateKBRuleDto,
  UpdateKBRuleDto,
  CreateBotRuleDto,
  UpdateBotRuleDto,
  KBRulesResponseDto,
  KBRuleResponseDto,
  BotRulesResponseDto,
  BotRuleResponseDto,
  AgentPreferencesResponseDto,
} from './conversation-orchestrator.dto';

@ApiTags('Conversation Orchestrator')
@ApiBearerAuth()
@Controller('api/v2/conversation-orchestrator/:accountId')
export class ConversationOrchestratorController {
  constructor(
    private readonly coService: ConversationOrchestratorService,
  ) {}

  // ============================================
  // KB Rules (Knowledge Base Recommendations)
  // ============================================

  @Get('kb-rules')
  @ApiOperation({
    summary: 'Get KB recommendation rules',
    description: 'Retrieves all Knowledge Base recommendation rules for Conversation Assist',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of KB rules', type: KBRulesResponseDto })
  async getKBRules(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: RulesQueryDto,
  ): Promise<KBRulesResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.coService.getKBRules(accountId, token, {
      page: query.page,
      size: query.size,
    }, userId);

    return {
      data: response.data?.rows || [],
      total: response.data?.total || 0,
      enabledCount: response.data?.enabledCount || 0,
    };
  }

  @Get('kb-rules/:ruleId')
  @ApiOperation({
    summary: 'Get KB rule by ID',
    description: 'Retrieves a single KB recommendation rule by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'ruleId', description: 'KB Rule ID' })
  @ApiResponse({ status: 200, description: 'The KB rule', type: KBRuleResponseDto })
  async getKBRuleById(
    @Param('accountId') accountId: string,
    @Param('ruleId') ruleId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
  ): Promise<KBRuleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.coService.getKBRuleById(accountId, ruleId, token, userId);

    return {
      data: response.data,
    };
  }

  @Post('kb-rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create KB rule',
    description: 'Creates a new KB recommendation rule',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'KB rule created', type: KBRuleResponseDto })
  async createKBRule(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Body() body: CreateKBRuleDto,
  ): Promise<KBRuleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.coService.createKBRule(accountId, token, body, userId);

    return {
      data: response.data,
    };
  }

  @Put('kb-rules/:ruleId')
  @ApiOperation({
    summary: 'Update KB rule',
    description: 'Updates an existing KB recommendation rule',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'ruleId', description: 'KB Rule ID to update' })
  @ApiResponse({ status: 200, description: 'KB rule updated', type: KBRuleResponseDto })
  async updateKBRule(
    @Param('accountId') accountId: string,
    @Param('ruleId') ruleId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Body() body: UpdateKBRuleDto,
  ): Promise<KBRuleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.coService.updateKBRule(accountId, ruleId, token, body, userId);

    return {
      data: response.data,
    };
  }

  @Delete('kb-rules/:ruleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete KB rule',
    description: 'Deletes a KB recommendation rule by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'ruleId', description: 'KB Rule ID to delete' })
  @ApiResponse({ status: 204, description: 'KB rule deleted' })
  async deleteKBRule(
    @Param('accountId') accountId: string,
    @Param('ruleId') ruleId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    await this.coService.deleteKBRule(accountId, ruleId, token, userId);
  }

  // ============================================
  // Bot Rules (Bot Recommendations)
  // ============================================

  @Get('bot-rules')
  @ApiOperation({
    summary: 'Get Bot recommendation rules',
    description: 'Retrieves all Bot recommendation rules for Conversation Assist',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of Bot rules', type: BotRulesResponseDto })
  async getBotRules(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: RulesQueryDto,
  ): Promise<BotRulesResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.coService.getBotRules(accountId, token, {
      page: query.page,
      size: query.size,
      filterConfidenceScoreMin: query.filterConfidenceScoreMin,
      filterConfidenceScoreMax: query.filterConfidenceScoreMax,
    }, userId);

    return {
      data: response.data?.rows || [],
      total: response.data?.total || 0,
      enabledCount: response.data?.enabledCount || 0,
    };
  }

  @Get('bot-rules/:ruleId')
  @ApiOperation({
    summary: 'Get Bot rule by ID',
    description: 'Retrieves a single Bot recommendation rule by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'ruleId', description: 'Bot Rule ID' })
  @ApiResponse({ status: 200, description: 'The Bot rule', type: BotRuleResponseDto })
  async getBotRuleById(
    @Param('accountId') accountId: string,
    @Param('ruleId') ruleId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
  ): Promise<BotRuleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.coService.getBotRuleById(accountId, ruleId, token, userId);

    return {
      data: response.data,
    };
  }

  @Post('bot-rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Bot rule',
    description: 'Creates a new Bot recommendation rule',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Bot rule created', type: BotRuleResponseDto })
  async createBotRule(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Body() body: CreateBotRuleDto,
  ): Promise<BotRuleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.coService.createBotRule(accountId, token, body, userId);

    return {
      data: response.data,
    };
  }

  @Put('bot-rules/:ruleId')
  @ApiOperation({
    summary: 'Update Bot rule',
    description: 'Updates an existing Bot recommendation rule',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'ruleId', description: 'Bot Rule ID to update' })
  @ApiResponse({ status: 200, description: 'Bot rule updated', type: BotRuleResponseDto })
  async updateBotRule(
    @Param('accountId') accountId: string,
    @Param('ruleId') ruleId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Body() body: UpdateBotRuleDto,
  ): Promise<BotRuleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.coService.updateBotRule(accountId, ruleId, token, body, userId);

    return {
      data: response.data,
    };
  }

  @Delete('bot-rules/:ruleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete Bot rule',
    description: 'Deletes a Bot recommendation rule by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'ruleId', description: 'Bot Rule ID to delete' })
  @ApiResponse({ status: 204, description: 'Bot rule deleted' })
  async deleteBotRule(
    @Param('accountId') accountId: string,
    @Param('ruleId') ruleId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    await this.coService.deleteBotRule(accountId, ruleId, token, userId);
  }

  // ============================================
  // Agent Preferences
  // ============================================

  @Get('agent-preferences')
  @ApiOperation({
    summary: 'Get agent preferences',
    description: 'Retrieves agent preferences for Conversation Assist',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent preferences', type: AgentPreferencesResponseDto })
  async getAgentPreferences(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
  ): Promise<AgentPreferencesResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.coService.getAgentPreferences(accountId, token, userId);

    return {
      data: response.data,
    };
  }

  @Put('agent-preferences')
  @ApiOperation({
    summary: 'Update agent preferences',
    description: 'Updates agent preferences for Conversation Assist',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent preferences updated', type: AgentPreferencesResponseDto })
  async updateAgentPreferences(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Body() body: Record<string, unknown>,
  ): Promise<AgentPreferencesResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.coService.updateAgentPreferences(accountId, token, body, userId);

    return {
      data: response.data,
    };
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
