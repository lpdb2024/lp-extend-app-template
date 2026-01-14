import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ConversationCloudService } from './conversation-cloud.service';
import { API_ROUTES } from '../../../constants/constants';
import { MsgIntRequest } from './conversation-cloud.dto';
import { helper } from 'src/utils/HelperService';
import { ConversationHistoryRecord } from './conversation-cloud.interfaces';

@ApiTags('Conversational Cloud')
@ApiBearerAuth()
@Controller(API_ROUTES.CONVERSATION_CLOUD())
export class ConversationCloudController {
  constructor(private service: ConversationCloudService) {}

  @Get(':accountId/prompts')
  @ApiOperation({ summary: 'Get prompts for account' })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getPrompts(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<any> {
    const token = this.extractToken(authorization, req);
    return this.service.getPrompts(
      accountId,
      helper.insertBearer(token.accessToken),
    );
  }

  @Post(':accountId/messaging-interactions')
  @ApiOperation({ summary: 'Get messaging interactions' })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getMessagingIteractions(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
    @Body() body: MsgIntRequest,
    @Query('firstOnly') firstOnly: boolean,
  ): Promise<any> {
    const token = this.extractToken(authorization, req);
    return this.service.getAllMessagingInteractions(
      helper.insertBearer(token.accessToken),
      accountId,
      body,
      firstOnly,
    );
  }

  @Post(':accountId/conversations')
  @ApiOperation({ summary: 'Get conversations by IDs' })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getConversationsByIds(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
    @Body() body: { conversationIds: string[] },
  ): Promise<ConversationHistoryRecord[]> {
    if (!body.conversationIds || body.conversationIds.length === 0) {
      throw new BadRequestException('No conversation IDs provided');
    }
    const token = this.extractToken(authorization, req);
    return this.service.getConversationsByIds(
      helper.insertBearer(token.accessToken),
      accountId,
      body.conversationIds,
    );
  }

  @Get(':accountId/messaging-interactions/:conversationId')
  @ApiOperation({ summary: 'Get messaging interaction by conversation ID' })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  async getMessagingIteractionBy(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<any> {
    const token = this.extractToken(authorization, req);
    return this.service.getOneMessagingInteraction(
      helper.insertBearer(token.accessToken),
      accountId,
      conversationId,
    );
  }

  @Post(':accountId/process-conversations')
  @ApiOperation({ summary: 'Process conversations (deploy bot)' })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async deployBot(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
    @Body() body: any,
  ): Promise<any> {
    const token = this.extractToken(authorization, req);
    return this.service.deployBot(
      helper.insertBearer(token.accessToken),
      accountId,
      body,
    );
  }

  @Post(':accountId/messaging-interactions-proxy/:conversationId')
  @ApiOperation({ summary: 'Proxy messaging interaction by conversation ID' })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  async getMessagingIteractionById(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<any> {
    const token = this.extractToken(authorization, req);
    return this.service.messagingHistoryProxyOneConversation(
      accountId,
      conversationId,
      helper.insertBearer(token.accessToken),
    );
  }

  @Get(':accountId/agent-stats/:agentId')
  @ApiOperation({ summary: 'Get agent stats' })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'agentId', description: 'Agent ID' })
  async getAgentStats(
    @Param('accountId') accountId: string,
    @Param('agentId') agentId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<any> {
    const token = this.extractToken(authorization, req);
    return this.service.getAgentStats(
      helper.insertBearer(token.accessToken),
      accountId,
      agentId,
    );
  }

  /**
   * Extract token from shell auth middleware (req.auth) or fallback to Authorization header
   */
  private extractToken(authorization: string, req?: any): { accessToken: string; extendToken?: string } {
    // First check if shell auth provided token via middleware (LpExtendAuthMiddleware sets req.auth)
    if (req?.auth?.lpAccessToken) {
      return {
        accessToken: req.auth.lpAccessToken,
        extendToken: req.headers?.['x-extend-token'],
      };
    }

    // Fall back to Authorization header
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return {
      accessToken: authorization.replace(/^Bearer\s+/i, ''),
      extendToken: req?.headers?.['x-extend-token'],
    };
  }
}
