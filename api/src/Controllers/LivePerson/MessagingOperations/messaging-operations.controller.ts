/**
 * Messaging Operations Controller
 * REST API endpoints for LivePerson Messaging Operations (Real-time)
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
import { MessagingOperationsService } from './messaging-operations.service';
import {
  MessagingConversationQueryDto,
  MessagingConversationBodyDto,
  QueueHealthQueryDto,
  CurrentQueueHealthQueryDto,
  CSATDistributionQueryDto,
  SkillSegmentQueryDto,
  AgentSegmentQueryDto,
  MessagingConversationResponseDto,
  QueueHealthResponseDto,
  CSATDistributionResponseDto,
  SkillSegmentResponseDto,
  AgentSegmentResponseDto,
} from './messaging-operations.dto';

@ApiTags('Messaging Operations')
@ApiBearerAuth()
@Controller('api/v2/messaging-operations/:accountId')
export class MessagingOperationsController {
  constructor(private readonly messagingOperationsService: MessagingOperationsService) {}

  @Get('conversation')
  @ApiOperation({
    summary: 'Get messaging conversation metrics',
    description: 'Returns resolved conversation data for the account, filterable by skills/agents. Max timeframe: 1440 minutes (24 hours).',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Conversation metrics', type: MessagingConversationResponseDto })
  async getMessagingConversation(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: MessagingConversationQueryDto,
  ): Promise<MessagingConversationResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeframe(query.timeframe);

    const response = await this.messagingOperationsService.getMessagingConversation(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Post('conversation')
  @ApiOperation({
    summary: 'Get messaging conversation metrics (POST)',
    description: 'Alternative POST method for messaging conversation metrics. Parameters passed in body.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Conversation metrics', type: MessagingConversationResponseDto })
  async postMessagingConversation(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: MessagingConversationBodyDto,
  ): Promise<MessagingConversationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingOperationsService.postMessagingConversation(
      accountId,
      token,
      body,
    );

    return { data: response.data };
  }

  @Get('queue-health')
  @ApiOperation({
    summary: 'Get queue health metrics',
    description: 'Returns queue state data including wait times and conversation counts. Max timeframe: 1440 minutes.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Queue health metrics', type: QueueHealthResponseDto })
  async getQueueHealth(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: QueueHealthQueryDto,
  ): Promise<QueueHealthResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeframe(query.timeframe);

    const response = await this.messagingOperationsService.getQueueHealth(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('queue-health/current')
  @ApiOperation({
    summary: 'Get current queue health metrics',
    description: 'Returns real-time queue state. No timeframe needed - returns current snapshot.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Current queue health metrics', type: QueueHealthResponseDto })
  async getCurrentQueueHealth(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: CurrentQueueHealthQueryDto,
  ): Promise<QueueHealthResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingOperationsService.getCurrentQueueHealth(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('csat-distribution')
  @ApiOperation({
    summary: 'Get CSAT distribution metrics',
    description: 'Returns customer satisfaction score distribution. Max timeframe: 1440 minutes.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'CSAT distribution metrics', type: CSATDistributionResponseDto })
  async getCSATDistribution(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: CSATDistributionQueryDto,
  ): Promise<CSATDistributionResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeframe(query.timeframe);

    const response = await this.messagingOperationsService.getCSATDistribution(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('skill-segment')
  @ApiOperation({
    summary: 'Get skill segment metrics',
    description: 'Returns conversation segment data grouped by skill. Max timeframe: 1440 minutes.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Skill segment metrics', type: SkillSegmentResponseDto })
  async getSkillSegment(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: SkillSegmentQueryDto,
  ): Promise<SkillSegmentResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeframe(query.timeframe);

    const response = await this.messagingOperationsService.getSkillSegment(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('agent-segment')
  @ApiOperation({
    summary: 'Get agent segment metrics',
    description: 'Returns conversation segment data grouped by agent. Max timeframe: 1440 minutes.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent segment metrics', type: AgentSegmentResponseDto })
  async getAgentSegment(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AgentSegmentQueryDto,
  ): Promise<AgentSegmentResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeframe(query.timeframe);

    const response = await this.messagingOperationsService.getAgentSegment(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Get('queue-summary')
  @ApiOperation({
    summary: 'Get real-time queue summary',
    description: 'Simplified view of current queue state with queue and wait time metrics.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Queue summary', type: QueueHealthResponseDto })
  async getQueueSummary(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('skillIds') skillIds?: string,
  ): Promise<QueueHealthResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingOperationsService.getQueueSummary(
      accountId,
      token,
      skillIds,
    );

    return { data: response.data };
  }

  @Get('hourly-metrics')
  @ApiOperation({
    summary: 'Get hourly conversation metrics',
    description: 'Returns conversation metrics for past 24 hours, broken down by hour.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Hourly conversation metrics', type: MessagingConversationResponseDto })
  async getHourlyMetrics(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('skillIds') skillIds?: string,
    @Query('agentIds') agentIds?: string,
  ): Promise<MessagingConversationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingOperationsService.getHourlyConversationMetrics(
      accountId,
      token,
      { skillIds, agentIds },
    );

    return { data: response.data };
  }

  @Get('recent-csat')
  @ApiOperation({
    summary: 'Get recent CSAT scores',
    description: 'Returns CSAT distribution for the past hour.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Recent CSAT metrics', type: CSATDistributionResponseDto })
  async getRecentCSAT(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('skillIds') skillIds?: string,
    @Query('agentIds') agentIds?: string,
  ): Promise<CSATDistributionResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingOperationsService.getRecentCSAT(
      accountId,
      token,
      { skillIds, agentIds },
    );

    return { data: response.data };
  }

  @Get('agent-performance')
  @ApiOperation({
    summary: 'Get agent performance metrics',
    description: 'Returns agent segment metrics for past 24 hours.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent performance metrics', type: AgentSegmentResponseDto })
  async getAgentPerformance(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('agentIds') agentIds?: string,
    @Query('skillIds') skillIds?: string,
  ): Promise<AgentSegmentResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messagingOperationsService.getAgentPerformance(
      accountId,
      token,
      { agentIds, skillIds },
    );

    return { data: response.data };
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }

  private validateTimeframe(timeframe?: number): void {
    if (timeframe && timeframe > 1440) {
      throw new BadRequestException('Timeframe cannot exceed 1440 minutes (24 hours)');
    }
  }
}
