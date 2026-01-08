/**
 * Messaging Operations Service
 * Business logic for LivePerson Messaging Operations (Real-time) API
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../APIService/api-service';
import { LPDomainService } from '../shared/lp-domain.service';
import { LPBaseService } from '../shared/lp-base.service';
import {
  LP_SERVICE_DOMAINS,
  LP_API_VERSIONS,
  LP_API_PATHS,
} from '../shared/lp-constants';
import { ILPResponse, ILPRequestOptions } from '../shared/lp-common.interfaces';
import {
  IMessagingConversationResponse,
  IQueueHealthResponse,
  ICSATDistributionResponse,
  ISkillSegmentResponse,
  IAgentSegmentResponse,
  IMessagingConversationQuery,
  IQueueHealthQuery,
  ICurrentQueueHealthQuery,
  ICSATDistributionQuery,
  ISkillSegmentQuery,
  IAgentSegmentQuery,
} from './messaging-operations.interfaces';

@Injectable()
export class MessagingOperationsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.LE_DATA_REPORTING;
  protected readonly defaultApiVersion = LP_API_VERSIONS.MSG_OPERATIONS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(MessagingOperationsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(MessagingOperationsService.name);
  }

  /**
   * Get messaging conversation metrics (GET method)
   * Returns resolved conversation data for the account/skills/agents
   */
  async getMessagingConversation(
    accountId: string,
    token: string,
    query: IMessagingConversationQuery,
  ): Promise<ILPResponse<IMessagingConversationResponse>> {
    const path = LP_API_PATHS.MSG_OPERATIONS.CONVERSATION(accountId);

    const additionalParams = this.buildQueryParams(query);

    this.logger.info(
      { accountId, timeframe: query.timeframe },
      'Getting messaging conversation metrics',
    );

    return this.get<IMessagingConversationResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get messaging conversation metrics (POST method)
   * Alternative method using POST body for parameters
   */
  async postMessagingConversation(
    accountId: string,
    token: string,
    body: {
      timeframe: string;
      v: string;
      skillIds?: string;
      agentIds?: string;
      interval?: string;
    },
  ): Promise<ILPResponse<IMessagingConversationResponse>> {
    const path = LP_API_PATHS.MSG_OPERATIONS.CONVERSATION(accountId);

    this.logger.info(
      { accountId, timeframe: body.timeframe },
      'Posting messaging conversation metrics request',
    );

    return this.post<IMessagingConversationResponse>(accountId, path, body, token, {});
  }

  /**
   * Get queue health metrics
   * Returns queue state data including wait times and conversation counts
   */
  async getQueueHealth(
    accountId: string,
    token: string,
    query: IQueueHealthQuery,
  ): Promise<ILPResponse<IQueueHealthResponse>> {
    const path = LP_API_PATHS.MSG_OPERATIONS.QUEUE_HEALTH(accountId);

    const additionalParams = this.buildQueryParams(query);

    this.logger.info(
      { accountId, timeframe: query.timeframe },
      'Getting queue health metrics',
    );

    return this.get<IQueueHealthResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get current queue health metrics
   * Returns real-time queue state (no timeframe needed)
   */
  async getCurrentQueueHealth(
    accountId: string,
    token: string,
    query: ICurrentQueueHealthQuery,
  ): Promise<ILPResponse<IQueueHealthResponse>> {
    const path = LP_API_PATHS.MSG_OPERATIONS.CURRENT_QUEUE_HEALTH(accountId);

    const additionalParams: Record<string, string> = {
      v: String(query.v),
    };

    if (query.skillIds) additionalParams.skillIds = query.skillIds;
    if (query.overdueConversations !== undefined) {
      additionalParams.overdueConversations = String(query.overdueConversations);
    }
    if (query.breakdown !== undefined) {
      additionalParams.breakdown = String(query.breakdown);
    }
    if (query.metrics) additionalParams.metrics = query.metrics;
    if (query.groupIds) additionalParams.groupIds = query.groupIds;
    if (query.fromMillis) additionalParams.fromMillis = String(query.fromMillis);
    if (query.toMillis) additionalParams.toMillis = String(query.toMillis);

    this.logger.info({ accountId }, 'Getting current queue health metrics');

    return this.get<IQueueHealthResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get CSAT distribution metrics
   * Returns customer satisfaction score distribution
   */
  async getCSATDistribution(
    accountId: string,
    token: string,
    query: ICSATDistributionQuery,
  ): Promise<ILPResponse<ICSATDistributionResponse>> {
    const path = LP_API_PATHS.MSG_OPERATIONS.CSAT_DISTRIBUTION(accountId);

    const additionalParams = this.buildQueryParams(query);

    this.logger.info(
      { accountId, timeframe: query.timeframe },
      'Getting CSAT distribution metrics',
    );

    return this.get<ICSATDistributionResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get skill segment metrics
   * Returns conversation segment data grouped by skill
   */
  async getSkillSegment(
    accountId: string,
    token: string,
    query: ISkillSegmentQuery,
  ): Promise<ILPResponse<ISkillSegmentResponse>> {
    const path = LP_API_PATHS.MSG_OPERATIONS.SKILL_SEGMENT(accountId);

    const additionalParams = this.buildQueryParams(query);
    if (query.userType) additionalParams.userType = query.userType;

    this.logger.info(
      { accountId, timeframe: query.timeframe },
      'Getting skill segment metrics',
    );

    return this.get<ISkillSegmentResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get agent segment metrics
   * Returns conversation segment data grouped by agent
   */
  async getAgentSegment(
    accountId: string,
    token: string,
    query: IAgentSegmentQuery,
  ): Promise<ILPResponse<IAgentSegmentResponse>> {
    const path = LP_API_PATHS.MSG_OPERATIONS.AGENT_SEGMENT(accountId);

    const additionalParams = this.buildQueryParams(query);
    if (query.agentIds) additionalParams.agentIds = query.agentIds;
    if (query.groupIds) additionalParams.groupIds = query.groupIds;
    if (query.userType) additionalParams.userType = query.userType;
    if (query.source) additionalParams.source = query.source;
    if (query.metrics) additionalParams.metrics = query.metrics;

    this.logger.info(
      { accountId, timeframe: query.timeframe },
      'Getting agent segment metrics',
    );

    return this.get<IAgentSegmentResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Build common query parameters
   */
  private buildQueryParams(
    query: IMessagingConversationQuery | IQueueHealthQuery | ICSATDistributionQuery | ISkillSegmentQuery | IAgentSegmentQuery,
  ): Record<string, string> {
    const params: Record<string, string> = {
      v: String(query.v),
    };

    if (query.timeframe) params.timeframe = String(query.timeframe);
    if (query.fromMillis) params.fromMillis = String(query.fromMillis);
    if (query.toMillis) params.toMillis = String(query.toMillis);

    if ('skillIds' in query && query.skillIds) {
      params.skillIds = query.skillIds;
    }
    if ('agentIds' in query && query.agentIds) {
      params.agentIds = query.agentIds;
    }
    if ('interval' in query && query.interval) {
      params.interval = String(query.interval);
    }
    if ('groupIds' in query && query.groupIds) {
      params.groupIds = query.groupIds;
    }

    return params;
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get real-time queue summary
   * Returns a simplified view of current queue state
   */
  async getQueueSummary(
    accountId: string,
    token: string,
    skillIds?: string,
  ): Promise<ILPResponse<IQueueHealthResponse>> {
    return this.getCurrentQueueHealth(accountId, token, {
      v: 1,
      skillIds,
      metrics: 'queue,waittimes',
      breakdown: true,
    });
  }

  /**
   * Get hourly conversation metrics for past 24 hours
   */
  async getHourlyConversationMetrics(
    accountId: string,
    token: string,
    options?: {
      skillIds?: string;
      agentIds?: string;
    },
  ): Promise<ILPResponse<IMessagingConversationResponse>> {
    return this.getMessagingConversation(accountId, token, {
      v: 1,
      timeframe: 1440,
      interval: 60,
      skillIds: options?.skillIds,
      agentIds: options?.agentIds,
    });
  }

  /**
   * Get CSAT scores for past hour
   */
  async getRecentCSAT(
    accountId: string,
    token: string,
    options?: {
      skillIds?: string;
      agentIds?: string;
    },
  ): Promise<ILPResponse<ICSATDistributionResponse>> {
    return this.getCSATDistribution(accountId, token, {
      v: 1,
      timeframe: 60,
      skillIds: options?.skillIds,
      agentIds: options?.agentIds,
    });
  }

  /**
   * Get agent performance metrics for past 24 hours
   */
  async getAgentPerformance(
    accountId: string,
    token: string,
    options?: {
      agentIds?: string;
      skillIds?: string;
    },
  ): Promise<ILPResponse<IAgentSegmentResponse>> {
    return this.getAgentSegment(accountId, token, {
      v: 1,
      timeframe: 1440,
      agentIds: options?.agentIds || 'all',
      skillIds: options?.skillIds,
    });
  }
}
