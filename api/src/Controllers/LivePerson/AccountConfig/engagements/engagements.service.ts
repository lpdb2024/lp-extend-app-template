/**
 * Engagements Service
 * Handles all Engagements API operations for LivePerson using the SDK
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import {
  initializeSDK,
  LPExtendSDK,
  Scopes,
  LPExtendSDKError,
} from '@lpextend/client-sdk';
import type {
  LPEngagement,
  CreateEngagementRequest,
  UpdateEngagementRequest,
} from '@lpextend/client-sdk';

/**
 * Response type for SDK operations
 */
export interface ILPResponse<T> {
  data: T;
  revision?: string;
  headers?: Record<string, string>;
}

/**
 * Engagement query options
 */
export interface IEngagementQuery {
  v?: string;
  fields?: string | string[];
  field_set?: string;
  select?: string;
  filter?: string;
  include_deleted?: boolean;
}

@Injectable()
export class EngagementsService {
  private shellBaseUrl: string;
  private appId: string;

  constructor(
    @InjectPinoLogger(EngagementsService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(EngagementsService.name);
    this.shellBaseUrl = this.configService.get<string>('SHELL_BASE_URL') || 'http://localhost:3001';
    this.appId = this.configService.get<string>('APP_ID') || 'lp-extend-template';
  }

  /**
   * Create SDK instance for the given account/token
   */
  private async getSDK(accountId: string, token: string): Promise<LPExtendSDK> {
    try {
      const accessToken = token.replace('Bearer ', '');
      return await initializeSDK({
        appId: this.appId,
        accountId,
        accessToken,
        shellBaseUrl: this.shellBaseUrl,
        scopes: [Scopes.ENGAGEMENTS, Scopes.CAMPAIGNS],
        debug: this.configService.get<string>('NODE_ENV') !== 'production',
      });
    } catch (error) {
      if (error instanceof LPExtendSDKError) {
        this.logger.error({ error: error.message, code: error.code }, 'SDK initialization failed');
      }
      throw error;
    }
  }

  /**
   * Get all engagements for a campaign
   */
  async getEngagements(
    accountId: string,
    campaignId: string,
    token: string,
    query?: IEngagementQuery,
  ): Promise<ILPResponse<LPEngagement[]>> {
    const sdk = await this.getSDK(accountId, token);
    const response = await sdk.engagements.getByCampaign(Number(campaignId));
    this.logger.info({ accountId, campaignId, count: response.data?.length }, 'Getting all engagements for campaign');
    return response;
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
  ): Promise<ILPResponse<LPEngagement>> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, campaignId, engagementId }, 'Getting engagement by ID');
    return sdk.engagements.getById(Number(campaignId), Number(engagementId));
  }

  /**
   * Create a new engagement
   */
  async createEngagement(
    accountId: string,
    campaignId: string,
    token: string,
    engagement: CreateEngagementRequest,
    query?: IEngagementQuery,
  ): Promise<ILPResponse<LPEngagement>> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, campaignId, engagementName: engagement.name }, 'Creating engagement');
    // Ensure campaignId is set on the engagement
    const engagementData = { ...engagement, campaignId: Number(campaignId) };
    return sdk.engagements.create(engagementData);
  }

  /**
   * Update an engagement
   */
  async updateEngagement(
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    engagement: UpdateEngagementRequest,
    revision?: string,
    query?: IEngagementQuery,
  ): Promise<ILPResponse<LPEngagement>> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, campaignId, engagementId }, 'Updating engagement');
    return sdk.engagements.update(Number(campaignId), Number(engagementId), engagement, revision);
  }

  /**
   * Delete an engagement
   */
  async deleteEngagement(
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, campaignId, engagementId }, 'Deleting engagement');
    return sdk.engagements.delete(Number(campaignId), Number(engagementId), revision);
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
  ): Promise<ILPResponse<LPEngagement[]>> {
    const response = await this.getEngagements(accountId, campaignId, token);
    const enabledEngagements = response.data.filter(e => e.status === 'active');
    return { ...response, data: enabledEngagements };
  }

  /**
   * Perform a partial update on an engagement
   */
  async partialUpdateEngagement(
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    changes: UpdateEngagementRequest,
    revision?: string,
  ): Promise<ILPResponse<LPEngagement>> {
    this.logger.info({ accountId, campaignId, engagementId, changes }, 'Partially updating engagement');
    return this.updateEngagement(accountId, campaignId, engagementId, token, changes, revision);
  }

  /**
   * Enable an engagement
   */
  async enableEngagement(
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    revision?: string,
  ): Promise<ILPResponse<LPEngagement>> {
    return this.partialUpdateEngagement(accountId, campaignId, engagementId, token, { status: 'active' }, revision);
  }

  /**
   * Disable an engagement
   */
  async disableEngagement(
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    revision?: string,
  ): Promise<ILPResponse<LPEngagement>> {
    return this.partialUpdateEngagement(accountId, campaignId, engagementId, token, { status: 'inactive' }, revision);
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
    revision?: string,
  ): Promise<ILPResponse<LPEngagement>> {
    return this.partialUpdateEngagement(accountId, campaignId, engagementId, token, { skillId }, revision);
  }
}
