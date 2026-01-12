/**
 * Users Service
 * Handles all Users API operations for LivePerson using the SDK
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
import type { LPUser, CreateUserRequest, UpdateUserRequest } from '@lpextend/node-sdk';

/**
 * Token info from controller
 */
export interface TokenInfo {
  accessToken: string;
  extendToken?: string;
}

/**
 * Response type for SDK operations
 */
export interface ILPResponse<T> {
  data: T;
  revision?: string;
  headers?: Record<string, string>;
}

/**
 * Batch update request for users
 */
export interface IBatchUpdateUsersRequest {
  ids: (string | number)[];
  fields: {
    name: string;
    value: any[];
    operation: 'add' | 'remove' | 'replace';
  }[];
}

/**
 * Batch update response
 */
export interface IBatchUpdateUsersResponse {
  success: boolean;
  results?: any[];
}

@Injectable()
export class UsersService {
  private shellBaseUrl: string;
  private appId: string;

  constructor(
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(UsersService.name);
    this.shellBaseUrl = this.configService.get<string>('SHELL_BASE_URL') || 'http://localhost:3001';
    this.appId = this.configService.get<string>('APP_ID') || 'lp-extend-template';
  }

  /**
   * Create SDK instance for the given account/token
   * Uses extendToken (preferred) when available for shell verification,
   * falls back to direct accessToken otherwise.
   */
  private async getSDK(accountId: string, token: TokenInfo | string): Promise<LPExtendSDK> {
    try {
      // Handle both new TokenInfo object and legacy string format
      const tokenInfo: TokenInfo = typeof token === 'string'
        ? { accessToken: token.replace('Bearer ', '') }
        : token;

      // Use extendToken for SDK if available (preferred - SDK verifies with shell)
      // Otherwise fall back to direct accessToken
      const sdkConfig = tokenInfo.extendToken
        ? {
            appId: this.appId,
            accountId,
            extendToken: tokenInfo.extendToken,
            shellBaseUrl: this.shellBaseUrl,
            scopes: [Scopes.USERS, Scopes.SKILLS],
            debug: this.configService.get<string>('NODE_ENV') !== 'production',
          }
        : {
            appId: this.appId,
            accountId,
            accessToken: tokenInfo.accessToken.replace('Bearer ', ''),
            shellBaseUrl: this.shellBaseUrl,
            scopes: [Scopes.USERS, Scopes.SKILLS],
            debug: this.configService.get<string>('NODE_ENV') !== 'production',
          };

      this.logger.debug({
        fn: 'getSDK',
        accountId,
        hasExtendToken: !!tokenInfo.extendToken,
        hasAccessToken: !!tokenInfo.accessToken,
      }, 'Initializing SDK');

      return await initializeSDK(sdkConfig);
    } catch (error) {
      if (error instanceof LPExtendSDKError) {
        this.logger.error({ error: error.message, code: error.code }, 'SDK initialization failed');
      }
      throw error;
    }
  }

  /**
   * Get all users for an account
   */
  async getAll(
    accountId: string,
    token: TokenInfo | string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<LPUser[]>> {
    const sdk = await this.getSDK(accountId, token);
    const response = await sdk.users.getAll();
    this.logger.debug({ accountId, count: response.data?.length }, 'Fetched users');
    return response;
  }

  /**
   * Get a single user by ID
   */
  async getById(
    accountId: string,
    userId: string,
    token: TokenInfo | string,
  ): Promise<ILPResponse<LPUser>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.users.getById(userId);
  }

