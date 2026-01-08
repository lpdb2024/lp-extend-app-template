/**
 * Connect to Messaging Controller
 * REST API endpoints for LivePerson Connect to Messaging (C2M)
 * Enables IVR/voice to messaging handoff
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ConnectToMessagingService } from './connect-to-messaging.service';
import {
  CreateConversationDto,
  SendMessageDto,
  CloseConversationDto,
  TransferConversationDto,
  CreateConversationResponseDto,
  SendMessageResponseDto,
  CloseConversationResponseDto,
  TransferConversationResponseDto,
  GetConversationResponseDto,
  GetCapabilitiesResponseDto,
} from './connect-to-messaging.dto';

@ApiTags('Connect to Messaging')
@ApiBearerAuth()
@Controller('api/v2/connect-to-messaging/:accountId')
export class ConnectToMessagingController {
  constructor(private readonly connectToMessagingService: ConnectToMessagingService) {}

  @Post('conversation')
  @ApiOperation({
    summary: 'Create messaging conversation',
    description: 'Create a new messaging conversation from IVR/voice channel. Returns conversation ID for subsequent operations.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
    type: CreateConversationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createConversation(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: CreateConversationDto,
  ): Promise<CreateConversationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.connectToMessagingService.createConversation(
      accountId,
      token,
      body,
    );

    return { data: response.data };
  }

  @Post('conversation/:conversationId/message')
  @ApiOperation({
    summary: 'Send message to conversation',
    description: 'Send a message to an existing messaging conversation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Message sent successfully',
    type: SendMessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async sendMessage(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: SendMessageDto,
  ): Promise<SendMessageResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.connectToMessagingService.sendMessage(
      accountId,
      conversationId,
      token,
      {
        conversationId,
        message: body.message,
        metadata: body.metadata,
      },
    );

    return { data: response.data };
  }

  @Post('conversation/:conversationId/close')
  @ApiOperation({
    summary: 'Close conversation',
    description: 'Close an active messaging conversation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID to close' })
  @ApiResponse({
    status: 200,
    description: 'Conversation closed successfully',
    type: CloseConversationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async closeConversation(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: CloseConversationDto,
  ): Promise<CloseConversationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.connectToMessagingService.closeConversation(
      accountId,
      conversationId,
      token,
      {
        conversationId,
        closeReason: body.closeReason,
        metadata: body.metadata,
      },
    );

    return { data: response.data };
  }

  @Post('conversation/:conversationId/transfer')
  @ApiOperation({
    summary: 'Transfer conversation to skill',
    description: 'Transfer the conversation to a different skill/agent group.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID to transfer' })
  @ApiResponse({
    status: 200,
    description: 'Conversation transferred successfully',
    type: TransferConversationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async transferConversation(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: TransferConversationDto,
  ): Promise<TransferConversationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.connectToMessagingService.transferConversation(
      accountId,
      conversationId,
      token,
      {
        conversationId,
        targetSkillId: body.targetSkillId,
        targetSkillName: body.targetSkillName,
        transferReason: body.transferReason,
        metadata: body.metadata,
      },
    );

    return { data: response.data };
  }

  @Get('conversation/:conversationId')
  @ApiOperation({
    summary: 'Get conversation details',
    description: 'Retrieve details and message history of a conversation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation details retrieved successfully',
    type: GetConversationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
  ): Promise<GetConversationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.connectToMessagingService.getConversation(
      accountId,
      conversationId,
      token,
    );

    return { data: response.data };
  }

  @Get('capabilities')
  @ApiOperation({
    summary: 'Get account capabilities',
    description: 'Retrieve Connect to Messaging capabilities enabled for the account.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Capabilities retrieved successfully',
    type: GetCapabilitiesResponseDto,
  })
  async getCapabilities(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<GetCapabilitiesResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.connectToMessagingService.getCapabilities(
      accountId,
      token,
    );

    return { data: response.data };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Post('conversation/simple')
  @ApiOperation({
    summary: 'Create simple conversation with text',
    description: 'Simplified endpoint to create a conversation with a text message. Ideal for basic IVR handoffs.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
    type: CreateConversationResponseDto,
  })
  async createSimpleConversation(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body()
    body: {
      skillId: number;
      messageText: string;
      consumerFirstName?: string;
      consumerLastName?: string;
      consumerPhone?: string;
      consumerEmail?: string;
      campaignId?: number;
      engagementId?: number;
    },
  ): Promise<CreateConversationResponseDto> {
    const token = this.extractToken(authorization);

    if (!body.skillId || !body.messageText) {
      throw new BadRequestException('skillId and messageText are required');
    }

    const response = await this.connectToMessagingService.createConversationWithText(
      accountId,
      token,
      body,
    );

    return { data: response.data };
  }

  @Post('conversation/:conversationId/message/simple')
  @ApiOperation({
    summary: 'Send simple text message',
    description: 'Simplified endpoint to send a plain text message to a conversation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Message sent successfully',
    type: SendMessageResponseDto,
  })
  async sendSimpleMessage(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: { text: string },
  ): Promise<SendMessageResponseDto> {
    const token = this.extractToken(authorization);

    if (!body.text) {
      throw new BadRequestException('text is required');
    }

    const response = await this.connectToMessagingService.sendTextMessage(
      accountId,
      conversationId,
      token,
      body.text,
    );

    return { data: response.data };
  }

  @Post('conversation/:conversationId/close/simple')
  @ApiOperation({
    summary: 'Close conversation with reason',
    description: 'Simplified endpoint to close a conversation with an optional reason.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation closed successfully',
    type: CloseConversationResponseDto,
  })
  async closeSimpleConversation(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: { closeReason?: string },
  ): Promise<CloseConversationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.connectToMessagingService.closeConversationWithReason(
      accountId,
      conversationId,
      token,
      body.closeReason,
    );

    return { data: response.data };
  }

  @Post('conversation/:conversationId/transfer/simple')
  @ApiOperation({
    summary: 'Transfer conversation to skill',
    description: 'Simplified endpoint to transfer a conversation to a different skill.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation transferred successfully',
    type: TransferConversationResponseDto,
  })
  async transferSimpleConversation(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: { targetSkillId: number; transferReason?: string },
  ): Promise<TransferConversationResponseDto> {
    const token = this.extractToken(authorization);

    if (!body.targetSkillId) {
      throw new BadRequestException('targetSkillId is required');
    }

    const response = await this.connectToMessagingService.transferToSkill(
      accountId,
      conversationId,
      token,
      body.targetSkillId,
      body.transferReason,
    );

    return { data: response.data };
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
