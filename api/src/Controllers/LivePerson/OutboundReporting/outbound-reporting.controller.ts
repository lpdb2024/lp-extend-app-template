/**
 * Outbound Reporting Controller
 * REST API endpoints for LivePerson Outbound Reporting API
 *
 * Service Domain: leDataReporting
 * Provides reporting data for outbound campaigns including delivery metrics,
 * performance analytics, and agent/skill activity
 */

import {
  Controller,
  Get,
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
import { OutboundReportingService } from './outbound-reporting.service';
import {
  CampaignListQueryDto,
  CampaignDetailsQueryDto,
  MessageDeliveriesQueryDto,
  CampaignPerformanceQueryDto,
  AgentOutboundActivityQueryDto,
  SkillOutboundMetricsQueryDto,
  CampaignListResponseDto,
  CampaignDetailsResponseDto,
  MessageDeliveriesResponseDto,
  CampaignPerformanceResponseDto,
  AgentOutboundActivityResponseDto,
  SkillOutboundMetricsResponseDto,
} from './outbound-reporting.dto';

@ApiTags('Outbound Reporting')
@ApiBearerAuth()
@Controller('api/v2/outbound-reporting/:accountId')
export class OutboundReportingController {
  constructor(private readonly outboundReportingService: OutboundReportingService) {}

  @Get('campaigns')
  @ApiOperation({
    summary: 'Get campaign list',
    description:
      'Retrieves list of outbound campaigns with filtering options. ' +
      'Supports pagination and sorting. ' +
      'Filter by status, type, channel, and time range.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign list data',
    type: CampaignListResponseDto,
  })
  async getCampaignList(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: CampaignListQueryDto,
  ): Promise<CampaignListResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.outboundReportingService.getCampaignList(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('campaigns/:campaignId')
  @ApiOperation({
    summary: 'Get campaign details',
    description:
      'Retrieves detailed information for a specific outbound campaign. ' +
      'Optionally includes detailed metrics breakdown by channel and time.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign identifier' })
  @ApiResponse({
    status: 200,
    description: 'Campaign details data',
    type: CampaignDetailsResponseDto,
  })
  async getCampaignDetails(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Query() query: CampaignDetailsQueryDto,
  ): Promise<CampaignDetailsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.outboundReportingService.getCampaignDetails(
      accountId,
      campaignId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('messages')
  @ApiOperation({
    summary: 'Get message deliveries',
    description:
      'Retrieves message delivery records with detailed status information. ' +
      'Filter by campaign, status, channel, consumer, and time range. ' +
      'Supports pagination and sorting.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Message deliveries data',
    type: MessageDeliveriesResponseDto,
  })
  async getMessageDeliveries(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: MessageDeliveriesQueryDto,
  ): Promise<MessageDeliveriesResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.outboundReportingService.getMessageDeliveries(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('campaigns/:campaignId/performance')
  @ApiOperation({
    summary: 'Get campaign performance',
    description:
      'Retrieves performance metrics over time for a specific campaign. ' +
      'Metrics are aggregated by configurable intervals (hourly, daily, weekly). ' +
      'Time range is required.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign identifier' })
  @ApiResponse({
    status: 200,
    description: 'Campaign performance data',
    type: CampaignPerformanceResponseDto,
  })
  async getCampaignPerformance(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Query() query: CampaignPerformanceQueryDto,
  ): Promise<CampaignPerformanceResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeRange(query.from, query.to);

    const response = await this.outboundReportingService.getCampaignPerformance(
      accountId,
      campaignId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('agents/activity')
  @ApiOperation({
    summary: 'Get agent outbound activity',
    description:
      'Retrieves agent activity metrics for outbound campaigns. ' +
      'Shows messages sent, conversations started, response rates, and conversion metrics. ' +
      'Filter by agent, agent group, and time range.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Agent outbound activity data',
    type: AgentOutboundActivityResponseDto,
  })
  async getAgentOutboundActivity(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AgentOutboundActivityQueryDto,
  ): Promise<AgentOutboundActivityResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeRange(query.from, query.to);

    const response = await this.outboundReportingService.getAgentOutboundActivity(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('skills/metrics')
  @ApiOperation({
    summary: 'Get skill outbound metrics',
    description:
      'Retrieves skill-level metrics for outbound campaigns. ' +
      'Shows campaign counts, message volumes, delivery rates, and response rates. ' +
      'Filter by skill and time range.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Skill outbound metrics data',
    type: SkillOutboundMetricsResponseDto,
  })
  async getSkillOutboundMetrics(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: SkillOutboundMetricsQueryDto,
  ): Promise<SkillOutboundMetricsResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeRange(query.from, query.to);

    const response = await this.outboundReportingService.getSkillOutboundMetrics(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Get('campaigns/active')
  @ApiOperation({
    summary: 'Get active campaigns',
    description: 'Convenience endpoint to retrieve all currently active campaigns',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Active campaigns',
    type: CampaignListResponseDto,
  })
  async getActiveCampaigns(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('source') source: string,
  ): Promise<CampaignListResponseDto> {
    const token = this.extractToken(authorization);

    if (!source) {
      throw new BadRequestException('source query parameter is required');
    }

    const response = await this.outboundReportingService.getActiveCampaigns(
      accountId,
      token,
      source,
    );

    return { data: response.data };
  }

  @Get('campaigns/:campaignId/failed-messages')
  @ApiOperation({
    summary: 'Get failed messages for campaign',
    description: 'Convenience endpoint to retrieve all failed messages for a campaign',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign identifier' })
  @ApiResponse({
    status: 200,
    description: 'Failed messages',
    type: MessageDeliveriesResponseDto,
  })
  async getFailedMessages(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Query('source') source: string,
  ): Promise<MessageDeliveriesResponseDto> {
    const token = this.extractToken(authorization);

    if (!source) {
      throw new BadRequestException('source query parameter is required');
    }

    const response = await this.outboundReportingService.getFailedMessages(
      accountId,
      campaignId,
      token,
      source,
    );

    return { data: response.data };
  }

  @Get('agents/:agentId/performance')
  @ApiOperation({
    summary: 'Get agent performance',
    description: 'Get outbound campaign performance metrics for a specific agent',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'agentId', description: 'Agent ID' })
  @ApiResponse({
    status: 200,
    description: 'Agent performance metrics',
    type: AgentOutboundActivityResponseDto,
  })
  async getAgentPerformance(
    @Param('accountId') accountId: string,
    @Param('agentId') agentId: string,
    @Headers('authorization') authorization: string,
    @Query('source') source: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<AgentOutboundActivityResponseDto> {
    const token = this.extractToken(authorization);

    if (!source) {
      throw new BadRequestException('source query parameter is required');
    }

    if (!from || !to) {
      throw new BadRequestException('from and to query parameters are required');
    }

    this.validateTimeRange(from, to);

    const response = await this.outboundReportingService.getAgentPerformance(
      accountId,
      parseInt(agentId, 10),
      token,
      source,
      from,
      to,
    );

    return { data: response.data };
  }

  @Get('skills/:skillId/performance')
  @ApiOperation({
    summary: 'Get skill performance',
    description: 'Get outbound campaign performance metrics for a specific skill',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({
    status: 200,
    description: 'Skill performance metrics',
    type: SkillOutboundMetricsResponseDto,
  })
  async getSkillPerformance(
    @Param('accountId') accountId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string,
    @Query('source') source: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<SkillOutboundMetricsResponseDto> {
    const token = this.extractToken(authorization);

    if (!source) {
      throw new BadRequestException('source query parameter is required');
    }

    if (!from || !to) {
      throw new BadRequestException('from and to query parameters are required');
    }

    this.validateTimeRange(from, to);

    const response = await this.outboundReportingService.getSkillPerformance(
      accountId,
      parseInt(skillId, 10),
      token,
      source,
      from,
      to,
    );

    return { data: response.data };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace('Bearer ', '');
  }

  private validateTimeRange(from?: string, to?: string): void {
    if (!from || !to) {
      throw new BadRequestException('Both from and to parameters are required');
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format for from or to parameters');
    }

    if (fromDate >= toDate) {
      throw new BadRequestException('from must be before to');
    }

    // Max 90 days span for outbound reporting
    const maxSpanMs = 90 * 24 * 60 * 60 * 1000;
    if (toDate.getTime() - fromDate.getTime() > maxSpanMs) {
      throw new BadRequestException('Time range cannot exceed 90 days');
    }
  }
}
