/**
 * Engagements Service
 * Business logic for LivePerson Engagements API
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../../APIService/api-service';
import { LPDomainService } from '../../shared/lp-domain.service';
import { LPBaseService } from '../../shared/lp-base.service';
import {
  LP_SERVICE_DOMAINS,
  LP_API_VERSIONS,
  LP_API_PATHS,
} from '../../shared/lp-constants';
import { ILPResponse } from '../../shared/lp-common.interfaces';
import {
  IEngagement,
  IEngagementCreateRequest,
  IEngagementUpdateRequest,
  IEngagementPartialUpdate,
  IEngagementQuery,
} from './engagements.interfaces';

@Injectable()
export class EngagementsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_READ;
  protected readonly writeDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.CAMPAIGNS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(EngagementsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(EngagementsService.name);
  }

  /**
   * Get all engagements for a campaign
   */
  async getEngagements(
    accountId: string,
    campaignId: string,
    token: string,
    query?: IEngagementQuery,
  ): Promise<ILPResponse<IEngagement[]>> {
    const path = LP_API_PATHS.ENGAGEMENTS.BASE(accountId, campaignId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, campaignId }, 'Getting all engagements for campaign');

    return this.get<IEngagement[]>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get an engagement by ID
   */
  async getEngagementById(
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    query?: IEngagementQuery,
  ): Promise<ILPResponse<IEngagement>> {
    const path = LP_API_PATHS.ENGAGEMENTS.BY_ID(accountId, campaignId, engagementId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info(
      { accountId, campaignId, engagementId },
      'Getting engagement by ID',
    );

    return this.get<IEngagement>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Create a new engagement
   */
  async createEngagement(
    accountId: string,
    campaignId: string,
    token: string,
    engagement: IEngagementCreateRequest,
    query?: IEngagementQuery,
  ): Promise<ILPResponse<IEngagement>> {
    const path = LP_API_PATHS.ENGAGEMENTS.BASE(accountId, campaignId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info(
      { accountId, campaignId, engagementName: engagement.name },
      'Creating engagement',
    );

    return this.post<IEngagement>(accountId, path, engagement, token, {
      additionalParams,
      useWriteDomain: true,
    });
  }

  /**
   * Update an engagement
   * Accepts either full or partial update payload
   */
  async updateEngagement(
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    engagement: IEngagementUpdateRequest | IEngagementPartialUpdate,
    revision: string,
    query?: IEngagementQuery,
  ): Promise<ILPResponse<IEngagement>> {
    const path = LP_API_PATHS.ENGAGEMENTS.BY_ID(accountId, campaignId, engagementId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info(
      { accountId, campaignId, engagementId },
      'Updating engagement',
    );

    return this.put<IEngagement>(accountId, path, engagement, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Delete an engagement
   */
  async deleteEngagement(
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.ENGAGEMENTS.BY_ID(accountId, campaignId, engagementId);
    const additionalParams: Record<string, string> = {
      v: this.defaultApiVersion,
    };

    this.logger.info(
      { accountId, campaignId, engagementId },
      'Deleting engagement',
    );

    return this.delete<void>(accountId, path, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Build query parameters from query object
   */
  private buildQueryParams(query?: IEngagementQuery): Record<string, string> {
    const params: Record<string, string> = {
      v: query?.v || this.defaultApiVersion,
    };

    if (query?.fields) {
      if (Array.isArray(query.fields)) {
        params.fields = query.fields.join(',');
      } else {
        params.fields = query.fields;
      }
    }

    if (query?.field_set) {
      params.field_set = query.field_set;
    }

    if (query?.select) {
      params.select = query.select;
    }

    if (query?.filter) {
      params.filter = query.filter;
    }

    if (query?.include_deleted) {
      params.include_deleted = 'true';
    }

    return params;
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get all enabled engagements for a campaign
   */
  async getEnabledEngagements(
    accountId: string,
    campaignId: string,
    token: string,
  ): Promise<ILPResponse<IEngagement[]>> {
    return this.getEngagements(accountId, campaignId, token, {
      field_set: 'all',
      filter: 'enabled==true',
    });
  }

  /**
   * Perform a partial update on an engagement
   * Gets current engagement first, merges changes, then updates
   */
  async partialUpdateEngagement(
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    changes: IEngagementPartialUpdate,
    revision: string,
  ): Promise<ILPResponse<IEngagement>> {
    const path = LP_API_PATHS.ENGAGEMENTS.BY_ID(accountId, campaignId, engagementId);

    this.logger.info(
      { accountId, campaignId, engagementId, changes },
      'Partially updating engagement',
    );

    return this.put<IEngagement>(accountId, path, changes, token, {
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Enable an engagement
   */
  async enableEngagement(
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<IEngagement>> {
    return this.partialUpdateEngagement(
      accountId,
      campaignId,
      engagementId,
      token,
      { enabled: true },
      revision,
    );
  }

  /**
   * Disable an engagement
   */
  async disableEngagement(
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<IEngagement>> {
    return this.partialUpdateEngagement(
      accountId,
      campaignId,
      engagementId,
      token,
      { enabled: false },
      revision,
    );
  }

  /**
   * Update engagement skill routing
   */
  async updateEngagementSkill(
    accountId: string,
    campaignId: string,
    engagementId: string,
    skillId: number,
    token: string,
    revision: string,
  ): Promise<ILPResponse<IEngagement>> {
    return this.partialUpdateEngagement(
      accountId,
      campaignId,
      engagementId,
      token,
      { skillId },
      revision,
    );
  }
}
