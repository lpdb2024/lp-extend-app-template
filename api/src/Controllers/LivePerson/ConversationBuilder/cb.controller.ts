import { Controller, Get, Headers, Param, Post, Body, Put, ForbiddenException, Query } from '@nestjs/common';
import { ConversationBuilderService } from './cb.service'
import { API_ROUTES } from '../../../constants/constants';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

import {
  BotAgentActionDto,
  AddBotAgentDto,
} from './cb.dto'
import { VerifyUser } from 'src/Firebase/auth.service';
import type { SentinelLpToken } from '@lpextend/client-sdk';

@ApiTags('Conversation Builder')
@ApiBearerAuth()
@Controller(API_ROUTES.CONVERSATION_BUILDER())
export class ConversationBuilderController {
  constructor(private service: ConversationBuilderService) {}

  // ============ Authentication ============
  @Get('/:accountId/token')
  @ApiOperation({ summary: 'Authenticate with Conversation Builder' })
  async getToken(
    @Param('accountId') accountId: string,
    @Headers('authorization') token: string,
  ): Promise<any> | null {
    return this.service.authenticateConversationBuilder(accountId, token);
  }

  // ============ Bots ============
  @Get('/:accountId/bots')
  @ApiOperation({ summary: 'Get all bots for account' })
  async getBots(
    @Param('accountId') accountId: string,
    @Headers('cb_token') authorization: string,
    @Headers('cb_org') organization: string,
  ): Promise<any> | null {
    return this.service.getBots(accountId, authorization, organization);
  }

