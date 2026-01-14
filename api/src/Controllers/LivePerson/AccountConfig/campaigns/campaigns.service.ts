/**
 * Campaigns Service
 * Handles all Campaigns API operations for LivePerson using the SDK
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Scopes } from '@lpextend/node-sdk';
import type {
  LPCampaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from '@lpextend/node-sdk';
import { SDKProviderService, TokenInfo } from '../../shared/sdk-provider.service';

/**
 * Response type for SDK operations
 */
export interface ILPResponse<T> {
  data: T;
  revision?: string;
  headers?: Record<string, string>;
}

/**
 * Campaign query options
 */
export interface ICampaignQuery {
  v?: string;
  fields?: string | string[];
  field_set?: string;
  select?: string;
  filter?: string;
  include_deleted?: boolean;
}

@Injectable()
export class CampaignsService {
  constructor(
    @InjectPinoLogger(CampaignsService.name)
    private readonly logger: PinoLogger,
    private readonly sdkProvider: SDKProviderService,
  ) {
    this.logger.setContext(CampaignsService.name);
  }

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.CAMPAIGNS]);
  }

  /**
   * Get all campaigns for an account
   */
  async getCampaigns(
    accountId: string,
    token: TokenInfo | string,
    query?: ICampaignQuery,
  ): Promise<ILPResponse<LPCampaign[]>> {
    const sdk = await this.getSDK(accountId, token);
    const response = await sdk.campaigns.getAll();
    this.logger.info({ accountId, count: response.data?.length }, 'Getting all campaigns');
    return response;
  }

  /**
   * Get a campaign by ID
   */
  async getCampaignById(
    accountId: string,
    campaignId: string,
    token: TokenInfo | string,
    query?: ICampaignQuery,
  ): Promise<ILPResponse<LPCampaign>> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, campaignId }, 'Getting campaign by ID');
    return sdk.campaigns.getById(Number(campaignId));
  }

  /**
   * Create a new campaign
   */
  async createCampaign(
    accountId: string,
    token: TokenInfo | string,
    campaign: CreateCampaignRequest,
    query?: ICampaignQuery,
  ): Promise<ILPResponse<LPCampaign>> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, campaignName: campaign.name }, 'Creating campaign');
    return sdk.campaigns.create(campaign);
  }

  /**
   * Update a campaign
   */
  async updateCampaign(
    accountId: string,
    campaignId: string,
    token: TokenInfo | string,
    campaign: UpdateCampaignRequest,
    revision?: string,
    query?: ICampaignQuery,
  ): Promise<ILPResponse<LPCampaign>> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, campaignId }, 'Updating campaign');
    return sdk.campaigns.update(Number(campaignId), campaign, revision);
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(
    accountId: string,
    campaignId: string,
    token: TokenInfo | string,
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, campaignId }, 'Deleting campaign');
    return sdk.campaigns.delete(Number(campaignId), revision);
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get all published campaigns
   */
  async getPublishedCampaigns(
    accountId: string,
    token: TokenInfo | string,
  ): Promise<ILPResponse<LPCampaign[]>> {
    const response = await this.getCampaigns(accountId, token);
    const publishedCampaigns = response.data.filter(c => c.status === 'active');
    return { ...response, data: publishedCampaigns };
  }

  /**
   * Get campaigns by LOB
   */
  async getCampaignsByLob(
    accountId: string,
    lobId: number,
    token: TokenInfo | string,
  ): Promise<ILPResponse<LPCampaign[]>> {
    const response = await this.getCampaigns(accountId, token);
    const filteredCampaigns = response.data.filter(c => c.lobId === lobId);
    return { ...response, data: filteredCampaigns };
  }

  /**
   * Publish a campaign (set status to active)
   */
  async publishCampaign(
    accountId: string,
    campaignId: string,
    token: TokenInfo | string,
    revision?: string,
  ): Promise<ILPResponse<LPCampaign>> {
    return this.updateCampaign(accountId, campaignId, token, { status: 'active' }, revision);
  }

  /**
   * Unpublish a campaign (set status to inactive)
   */
  async unpublishCampaign(
    accountId: string,
    campaignId: string,
    token: TokenInfo | string,
    revision?: string,
  ): Promise<ILPResponse<LPCampaign>> {
    return this.updateCampaign(accountId, campaignId, token, { status: 'inactive' }, revision);
  }
}
