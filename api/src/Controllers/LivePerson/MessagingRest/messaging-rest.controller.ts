/**
 * Messaging REST Controller
 * REST API endpoints for LivePerson Messaging REST API (Connector API)
 *
 * Provides endpoints for:
 * - Conversation lifecycle management
 * - Message sending (text, rich content, typing indicators)
 * - Consumer profile management
 * - Conversation routing and transfer
 */

import {
  Controller,
  Get,
  Post,
  Put,
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
import { MessagingRestService } from './messaging-rest.service';
import {
  CreateConversationBodyDto,
  SendTextMessageDto,
  SendStructuredContentDto,
  SendChatStateDto,
  SendAcceptStatusDto,
  CloseConversationDto,
  UpdateConversationFieldDto,
  TransferConversationDto,
  GetConversationsQueryDto,
  GetConversationQueryDto,
  CreateConversationResponseDto,
  GetConversationResponseDto,
  GetConversationsResponseDto,
  SendMessageResponseDto,
  MessagingResponseDto,
  ConsumerProfileResponseDto,
} from './messaging-rest.dto';

@ApiTags('Messaging REST API')
@ApiBearerAuth()
@Controller('api/v2/messaging-rest/:accountId')
export class MessagingRestController {
  constructor(private readonly messagingRestService: MessagingRestService) {}

  // ============================================
  // Conversation Management Endpoints
  // ============================================

  @Post('conversations')
  @ApiOperation({
    summary: 'Create new conversation',
    description: 'Opens a new messaging conversation with optional consumer information and routing.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
    type: CreateConversationResponseDto,
  })
  async createConversation(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: CreateConversationBodyDto,
  ): Promise<CreateConversationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingRestService.createConversation(
      accountId,
      token,
      body,
    );

    return {
      conversationId: response.data.body.conversationId,
      consumerId: response.data.body.consumerId,
    };
  }

  @Get('conversations')
  @ApiOperation({
    summary: 'Get all conversations',
    description: 'Retrieves list of conversations with optional filtering and pagination.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'List of conversations',
    type: GetConversationsResponseDto,
  })
  async getConversations(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: GetConversationsQueryDto,
  ): Promise<GetConversationsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingRestService.getConversations(
      accountId,
      token,
      query,
    );

    return response.data;
  }

  @Get('conversations/open')
  @ApiOperation({
    summary: 'Get open conversations',
    description: 'Retrieves only open/active conversations.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'List of open conversations',
    type: GetConversationsResponseDto,
  })
  async getOpenConversations(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('limit') limit?: string,
  ): Promise<GetConversationsResponseDto> {
    const token = this.extractToken(authorization);
    const limitNum = limit ? parseInt(limit, 10) : 50;

    const response = await this.messagingRestService.getOpenConversations(
      accountId,
      token,
      limitNum,
    );

    return response.data;
  }

  @Get('conversations/closed')
  @ApiOperation({
    summary: 'Get closed conversations',
    description: 'Retrieves only closed conversations.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'List of closed conversations',
    type: GetConversationsResponseDto,
  })
  async getClosedConversations(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('limit') limit?: string,
  ): Promise<GetConversationsResponseDto> {
    const token = this.extractToken(authorization);
    const limitNum = limit ? parseInt(limit, 10) : 50;

    const response = await this.messagingRestService.getClosedConversations(
      accountId,
      token,
      limitNum,
    );

    return response.data;
  }

  @Get('conversations/:conversationId')
  @ApiOperation({
    summary: 'Get conversation by ID',
    description: 'Retrieves detailed information about a specific conversation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation details',
    type: GetConversationResponseDto,
  })
  async getConversation(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Query() query: GetConversationQueryDto,
  ): Promise<GetConversationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingRestService.getConversation(
      accountId,
      conversationId,
      token,
      query,
    );

    return response.data;
  }

  @Post('conversations/:conversationId/close')
  @ApiOperation({
    summary: 'Close conversation',
    description: 'Closes an active conversation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation closed successfully',
    type: MessagingResponseDto,
  })
  async closeConversation(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: CloseConversationDto,
  ): Promise<MessagingResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingRestService.closeConversation(
      accountId,
      conversationId,
      token,
    );

    return {
      success: true,
      message: 'Conversation closed successfully',
      data: response.data,
    };
  }

  @Put('conversations/:conversationId/field')
  @ApiOperation({
    summary: 'Update conversation field',
    description: 'Updates a specific field in the conversation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Field updated successfully',
    type: MessagingResponseDto,
  })
  async updateConversationField(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: UpdateConversationFieldDto,
  ): Promise<MessagingResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingRestService.updateConversationField(
      accountId,
      conversationId,
      token,
      body.field,
      body.value,
    );

    return {
      success: true,
      message: 'Conversation field updated successfully',
      data: response.data,
    };
  }

  @Post('conversations/:conversationId/transfer')
  @ApiOperation({
    summary: 'Transfer conversation to skill',
    description: 'Transfers the conversation to a different skill.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation transferred successfully',
    type: MessagingResponseDto,
  })
  async transferConversation(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: TransferConversationDto,
  ): Promise<MessagingResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingRestService.transferConversation(
      accountId,
      conversationId,
      token,
      body.skillId,
    );

    return {
      success: true,
      message: 'Conversation transferred successfully',
      data: response.data,
    };
  }

  // ============================================
  // Message Sending Endpoints
  // ============================================

  @Post('conversations/:conversationId/messages/text')
  @ApiOperation({
    summary: 'Send text message',
    description: 'Sends a text message to the conversation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Message sent successfully',
    type: SendMessageResponseDto,
  })
  async sendTextMessage(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: SendTextMessageDto,
  ): Promise<SendMessageResponseDto> {
    const token = this.extractToken(authorization);

    if (!body.message || body.message.trim().length === 0) {
      throw new BadRequestException('Message text cannot be empty');
    }

    const response = await this.messagingRestService.sendTextMessage(
      accountId,
      conversationId,
      token,
      body.dialogId,
      body.message,
      body.contentType || 'text/plain',
    );

    return { sequence: response.data.body.sequence };
  }

  @Post('conversations/:conversationId/messages/structured')
  @ApiOperation({
    summary: 'Send structured content',
    description: 'Sends rich structured content (cards, buttons, etc.) to the conversation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Structured content sent successfully',
    type: SendMessageResponseDto,
  })
  async sendStructuredContent(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: SendStructuredContentDto,
  ): Promise<SendMessageResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingRestService.sendStructuredContent(
      accountId,
      conversationId,
      token,
      body.dialogId,
      body.content,
    );

    return { sequence: response.data.body.sequence };
  }

  @Post('conversations/:conversationId/chat-state')
  @ApiOperation({
    summary: 'Send chat state',
    description: 'Updates chat state (typing indicator, active, pause, etc.).',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Chat state sent successfully',
    type: SendMessageResponseDto,
  })
  async sendChatState(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: SendChatStateDto,
  ): Promise<SendMessageResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingRestService.sendChatState(
      accountId,
      conversationId,
      token,
      body.dialogId,
      body.chatState,
    );

    return { sequence: response.data.body.sequence };
  }

  @Post('conversations/:conversationId/accept-status')
  @ApiOperation({
    summary: 'Send accept status',
    description: 'Sends read receipt or acknowledgment for messages.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Accept status sent successfully',
    type: SendMessageResponseDto,
  })
  async sendAcceptStatus(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: SendAcceptStatusDto,
  ): Promise<SendMessageResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingRestService.sendAcceptStatus(
      accountId,
      conversationId,
      token,
      body.dialogId,
      body.status,
      body.sequenceList,
    );

    return { sequence: response.data.body.sequence };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Post('conversations/:conversationId/typing/start')
  @ApiOperation({
    summary: 'Start typing indicator',
    description: 'Shows typing indicator in the conversation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Typing indicator started',
    type: SendMessageResponseDto,
  })
  async startTyping(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body('dialogId') dialogId: string,
  ): Promise<SendMessageResponseDto> {
    const token = this.extractToken(authorization);

    if (!dialogId) {
      throw new BadRequestException('dialogId is required');
    }

    const response = await this.messagingRestService.sendTypingIndicator(
      accountId,
      conversationId,
      token,
      dialogId,
    );

    return { sequence: response.data.body.sequence };
  }

  @Post('conversations/:conversationId/typing/stop')
  @ApiOperation({
    summary: 'Stop typing indicator',
    description: 'Stops/hides typing indicator in the conversation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Typing indicator stopped',
    type: SendMessageResponseDto,
  })
  async stopTyping(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body('dialogId') dialogId: string,
  ): Promise<SendMessageResponseDto> {
    const token = this.extractToken(authorization);

    if (!dialogId) {
      throw new BadRequestException('dialogId is required');
    }

    const response = await this.messagingRestService.stopTypingIndicator(
      accountId,
      conversationId,
      token,
      dialogId,
    );

    return { sequence: response.data.body.sequence };
  }

  @Post('conversations/:conversationId/mark-read')
  @ApiOperation({
    summary: 'Mark messages as read',
    description: 'Marks multiple messages as read by sequence number.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Messages marked as read',
    type: SendMessageResponseDto,
  })
  async markAsRead(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Body() body: { dialogId: string; sequenceList: number[] },
  ): Promise<SendMessageResponseDto> {
    const token = this.extractToken(authorization);

    if (!body.dialogId || !body.sequenceList || body.sequenceList.length === 0) {
      throw new BadRequestException('dialogId and sequenceList are required');
    }

    const response = await this.messagingRestService.markAsRead(
      accountId,
      conversationId,
      token,
      body.dialogId,
      body.sequenceList,
    );

    return { sequence: response.data.body.sequence };
  }

  // ============================================
  // Consumer Profile Endpoints
  // ============================================

  @Get('consumers/:consumerId/profile')
  @ApiOperation({
    summary: 'Get consumer profile',
    description: 'Retrieves consumer profile data including SDEs.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'consumerId', description: 'Consumer ID' })
  @ApiResponse({
    status: 200,
    description: 'Consumer profile data',
    type: ConsumerProfileResponseDto,
  })
  async getConsumerProfile(
    @Param('accountId') accountId: string,
    @Param('consumerId') consumerId: string,
    @Headers('authorization') authorization: string,
  ): Promise<ConsumerProfileResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingRestService.getConsumerProfile(
      accountId,
      consumerId,
      token,
    );

    return response.data;
  }

  @Put('consumers/:consumerId/profile')
  @ApiOperation({
    summary: 'Update consumer profile',
    description: 'Updates consumer profile data including SDEs.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'consumerId', description: 'Consumer ID' })
  @ApiResponse({
    status: 200,
    description: 'Consumer profile updated',
    type: MessagingResponseDto,
  })
  async updateConsumerProfile(
    @Param('accountId') accountId: string,
    @Param('consumerId') consumerId: string,
    @Headers('authorization') authorization: string,
    @Body() body: { authenticatedData?: any; unAuthenticatedData?: any },
  ): Promise<MessagingResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingRestService.updateConsumerProfile(
      accountId,
      consumerId,
      token,
      body.authenticatedData,
      body.unAuthenticatedData,
    );

    return {
      success: true,
      message: 'Consumer profile updated successfully',
      data: response.data,
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
