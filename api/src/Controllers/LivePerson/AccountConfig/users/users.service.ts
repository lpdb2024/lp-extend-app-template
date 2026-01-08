/**
 * Users Service
 * Handles all Users API operations for LivePerson
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
import { ILPResponse, ILPRequestOptions } from '../../shared/lp-common.interfaces';
import {
  IUser,
  ICreateUserRequest,
  IUpdateUserRequest,
  IBatchUpdateUsersRequest,
  IBatchUpdateUsersResponse,
} from './users.interfaces';

@Injectable()
export class UsersService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.USERS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(UsersService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(UsersService.name);
  }

  /**
   * Get all users for an account
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<IUser[]>> {
    const path = LP_API_PATHS.USERS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      includeDeleted: options?.includeDeleted,
      source: 'ccui',
    };

    return this.get<IUser[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single user by ID
   */
  async getById(
    accountId: string,
    userId: string,
    token: string,
  ): Promise<ILPResponse<IUser>> {
    const path = LP_API_PATHS.USERS.BY_ID(accountId, userId);

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<IUser>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new user
   */
  async create(
    accountId: string,
    token: string,
    data: ICreateUserRequest,
    revision?: string,
  ): Promise<ILPResponse<IUser>> {
    const path = LP_API_PATHS.USERS.BASE(accountId);

    // Users API uses v5.0 for creation
    const requestOptions: ILPRequestOptions = {
      version: '5.0',
      source: 'ccui',
      revision,
    };

    const createData = {
      ...data,
      isEnabled: data.isEnabled ?? true,
    };

    return this.post<IUser>(accountId, path, createData, token, requestOptions);
  }

  /**
   * Create multiple users
   */
  async createMany(
    accountId: string,
    token: string,
    data: ICreateUserRequest[],
    revision?: string,
  ): Promise<ILPResponse<IUser[]>> {
    const path = LP_API_PATHS.USERS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      version: '5.0',
      source: 'ccui',
      revision,
    };

    const createData = data.map((user) => ({
      ...user,
      isEnabled: user.isEnabled ?? true,
    }));

    return this.post<IUser[]>(accountId, path, createData, token, requestOptions);
  }

  /**
   * Update a user
   */
  async update(
    accountId: string,
    userId: string,
    token: string,
    data: IUpdateUserRequest,
    revision: string,
  ): Promise<ILPResponse<IUser>> {
    const path = LP_API_PATHS.USERS.BY_ID(accountId, userId);

    const requestOptions: ILPRequestOptions = {
      version: '5.0',
      source: 'ccui',
      revision,
    };

    return this.put<IUser>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update multiple users
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (IUpdateUserRequest & { id: string })[],
    revision: string,
  ): Promise<ILPResponse<IUser[]>> {
    const path = LP_API_PATHS.USERS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      version: '5.0',
      source: 'ccui',
      revision,
    };

    return this.put<IUser[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete a user
   */
  async remove(
    accountId: string,
    userId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.USERS.BY_ID(accountId, userId);

    const requestOptions: ILPRequestOptions = {
      version: '5.0',
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Delete multiple users
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: string[],
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.USERS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      version: '5.0',
      source: 'ccui',
      revision,
      additionalParams: {
        ids: ids.join(','),
      },
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Reset user password
   */
  async resetPassword(
    accountId: string,
    userId: string,
    token: string,
    newPassword: string,
  ): Promise<ILPResponse<void>> {
    const path = `${LP_API_PATHS.USERS.BY_ID(accountId, userId)}/resetPassword`;

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
    };

    return this.post<void>(accountId, path, { newPassword }, token, requestOptions);
  }

  /**
   * Get the current revision for users
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }

  /**
   * Find all users that have a specific skill assigned
   */
  async getUsersWithSkill(
    accountId: string,
    token: string,
    skillId: number,
  ): Promise<IUser[]> {
    const response = await this.getAll(accountId, token, { select: '$all' });
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
    token: string,
    skillId: number,
  ): Promise<ILPResponse<IUser>> {
    // Fetch the full user to get current state
    const userResponse = await this.getById(accountId, userId, token);
    const user = userResponse.data;
    const revision = userResponse.revision;

    if (!revision) {
      throw new Error('Could not get revision for user update');
    }

    // Remove the skill from skillIds - also filter out any null/undefined values
    const updatedSkillIds = (user.skillIds || [])
      .filter((id): id is number => id != null && id !== skillId);

    // Filter null values from all ID arrays - LP API rejects null values
    const safeProfileIds = (user.profileIds || []).filter((id): id is number => id != null);
    const safeLobIds = (user.lobIds || []).filter((id): id is number => id != null);

    // Build update payload with required id field
    // LP API requires id in the body for PUT requests
    const updatePayload = {
      id: userId,
      skillIds: updatedSkillIds,
      profileIds: safeProfileIds,
      lobIds: safeLobIds,
    };

    this.logger.info({
      fn: 'removeSkillFromUser',
      message: 'Removing skill from user - MINIMAL PAYLOAD',
      accountId,
      userId,
      skillId,
      originalSkillIds: user.skillIds,
      updatedSkillIds,
      payloadKeys: Object.keys(updatePayload),
      payload: JSON.stringify(updatePayload),
    });

    return this.update(accountId, userId, token, updatePayload, revision);
  }

  /**
   * Remove a skill from multiple users in bulk
   * Returns success/failure for each user
   */
  async removeSkillFromUsers(
    accountId: string,
    token: string,
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
   * Batch update users using LP's batch API
   * Allows adding/removing field values in bulk
   *
   * Example: Remove skill 123 from users [1, 2, 3]:
   * batchUpdate(accountId, token, {
   *   ids: [1, 2, 3],
   *   fields: [{ name: 'skillIds', value: [123], operation: 'remove' }]
   * })
   */
  async batchUpdate(
    accountId: string,
    token: string,
    request: IBatchUpdateUsersRequest,
  ): Promise<ILPResponse<IBatchUpdateUsersResponse>> {
    const path = LP_API_PATHS.USERS.BATCH(accountId);

    this.logger.info({
      fn: 'batchUpdate',
      message: 'Batch updating users',
      accountId,
      userCount: request.ids.length,
      fields: request.fields,
    });

    // LP batch API uses v4.0
    const requestOptions: ILPRequestOptions = {
      version: '4.0',
      source: 'ccui',
    };

    return this.post<IBatchUpdateUsersResponse>(
      accountId,
      path,
      request,
      token,
      requestOptions,
    );
  }

  /**
   * Remove a skill from multiple users using batch API
   * This is a convenience method that uses batchUpdate internally
   */
  async batchRemoveSkillFromUsers(
    accountId: string,
    token: string,
    skillId: number,
    userIds: (string | number)[],
  ): Promise<ILPResponse<IBatchUpdateUsersResponse>> {
    this.logger.info({
      fn: 'batchRemoveSkillFromUsers',
      message: 'Batch removing skill from users',
      accountId,
      skillId,
      userCount: userIds.length,
      userIds,
    });

    return this.batchUpdate(accountId, token, {
      ids: userIds,
      fields: [
        {
          name: 'skillIds',
          value: [skillId],
          operation: 'remove',
        },
      ],
    });
  }

  /**
   * Add a skill to multiple users using batch API
   */
  async batchAddSkillToUsers(
    accountId: string,
    token: string,
    skillId: number,
    userIds: (string | number)[],
  ): Promise<ILPResponse<IBatchUpdateUsersResponse>> {
    this.logger.info({
      fn: 'batchAddSkillToUsers',
      message: 'Batch adding skill to users',
      accountId,
      skillId,
      userCount: userIds.length,
    });

    return this.batchUpdate(accountId, token, {
      ids: userIds,
      fields: [
        {
          name: 'skillIds',
          value: [skillId],
          operation: 'add',
        },
      ],
    });
  }
}
