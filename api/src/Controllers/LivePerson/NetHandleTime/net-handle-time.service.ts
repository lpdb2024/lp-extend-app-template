/**
 * Net Handle Time Service
 * Business logic for LivePerson Net Handle Time API
 *
 * Service Domain: agentActivityDomain
 * Status: Beta - subject to adjustments
 * Data Availability: Up to 24 hours from segment close
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../APIService/api-service';
import { LPDomainService } from '../shared/lp-domain.service';
import { LPBaseService } from '../shared/lp-base.service';
import { LP_SERVICE_DOMAINS, LP_API_PATHS } from '../shared/lp-constants';
import { ILPResponse } from '../shared/lp-common.interfaces';
import {
  INHTAgentSegmentsResponse,
  INHTAgentSegmentsQuery,
  INHTBreakdownFilesResponse,
  INHTBreakdownFilesQuery,
  INHUBreakdownRecord,
  INHTBreakdownFileQuery,
} from './net-handle-time.interfaces';

@Injectable()
export class NetHandleTimeService extends LPBaseService {
  // Uses same domain as Agent Activity
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.AGENT_ACTIVITY;
  protected readonly defaultApiVersion = '1';

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(NetHandleTimeService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(NetHandleTimeService.name);
  }

  /**
   * Get agent segments
   * Retrieves segment-level net handle time data
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getAgentSegments(
    accountId: string,
    token: string,
    query: INHTAgentSegmentsQuery,
  ): Promise<ILPResponse<INHTAgentSegmentsResponse>> {
    const path = LP_API_PATHS.NET_HANDLE_TIME.AGENT_SEGMENTS(accountId);
    const additionalParams = this.buildAgentSegmentsParams(query);

    this.logger.info(
      { accountId, source: query.source, from: query.from, to: query.to },
      'Getting agent segments',
    );

    return this.get<INHTAgentSegmentsResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get breakdown files list
   * Lists available NHU breakdown file resources
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters
   */
  async getBreakdownFilesList(
    accountId: string,
    token: string,
    query: INHTBreakdownFilesQuery,
  ): Promise<ILPResponse<INHTBreakdownFilesResponse>> {
    const path = LP_API_PATHS.NET_HANDLE_TIME.BREAKDOWN_FILES(accountId);
    const additionalParams = this.buildBreakdownFilesParams(query);

    this.logger.info(
      { accountId, source: query.source },
      'Getting breakdown files list',
    );

    return this.get<INHTBreakdownFilesResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get breakdown file
   * Downloads specific NHU breakdown file
   *
   * @param accountId - LivePerson account ID
   * @param token - Bearer token
   * @param query - Query parameters including file path
   */
  async getBreakdownFile(
    accountId: string,
    token: string,
    query: INHTBreakdownFileQuery,
  ): Promise<ILPResponse<INHUBreakdownRecord[]>> {
    const path = LP_API_PATHS.NET_HANDLE_TIME.BREAKDOWN_FILE(accountId);
    const additionalParams: Record<string, string> = {
      source: query.source,
      path: query.path,
    };

    this.logger.info(
      { accountId, source: query.source, path: query.path },
      'Getting breakdown file',
    );

    return this.get<INHUBreakdownRecord[]>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Build query parameters for agent segments endpoint
   */
  private buildAgentSegmentsParams(query: INHTAgentSegmentsQuery): Record<string, string> {
    const params: Record<string, string> = {
      source: query.source,
    };

    if (query.limit !== undefined) {
      params.limit = query.limit.toString();
    }

    if (query.offset !== undefined) {
      params.offset = query.offset.toString();
    }

    if (query.sort) {
      params.sort = query.sort;
    }

    if (query.from) {
      params.from = query.from;
    }

    if (query.fromMillis !== undefined) {
      params.fromMillis = query.fromMillis.toString();
    }

    if (query.to) {
      params.to = query.to;
    }

    if (query.toMillis !== undefined) {
      params.toMillis = query.toMillis.toString();
    }

    if (query.ConversationId) {
      params.ConversationId = query.ConversationId;
    }

    if (query.AgentId) {
      params.AgentId = query.AgentId;
    }

    if (query.EmployeeId) {
      params.EmployeeId = query.EmployeeId;
    }

    if (query.SkillId) {
      params.SkillId = query.SkillId;
    }

    if (query.GroupId) {
      params.GroupId = query.GroupId;
    }

    return params;
  }

  /**
   * Build query parameters for breakdown files endpoint
   */
  private buildBreakdownFilesParams(query: INHTBreakdownFilesQuery): Record<string, string> {
    const params: Record<string, string> = {
      source: query.source,
    };

    if (query.from) {
      params.from = query.from;
    }

    if (query.fromMillis !== undefined) {
      params.fromMillis = query.fromMillis.toString();
    }

    if (query.to) {
      params.to = query.to;
    }

    if (query.toMillis !== undefined) {
      params.toMillis = query.toMillis.toString();
    }

    return params;
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get net handle time for a specific agent
   */
  async getAgentNetHandleTime(
    accountId: string,
    token: string,
    source: string,
    agentId: string,
    from: string,
    to: string,
  ): Promise<ILPResponse<INHTAgentSegmentsResponse>> {
    return this.getAgentSegments(accountId, token, {
      source,
      from,
      to,
      AgentId: agentId,
      limit: 500,
    });
  }

  /**
   * Get net handle time for a specific skill
   */
  async getSkillNetHandleTime(
    accountId: string,
    token: string,
    source: string,
    skillId: string,
    from: string,
    to: string,
  ): Promise<ILPResponse<INHTAgentSegmentsResponse>> {
    return this.getAgentSegments(accountId, token, {
      source,
      from,
      to,
      SkillId: skillId,
      limit: 500,
    });
  }

  /**
   * Get net handle time for a specific conversation
   */
  async getConversationNetHandleTime(
    accountId: string,
    token: string,
    source: string,
    conversationId: string,
  ): Promise<ILPResponse<INHTAgentSegmentsResponse>> {
    return this.getAgentSegments(accountId, token, {
      source,
      ConversationId: conversationId,
    });
  }
}
