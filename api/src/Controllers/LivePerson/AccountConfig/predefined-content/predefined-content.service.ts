/**
 * Predefined Content Service
 * Handles all Predefined Content API operations for LivePerson using the SDK
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Scopes } from '@lpextend/node-sdk';
import type {
  LPPredefinedContent,
  CreatePredefinedContentRequest,
  UpdatePredefinedContentRequest,
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

@Injectable()
export class PredefinedContentService {
  constructor(
    @InjectPinoLogger(PredefinedContentService.name)
    private readonly logger: PinoLogger,
    private readonly sdkProvider: SDKProviderService,
  ) {
    this.logger.setContext(PredefinedContentService.name);
  }

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.PREDEFINED_CONTENT]);
  }

  /**
   * Get all predefined content for an account
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
      skillIds?: string;
      categoryIds?: string;
      enabled?: boolean;
    },
  ): Promise<ILPResponse<LPPredefinedContent[]>> {
    const sdk = await this.getSDK(accountId, token);
    const response = await sdk.predefinedContent.getAll();
    this.logger.debug({ accountId, count: response.data?.length }, 'Fetched predefined content');
    return response;
  }

  /**
   * Get a single predefined content by ID
   */
  async getById(
    accountId: string,
    contentId: string | number,
    token: string,
  ): Promise<ILPResponse<LPPredefinedContent>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.predefinedContent.getById(Number(contentId));
  }

  /**
   * Create new predefined content
   */
  async create(
    accountId: string,
    token: string,
    data: CreatePredefinedContentRequest,
    revision?: string,
  ): Promise<ILPResponse<LPPredefinedContent>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.predefinedContent.create(data);
  }

  /**
   * Create multiple predefined content items
   */
  async createMany(
    accountId: string,
    token: string,
    data: CreatePredefinedContentRequest[],
    revision?: string,
  ): Promise<ILPResponse<LPPredefinedContent[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPPredefinedContent[] = [];
    let lastRevision: string | undefined;
    for (const content of data) {
      const response = await sdk.predefinedContent.create(content);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Update predefined content
   */
  async update(
    accountId: string,
    contentId: string | number,
    token: string,
    data: UpdatePredefinedContentRequest,
    revision?: string,
  ): Promise<ILPResponse<LPPredefinedContent>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.predefinedContent.update(Number(contentId), data, revision);
  }

  /**
   * Update multiple predefined content items
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (UpdatePredefinedContentRequest & { id: number })[],
    revision?: string,
  ): Promise<ILPResponse<LPPredefinedContent[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPPredefinedContent[] = [];
    let lastRevision = revision;
    for (const content of data) {
      const response = await sdk.predefinedContent.update(content.id, content, lastRevision);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Delete predefined content
   */
  async remove(
    accountId: string,
    contentId: string | number,
    token: string,
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.predefinedContent.delete(Number(contentId), revision);
  }

  /**
   * Delete multiple predefined content items
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: number[],
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    let lastRevision = revision;
    for (const id of ids) {
      const response = await sdk.predefinedContent.delete(id, lastRevision);
      lastRevision = response.revision;
    }
    return { data: undefined, revision: lastRevision };
  }

  /**
   * Get the current revision for predefined content
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }
}
