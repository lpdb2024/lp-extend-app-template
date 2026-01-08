/**
 * Agent Metrics Service
 * Business logic for LivePerson Agent Metrics (Operational Realtime) API
 *
 * Service Domain: agentManagerWorkspace
 * Data Latency: Real-time
 * Purpose: Monitor agent status, load, and performance in real-time
 *
 * NOTE: This service uses the Key Messaging Metrics API (agent_view endpoint)
 * as the underlying data source, since the agent-metrics/* paths don't exist
 * in the LivePerson API.
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../APIService/api-service';
import { LPDomainService } from '../shared/lp-domain.service';
import { LPBaseService } from '../shared/lp-base.service';
import { LP_SERVICE_DOMAINS, LP_API_PATHS } from '../shared/lp-constants';
import { ILPResponse } from '../shared/lp-common.interfaces';
import {
  IAgentStatesResponse,
  IAgentLoadResponse,
  IAgentUtilizationResponse,
  IAgentActivityResponse,
  IAgentPerformanceResponse,
  IAgentTimeSeriesResponse,
  ISkillMetricsResponse,
  IAgentGroupMetricsResponse,
  IAgentStatesQuery,
  IAgentLoadQuery,
  IAgentUtilizationQuery,
  IAgentActivityQuery,
  IAgentPerformanceQuery,
  IAgentTimeSeriesQuery,
  ISkillMetricsQuery,
  IAgentGroupMetricsQuery,
  AggregationType,
  IntervalType,
} from './agent-metrics.interfaces';
import { KMMUserType } from '../KeyMessagingMetrics/key-messaging-metrics.interfaces';

@Injectable()
export class AgentMetricsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.AGENT_MANAGER;
  protected readonly defaultApiVersion = '1';

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(AgentMetricsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(AgentMetricsService.name);
  }

  /**
   * Helper to get time range for metrics queries
   */
  private getTimeRange(timeframeMinutes: number = 60): { from: number; to: number } {
    const now = Date.now();
    return {
      from: now - timeframeMinutes * 60 * 1000,
      to: now,
    };
  }

  /**
   * Get current agent states
   * Returns real-time status and state information for agents
   *
   * Uses the agent_view endpoint from Key Messaging Metrics API
   * Note: agent_view returns per-agent records with status info
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentStates(
    accountId: string,
    token: string,
    query: IAgentStatesQuery,
  ): Promise<ILPResponse<IAgentStatesResponse>> {
    const path = LP_API_PATHS.KEY_MESSAGING_METRICS.AGENT_VIEW(accountId);
    const timeRange = this.getTimeRange(60);

    const requestBody = {
      filters: {
        time: { from: timeRange.from, to: timeRange.to },
        userTypes: [KMMUserType.HUMAN],
        ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
        ...(query.skillIds && { skillIds: query.skillIds.split(',') }),
      },
      includeAgentMetadata: true,
    };

    this.logger.info(
      { accountId, agentIds: query.agentIds, status: query.status },
      'Getting agent states via agent_view',
    );

    return this.post<IAgentStatesResponse>(accountId, path, requestBody, token, {});
  }

  /**
   * Get agent conversation load
   * Returns current conversation count and capacity for agents
   *
   * Uses the agent_view endpoint from Key Messaging Metrics API
   * Note: agent_view returns per-agent records with load info
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentLoad(
    accountId: string,
    token: string,
    query: IAgentLoadQuery,
  ): Promise<ILPResponse<IAgentLoadResponse>> {
    const path = LP_API_PATHS.KEY_MESSAGING_METRICS.AGENT_VIEW(accountId);
    const timeRange = this.getTimeRange(60);

    const requestBody = {
      filters: {
        time: { from: timeRange.from, to: timeRange.to },
        userTypes: [KMMUserType.HUMAN],
        ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
        ...(query.skillIds && { skillIds: query.skillIds.split(',') }),
      },
      includeAgentMetadata: true,
    };

    this.logger.info(
      { accountId, agentIds: query.agentIds },
      'Getting agent load via agent_view',
    );

    return this.post<IAgentLoadResponse>(accountId, path, requestBody, token, {});
  }

  /**
   * Get agent utilization metrics
   * Returns time-based utilization metrics (online time, away time, etc.)
   *
   * Uses the agent_view endpoint from Key Messaging Metrics API
   * Note: agent_view returns per-agent records
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentUtilization(
    accountId: string,
    token: string,
    query: IAgentUtilizationQuery,
  ): Promise<ILPResponse<IAgentUtilizationResponse>> {
    const path = LP_API_PATHS.KEY_MESSAGING_METRICS.AGENT_VIEW(accountId);
    const timeRange = this.getTimeRange(query.timeframe || 60);

    const requestBody = {
      filters: {
        time: { from: timeRange.from, to: timeRange.to },
        userTypes: [KMMUserType.HUMAN],
        ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
      },
      includeAgentMetadata: true,
    };

    this.logger.info(
      { accountId, agentIds: query.agentIds, timeframe: query.timeframe },
      'Getting agent utilization via agent_view',
    );

    return this.post<IAgentUtilizationResponse>(accountId, path, requestBody, token, {});
  }

  /**
   * Get agent activity metrics
   * Returns conversation and message activity metrics
   *
   * Uses the agent_view endpoint from Key Messaging Metrics API
   * Note: agent_view returns per-agent records
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentActivity(
    accountId: string,
    token: string,
    query: IAgentActivityQuery,
  ): Promise<ILPResponse<IAgentActivityResponse>> {
    const path = LP_API_PATHS.KEY_MESSAGING_METRICS.AGENT_VIEW(accountId);
    const timeRange = this.getTimeRange(query.timeframe || 60);

    const requestBody = {
      filters: {
        time: { from: timeRange.from, to: timeRange.to },
        userTypes: [KMMUserType.HUMAN],
        ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
        ...(query.skillIds && { skillIds: query.skillIds.split(',') }),
      },
      includeAgentMetadata: true,
    };

    this.logger.info(
      { accountId, agentIds: query.agentIds, timeframe: query.timeframe },
      'Getting agent activity via agent_view',
    );

    return this.post<IAgentActivityResponse>(accountId, path, requestBody, token, {});
  }

  /**
   * Get comprehensive agent performance metrics
   * Returns combined state, load, utilization, and activity data
   *
   * Uses the agent_view endpoint from Key Messaging Metrics API
   * Note: agent_view returns per-agent records, not account-level aggregates
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentPerformance(
    accountId: string,
    token: string,
    query: IAgentPerformanceQuery,
  ): Promise<ILPResponse<IAgentPerformanceResponse>> {
    // Use agent_view endpoint which actually exists in LP API
    const path = LP_API_PATHS.KEY_MESSAGING_METRICS.AGENT_VIEW(accountId);

    const timeRange = this.getTimeRange(query.timeframe || 60);

    // Build the request body for agent_view POST endpoint
    // agent_view returns per-agent data, not account aggregates
    const requestBody = {
      filters: {
        time: {
          from: timeRange.from,
          to: timeRange.to,
        },
        userTypes: [KMMUserType.HUMAN],
        ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
        ...(query.groupIds && { agentGroupIds: query.groupIds.split(',') }),
      },
      includeAgentMetadata: true,
    };

    this.logger.info(
      { accountId, agentIds: query.agentIds, timeframe: query.timeframe },
      'Getting agent performance via agent_view',
    );

    return this.post<IAgentPerformanceResponse>(accountId, path, requestBody, token, {});
  }

  /**
   * Get agent metric time series
   * Returns time series data for a specific metric
   *
   * Uses the historical endpoint from Key Messaging Metrics API
   * Valid metricsToRetrieveByTime: closed_conversations, concluded_conversations, transfers
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentTimeSeries(
    accountId: string,
    token: string,
    query: IAgentTimeSeriesQuery,
  ): Promise<ILPResponse<IAgentTimeSeriesResponse>> {
    const path = LP_API_PATHS.KEY_MESSAGING_METRICS.HISTORICAL(accountId);
    const timeRange = this.getTimeRange(query.timeframe || 60);

    const requestBody = {
      filters: {
        time: { from: timeRange.from, to: timeRange.to },
        userTypes: [KMMUserType.HUMAN],
        ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
      },
      metricsToRetrieveByTime: ['closed_conversations', 'concluded_conversations', 'transfers'],
    };

    const additionalParams: Record<string, string> = {};
    if (query.interval) {
      additionalParams.interval = query.interval;
    }

    this.logger.info(
      {
        accountId,
        agentIds: query.agentIds,
        metricName: query.metricName,
        interval: query.interval,
      },
      'Getting agent time series via historical',
    );

    return this.post<IAgentTimeSeriesResponse>(accountId, path, requestBody, token, {
      additionalParams,
    });
  }

  /**
   * Get skill metrics
   * Returns aggregated metrics by skill
   *
   * Uses the metrics endpoint from Key Messaging Metrics API with skillId grouping
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getSkillMetrics(
    accountId: string,
    token: string,
    query: ISkillMetricsQuery,
  ): Promise<ILPResponse<ISkillMetricsResponse>> {
    const path = LP_API_PATHS.KEY_MESSAGING_METRICS.METRICS(accountId);
    const timeRange = this.getTimeRange(60);

    const requestBody = {
      filters: {
        time: { from: timeRange.from, to: timeRange.to },
        userTypes: [KMMUserType.HUMAN],
        ...(query.skillIds && { skillIds: query.skillIds.split(',') }),
      },
      groupBy: 'skillId',
      responseSections: ['groupBy'],
    };

    this.logger.info(
      { accountId, skillIds: query.skillIds },
      'Getting skill metrics via metrics endpoint',
    );

    return this.post<ISkillMetricsResponse>(accountId, path, requestBody, token, {});
  }

  /**
   * Get agent group metrics
   * Returns aggregated metrics by agent group
   *
   * Uses the metrics endpoint from Key Messaging Metrics API with agentGroupId grouping
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentGroupMetrics(
    accountId: string,
    token: string,
    query: IAgentGroupMetricsQuery,
  ): Promise<ILPResponse<IAgentGroupMetricsResponse>> {
    const path = LP_API_PATHS.KEY_MESSAGING_METRICS.METRICS(accountId);
    const timeRange = this.getTimeRange(60);

    const requestBody = {
      filters: {
        time: { from: timeRange.from, to: timeRange.to },
        userTypes: [KMMUserType.HUMAN],
        ...(query.groupIds && { agentGroupIds: query.groupIds.split(',') }),
      },
      groupBy: 'agentGroupId',
      responseSections: ['groupBy'],
    };

    this.logger.info(
      { accountId, groupIds: query.groupIds },
      'Getting agent group metrics via metrics endpoint',
    );

    return this.post<IAgentGroupMetricsResponse>(accountId, path, requestBody, token, {});
  }

  /**
   * Build base query parameters
   */
  private buildQueryParams(query: any): Record<string, string> {
    const params: Record<string, string> = {};

    if (query.v !== undefined) {
      params.v = String(query.v);
    }
    if (query.source) {
      params.source = query.source;
    }
    if (query.agentIds) {
      params.agentIds = query.agentIds;
    }
    if (query.groupIds) {
      params.groupIds = query.groupIds;
    }
    if (query.status) {
      params.status = query.status;
    }
    if (query.state) {
      params.state = query.state;
    }

    return params;
  }

  /**
   * Build timeframe query parameters
   */
  private buildTimeframeQueryParams(query: any): Record<string, string> {
    const params = this.buildQueryParams(query);

    if (query.fromMillis !== undefined) {
      params.fromMillis = String(query.fromMillis);
    }
    if (query.toMillis !== undefined) {
      params.toMillis = String(query.toMillis);
    }
    if (query.timeframe !== undefined) {
      params.timeframe = String(query.timeframe);
    }

    return params;
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get online agents summary
   * Returns all online agents with their current status
   */
  async getOnlineAgents(
    accountId: string,
    token: string,
    skillIds?: string,
  ): Promise<ILPResponse<IAgentStatesResponse>> {
    return this.getAgentStates(accountId, token, {
      v: 1,
      skillIds,
    });
  }

  /**
   * Get overloaded agents
   * Returns agents with high conversation load
   */
  async getOverloadedAgents(
    accountId: string,
    token: string,
    threshold: number = 80,
  ): Promise<ILPResponse<IAgentLoadResponse>> {
    return this.getAgentLoad(accountId, token, {
      v: 1,
      minLoad: threshold,
    });
  }

  /**
   * Get available agents
   * Returns agents with available capacity
   */
  async getAvailableAgents(
    accountId: string,
    token: string,
    skillIds?: string,
  ): Promise<ILPResponse<IAgentLoadResponse>> {
    return this.getAgentLoad(accountId, token, {
      v: 1,
      skillIds,
      maxLoad: 99,
    });
  }

  /**
   * Get agent performance summary for specific agents
   * Returns comprehensive metrics for the specified agents
   */
  async getAgentsSummary(
    accountId: string,
    token: string,
    agentIds: string,
    timeframe: number = 60,
  ): Promise<ILPResponse<IAgentPerformanceResponse>> {
    return this.getAgentPerformance(accountId, token, {
      v: 1,
      agentIds,
      timeframe,
      includeLoad: true,
      includeUtilization: true,
      includeActivity: true,
    });
  }

  /**
   * Get real-time agent activity trends
   * Returns time series data for active conversations
   */
  async getActivityTrends(
    accountId: string,
    token: string,
    timeframe: number = 60,
    interval: IntervalType = IntervalType.FIVE_MINUTES,
  ): Promise<ILPResponse<IAgentTimeSeriesResponse>> {
    return this.getAgentTimeSeries(accountId, token, {
      v: 1,
      metricName: 'activeConversations',
      aggregation: AggregationType.SUM,
      interval,
      timeframe,
    });
  }

  /**
   * Get skill capacity overview
   * Returns capacity and utilization metrics for all skills
   */
  async getSkillCapacity(
    accountId: string,
    token: string,
  ): Promise<ILPResponse<ISkillMetricsResponse>> {
    return this.getSkillMetrics(accountId, token, {
      v: 1,
      includeAgentBreakdown: false,
    });
  }

  /**
   * Get group performance overview
   * Returns performance metrics for all agent groups
   */
  async getGroupPerformance(
    accountId: string,
    token: string,
  ): Promise<ILPResponse<IAgentGroupMetricsResponse>> {
    return this.getAgentGroupMetrics(accountId, token, {
      v: 1,
      includeAgentBreakdown: false,
    });
  }
}
