/**
 * Agent Activity Service
 * Business logic for LivePerson Agent Activity API
 *
 * Service Domain: agentActivityDomain
 * Data Latency: 1 hour SLA
 * Note: Not intended for real-time routing decisions
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../APIService/api-service';
import { LPDomainService } from '../shared/lp-domain.service';
import { LPBaseService } from '../shared/lp-base.service';
import { LP_SERVICE_DOMAINS, LP_API_PATHS } from '../shared/lp-constants';
import { ILPResponse } from '../shared/lp-common.interfaces';
import {
  IStatusChangesResponse,
  IStatusChangesQuery,
  IIntervalMetricsResponse,
  IIntervalMetricsQuery,
  IntervalGrouping,
  HandleTimeModel,
  IntervalDuration,
} from './agent-activity.interfaces';

@Injectable()
export class AgentActivityService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.AGENT_ACTIVITY;
  protected readonly defaultApiVersion = '2';

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(AgentActivityService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(AgentActivityService.name);
  }

  /**
   * Get agent status changes (V2 - flat response)
   * Tracks agent login/logout and status transitions
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getStatusChanges(
    accountId: string,
    token: string,
    query: IStatusChangesQuery,
  ): Promise<ILPResponse<IStatusChangesResponse>> {
    const path = LP_API_PATHS.AGENT_ACTIVITY.STATUS_CHANGES(accountId);
    const additionalParams = this.buildStatusChangesParams(query);

    this.logger.info(
      { accountId, source: query.source, from: query.from, to: query.to },
      'Getting agent status changes',
    );

    return this.get<IStatusChangesResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get interval metrics
   * Aggregated metrics at configurable intervals (15, 30, 60 min or 1 day)
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getIntervalMetrics(
    accountId: string,
    token: string,
    query: IIntervalMetricsQuery,
  ): Promise<ILPResponse<IIntervalMetricsResponse>> {
    const path = LP_API_PATHS.AGENT_ACTIVITY.INTERVAL_METRICS(accountId);
    const additionalParams = this.buildIntervalMetricsParams(query);

    this.logger.info(
      {
        accountId,
        source: query.source,
        grouping: query.grouping,
        metrics: query.metrics,
        path
      },
      'Getting interval metrics',
    );

    return this.get<IIntervalMetricsResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Build query parameters for status changes endpoint
   */
  private buildStatusChangesParams(query: IStatusChangesQuery): Record<string, string> {
    const params: Record<string, string> = {
      source: query.source,
    };

    if (query.v) {
      params.v = query.v;
    }

    if (query.from) {
      params.from = query.from;
    }

    if (query.to) {
      params.to = query.to;
    }

    if (query.agentId !== undefined) {
      params.agentId = query.agentId.toString();
    }

    if (query.groupId !== undefined) {
      params.groupId = query.groupId.toString();
    }

    if (query.empId) {
      params.empId = query.empId;
    }

    if (query.limit !== undefined) {
      params.limit = query.limit.toString();
    }

    if (query.offset !== undefined) {
      params.offset = query.offset.toString();
    }

    return params;
  }

  /**
   * Build query parameters for interval metrics endpoint
   */
  private buildIntervalMetricsParams(query: IIntervalMetricsQuery): Record<string, string> {
    const params: Record<string, string> = {
      v: query.v,
      source: query.source,
      handleTimeModel: query.handleTimeModel,
      metrics: query.metrics,
    };

    if (query.from) {
      params.from = query.from;
    }

    if (query.to) {
      params.to = query.to;
    }

    if (query.fromL !== undefined) {
      params.fromL = query.fromL.toString();
    }

    if (query.toL !== undefined) {
      params.toL = query.toL.toString();
    }

    if (query.pageSize !== undefined) {
      params.pageSize = query.pageSize.toString();
    }

    if (query.pageKey) {
      params.pageKey = query.pageKey;
    }

    if (query.intervalDuration !== undefined) {
      params.intervalDuration = query.intervalDuration.toString();
    }

    if (query.grouping) {
      params.grouping = query.grouping;
    }

    if (query.agentId !== undefined) {
      params.agentId = query.agentId.toString();
    }

    if (query.skillId !== undefined) {
      params.skillId = query.skillId.toString();
    }

    if (query.agentGroupId !== undefined) {
      params.agentGroupId = query.agentGroupId.toString();
    }

    if (query.conversationId) {
      params.conversationId = query.conversationId;
    }

    if (query.includeBotSkills !== undefined) {
      params.includeBotSkills = query.includeBotSkills.toString();
    }

    return params;
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get agent login/logout activity for a time range
   */
  async getAgentSessions(
    accountId: string,
    token: string,
    source: string,
    from: string,
    to: string,
    agentId?: number,
  ): Promise<ILPResponse<IStatusChangesResponse>> {
    return this.getStatusChanges(accountId, token, {
      source,
      v: '2',
      from,
      to,
      agentId,
      limit: 5000,
    });
  }

  /**
   * Get agent activity by group
   */
  async getGroupActivity(
    accountId: string,
    token: string,
    source: string,
    groupId: number,
    from: string,
    to: string,
  ): Promise<ILPResponse<IStatusChangesResponse>> {
    return this.getStatusChanges(accountId, token, {
      source,
      v: '2',
      from,
      to,
      groupId,
      limit: 5000,
    });
  }

  /**
   * Get handle time metrics by skill
   */
  async getSkillHandleTime(
    accountId: string,
    token: string,
    source: string,
    from: string,
    to: string,
    skillId?: number,
  ): Promise<ILPResponse<IIntervalMetricsResponse>> {
    return this.getIntervalMetrics(accountId, token, {
      v: '1',
      source,
      from,
      to,
      handleTimeModel: HandleTimeModel.EHT,
      metrics: 'handleTime,handledConversations,closedConversations',
      grouping: IntervalGrouping.SKILL,
      intervalDuration: IntervalDuration.ONE_HOUR,
      skillId,
    });
  }

  /**
   * Get agent productivity metrics
   */
  async getAgentProductivity(
    accountId: string,
    token: string,
    source: string,
    from: string,
    to: string,
    agentId?: number,
  ): Promise<ILPResponse<IIntervalMetricsResponse>> {
    return this.getIntervalMetrics(accountId, token, {
      v: '1',
      source,
      from,
      to,
      handleTimeModel: HandleTimeModel.IFT,
      metrics: 'handleTime,handledConversations,repliedConversations,agentMessages,workTime',
      grouping: IntervalGrouping.AGENT,
      intervalDuration: IntervalDuration.ONE_HOUR,
      agentId,
    });
  }
}
