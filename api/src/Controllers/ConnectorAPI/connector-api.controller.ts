import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ConnectorAPIService } from './connector-api.service'
import { API_ROUTES, MANAGER_ROLES } from '../../constants/constants';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UseGuards } from '@nestjs/common';


import {
  ApiOperation,
  ApiResponse
} from '@nestjs/swagger';
import { CronJobParams } from 'cron';

@Controller(API_ROUTES.CONNECTOR_API())
export class ConnectorAPIController {
  constructor(private service: ConnectorAPIService) {}

  @Post('/:accountId/consumer_jws')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get Consumer JWS' })
  @ApiResponse({ status: 200, description: 'The topics have been successfully retrieved.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getConsumerJWS(
    @Body() body: any,
    @Param('accountId') accountId: string
  ): Promise<any> {
    return await this.service.getConsumerJWS(accountId, body.token)
  }

  @Get('/:accountId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get AppJwt' })
  @ApiResponse({ status: 200, description: 'The topics have been successfully retrieved.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'U RForbidden.' })
  async getTopics(
    @Param('accountId') accountId: string
  ): Promise<any> {
    return await this.service.getAppJwt(accountId)
  }

  @Post('/:accountId/agent-message')
  @ApiOperation({ summary: 'Agent Message' })
  @ApiResponse({ status: 200, description: 'Agent message has been successfully sent.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async publishAgentMessage(
    @Body() body: any,
    @Param('accountId') accountId: string
  ): Promise<any> {
    return await this.service.publishAgentMessage(
      accountId,
      body.message,
      body.conversationId,
      body.dialogId
    )
  }

  @Post('/:accountId/create_conversation')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Create Conversation' })
  @ApiResponse({ status: 200, description: 'conversation has been successfully created.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createConversation(
    @Body() body: any,
    @Param('accountId') accountId: string
  ): Promise<any> {
    return await this.service.sendCreateConversationRequest(
      accountId,
      body.appJwt,
      body.consumerToken,
      body.skillId,
      body.externalConsumerId,
      '',
      ''
    )
  }

  @Post('/:accountId/content-event/conv-sim')
  @ApiOperation({ summary: 'Content Event' })
  @ApiResponse({ status: 200, description: 'Content Event has been successfully created.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async contentEvent(
    @Body() body: any,
    @Param('accountId') accountId: string
  ): Promise<any> {
    return await this.service.contentEvent(
      accountId,
      body
    )
  }

  @Post('/:accountId/state/conv-sim')
  @ApiOperation({ summary: 'Content Event' })
  @ApiResponse({ status: 200, description: 'Content Event has been successfully created.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async exChangeEvent(
    @Body() body: any,
    @Param('accountId') accountId: string
  ): Promise<any> {
    return await this.service.exChangeEvent(
      accountId,
      body
    )
  }


}
