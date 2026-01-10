/**
 * Profiles Service
 * Handles all Profiles API operations for LivePerson using the SDK
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
  LPProfile,
  CreateProfileRequest,
  UpdateProfileRequest,
} from '@lpextend/client-sdk';

/**
 * Response type for SDK operations
 */
export interface ILPResponse<T> {
  data: T;
  revision?: string;
  headers?: Record<string, string>;
}

@Injectable()
export class ProfilesService {
  private shellBaseUrl: string;
  private appId: string;

  constructor(
    @InjectPinoLogger(ProfilesService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(ProfilesService.name);
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
        scopes: [Scopes.PROFILES],
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
   * Get all profiles for an account
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<LPProfile[]>> {
    const sdk = await this.getSDK(accountId, token);
    const response = await sdk.profiles.getAll();
    this.logger.debug({ accountId, count: response.data?.length }, 'Fetched profiles');
    return response;
  }

  /**
   * Get a single profile by ID
   */
  async getById(
    accountId: string,
    profileId: string | number,
    token: string,
  ): Promise<ILPResponse<LPProfile>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.profiles.getById(Number(profileId));
  }

  /**
   * Create a new profile
   */
  async create(
    accountId: string,
    token: string,
    data: CreateProfileRequest,
    revision?: string,
  ): Promise<ILPResponse<LPProfile>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.profiles.create(data);
  }

  /**
   * Create multiple profiles
   */
  async createMany(
    accountId: string,
    token: string,
    data: CreateProfileRequest[],
    revision?: string,
  ): Promise<ILPResponse<LPProfile[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPProfile[] = [];
    let lastRevision: string | undefined;
    for (const profile of data) {
      const response = await sdk.profiles.create(profile);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Update a profile
   */
  async update(
    accountId: string,
    profileId: string | number,
    token: string,
    data: UpdateProfileRequest,
    revision?: string,
  ): Promise<ILPResponse<LPProfile>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.profiles.update(Number(profileId), data, revision);
  }

  /**
   * Update multiple profiles
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (UpdateProfileRequest & { id: number })[],
    revision?: string,
  ): Promise<ILPResponse<LPProfile[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPProfile[] = [];
    let lastRevision = revision;
    for (const profile of data) {
      const response = await sdk.profiles.update(profile.id, profile, lastRevision);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Delete a profile
   */
  async remove(
    accountId: string,
    profileId: string | number,
    token: string,
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.profiles.delete(Number(profileId), revision);
  }

  /**
   * Delete multiple profiles
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
      const response = await sdk.profiles.delete(id, lastRevision);
      lastRevision = response.revision;
    }
    return { data: undefined, revision: lastRevision };
  }

  /**
   * Get the current revision for profiles
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }
}
