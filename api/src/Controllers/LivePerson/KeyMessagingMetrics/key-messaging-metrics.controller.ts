/**
 * Key Messaging Metrics Controller
 * REST API endpoints for LivePerson Key Messaging Metrics
 *
 * Service Domain: agentManagerWorkspace
 * Data Retention: 14 days (24-hour query window for metrics/agent-view)
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
} from '@nestjs/swagger';
import { KeyMessagingMetricsService } from './key-messaging-metrics.service';
import {
  KMMMetricsRequestDto,
  KMMMetricsQueryDto,
  KMMMetricsResponseDto,
  KMMAgentViewRequestDto,
  KMMAgentViewQueryDto,
  KMMAgentViewResponseDto,
  KMMHistoricalRequestDto,
  KMMHistoricalQueryDto,
  KMMHistoricalResponseDto,
} from './key-messaging-metrics.dto';

@ApiTags('Key Messaging Metrics')
@ApiBearerAuth()
@Controller('api/v2/key-messaging-metrics/:accountId')
export class KeyMessagingMetricsController {
  constructor(private readonly kmmService: KeyMessagingMetricsService) {}

  @Post('metrics')
  @ApiOperation({
    summary: 'Get messaging metrics',
    description:
      'Retrieve core messaging metrics at account, skill, agent, or group level. ' +
      'Time range is limited to the last 24 hours. Data retention: 14 days.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Metrics data',
    type: KMMMetricsResponseDto,
  })
  async getMetrics(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: KMMMetricsRequestDto,
    @Query() query: KMMMetricsQueryDto,
  ): Promise<KMMMetricsResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeRange(body.filters.time.from, body.filters.time.to);

    const response = await this.kmmService.getMetrics(
      accountId,
      token,
      body,
      query,
    );

    return { data: response.data };
  }

  @Post('agent-view')
  @ApiOperation({
    summary: 'Get agent view metrics',
    description:
      'Retrieve agent-level metrics with optional metadata. ' +
      'Returns logged-in agents by default when no status filters applied. ' +
      'Time range is limited to the last 24 hours.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Agent view data',
    type: KMMAgentViewResponseDto,
  })
  async getAgentView(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: KMMAgentViewRequestDto,
    @Query() query: KMMAgentViewQueryDto,
  ): Promise<KMMAgentViewResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeRange(body.filters.time.from, body.filters.time.to);
    this.validateAgentViewPagination(query.offset, query.limit);

    const response = await this.kmmService.getAgentView(
      accountId,
      token,
      body,
      query,
    );

    return { data: response.data };
  }

  @Post('historical')
  @ApiOperation({
    summary: 'Get historical metrics',
    description:
      'Retrieve time-series metric data. Maximum 100 data points returned. ' +
      'Time range is limited to 24 hours. If interval not specified, it is auto-calculated.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Historical data',
    type: KMMHistoricalResponseDto,
  })
  async getHistorical(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: KMMHistoricalRequestDto,
    @Query() query: KMMHistoricalQueryDto,
  ): Promise<KMMHistoricalResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeRange(body.filters.time.from, body.filters.time.to);

    const response = await this.kmmService.getHistorical(
      accountId,
      token,
      body,
      query,
    );

    return { data: response.data };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Post('online-agents')
  @ApiOperation({
    summary: 'Get online agents by skill',
    description: 'Quick endpoint to get agent availability metrics grouped by skill',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Online agent metrics', type: KMMMetricsResponseDto })
  async getOnlineAgentsBySkill(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: { skillIds: string[]; timeFrom: number; timeTo: number },
  ): Promise<KMMMetricsResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeRange(body.timeFrom, body.timeTo);

    const response = await this.kmmService.getOnlineAgentsBySkill(
      accountId,
      token,
      body.skillIds,
      body.timeFrom,
      body.timeTo,
    );

    return { data: response.data };
  }

  @Post('queue-metrics')
  @ApiOperation({
    summary: 'Get queue health metrics',
    description: 'Quick endpoint to get queue wait times and unassigned conversations',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Queue metrics', type: KMMMetricsResponseDto })
  async getQueueMetrics(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: { skillIds: string[]; timeFrom: number; timeTo: number },
  ): Promise<KMMMetricsResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeRange(body.timeFrom, body.timeTo);

    const response = await this.kmmService.getQueueMetrics(
      accountId,
      token,
      body.skillIds,
      body.timeFrom,
      body.timeTo,
    );

    return { data: response.data };
  }

  @Post('resolution-metrics')
  @ApiOperation({
    summary: 'Get CSAT and resolution metrics',
    description: 'Quick endpoint to get CSAT, FCR, NPS and transfer rate metrics',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Resolution metrics', type: KMMMetricsResponseDto })
  async getResolutionMetrics(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: { skillIds: string[]; timeFrom: number; timeTo: number },
  ): Promise<KMMMetricsResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeRange(body.timeFrom, body.timeTo);

    const response = await this.kmmService.getResolutionMetrics(
      accountId,
      token,
      body.skillIds,
      body.timeFrom,
      body.timeTo,
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

  private validateTimeRange(from: number, to: number): void {
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const range = to - from;

    if (range > twentyFourHoursMs) {
      throw new BadRequestException(
        'Time range cannot exceed 24 hours for metrics and agent-view endpoints',
      );
    }

    if (from >= to) {
      throw new BadRequestException('Time range "from" must be before "to"');
    }
  }

  private validateAgentViewPagination(offset?: number, limit?: number): void {
    const effectiveOffset = offset ?? 0;
    const effectiveLimit = limit ?? 50;

    if (effectiveOffset + effectiveLimit > 1000) {
      throw new BadRequestException(
        'Agent view pagination: offset + limit cannot exceed 1000',
      );
    }
  }
}
