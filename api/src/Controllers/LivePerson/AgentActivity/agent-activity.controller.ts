/**
 * Agent Activity Controller
 * REST API endpoints for LivePerson Agent Activity API
 *
 * Service Domain: agentActivityDomain
 * Data Latency: 1 hour SLA
 * Note: Not intended for real-time routing decisions
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
import { AgentActivityService } from './agent-activity.service';
import {
  StatusChangesQueryDto,
  IntervalMetricsQueryDto,
  StatusChangesResponseDto,
  IntervalMetricsResponseDto,
} from './agent-activity.dto';

@ApiTags('Agent Activity')
@ApiBearerAuth()
@Controller('api/v2/agent-activity/:accountId')
export class AgentActivityController {
  constructor(private readonly agentActivityService: AgentActivityService) {}

  @Get('status-changes')
  @ApiOperation({
    summary: 'Get agent status changes',
    description:
      'Track agent login/logout and status transitions. ' +
      'Data latency: 1 hour SLA. ' +
      'V2 returns flat response structure (not grouped by agent).',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Status changes data',
    type: StatusChangesResponseDto,
  })
  async getStatusChanges(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: StatusChangesQueryDto,
  ): Promise<StatusChangesResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeRange(query.from, query.to);

    const response = await this.agentActivityService.getStatusChanges(
      accountId,
      token,
      {
        ...query,
        v: query.v || '2', // Default to V2
      },
    );

    return { data: response.data };
  }

  @Get('interval-metrics')
  @ApiOperation({
    summary: 'Get interval metrics',
    description:
      'Aggregated agent activity metrics at configurable intervals. ' +
      'Data retention: 14 days. Max timeframe: 1 day. ' +
      'Returns 202 if processing is incomplete.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Interval metrics data',
    type: IntervalMetricsResponseDto,
  })
  @ApiResponse({
    status: 202,
    description: 'Partial processing - some intervals may still be in progress',
    type: IntervalMetricsResponseDto,
  })
  async getIntervalMetrics(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: IntervalMetricsQueryDto,
  ): Promise<IntervalMetricsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.agentActivityService.getIntervalMetrics(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Get('sessions')
  @ApiOperation({
    summary: 'Get agent sessions',
    description: 'Convenience endpoint to get agent login/logout activity',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agent sessions', type: StatusChangesResponseDto })
  async getAgentSessions(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('source') source: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('agentId') agentId?: string,
  ): Promise<StatusChangesResponseDto> {
    const token = this.extractToken(authorization);

    if (!source) {
      throw new BadRequestException('source query parameter is required');
    }

    if (!from || !to) {
      throw new BadRequestException('from and to query parameters are required');
    }

    const response = await this.agentActivityService.getAgentSessions(
      accountId,
      token,
      source,
      from,
      to,
      agentId ? parseInt(agentId, 10) : undefined,
    );

    return { data: response.data };
  }

  @Get('group-activity/:groupId')
  @ApiOperation({
    summary: 'Get group activity',
    description: 'Get agent status changes for a specific agent group',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'groupId', description: 'Agent group ID' })
  @ApiResponse({ status: 200, description: 'Group activity', type: StatusChangesResponseDto })
  async getGroupActivity(
    @Param('accountId') accountId: string,
    @Param('groupId') groupId: string,
    @Headers('authorization') authorization: string,
    @Query('source') source: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<StatusChangesResponseDto> {
    const token = this.extractToken(authorization);

    if (!source) {
      throw new BadRequestException('source query parameter is required');
    }

    if (!from || !to) {
      throw new BadRequestException('from and to query parameters are required');
    }

    const response = await this.agentActivityService.getGroupActivity(
      accountId,
      token,
      source,
      parseInt(groupId, 10),
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
    if ((from && !to) || (!from && to)) {
      throw new BadRequestException('Both from and to must be provided together');
    }

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (fromDate >= toDate) {
        throw new BadRequestException('from must be before to');
      }

      // Max 1 month span for status changes
      const maxSpanMs = 31 * 24 * 60 * 60 * 1000;
      if (toDate.getTime() - fromDate.getTime() > maxSpanMs) {
        throw new BadRequestException('Time range cannot exceed 1 month');
      }
    }
  }
}
