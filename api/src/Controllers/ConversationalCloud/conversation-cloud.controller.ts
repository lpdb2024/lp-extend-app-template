import {
  ValidationPipe,
  UsePipes,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Res,
  HttpCode,
  Query,
} from '@nestjs/common';
// import { CreateCatDto } from './dto/create-cat.dto';
// import { CatsService } from './cats.service';
import { ConversationCloudService } from './conversation-cloud.service';
// import { Response as Res } from 'express';
import { API_ROUTES, MANAGER_ROLES } from '../../constants/constants';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { USER_ROLES } from 'src/constants/constants';

import {
  SkillDto,
  AccountConfigDto,
  UserDto,
  PredefinedContentDto,
  MsgIntRequest,
  CampaignDto,
} from './conversation-cloud.dto';
import { User } from 'src/constants/constants';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AxiosResponse } from 'axios';
import { LpToken } from '../CCIDP/cc-idp.interfaces';
import { helper } from 'src/utils/HelperService';
import { VerifyToken } from 'src/auth/auth.decorators';
import { ConversationHistoryRecord } from './conversation-cloud.interfaces';

@Controller(API_ROUTES.CONVERSATION_CLOUD())
export class ConversationCloudController {
  constructor(private service: ConversationCloudService) {}

  // async getPrompts (accountId: string, token: string):
  @Get(':accountId/prompts')
  async getPrompts(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
  ): Promise<any> | null {
    if (!token) {
      throw new Error('No token found');
    }
    return this.service.getPrompts(
      accountId,
      helper.insertBearer(token.accessToken),
    );
  }

  @Post(':accountId/messaging-interactions')
  async getMessagingIteractions(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Body() body: MsgIntRequest,
    @Query('firstOnly') firstOnly: boolean,
  ): Promise<any> | null {
    return this.service.getAllMessagingInteractions(
      helper.insertBearer(token.accessToken),
      accountId,
      body,
      firstOnly,
    );
  }

  @Post(':accountId/conversations')
  async getConversationsByIds(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Body() body: { conversationIds: string[] },
  ): Promise<ConversationHistoryRecord[]> {
    if (!body.conversationIds || body.conversationIds.length === 0) {
      throw new Error('No conversation IDs provided');
    }
    return this.service.getConversationsByIds(
      helper.insertBearer(token.accessToken),
      accountId,
      body.conversationIds,
    );
  }

  @Get(':accountId/messaging-interactions/:conversationId')
  async getMessagingIteractionBy(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Param('conversationId') conversationId: string,
  ): Promise<any> | null {
    return this.service.getOneMessagingInteraction(
      helper.insertBearer(token.accessToken),
      accountId,
      conversationId,
    );
  }

  @Post(':accountId/process-conversations')
  async deployBot(
    @Param('accountId') accountId: string,
    @Headers('authorization') token: string,
    @Body() body: any,
  ): Promise<any> {
    return this.service.deployBot(helper.insertBearer(token), accountId, body);
  }

  @Post(':accountId/messaging-interactions-proxy/:conversationId')
  async getMessagingIteractionById(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
  ): Promise<any> {
    return this.service.messagingHistoryProxyOneConversation(
      accountId,
      conversationId,
      helper.insertBearer(token.accessToken),
    );
  }

  // async getAgentStats (accountId: string, agentId: string) {
  @Get(':accountId/agent-stats/:agentId')
  async getAgentStats(
    @Param('accountId') accountId: string,
    @Param('agentId') agentId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
  ): Promise<any> {
    return this.service.getAgentStats(
      helper.insertBearer(token.accessToken),
      accountId,
      agentId,
    );
  }
}
