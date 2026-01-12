/**
 * Agent Activity Service
 * Business logic for LivePerson Agent Activity API using SDK
 *
 * Service Domain: agentActivityDomain
 * Data Latency: 1 hour SLA
 * Note: Not intended for real-time routing decisions
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Scopes } from '@lpextend/node-sdk';
import type { AgentActivity, AgentActivityQuery } from '@lpextend/node-sdk';
import { SDKProviderService, TokenInfo } from '../shared/sdk-provider.service';
import {
  IStatusChangesResponse,
  IStatusChangesQuery,
  IIntervalMetricsResponse,
  IIntervalMetricsQuery,
  IntervalGrouping,
  HandleTimeModel,
  IntervalDuration,
} from './agent-activity.interfaces';

/**
 * Response type for SDK operations
 */
export interface ILPResponse<T> {
  data: T;
  revision?: string;
  headers?: Record<string, string>;
}

@Injectable()
export class AgentActivityService {
  constructor(
    private readonly sdkProvider: SDKProviderService,
    @InjectPinoLogger(AgentActivityService.name)
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AgentActivityService.name);
  }

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.AGENT_ACTIVITY]);
  }

  /**
   * Get agent status changes using SDK
   * Tracks agent login/logout and status transitions
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getStatusChanges(
    accountId: string,
    token: TokenInfo | string,
    query: IStatusChangesQuery,
  ): Promise<ILPResponse<IStatusChangesResponse>> {
    const sdk = await this.getSDK(accountId, token);

    const params: AgentActivityQuery = {
      from: query.from ? new Date(query.from).getTime() : Date.now() - 24 * 60 * 60 * 1000,
      to: query.to ? new Date(query.to).getTime() : Date.now(),
      ...(query.agentId && { agentIds: [String(query.agentId)] }),
      ...(query.groupId && { agentGroupIds: [query.groupId] }),
    };

    this.logger.info(
      { accountId, source: query.source, from: query.from, to: query.to },
      'Getting agent status changes via SDK',
    );

    const response = await sdk.messaging.agentActivity.query(params);
    return { data: response.data as unknown as IStatusChangesResponse };
  }

  /**
   * Get interval metrics using SDK
   * Aggregated metrics at configurable intervals (15, 30, 60 min or 1 day)
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getIntervalMetrics(
    accountId: string,
    token: TokenInfo | string,
    query: IIntervalMetricsQuery,
  ): Promise<ILPResponse<IIntervalMetricsResponse>> {
    const sdk = await this.getSDK(accountId, token);

    const params: AgentActivityQuery = {
      from: query.from ? new Date(query.from).getTime() : (query.fromL || Date.now() - 24 * 60 * 60 * 1000),
      to: query.to ? new Date(query.to).getTime() : (query.toL || Date.now()),
      ...(query.agentId && { agentIds: [String(query.agentId)] }),
      ...(query.agentGroupId && { agentGroupIds: [query.agentGroupId] }),
      ...(query.skillId && { skillIds: [query.skillId] }),
    };

    this.logger.info(
      {
        accountId,
        source: query.source,
        grouping: query.grouping,
        metrics: query.metrics,
      },
      'Getting interval metrics via SDK',
    );

    const response = await sdk.messaging.agentActivity.query(params);
    return { data: response.data as unknown as IIntervalMetricsResponse };
  }

  /**
   * Get agent activity for a specific agent using SDK
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param agentId - Agent ID
   * @param from - Start timestamp (ms)
   * @param to - End timestamp (ms)
   */
  async getAgentActivityById(
    accountId: string,
    token: TokenInfo | string,
    agentId: string,
    from: number,
    to: number,
  ): Promise<ILPResponse<AgentActivity>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, agentId, from, to },
      'Getting agent activity by ID via SDK',
    );

    const response = await sdk.messaging.agentActivity.getAgentActivity(agentId, from, to);
    return { data: response.data };
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get agent login/logout activity for a time range
   */
  async getAgentSessions(
    accountId: string,
    token: TokenInfo | string,
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
    token: TokenInfo | string,
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
    token: TokenInfo | string,
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
    token: TokenInfo | string,
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
