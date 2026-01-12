/**
 * LOBs Service
 * Handles all LOBs (Lines of Business) API operations for LivePerson using the SDK
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import {
  initializeSDK,
  LPExtendSDK,
  Scopes,
  LPExtendSDKError,
} from '@lpextend/node-sdk';
import type {
  LPLOB,
  CreateLOBRequest,
  UpdateLOBRequest,
} from '@lpextend/node-sdk';

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
  private shellBaseUrl: string;
  private appId: string;

  constructor(
    @InjectPinoLogger(LobsService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(LobsService.name);
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
        scopes: [Scopes.LOBS],
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
   * Get all LOBs for an account
   */
  async getAll(
    accountId: string,
    token: string,
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
    token: string,
  ): Promise<ILPResponse<LPLOB>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.lobs.getById(Number(lobId));
  }

  /**
   * Create a new LOB
   */
  async create(
    accountId: string,
    token: string,
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
    token: string,
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
    token: string,
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
    token: string,
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
    token: string,
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
    token: string,
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
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }
}
