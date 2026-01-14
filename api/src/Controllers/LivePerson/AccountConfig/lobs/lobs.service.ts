/**
 * LOBs Service
 * Handles all LOBs (Lines of Business) API operations for LivePerson using the SDK
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Scopes } from '@lpextend/node-sdk';
import type {
  LPLOB,
  CreateLOBRequest,
  UpdateLOBRequest,
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
export class LobsService {
  constructor(
    @InjectPinoLogger(LobsService.name)
    private readonly logger: PinoLogger,
    private readonly sdkProvider: SDKProviderService,
  ) {
    this.logger.setContext(LobsService.name);
  }

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.LOBS]);
  }

  /**
   * Get all LOBs for an account
   */
  async getAll(
    accountId: string,
    token: TokenInfo | string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<LPLOB[]>> {
    const sdk = await this.getSDK(accountId, token);
    const response = await sdk.lobs.getAll();
    this.logger.debug({ accountId, count: response.data?.length }, 'Fetched LOBs');
    return response;
  }

  /**
   * Get a single LOB by ID
   */
  async getById(
    accountId: string,
    lobId: string | number,
    token: TokenInfo | string,
  ): Promise<ILPResponse<LPLOB>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.lobs.getById(Number(lobId));
  }

  /**
   * Create a new LOB
   */
  async create(
    accountId: string,
    token: TokenInfo | string,
    data: CreateLOBRequest,
    revision?: string,
  ): Promise<ILPResponse<LPLOB>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.lobs.create(data);
  }

  /**
   * Create multiple LOBs
   */
  async createMany(
    accountId: string,
    token: TokenInfo | string,
    data: CreateLOBRequest[],
    revision?: string,
  ): Promise<ILPResponse<LPLOB[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPLOB[] = [];
    let lastRevision: string | undefined;
    for (const lob of data) {
      const response = await sdk.lobs.create(lob);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Update a LOB
   */
  async update(
    accountId: string,
    lobId: string | number,
    token: TokenInfo | string,
    data: UpdateLOBRequest,
    revision?: string,
  ): Promise<ILPResponse<LPLOB>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.lobs.update(Number(lobId), data, revision);
  }

  /**
   * Update multiple LOBs
   */
  async updateMany(
    accountId: string,
    token: TokenInfo | string,
    data: (UpdateLOBRequest & { id: number })[],
    revision?: string,
  ): Promise<ILPResponse<LPLOB[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPLOB[] = [];
    let lastRevision = revision;
    for (const lob of data) {
      const response = await sdk.lobs.update(lob.id, lob, lastRevision);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Delete a LOB
   */
  async remove(
    accountId: string,
    lobId: string | number,
    token: TokenInfo | string,
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.lobs.delete(Number(lobId), revision);
  }

  /**
   * Delete multiple LOBs
   */
  async removeMany(
    accountId: string,
    token: TokenInfo | string,
    ids: number[],
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    let lastRevision = revision;
    for (const id of ids) {
      const response = await sdk.lobs.delete(id, lastRevision);
      lastRevision = response.revision;
    }
    return { data: undefined, revision: lastRevision };
  }

  /**
   * Get the current revision for LOBs
   */
  async getRevision(accountId: string, token: TokenInfo | string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }
}
