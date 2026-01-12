/**
 * Messaging Interactions (History) Controller
 * REST API endpoints for LivePerson Messaging History
 */

import {
  Controller,
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
  ApiQuery,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import {
  ConversationSearchRequestDto,
  ConversationSearchQueryDto,
  GetConversationByIdRequestDto,
  GetConversationsByConsumerRequestDto,
  ConsumerSearchQueryDto,
  ConversationSearchResponseDto,
  ConversationResponseDto,
} from './conversations.dto';

@ApiTags('Messaging History - Conversations')
@ApiBearerAuth()
@Controller('api/v2/messaging-history/:accountId/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('search')
  @ApiOperation({
    summary: 'Search conversations',
    description: 'Search conversation history with various filters. Returns conversations matching the specified criteria.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiQuery({ name: 'offset', required: false, description: 'Starting record position (default: 0)' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order (e.g., start:desc)' })
  @ApiQuery({ name: 'source', required: false, description: 'Source identifier (max 20 chars)' })
  @ApiResponse({ status: 200, description: 'Conversation search results', type: ConversationSearchResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchConversations(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: ConversationSearchRequestDto,
    @Query() query: ConversationSearchQueryDto,
  ): Promise<any> {
    const token = this.extractToken(authorization);

    if (!body.start || body.start.from === undefined || body.start.to === undefined) {
      throw new BadRequestException('Start time range (from and to) is required');
    }

    const response = await this.conversationsService.searchConversations(
      accountId,
      token,
      {
        start: body.start,
        status: body.status as ('OPEN' | 'CLOSE')[] | undefined,
        skillIds: body.skillIds,
        agentIds: body.agentIds,
        keyword: body.keyword,
        contentToRetrieve: body.contentToRetrieve as any,
        sort: (query.sort as any) || undefined,
        offset: query.offset,
        limit: undefined,
      },
    );

    return response.data;
  }

  @Post('by-id')
  @ApiOperation({
    summary: 'Get conversation(s) by ID',
    description: 'Retrieve specific conversation(s) by their IDs. Can retrieve up to 100 conversations at once.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiQuery({ name: 'source', required: false, description: 'Source identifier (max 20 chars)' })
  @ApiResponse({ status: 200, description: 'Conversation(s) data', type: ConversationResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getConversationById(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: GetConversationByIdRequestDto,
    @Query('source') source?: string,
  ): Promise<any> {
    const token = this.extractToken(authorization);

    if (!body.conversationId && !body.conversationIds?.length) {
      throw new BadRequestException('Either conversationId or conversationIds is required');
    }

    if (body.conversationIds && body.conversationIds.length > 100) {
      throw new BadRequestException('Maximum 100 conversation IDs allowed');
    }

    // Single conversation
    if (body.conversationId) {
      const response = await this.conversationsService.getConversationById(
        accountId,
        token,
        body.conversationId,
      );
      return response.data;
    }

    // Multiple conversations
    const response = await this.conversationsService.getConversationsByIds(
      accountId,
      token,
      body.conversationIds!,
    );
    return { conversationHistoryRecords: response.data };
  }

  @Post('by-consumer')
  @ApiOperation({
    summary: 'Get conversations by consumer ID',
    description: 'Retrieve all conversations for a specific consumer.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiQuery({ name: 'offset', required: false, description: 'Starting record position (default: 0, max: 100)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results per response (default: 50, max: 100)' })
  @ApiQuery({ name: 'source', required: false, description: 'Source identifier (max 20 chars)' })
  @ApiResponse({ status: 200, description: 'Consumer conversation history', type: ConversationSearchResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getConversationsByConsumer(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: GetConversationsByConsumerRequestDto,
    @Query() query: ConsumerSearchQueryDto,
  ): Promise<any> {
    const token = this.extractToken(authorization);

    if (!body.consumer) {
      throw new BadRequestException('Consumer ID is required');
    }

    if (!body.status || body.status.length === 0) {
      throw new BadRequestException('At least one status is required');
    }

    const response = await this.conversationsService.getConversationsByConsumer(
      accountId,
      token,
      body.consumer,
      {
        status: body.status as ('OPEN' | 'CLOSE')[] | undefined,
        limit: query.limit,
      },
    );

    return response.data;
  }

  @Post('open')
  @ApiOperation({
    summary: 'Get open conversations',
    description: 'Convenience endpoint to get all currently open conversations.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default: 100)' })
  @ApiResponse({ status: 200, description: 'Open conversations', type: ConversationSearchResponseDto })
  async getOpenConversations(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('limit') limit?: number,
    @Body() body?: { skillIds?: number[]; agentIds?: string[] },
  ): Promise<any> {
    const token = this.extractToken(authorization);

    const response = await this.conversationsService.getOpenConversations(
      accountId,
      token,
      {
        skillIds: body?.skillIds,
        agentIds: body?.agentIds,
        limit: limit ? Number(limit) : undefined,
      },
    );

    return response.data;
  }

  @Post('recent-closed')
  @ApiOperation({
    summary: 'Get recent closed conversations',
    description: 'Convenience endpoint to get recently closed conversations.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiQuery({ name: 'daysBack', required: false, description: 'Number of days back to search (default: 7)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default: 100)' })
  @ApiResponse({ status: 200, description: 'Recent closed conversations', type: ConversationSearchResponseDto })
  async getRecentClosedConversations(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('daysBack') daysBack?: number,
    @Query('limit') limit?: number,
    @Body() body?: { skillIds?: number[]; agentIds?: string[] },
  ): Promise<any> {
    const token = this.extractToken(authorization);

    const response = await this.conversationsService.getRecentClosedConversations(
      accountId,
      token,
      {
        daysBack: daysBack ? Number(daysBack) : undefined,
        skillIds: body?.skillIds,
        agentIds: body?.agentIds,
        limit: limit ? Number(limit) : undefined,
      },
    );

    return response.data;
  }

  @Post(':conversationId/transcript')
  @ApiOperation({
    summary: 'Get conversation with full transcript',
    description: 'Get a single conversation with all message records and participant info.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Conversation with transcript', type: ConversationResponseDto })
  async getConversationWithTranscript(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
  ): Promise<any> {
    const token = this.extractToken(authorization);

    const response = await this.conversationsService.getConversationWithTranscript(
      accountId,
      token,
      conversationId,
    );

    return response.data;
  }

  @Post('search-keyword')
  @ApiOperation({
    summary: 'Search conversations by keyword',
    description: 'Search for specific text/keyword within conversation messages.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Matching conversations', type: ConversationSearchResponseDto })
  async searchByKeyword(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: { keyword: string; startTime?: number; endTime?: number; status?: ('OPEN' | 'CLOSE')[]; limit?: number },
  ): Promise<any> {
    const token = this.extractToken(authorization);

    if (!body.keyword) {
      throw new BadRequestException('Keyword is required');
    }

    const response = await this.conversationsService.searchByKeyword(
      accountId,
      token,
      body.keyword,
      {
        startTime: body.startTime || Date.now() - 7 * 24 * 60 * 60 * 1000,
        endTime: body.endTime,
        status: body.status,
        limit: body.limit,
      },
    );

    return response.data;
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
