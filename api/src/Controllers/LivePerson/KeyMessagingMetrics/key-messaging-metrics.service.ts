/**
 * Key Messaging Metrics Service
 * Business logic for LivePerson Key Messaging Metrics API
 *
 * Service Domain: agentManagerWorkspace
 * Data Retention: 14 days (24-hour query window for metrics/agent-view)
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../APIService/api-service';
import { LPDomainService } from '../shared/lp-domain.service';
import { LPBaseService } from '../shared/lp-base.service';
import { LP_SERVICE_DOMAINS, LP_API_PATHS } from '../shared/lp-constants';
import { ILPResponse } from '../shared/lp-common.interfaces';
import {
  IKMMMetricsRequest,
  IKMMMetricsResponse,
  IKMMMetricsQuery,
  IKMMAgentViewRequest,
  IKMMAgentViewResponse,
  IKMMAgentViewQuery,
  IKMMHistoricalRequest,
  IKMMHistoricalResponse,
  IKMMHistoricalQuery,
  KMMUserType,
  KMMGroupBy,
  KMMResponseSection,
} from './key-messaging-metrics.interfaces';

@Injectable()
export class KeyMessagingMetricsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.AGENT_MANAGER;
  protected readonly defaultApiVersion = '1';

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(KeyMessagingMetricsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(KeyMessagingMetricsService.name);
  }

  /**
   * Get messaging metrics
   * Retrieves core messaging metrics at account, skill, agent, or group level
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param request - Metrics request with filters and metrics to retrieve
   * @param query - Query parameters (offset, limit, sort)
   */
  async getMetrics(
    accountId: string,
    token: string,
    request: IKMMMetricsRequest,
    query?: IKMMMetricsQuery,
  ): Promise<ILPResponse<IKMMMetricsResponse>> {
    const path = LP_API_PATHS.KEY_MESSAGING_METRICS.METRICS(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info(
      { accountId, filters: request.filters, metrics: request.metricsToRetrieveByTime },
      'Getting messaging metrics',
    );

    return this.post<IKMMMetricsResponse>(accountId, path, request, token, {
      additionalParams,
    });
  }

  /**
   * Get agent view metrics
   * Retrieves agent-level metrics with optional metadata
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param request - Agent view request with filters and metrics
   * @param query - Query parameters (offset, limit, sort)
   */
  async getAgentView(
    accountId: string,
    token: string,
    request: IKMMAgentViewRequest,
    query?: IKMMAgentViewQuery,
  ): Promise<ILPResponse<IKMMAgentViewResponse>> {
    const path = LP_API_PATHS.KEY_MESSAGING_METRICS.AGENT_VIEW(accountId);
    const additionalParams = this.buildAgentViewQueryParams(query);

    this.logger.info(
      { accountId, filters: request.filters },
      'Getting agent view metrics',
    );

    return this.post<IKMMAgentViewResponse>(accountId, path, request, token, {
      additionalParams,
    });
  }

  /**
   * Get historical metrics
   * Retrieves time-series metric data (24-hour window)
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param request - Historical request with filters and metrics
   * @param query - Query parameters (interval)
   */
  async getHistorical(
    accountId: string,
    token: string,
    request: IKMMHistoricalRequest,
    query?: IKMMHistoricalQuery,
  ): Promise<ILPResponse<IKMMHistoricalResponse>> {
    const path = LP_API_PATHS.KEY_MESSAGING_METRICS.HISTORICAL(accountId);
    const additionalParams = this.buildHistoricalQueryParams(query);

    this.logger.info(
      { accountId, filters: request.filters, interval: query?.interval },
      'Getting historical metrics',
    );

    return this.post<IKMMHistoricalResponse>(accountId, path, request, token, {
      additionalParams,
    });
  }

  /**
   * Build query parameters for metrics endpoint
   */
  private buildQueryParams(query?: IKMMMetricsQuery): Record<string, string> {
    const params: Record<string, string> = {};

    if (query?.offset !== undefined) {
      params.offset = query.offset.toString();
    }

    if (query?.limit !== undefined) {
      params.limit = query.limit.toString();
    }

    if (query?.sort) {
      params.sort = query.sort;
    }

    return params;
  }

  /**
   * Build query parameters for agent view endpoint
   */
  private buildAgentViewQueryParams(query?: IKMMAgentViewQuery): Record<string, string> {
    const params: Record<string, string> = {};

    if (query?.offset !== undefined) {
      params.offset = query.offset.toString();
    }

    if (query?.limit !== undefined) {
      params.limit = query.limit.toString();
    }

    if (query?.sort) {
      params.sort = query.sort;
    }

    return params;
  }

  /**
   * Build query parameters for historical endpoint
   */
  private buildHistoricalQueryParams(query?: IKMMHistoricalQuery): Record<string, string> {
    const params: Record<string, string> = {};

    if (query?.interval !== undefined) {
      params.interval = query.interval.toString();
    }

    return params;
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get online agents count for skills
   */
  async getOnlineAgentsBySkill(
    accountId: string,
    token: string,
    skillIds: string[],
    timeFrom: number,
    timeTo: number,
  ): Promise<ILPResponse<IKMMMetricsResponse>> {
    return this.getMetrics(accountId, token, {
      filters: {
        time: { from: timeFrom, to: timeTo },
        skillIds,
        userTypes: [KMMUserType.HUMAN],
      },
      metricsToRetrieveCurrentValue: ['online_agents', 'away_agents', 'back_soon_agents'],
      groupBy: KMMGroupBy.SKILL_ID,
      responseSections: [KMMResponseSection.GROUP_BY],
    });
  }

  /**
   * Get queue health metrics
   */
  async getQueueMetrics(
    accountId: string,
    token: string,
    skillIds: string[],
    timeFrom: number,
    timeTo: number,
  ): Promise<ILPResponse<IKMMMetricsResponse>> {
    return this.getMetrics(accountId, token, {
      filters: {
        time: { from: timeFrom, to: timeTo },
        skillIds,
      },
      metricsToRetrieveCurrentValue: [
        'unassigned_conversations',
        'queue_wait_time_50th_percentile',
        'queue_wait_time_90th_percentile',
        'overdue_conversations_in_queue',
      ],
      groupBy: KMMGroupBy.SKILL_ID,
      responseSections: [KMMResponseSection.GROUP_BY],
    });
  }

  /**
   * Get CSAT and resolution metrics
   */
  async getResolutionMetrics(
    accountId: string,
    token: string,
    skillIds: string[],
    timeFrom: number,
    timeTo: number,
  ): Promise<ILPResponse<IKMMMetricsResponse>> {
    return this.getMetrics(accountId, token, {
      filters: {
        time: { from: timeFrom, to: timeTo },
        skillIds,
      },
      metricsToRetrieveByTime: [
        'csat',
        'fcr',
        'nps',
        'closed_conversations',
        'transfer_rate',
      ],
      groupBy: KMMGroupBy.SKILL_ID,
      responseSections: [KMMResponseSection.ALL, KMMResponseSection.GROUP_BY],
    });
  }

  /**
   * Get agent performance metrics
   */
  async getAgentPerformance(
    accountId: string,
    token: string,
    agentIds: string[],
    timeFrom: number,
    timeTo: number,
  ): Promise<ILPResponse<IKMMAgentViewResponse>> {
    return this.getAgentView(
      accountId,
      token,
      {
        filters: {
          time: { from: timeFrom, to: timeTo },
          agentIds,
          userTypes: [KMMUserType.HUMAN],
        },
        metricsToRetrieveByTime: [
          'closed_conversations',
          'avg_time_to_response',
          'csat',
          'fcr',
          'transfer_rate',
        ],
        metricsToRetrieveCurrentValue: [
          'agent_load',
          'active_conversations',
          'assigned_conversations',
        ],
        includeAgentMetadata: true,
      },
      { sort: 'agentLoad:desc' },
    );
  }

  /**
   * Get historical conversation trends
   */
  async getConversationTrends(
    accountId: string,
    token: string,
    skillIds: string[],
    timeFrom: number,
    timeTo: number,
    intervalMinutes?: number,
  ): Promise<ILPResponse<IKMMHistoricalResponse>> {
    return this.getHistorical(
      accountId,
      token,
      {
        filters: {
          time: { from: timeFrom, to: timeTo },
          skillIds,
        },
        metricsToRetrieveByTime: [
          'closed_conversations',
          'concluded_conversations',
          'transfers',
        ],
      },
      intervalMinutes ? { interval: intervalMinutes } : undefined,
    );
  }
}
