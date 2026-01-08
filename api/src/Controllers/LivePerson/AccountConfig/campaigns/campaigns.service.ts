/**
 * Campaigns Service
 * Business logic for LivePerson Campaigns API
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
  ICampaign,
  ICampaignCreateRequest,
  ICampaignUpdateRequest,
  ICampaignQuery,
} from './campaigns.interfaces';

@Injectable()
export class CampaignsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_READ;
  protected readonly writeDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.CAMPAIGNS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(CampaignsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(CampaignsService.name);
  }

  /**
   * Get all campaigns for an account
   */
  async getCampaigns(
    accountId: string,
    token: string,
    query?: ICampaignQuery,
  ): Promise<ILPResponse<ICampaign[]>> {
    const path = LP_API_PATHS.CAMPAIGNS.BASE(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId }, 'Getting all campaigns');

    return this.get<ICampaign[]>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get a campaign by ID
   */
  async getCampaignById(
    accountId: string,
    campaignId: string,
    token: string,
    query?: ICampaignQuery,
  ): Promise<ILPResponse<ICampaign>> {
    const path = LP_API_PATHS.CAMPAIGNS.BY_ID(accountId, campaignId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, campaignId }, 'Getting campaign by ID');

    return this.get<ICampaign>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Create a new campaign
   */
  async createCampaign(
    accountId: string,
    token: string,
    campaign: ICampaignCreateRequest,
    query?: ICampaignQuery,
  ): Promise<ILPResponse<ICampaign>> {
    const path = LP_API_PATHS.CAMPAIGNS.BASE(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info(
      { accountId, campaignName: campaign.name },
      'Creating campaign',
    );

    return this.post<ICampaign>(accountId, path, campaign, token, {
      additionalParams,
      useWriteDomain: true,
    });
  }

  /**
   * Update a campaign
   */
  async updateCampaign(
    accountId: string,
    campaignId: string,
    token: string,
    campaign: ICampaignUpdateRequest,
    revision: string,
    query?: ICampaignQuery,
  ): Promise<ILPResponse<ICampaign>> {
    const path = LP_API_PATHS.CAMPAIGNS.BY_ID(accountId, campaignId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, campaignId }, 'Updating campaign');

    return this.put<ICampaign>(accountId, path, campaign, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(
    accountId: string,
    campaignId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.CAMPAIGNS.BY_ID(accountId, campaignId);
    const additionalParams: Record<string, string> = {
      v: this.defaultApiVersion,
    };

    this.logger.info({ accountId, campaignId }, 'Deleting campaign');

    return this.delete<void>(accountId, path, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Build query parameters from query object
   */
  private buildQueryParams(query?: ICampaignQuery): Record<string, string> {
    const params: Record<string, string> = {
      v: query?.v || this.defaultApiVersion,
    };

    if (query?.fields) {
      if (Array.isArray(query.fields)) {
        // LP API accepts multiple fields params
        // We'll join them for the query string
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
   * Get all published campaigns
   */
  async getPublishedCampaigns(
    accountId: string,
    token: string,
  ): Promise<ILPResponse<ICampaign[]>> {
    return this.getCampaigns(accountId, token, {
      field_set: 'all',
      filter: 'status==1',
    });
  }

  /**
   * Get campaigns by LOB
   */
  async getCampaignsByLob(
    accountId: string,
    lobId: number,
    token: string,
  ): Promise<ILPResponse<ICampaign[]>> {
    return this.getCampaigns(accountId, token, {
      field_set: 'all',
      filter: `lobId==${lobId}`,
    });
  }

  /**
   * Publish a campaign (set status to 1)
   */
  async publishCampaign(
    accountId: string,
    campaignId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<ICampaign>> {
    return this.updateCampaign(
      accountId,
      campaignId,
      token,
      { status: 1 },
      revision,
    );
  }

  /**
   * Unpublish a campaign (set status to 0)
   */
  async unpublishCampaign(
    accountId: string,
    campaignId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<ICampaign>> {
    return this.updateCampaign(
      accountId,
      campaignId,
      token,
      { status: 0 },
      revision,
    );
  }
}