  @Get('/:accountId/bots/:botId/logs')
  @ApiOperation({ summary: 'Get bot debug logs' })
  async getBotLogs(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('botId') botId: string
  ): Promise<any> | null {
    if (!lpToken || !lpToken.cbOrg || !lpToken.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getBotLogsFormatted(botId, lpToken.cbToken, lpToken.cbOrg);
  }

  // ============ Bot Groups ============
  @Get('/:accountId/bot-groups')
  @ApiOperation({ summary: 'Get all bot groups' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiQuery({ name: 'expand-all', required: false, type: Boolean })
  async getBotGroups(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 100,
    @Query('expand-all') expandAll: boolean = false
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getBotGroups(accountId, lpToken.cbToken, lpToken.cbOrg, page, size, expandAll);
  }

  @Get('/:accountId/bot-groups/bots')
  @ApiOperation({ summary: 'Get bots by group' })
  @ApiQuery({ name: 'bot-group-id', required: false, type: String })
  @ApiQuery({ name: 'sort-by', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  async getBotsByGroup(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Query('bot-group-id') botGroupId: string = 'un_assigned',
    @Query('sort-by') sortBy: string = 'botName:asc',
    @Query('page') page: number = 1,
    @Query('size') size: number = 10
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getBotsByGroup(accountId, lpToken.cbToken, lpToken.cbOrg, botGroupId, sortBy, page, size);
  }

  // ============ Chatbot Details ============
  @Get('/:accountId/chatbots/:chatBotId')
  @ApiOperation({ summary: 'Get chatbot details by ID' })
  async getChatbotById(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('chatBotId') chatBotId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getChatbotById(accountId, lpToken.cbToken, lpToken.cbOrg, chatBotId);
  }

  // ============ Dialogs ============
  @Get('/:accountId/bots/:botId/dialogs')
  @ApiOperation({ summary: 'Get all dialogs for a bot' })
  async getDialogs(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('botId') botId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getDialogs(accountId, lpToken.cbToken, lpToken.cbOrg, botId);
  }

  // ============ Interactions ============
  @Get('/:accountId/bots/:botId/interactions')
  @ApiOperation({ summary: 'Get all interactions for a bot' })
  async getInteractions(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('botId') botId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getInteractions(accountId, lpToken.cbToken, lpToken.cbOrg, botId);
  }

  // ============ Responders / Integrations ============
  @Get('/:accountId/chatbots/:chatBotId/responders')
  @ApiOperation({ summary: 'Get all responders/integrations for a chatbot' })
  async getResponders(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('chatBotId') chatBotId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getResponders(accountId, lpToken.cbToken, lpToken.cbOrg, chatBotId);
  }

  // ============ NLU Domains ============
  @Get('/:accountId/nlu/domains')
  @ApiOperation({ summary: 'Get all NLU domains' })
  async getNLUDomains(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getNLUDomains(accountId, lpToken.cbToken, lpToken.cbOrg);
  }

  @Get('/:accountId/nlu/domains/:domainId/intents')
  @ApiOperation({ summary: 'Get intents for a domain' })
  async getDomainIntents(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('domainId') domainId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getDomainIntents(accountId, lpToken.cbToken, lpToken.cbOrg, domainId);
  }

  // ============ Knowledge Base (KAI) ============
  @Get('/:accountId/knowledge-bases')
  @ApiOperation({ summary: 'Get all knowledge bases' })
  @ApiQuery({ name: 'includeMetrics', required: false, type: Boolean })
  async getKnowledgeBases(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Query('includeMetrics') includeMetrics: boolean = true
  ): Promise<any> {
    console.info('[getKnowledgeBases] lpToken received:', {
      hasToken: !!lpToken,
      hasCbToken: !!lpToken?.cbToken,
      hasCbOrg: !!lpToken?.cbOrg,
      cbOrg: lpToken?.cbOrg,
      cbTokenLength: lpToken?.cbToken?.length,
      cbTokenFirst20: lpToken?.cbToken?.substring(0, 20),
    });
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    console.info('Fetching knowledge bases with metrics:', includeMetrics);
    return this.service.getKnowledgeBases(accountId, lpToken.cbToken, lpToken.cbOrg, includeMetrics);
  }

  @Get('/:accountId/knowledge-bases/:kbId')
  @ApiOperation({ summary: 'Get knowledge base by ID' })
  @ApiQuery({ name: 'includeMetrics', required: false, type: Boolean })
  async getKnowledgeBaseById(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @Query('includeMetrics') includeMetrics: boolean = true
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getKnowledgeBaseById(accountId, lpToken.cbToken, lpToken.cbOrg, kbId, includeMetrics);
  }

  @Get('/:accountId/knowledge-bases/:kbId/content-sources')
  @ApiOperation({ summary: 'Get content sources for a knowledge base' })
  @ApiQuery({ name: 'includeKmsRecipeDetails', required: false, type: Boolean })
  async getKBContentSources(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @Query('includeKmsRecipeDetails') includeKmsRecipeDetails: boolean = true
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getKBContentSources(accountId, lpToken.cbToken, lpToken.cbOrg, kbId, includeKmsRecipeDetails);
  }

  @Post('/:accountId/knowledge-bases/:kbId/articles')
  @ApiOperation({ summary: 'Get articles for a knowledge base' })
  @ApiQuery({ name: 'includeConflictingDetails', required: false, type: Boolean })
  async getKBArticles(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @Query('includeConflictingDetails') includeConflictingDetails: boolean = true,
    @Body() body: { page?: number; size?: number; sortAscByLastModificationTime?: boolean; articleIds?: string[] }
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    const { page = 1, size = 20, sortAscByLastModificationTime = false, articleIds = [] } = body;
    return this.service.getKBArticles(
      accountId,
      lpToken.cbToken,
      lpToken.cbOrg,
      kbId,
      page,
      size,
      sortAscByLastModificationTime,
      articleIds,
      includeConflictingDetails
    );
  }

  // ============ Bot Agent Management ============
  @Get('/:accountId/bots/:botId/status')
  @ApiOperation({ summary: 'Get bot instance status' })
  async getBotInstanceStatus(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('botId') botId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getBotInstanceStatus(accountId, lpToken.cbToken, lpToken.cbOrg, botId);
  }

  @Put('/:accountId/bots/:botId/start')
  @ApiOperation({ summary: 'Start a bot agent' })
  async startBotAgent(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('botId') botId: string,
    @Body() body: BotAgentActionDto
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.startBotAgent(accountId, lpToken.cbToken, lpToken.cbOrg, botId, body.lpAccountId, body.lpAccountUser);
  }

  @Put('/:accountId/bots/:botId/stop')
  @ApiOperation({ summary: 'Stop a bot agent' })
  async stopBotAgent(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('botId') botId: string,
    @Body() body: BotAgentActionDto
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.stopBotAgent(accountId, lpToken.cbToken, lpToken.cbOrg, botId, body.lpAccountId, body.lpAccountUser);
  }

  @Get('/:accountId/bot-users')
  @ApiOperation({ summary: 'Get all bot users for account' })
  async getBotUsers(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getBotUsers(accountId, lpToken.cbToken, lpToken.cbOrg);
  }

  @Post('/:accountId/bot-users/:lpUserId')
  @ApiOperation({ summary: 'Add bot agent to LP user' })
  @ApiQuery({ name: 'chatBotId', required: true, type: String })
  async addBotAgent(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('lpUserId') lpUserId: string,
    @Query('chatBotId') chatBotId: string,
    @Body() body: AddBotAgentDto
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.addBotAgent(accountId, lpToken.cbToken, lpToken.cbOrg, lpUserId, chatBotId, body);
  }

  // ============ Global Functions ============
  @Get('/:accountId/bots/:botId/global-functions')
  @ApiOperation({ summary: 'Get bot global functions' })
  async getGlobalFunctions(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('botId') botId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getGlobalFunctions(accountId, lpToken.cbToken, lpToken.cbOrg, botId);
  }

  // ============ Bot Environment ============
  @Get('/:accountId/bot-environment')
  @ApiOperation({ summary: 'Get bot environment variables' })
  async getBotEnvironment(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getBotEnvironment(accountId, lpToken.cbToken, lpToken.cbOrg);
  }

  // ============ LP Skills ============
  @Get('/:accountId/lp-skills')
  @ApiOperation({ summary: 'Get LP skills for account' })
  async getLPSkills(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getLPSkills(accountId, lpToken.cbToken, lpToken.cbOrg);
  }

  // ============ Credentials ============
  @Get('/:accountId/credentials')
  @ApiOperation({ summary: 'Get credentials for organization' })
  async getCredentials(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getCredentials(accountId, lpToken.cbToken, lpToken.cbOrg);
  }

  // ============ LP App Credentials ============
  @Get('/:accountId/chatbots/:chatBotId/lp-app-credentials')
  @ApiOperation({ summary: 'Get LP app credentials for chatbot' })
  async getLPAppCredentials(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Param('chatBotId') chatBotId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getLPAppCredentials(accountId, lpToken.cbToken, lpToken.cbOrg, chatBotId);
  }

  // ============ Dialog Templates ============
  @Get('/:accountId/dialog-templates')
  @ApiOperation({ summary: 'Get dialog template summary' })
  async getDialogTemplateSummary(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getDialogTemplateSummary(accountId, lpToken.cbToken, lpToken.cbOrg);
  }

  // ============ Bot Agents Status (All running bots) ============
  @Get('/:accountId/bot-agents-status')
  @ApiOperation({ summary: 'Get all bot agents status' })
  @ApiQuery({ name: 'environment', required: false, type: String })
  async getBotAgentsStatus(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Query('environment') environment: string = 'PRODUCTION'
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getAllBotAgentsStatus(accountId, lpToken.cbToken, lpToken.cbOrg, environment);
  }

  // ============ PCS Bots Status ============
  @Get('/:accountId/pcs-bots-status')
  @ApiOperation({ summary: 'Get PCS bots status' })
  @ApiQuery({ name: 'showBotsData', required: false, type: Boolean })
  async getPCSBotsStatus(
    @VerifyUser({ roles: ['OWNER', 'ADMIN'] }) lpToken: SentinelLpToken,
    @Param('accountId') accountId: string,
    @Query('showBotsData') showBotsData: boolean = true
  ): Promise<any> {
    if (!lpToken?.cbOrg || !lpToken?.cbToken) {
      throw new ForbiddenException('Conversation Builder credentials not found')
    }
    return this.service.getPCSBotsStatus(accountId, lpToken.cbToken, lpToken.cbOrg, showBotsData);
  }
}
