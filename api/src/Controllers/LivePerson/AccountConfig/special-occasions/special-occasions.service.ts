/**
 * Special Occasions Service
 * Handles all Special Occasions API operations for LivePerson using the SDK
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Scopes } from '@lpextend/node-sdk';
import type {
  LPSpecialOccasion,
  CreateSpecialOccasionRequest,
  UpdateSpecialOccasionRequest,
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
export class SpecialOccasionsService {
  constructor(
    @InjectPinoLogger(SpecialOccasionsService.name)
    private readonly logger: PinoLogger,
    private readonly sdkProvider: SDKProviderService,
  ) {
    this.logger.setContext(SpecialOccasionsService.name);
  }

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.SPECIAL_OCCASIONS]);
  }

  /**
   * Get all special occasions for an account
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<LPSpecialOccasion[]>> {
    const sdk = await this.getSDK(accountId, token);
    const response = await sdk.specialOccasions.getAll();
    this.logger.debug({ accountId, count: response.data?.length }, 'Fetched special occasions');
    return response;
  }

  /**
   * Get a single special occasion by ID
   */
  async getById(
    accountId: string,
    occasionId: string | number,
    token: string,
  ): Promise<ILPResponse<LPSpecialOccasion>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.specialOccasions.getById(Number(occasionId));
  }

  /**
   * Create a new special occasion
   */
  async create(
    accountId: string,
    token: string,
    data: CreateSpecialOccasionRequest,
    revision?: string,
  ): Promise<ILPResponse<LPSpecialOccasion>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.specialOccasions.create(data);
  }

  /**
   * Create multiple special occasions
   */
  async createMany(
    accountId: string,
    token: string,
    data: CreateSpecialOccasionRequest[],
    revision?: string,
  ): Promise<ILPResponse<LPSpecialOccasion[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPSpecialOccasion[] = [];
    let lastRevision: string | undefined;
    for (const occasion of data) {
      const response = await sdk.specialOccasions.create(occasion);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Update a special occasion
   */
  async update(
    accountId: string,
    occasionId: string | number,
    token: string,
    data: UpdateSpecialOccasionRequest,
    revision?: string,
  ): Promise<ILPResponse<LPSpecialOccasion>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.specialOccasions.update(Number(occasionId), data, revision);
  }

  /**
   * Update multiple special occasions
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (UpdateSpecialOccasionRequest & { id: number })[],
    revision?: string,
  ): Promise<ILPResponse<LPSpecialOccasion[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPSpecialOccasion[] = [];
    let lastRevision = revision;
    for (const occasion of data) {
      const response = await sdk.specialOccasions.update(occasion.id, occasion, lastRevision);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Delete a special occasion
   */
  async remove(
    accountId: string,
    occasionId: string | number,
    token: string,
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.specialOccasions.delete(Number(occasionId), revision);
  }

  /**
   * Delete multiple special occasions
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
      const response = await sdk.specialOccasions.delete(id, lastRevision);
      lastRevision = response.revision;
    }
    return { data: undefined, revision: lastRevision };
  }

  /**
   * Get the current revision for special occasions
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }
}
