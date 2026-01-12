/**
 * Agent Metrics Service
 * Business logic for LivePerson Agent Metrics (Operational Realtime) API using SDK
 *
 * Service Domain: agentManagerWorkspace
 * Data Latency: Real-time
 * Purpose: Monitor agent status, load, and performance in real-time
 *
 * NOTE: This service uses the SDK's messaging.agentMetrics API which internally
 * uses the Key Messaging Metrics API (agent_view endpoint).
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Scopes } from '@lpextend/node-sdk';
import type { AgentMetrics, AgentMetricsQuery } from '@lpextend/node-sdk';
import { SDKProviderService, TokenInfo } from '../shared/sdk-provider.service';
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

/**
 * Response type for SDK operations
 */
export interface ILPResponse<T> {
  data: T;
  revision?: string;
  headers?: Record<string, string>;
}

@Injectable()
export class AgentMetricsService {
  constructor(
    private readonly sdkProvider: SDKProviderService,
    @InjectPinoLogger(AgentMetricsService.name)
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AgentMetricsService.name);
  }

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.AGENT_METRICS]);
  }

  /**
   * Get current agent metrics using SDK
   * Returns real-time status and metrics for agents
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentStates(
    accountId: string,
    token: TokenInfo | string,
    query: IAgentStatesQuery,
  ): Promise<ILPResponse<IAgentStatesResponse>> {
    const sdk = await this.getSDK(accountId, token);

    const params: AgentMetricsQuery = {
      includeAgentMetadata: true,
      ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
      ...(query.skillIds && { skillIds: query.skillIds.split(',').map(Number) }),
    };

    this.logger.info(
      { accountId, agentIds: query.agentIds, status: query.status },
      'Getting agent states via SDK',
    );

    const response = await sdk.messaging.agentMetrics.getMetrics(params);
    return { data: response.data as unknown as IAgentStatesResponse };
  }

  /**
   * Get agent conversation load using SDK
   * Returns current conversation count and capacity for agents
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentLoad(
    accountId: string,
    token: TokenInfo | string,
    query: IAgentLoadQuery,
  ): Promise<ILPResponse<IAgentLoadResponse>> {
    const sdk = await this.getSDK(accountId, token);

    const params: AgentMetricsQuery = {
      includeAgentMetadata: true,
      ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
      ...(query.skillIds && { skillIds: query.skillIds.split(',').map(Number) }),
    };

    this.logger.info(
      { accountId, agentIds: query.agentIds },
      'Getting agent load via SDK',
    );

    const response = await sdk.messaging.agentMetrics.getMetrics(params);
    return { data: response.data as unknown as IAgentLoadResponse };
  }

  /**
   * Get agent utilization metrics using SDK
   * Returns time-based utilization metrics (online time, away time, etc.)
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentUtilization(
    accountId: string,
    token: TokenInfo | string,
    query: IAgentUtilizationQuery,
  ): Promise<ILPResponse<IAgentUtilizationResponse>> {
    const sdk = await this.getSDK(accountId, token);

    const params: AgentMetricsQuery = {
      includeAgentMetadata: true,
      ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
    };

    this.logger.info(
      { accountId, agentIds: query.agentIds, timeframe: query.timeframe },
      'Getting agent utilization via SDK',
    );

    const response = await sdk.messaging.agentMetrics.getMetrics(params);
    return { data: response.data as unknown as IAgentUtilizationResponse };
  }

  /**
   * Get agent activity metrics using SDK
   * Returns conversation and message activity metrics
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentActivity(
    accountId: string,
    token: TokenInfo | string,
    query: IAgentActivityQuery,
  ): Promise<ILPResponse<IAgentActivityResponse>> {
    const sdk = await this.getSDK(accountId, token);

    const params: AgentMetricsQuery = {
      includeAgentMetadata: true,
      ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
      ...(query.skillIds && { skillIds: query.skillIds.split(',').map(Number) }),
    };

    this.logger.info(
      { accountId, agentIds: query.agentIds, timeframe: query.timeframe },
      'Getting agent activity via SDK',
    );

    const response = await sdk.messaging.agentMetrics.getMetrics(params);
    return { data: response.data as unknown as IAgentActivityResponse };
  }

  /**
   * Get comprehensive agent performance metrics using SDK
   * Returns combined state, load, utilization, and activity data
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentPerformance(
    accountId: string,
    token: TokenInfo | string,
    query: IAgentPerformanceQuery,
  ): Promise<ILPResponse<IAgentPerformanceResponse>> {
    const sdk = await this.getSDK(accountId, token);

    const params: AgentMetricsQuery = {
      includeAgentMetadata: true,
      ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
      ...(query.groupIds && { agentGroupIds: query.groupIds.split(',').map(Number) }),
    };

    this.logger.info(
      { accountId, agentIds: query.agentIds, timeframe: query.timeframe },
      'Getting agent performance via SDK',
    );

    const response = await sdk.messaging.agentMetrics.getMetrics(params);
    return { data: response.data as unknown as IAgentPerformanceResponse };
  }

  /**
   * Get agent metrics for specific agent using SDK
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param agentId - Agent ID
   */
  async getAgentMetricsById(
    accountId: string,
    token: TokenInfo | string,
    agentId: string,
  ): Promise<ILPResponse<AgentMetrics>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, agentId },
      'Getting agent metrics by ID via SDK',
    );

    const response = await sdk.messaging.agentMetrics.getAgentMetrics(agentId);
    return { data: response.data };
  }

  /**
   * Get agent metric time series
   * Note: This method uses the SDK's agent metrics, which may not have full time series support
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentTimeSeries(
    accountId: string,
    token: TokenInfo | string,
    query: IAgentTimeSeriesQuery,
  ): Promise<ILPResponse<IAgentTimeSeriesResponse>> {
    const sdk = await this.getSDK(accountId, token);

    const params: AgentMetricsQuery = {
      includeAgentMetadata: true,
      ...(query.agentIds && { agentIds: query.agentIds.split(',') }),
    };

    this.logger.info(
      {
        accountId,
        agentIds: query.agentIds,
        metricName: query.metricName,
        interval: query.interval,
      },
      'Getting agent time series via SDK',
    );

    const response = await sdk.messaging.agentMetrics.getMetrics(params);
    return { data: response.data as unknown as IAgentTimeSeriesResponse };
  }

  /**
   * Get skill metrics using SDK
   * Returns aggregated metrics by skill
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getSkillMetrics(
    accountId: string,
    token: TokenInfo | string,
    query: ISkillMetricsQuery,
  ): Promise<ILPResponse<ISkillMetricsResponse>> {
    const sdk = await this.getSDK(accountId, token);

    const skillId = query.skillIds ? Number(query.skillIds.split(',')[0]) : undefined;

    this.logger.info(
      { accountId, skillIds: query.skillIds },
      'Getting skill metrics via SDK',
    );

    if (skillId) {
      const response = await sdk.messaging.agentMetrics.getBySkill(skillId);
      return { data: response.data as unknown as ISkillMetricsResponse };
    }

    const response = await sdk.messaging.agentMetrics.getMetrics({});
    return { data: response.data as unknown as ISkillMetricsResponse };
  }

  /**
   * Get agent group metrics using SDK
   * Returns aggregated metrics by agent group
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentGroupMetrics(
    accountId: string,
    token: TokenInfo | string,
    query: IAgentGroupMetricsQuery,
  ): Promise<ILPResponse<IAgentGroupMetricsResponse>> {
    const sdk = await this.getSDK(accountId, token);

    const groupId = query.groupIds ? Number(query.groupIds.split(',')[0]) : undefined;

    this.logger.info(
      { accountId, groupIds: query.groupIds },
      'Getting agent group metrics via SDK',
    );

    if (groupId) {
      const response = await sdk.messaging.agentMetrics.getByAgentGroup(groupId);
      return { data: response.data as unknown as IAgentGroupMetricsResponse };
    }

    const response = await sdk.messaging.agentMetrics.getMetrics({});
    return { data: response.data as unknown as IAgentGroupMetricsResponse };
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
