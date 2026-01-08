/**
 * Agent Metrics Controller
 * REST API endpoints for LivePerson Agent Metrics (Operational Realtime)
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
import { AgentMetricsService } from './agent-metrics.service';
import {
  AgentStatesQueryDto,
  AgentLoadQueryDto,
  AgentUtilizationQueryDto,
  AgentActivityQueryDto,
  AgentPerformanceQueryDto,
  AgentTimeSeriesQueryDto,
  SkillMetricsQueryDto,
  AgentGroupMetricsQueryDto,
  AgentStatesResponseDto,
  AgentLoadResponseDto,
  AgentUtilizationResponseDto,
  AgentActivityResponseDto,
  AgentPerformanceResponseDto,
  AgentTimeSeriesResponseDto,
  SkillMetricsResponseDto,
  AgentGroupMetricsResponseDto,
} from './agent-metrics.dto';

@ApiTags('Agent Metrics')
@ApiBearerAuth()
@Controller('api/v2/agent-metrics/:accountId')
export class AgentMetricsController {
  constructor(private readonly agentMetricsService: AgentMetricsService) {}

  @Get('states')
  @ApiOperation({
    summary: 'Get agent states',
    description: 'Returns real-time status and state information for agents (online, away, available, occupied, etc.).',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent states', type: AgentStatesResponseDto })
  async getAgentStates(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AgentStatesQueryDto,
  ): Promise<AgentStatesResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.agentMetricsService.getAgentStates(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('load')
  @ApiOperation({
    summary: 'Get agent conversation load',
    description: 'Returns current conversation count and capacity for agents. Useful for load balancing and capacity planning.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent load metrics', type: AgentLoadResponseDto })
  async getAgentLoad(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AgentLoadQueryDto,
  ): Promise<AgentLoadResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.agentMetricsService.getAgentLoad(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('utilization')
  @ApiOperation({
    summary: 'Get agent utilization metrics',
    description: 'Returns time-based utilization metrics including online time, away time, and utilization rate for a given timeframe.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent utilization metrics', type: AgentUtilizationResponseDto })
  async getAgentUtilization(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AgentUtilizationQueryDto,
  ): Promise<AgentUtilizationResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeframe(query.timeframe);

    const response = await this.agentMetricsService.getAgentUtilization(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Get agent activity metrics',
    description: 'Returns conversation and message activity metrics including conversations handled, messages sent/received, response times, and CSAT scores.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent activity metrics', type: AgentActivityResponseDto })
  async getAgentActivity(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AgentActivityQueryDto,
  ): Promise<AgentActivityResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeframe(query.timeframe);

    const response = await this.agentMetricsService.getAgentActivity(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('performance')
  @ApiOperation({
    summary: 'Get comprehensive agent performance',
    description: 'Returns combined state, load, utilization, and activity data for comprehensive agent performance monitoring.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent performance metrics', type: AgentPerformanceResponseDto })
  async getAgentPerformance(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AgentPerformanceQueryDto,
  ): Promise<AgentPerformanceResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeframe(query.timeframe);

    const response = await this.agentMetricsService.getAgentPerformance(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('time-series')
  @ApiOperation({
    summary: 'Get agent metric time series',
    description: 'Returns time series data for a specific metric at configurable intervals (1m, 5m, 15m, 30m, 1h, 1d).',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent time series data', type: AgentTimeSeriesResponseDto })
  async getAgentTimeSeries(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AgentTimeSeriesQueryDto,
  ): Promise<AgentTimeSeriesResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeframe(query.timeframe);

    const response = await this.agentMetricsService.getAgentTimeSeries(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('skills')
  @ApiOperation({
    summary: 'Get skill metrics',
    description: 'Returns aggregated metrics by skill including agent counts, capacity, and utilization.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Skill metrics', type: SkillMetricsResponseDto })
  async getSkillMetrics(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: SkillMetricsQueryDto,
  ): Promise<SkillMetricsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.agentMetricsService.getSkillMetrics(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('groups')
  @ApiOperation({
    summary: 'Get agent group metrics',
    description: 'Returns aggregated metrics by agent group including agent counts, status distribution, and performance.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent group metrics', type: AgentGroupMetricsResponseDto })
  async getAgentGroupMetrics(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AgentGroupMetricsQueryDto,
  ): Promise<AgentGroupMetricsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.agentMetricsService.getAgentGroupMetrics(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Get('online')
  @ApiOperation({
    summary: 'Get online agents',
    description: 'Returns all online agents with their current status. Convenience endpoint for quick overview.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Online agents', type: AgentStatesResponseDto })
  async getOnlineAgents(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('skillIds') skillIds?: string,
  ): Promise<AgentStatesResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.agentMetricsService.getOnlineAgents(
      accountId,
      token,
      skillIds,
    );

    return { data: response.data };
  }

  @Get('overloaded')
  @ApiOperation({
    summary: 'Get overloaded agents',
    description: 'Returns agents with high conversation load (default: >80%). Useful for identifying agents needing support.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Overloaded agents', type: AgentLoadResponseDto })
  async getOverloadedAgents(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('threshold') threshold?: string,
  ): Promise<AgentLoadResponseDto> {
    const token = this.extractToken(authorization);
    const thresholdNum = threshold ? parseInt(threshold, 10) : 80;

    const response = await this.agentMetricsService.getOverloadedAgents(
      accountId,
      token,
      thresholdNum,
    );

    return { data: response.data };
  }

  @Get('available')
  @ApiOperation({
    summary: 'Get available agents',
    description: 'Returns agents with available capacity for new conversations. Useful for routing decisions.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Available agents', type: AgentLoadResponseDto })
  async getAvailableAgents(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('skillIds') skillIds?: string,
  ): Promise<AgentLoadResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.agentMetricsService.getAvailableAgents(
      accountId,
      token,
      skillIds,
    );

    return { data: response.data };
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get agent summary',
    description: 'Returns comprehensive metrics for specific agents. Combines all metric types for a complete overview.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent summary', type: AgentPerformanceResponseDto })
  async getAgentsSummary(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('agentIds') agentIds?: string,
    @Query('timeframe') timeframe?: string,
  ): Promise<AgentPerformanceResponseDto> {
    const token = this.extractToken(authorization);

    if (!agentIds) {
      throw new BadRequestException('agentIds query parameter is required');
    }

    const timeframeNum = timeframe ? parseInt(timeframe, 10) : 60;
    this.validateTimeframe(timeframeNum);

    const response = await this.agentMetricsService.getAgentsSummary(
      accountId,
      token,
      agentIds,
      timeframeNum,
    );

    return { data: response.data };
  }

  @Get('trends/activity')
  @ApiOperation({
    summary: 'Get agent activity trends',
    description: 'Returns time series data for active conversations at 5-minute intervals. Useful for dashboard visualizations.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Activity trends', type: AgentTimeSeriesResponseDto })
  async getActivityTrends(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('timeframe') timeframe?: string,
    @Query('interval') interval?: string,
  ): Promise<AgentTimeSeriesResponseDto> {
    const token = this.extractToken(authorization);

    const timeframeNum = timeframe ? parseInt(timeframe, 10) : 60;
    this.validateTimeframe(timeframeNum);

    const response = await this.agentMetricsService.getActivityTrends(
      accountId,
      token,
      timeframeNum,
      interval as any,
    );

    return { data: response.data };
  }

  @Get('capacity/skills')
  @ApiOperation({
    summary: 'Get skill capacity overview',
    description: 'Returns capacity and utilization metrics for all skills. Useful for skill-based routing optimization.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Skill capacity metrics', type: SkillMetricsResponseDto })
  async getSkillCapacity(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<SkillMetricsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.agentMetricsService.getSkillCapacity(
      accountId,
      token,
    );

    return { data: response.data };
  }

  @Get('capacity/groups')
  @ApiOperation({
    summary: 'Get group performance overview',
    description: 'Returns performance metrics for all agent groups. Useful for comparing group performance.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Group performance metrics', type: AgentGroupMetricsResponseDto })
  async getGroupPerformance(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<AgentGroupMetricsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.agentMetricsService.getGroupPerformance(
      accountId,
      token,
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
    return authorization.replace(/^Bearer\s+/i, '');
  }

  private validateTimeframe(timeframe?: number): void {
    if (timeframe && timeframe > 1440) {
      throw new BadRequestException('Timeframe cannot exceed 1440 minutes (24 hours)');
    }
  }
}
