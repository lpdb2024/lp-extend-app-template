/**
 * Outbound Reporting Service
 * Business logic for LivePerson Outbound Reporting API
 *
 * Service Domain: leDataReporting
 * Provides reporting data for outbound campaigns including delivery metrics,
 * performance analytics, and agent/skill activity
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../APIService/api-service';
import { LPDomainService } from '../shared/lp-domain.service';
import { LPBaseService } from '../shared/lp-base.service';
import { LP_SERVICE_DOMAINS, LP_API_PATHS } from '../shared/lp-constants';
import { ILPResponse } from '../shared/lp-common.interfaces';
import {
  ICampaignListResponse,
  ICampaignListQuery,
  ICampaignDetailsResponse,
  ICampaignDetailsQuery,
  IMessageDeliveriesResponse,
  IMessageDeliveriesQuery,
  ICampaignPerformanceResponse,
  ICampaignPerformanceQuery,
  IAgentOutboundActivityResponse,
  IAgentOutboundActivityQuery,
  ISkillOutboundMetricsResponse,
  ISkillOutboundMetricsQuery,
} from './outbound-reporting.interfaces';

@Injectable()
export class OutboundReportingService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.LE_DATA_REPORTING;
  protected readonly defaultApiVersion = '1';

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(OutboundReportingService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(OutboundReportingService.name);
  }

  /**
   * Get campaign list
   * Retrieves list of outbound campaigns with filtering and pagination
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getCampaignList(
    accountId: string,
    token: string,
    query: ICampaignListQuery,
  ): Promise<ILPResponse<ICampaignListResponse>> {
    const path = LP_API_PATHS.OUTBOUND_REPORTING.CAMPAIGNS(accountId);
    const additionalParams = this.buildCampaignListParams(query);

    this.logger.info(
      { accountId, source: query.source, from: query.from, to: query.to },
      'Getting outbound campaign list',
    );

    return this.get<ICampaignListResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get campaign details
   * Retrieves detailed information for a specific campaign
   *
   * @param accountId - LivePerson account ID
   * @param campaignId - Campaign identifier
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getCampaignDetails(
    accountId: string,
    campaignId: string,
    token: string,
    query: ICampaignDetailsQuery,
  ): Promise<ILPResponse<ICampaignDetailsResponse>> {
    const path = LP_API_PATHS.OUTBOUND_REPORTING.CAMPAIGN_BY_ID(accountId, campaignId);
    const additionalParams: Record<string, string> = {
      source: query.source,
    };

    if (query.includeBreakdown !== undefined) {
      additionalParams.includeBreakdown = query.includeBreakdown.toString();
    }

    this.logger.info(
      { accountId, campaignId, source: query.source },
      'Getting campaign details',
    );

    return this.get<ICampaignDetailsResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get message deliveries
   * Retrieves message delivery records with filtering
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getMessageDeliveries(
    accountId: string,
    token: string,
    query: IMessageDeliveriesQuery,
  ): Promise<ILPResponse<IMessageDeliveriesResponse>> {
    const path = LP_API_PATHS.OUTBOUND_REPORTING.MESSAGES(accountId);
    const additionalParams = this.buildMessageDeliveriesParams(query);

    this.logger.info(
      { accountId, source: query.source, campaignId: query.campaignId },
      'Getting message deliveries',
    );

    return this.get<IMessageDeliveriesResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get campaign performance
   * Retrieves performance metrics over time for a campaign
   *
   * @param accountId - LivePerson account ID
   * @param campaignId - Campaign identifier
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getCampaignPerformance(
    accountId: string,
    campaignId: string,
    token: string,
    query: ICampaignPerformanceQuery,
  ): Promise<ILPResponse<ICampaignPerformanceResponse>> {
    const path = LP_API_PATHS.OUTBOUND_REPORTING.CAMPAIGN_PERFORMANCE(
      accountId,
      campaignId,
    );
    const additionalParams: Record<string, string> = {
      source: query.source,
      from: query.from,
      to: query.to,
    };

    if (query.interval) {
      additionalParams.interval = query.interval;
    }

    this.logger.info(
      { accountId, campaignId, source: query.source, from: query.from, to: query.to },
      'Getting campaign performance',
    );

    return this.get<ICampaignPerformanceResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get agent outbound activity
   * Retrieves agent activity metrics for outbound campaigns
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentOutboundActivity(
    accountId: string,
    token: string,
    query: IAgentOutboundActivityQuery,
  ): Promise<ILPResponse<IAgentOutboundActivityResponse>> {
    const path = LP_API_PATHS.OUTBOUND_REPORTING.AGENT_ACTIVITY(accountId);
    const additionalParams = this.buildAgentActivityParams(query);

    this.logger.info(
      { accountId, source: query.source, agentId: query.agentId },
      'Getting agent outbound activity',
    );

    return this.get<IAgentOutboundActivityResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get skill outbound metrics
   * Retrieves skill-level metrics for outbound campaigns
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getSkillOutboundMetrics(
    accountId: string,
    token: string,
    query: ISkillOutboundMetricsQuery,
  ): Promise<ILPResponse<ISkillOutboundMetricsResponse>> {
    const path = LP_API_PATHS.OUTBOUND_REPORTING.SKILL_METRICS(accountId);
    const additionalParams = this.buildSkillMetricsParams(query);

    this.logger.info(
      { accountId, source: query.source, skillId: query.skillId },
      'Getting skill outbound metrics',
    );

    return this.get<ISkillOutboundMetricsResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Build query parameters for campaign list endpoint
   */
  private buildCampaignListParams(query: ICampaignListQuery): Record<string, string> {
    const params: Record<string, string> = {
      source: query.source,
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

    if (query.status) {
      params.status = query.status;
    }

    if (query.campaignType) {
      params.campaignType = query.campaignType;
    }

    if (query.channel) {
      params.channel = query.channel;
    }

    if (query.page !== undefined) {
      params.page = query.page.toString();
    }

    if (query.pageSize !== undefined) {
      params.pageSize = query.pageSize.toString();
    }

    if (query.sortBy) {
      params.sortBy = query.sortBy;
    }

    if (query.sortOrder) {
      params.sortOrder = query.sortOrder;
    }

    return params;
  }

  /**
   * Build query parameters for message deliveries endpoint
   */
  private buildMessageDeliveriesParams(
    query: IMessageDeliveriesQuery,
  ): Record<string, string> {
    const params: Record<string, string> = {
      source: query.source,
    };

    if (query.campaignId) {
      params.campaignId = query.campaignId;
    }

    if (query.status) {
      params.status = query.status;
    }

    if (query.channel) {
      params.channel = query.channel;
    }

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

    if (query.consumerId) {
      params.consumerId = query.consumerId;
    }

    if (query.failedOnly !== undefined) {
      params.failedOnly = query.failedOnly.toString();
    }

    if (query.page !== undefined) {
      params.page = query.page.toString();
    }

    if (query.pageSize !== undefined) {
      params.pageSize = query.pageSize.toString();
    }

    if (query.sortBy) {
      params.sortBy = query.sortBy;
    }

    if (query.sortOrder) {
      params.sortOrder = query.sortOrder;
    }

    return params;
  }

  /**
   * Build query parameters for agent activity endpoint
   */
  private buildAgentActivityParams(
    query: IAgentOutboundActivityQuery,
  ): Record<string, string> {
    const params: Record<string, string> = {
      source: query.source,
      from: query.from,
      to: query.to,
    };

    if (query.agentId !== undefined) {
      params.agentId = query.agentId.toString();
    }

    if (query.agentGroupId !== undefined) {
      params.agentGroupId = query.agentGroupId.toString();
    }

    if (query.page !== undefined) {
      params.page = query.page.toString();
    }

    if (query.pageSize !== undefined) {
      params.pageSize = query.pageSize.toString();
    }

    return params;
  }

  /**
   * Build query parameters for skill metrics endpoint
   */
  private buildSkillMetricsParams(
    query: ISkillOutboundMetricsQuery,
  ): Record<string, string> {
    const params: Record<string, string> = {
      source: query.source,
      from: query.from,
      to: query.to,
    };

    if (query.skillId !== undefined) {
      params.skillId = query.skillId.toString();
    }

    if (query.page !== undefined) {
      params.page = query.page.toString();
    }

    if (query.pageSize !== undefined) {
      params.pageSize = query.pageSize.toString();
    }

    return params;
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get active campaigns
   */
  async getActiveCampaigns(
    accountId: string,
    token: string,
    source: string,
  ): Promise<ILPResponse<ICampaignListResponse>> {
    return this.getCampaignList(accountId, token, {
      source,
      status: 'active' as any,
      pageSize: 100,
    });
  }

  /**
   * Get failed messages for a campaign
   */
  async getFailedMessages(
    accountId: string,
    campaignId: string,
    token: string,
    source: string,
  ): Promise<ILPResponse<IMessageDeliveriesResponse>> {
    return this.getMessageDeliveries(accountId, token, {
      source,
      campaignId,
      failedOnly: true,
      pageSize: 500,
    });
  }

  /**
   * Get agent performance for outbound campaigns
   */
  async getAgentPerformance(
    accountId: string,
    agentId: number,
    token: string,
    source: string,
    from: string,
    to: string,
  ): Promise<ILPResponse<IAgentOutboundActivityResponse>> {
    return this.getAgentOutboundActivity(accountId, token, {
      source,
      from,
      to,
      agentId,
    });
  }

  /**
   * Get skill performance for outbound campaigns
   */
  async getSkillPerformance(
    accountId: string,
    skillId: number,
    token: string,
    source: string,
    from: string,
    to: string,
  ): Promise<ILPResponse<ISkillOutboundMetricsResponse>> {
    return this.getSkillOutboundMetrics(accountId, token, {
      source,
      from,
      to,
      skillId,
    });
  }
}
