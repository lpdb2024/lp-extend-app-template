/**
 * Working Hours Service
 * Handles all Working Hours API operations for LivePerson using the SDK
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
  LPWorkingHours,
  CreateWorkingHoursRequest,
  UpdateWorkingHoursRequest,
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
export class WorkingHoursService {
  private shellBaseUrl: string;
  private appId: string;

  constructor(
    @InjectPinoLogger(WorkingHoursService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(WorkingHoursService.name);
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
        scopes: [Scopes.WORKING_HOURS],
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
   * Get all working hours for an account
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<LPWorkingHours[]>> {
    const sdk = await this.getSDK(accountId, token);
    const response = await sdk.workingHours.getAll();
    this.logger.debug({ accountId, count: response.data?.length }, 'Fetched working hours');
    return response;
  }

  /**
   * Get a single working hours by ID
   */
  async getById(
    accountId: string,
    workingHoursId: string | number,
    token: string,
  ): Promise<ILPResponse<LPWorkingHours>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.workingHours.getById(Number(workingHoursId));
  }

  /**
   * Create new working hours
   */
  async create(
    accountId: string,
    token: string,
    data: CreateWorkingHoursRequest,
    revision?: string,
  ): Promise<ILPResponse<LPWorkingHours>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.workingHours.create(data);
  }

  /**
   * Create multiple working hours
   */
  async createMany(
    accountId: string,
    token: string,
    data: CreateWorkingHoursRequest[],
    revision?: string,
  ): Promise<ILPResponse<LPWorkingHours[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPWorkingHours[] = [];
    let lastRevision: string | undefined;
    for (const workingHours of data) {
      const response = await sdk.workingHours.create(workingHours);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Update working hours
   */
  async update(
    accountId: string,
    workingHoursId: string | number,
    token: string,
    data: UpdateWorkingHoursRequest,
    revision?: string,
  ): Promise<ILPResponse<LPWorkingHours>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.workingHours.update(Number(workingHoursId), data, revision);
  }

  /**
   * Update multiple working hours
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (UpdateWorkingHoursRequest & { id: number })[],
    revision?: string,
  ): Promise<ILPResponse<LPWorkingHours[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPWorkingHours[] = [];
    let lastRevision = revision;
    for (const workingHours of data) {
      const response = await sdk.workingHours.update(workingHours.id, workingHours, lastRevision);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Delete working hours
   */
  async remove(
    accountId: string,
    workingHoursId: string | number,
    token: string,
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.workingHours.delete(Number(workingHoursId), revision);
  }

  /**
   * Delete multiple working hours
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
      const response = await sdk.workingHours.delete(id, lastRevision);
      lastRevision = response.revision;
    }
    return { data: undefined, revision: lastRevision };
  }

  /**
   * Get the current revision for working hours
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }
}