  /**
   * Create a new user
   */
  async create(
    accountId: string,
    token: TokenInfo | string,
    data: CreateUserRequest,
    revision?: string,
  ): Promise<ILPResponse<LPUser>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.users.create(data);
  }

  /**
   * Create multiple users
   */
  async createMany(
    accountId: string,
    token: TokenInfo | string,
    data: CreateUserRequest[],
    revision?: string,
  ): Promise<ILPResponse<LPUser[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPUser[] = [];
    let lastRevision: string | undefined;
    for (const user of data) {
      const response = await sdk.users.create(user);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Update a user
   */
  async update(
    accountId: string,
    userId: string,
    token: TokenInfo | string,
    data: UpdateUserRequest,
    revision?: string,
  ): Promise<ILPResponse<LPUser>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.users.update(userId, data, revision);
  }

  /**
   * Update multiple users
   */
  async updateMany(
    accountId: string,
    token: TokenInfo | string,
    data: (UpdateUserRequest & { id: string })[],
    revision?: string,
  ): Promise<ILPResponse<LPUser[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPUser[] = [];
    let lastRevision = revision;
    for (const user of data) {
      const response = await sdk.users.update(user.id, user, lastRevision);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Delete a user
   */
  async remove(
    accountId: string,
    userId: string,
    token: TokenInfo | string,
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.users.delete(userId, revision);
  }

  /**
   * Delete multiple users
   */
  async removeMany(
    accountId: string,
    token: TokenInfo | string,
    ids: string[],
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    let lastRevision = revision;
    for (const id of ids) {
      const response = await sdk.users.delete(id, lastRevision);
      lastRevision = response.revision;
    }
    return { data: undefined, revision: lastRevision };
  }

  /**
   * Get the current revision for users
   */
  async getRevision(accountId: string, token: TokenInfo | string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }

  /**
   * Find all users that have a specific skill assigned
   */
  async getUsersWithSkill(
    accountId: string,
    token: TokenInfo | string,
    skillId: number,
  ): Promise<LPUser[]> {
    const response = await this.getAll(accountId, token);
    return response.data.filter(
      (user) => user.skillIds && user.skillIds.includes(skillId),
    );
  }

  /**
   * Remove a skill from a user
   * Fetches the user, removes the skill from skillIds, and updates
   */
  async removeSkillFromUser(
    accountId: string,
    userId: string,
    token: TokenInfo | string,
    skillId: number,
  ): Promise<ILPResponse<LPUser>> {
    const sdk = await this.getSDK(accountId, token);

    // Fetch the full user to get current state
    const userResponse = await sdk.users.getById(userId);
    const user = userResponse.data;
    const revision = userResponse.revision;

    // Remove the skill from skillIds - also filter out any null/undefined values
    const updatedSkillIds = (user.skillIds || [])
      .filter((id): id is number => id != null && id !== skillId);

    // Filter null values from all ID arrays - LP API rejects null values
    const safeProfileIds = (user.profileIds || []).filter((id): id is number => id != null);

    // Build update payload
    const updatePayload: UpdateUserRequest = {
      skillIds: updatedSkillIds,
      profileIds: safeProfileIds,
    };

    this.logger.info({
      fn: 'removeSkillFromUser',
      message: 'Removing skill from user',
      accountId,
      userId,
      skillId,
      originalSkillIds: user.skillIds,
      updatedSkillIds,
    });

    return sdk.users.update(userId, updatePayload, revision);
  }

  /**
   * Remove a skill from multiple users in bulk
   * Returns success/failure for each user
   */
  async removeSkillFromUsers(
    accountId: string,
    token: TokenInfo | string,
    skillId: number,
    userIds: string[],
  ): Promise<{ success: string[]; failed: { userId: string; error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { userId: string; error: string }[],
    };

    for (const userId of userIds) {
      try {
        await this.removeSkillFromUser(accountId, userId, token, skillId);
        results.success.push(userId);
      } catch (error) {
        results.failed.push({
          userId,
          error: error.message || 'Unknown error',
        });
        this.logger.error({
          fn: 'removeSkillFromUsers',
          message: 'Failed to remove skill from user',
          accountId,
          userId,
          skillId,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Add a skill to multiple users
   */
  async addSkillToUsers(
    accountId: string,
    token: TokenInfo | string,
    skillId: number,
    userIds: string[],
  ): Promise<{ success: string[]; failed: { userId: string; error: string }[] }> {
    const sdk = await this.getSDK(accountId, token);
    const results = {
      success: [] as string[],
      failed: [] as { userId: string; error: string }[],
    };

    for (const userId of userIds) {
      try {
        const userResponse = await sdk.users.getById(userId);
        const user = userResponse.data;
        const skillIds = user.skillIds || [];

        if (!skillIds.includes(skillId)) {
          await sdk.users.update(userId, {
            skillIds: [...skillIds, skillId],
          }, userResponse.revision);
        }

        results.success.push(userId);
      } catch (error) {
        results.failed.push({
          userId,
          error: error.message || 'Unknown error',
        });
        this.logger.error({
          fn: 'addSkillToUsers',
          message: 'Failed to add skill to user',
          accountId,
          userId,
          skillId,
          error: error.message,
        });
      }
    }

    return results;
  }
}
