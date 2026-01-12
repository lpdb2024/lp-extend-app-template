/**
 * Skills Service
 * Handles all Skills API operations for LivePerson using the SDK
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Scopes } from '@lpextend/node-sdk';
import type { LPSkill, CreateSkillRequest, UpdateSkillRequest } from '@lpextend/node-sdk';
import { UsersService } from '../users/users.service';
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
 * Skill dependency info for deletion
 */
export interface ISkillDependencies {
  skillId: number;
  skillName: string;
  hasDependencies: boolean;
  users: { id: string; loginName: string; fullName?: string }[];
  otherDependencyCount?: number;
}

/**
 * Smart delete response
 */
export interface ISmartDeleteResponse {
  success: boolean;
  message?: string;
  dependencies?: ISkillDependencies;
  usersUpdated?: string[];
  usersFailed?: { userId: string; error: string }[];
}

@Injectable()
export class SkillsService {
  constructor(
    @InjectPinoLogger(SkillsService.name)
    private readonly logger: PinoLogger,
    private readonly sdkProvider: SDKProviderService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    this.logger.setContext(SkillsService.name);
  }

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.SKILLS, Scopes.USERS]);
  }

  /**
   * Get all skills for an account
   */
  async getAll(
    accountId: string,
    token: TokenInfo | string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<LPSkill[]>> {
    const sdk = await this.getSDK(accountId, token);
    const response = await sdk.skills.getAll();
    this.logger.info({ accountId, count: response.data?.length }, 'Fetched skills');
    return response;
  }

  /**
   * Get a single skill by ID
   */
  async getById(
    accountId: string,
    skillId: string | number,
    token: TokenInfo | string,
  ): Promise<ILPResponse<LPSkill>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.skills.getById(Number(skillId));
  }

  /**
   * Create a new skill
   */
  async create(
    accountId: string,
    token: TokenInfo | string,
    data: CreateSkillRequest,
    revision?: string,
  ): Promise<ILPResponse<LPSkill>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.skills.create(data);
  }

  /**
   * Create multiple skills
   */
  async createMany(
    accountId: string,
    token: TokenInfo | string,
    data: CreateSkillRequest[],
    revision?: string,
  ): Promise<ILPResponse<LPSkill[]>> {
    const sdk = await this.getSDK(accountId, token);
    // Create skills one by one and collect results
    const results: LPSkill[] = [];
    let lastRevision: string | undefined;
    for (const skill of data) {
      const response = await sdk.skills.create(skill);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Update a skill
   */
  async update(
    accountId: string,
    skillId: string | number,
    token: TokenInfo | string,
    data: UpdateSkillRequest,
    revision?: string,
  ): Promise<ILPResponse<LPSkill>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.skills.update(Number(skillId), data, revision);
  }

  /**
   * Update multiple skills
   */
  async updateMany(
    accountId: string,
    token: TokenInfo | string,
    data: (UpdateSkillRequest & { id: number })[],
    revision?: string,
  ): Promise<ILPResponse<LPSkill[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPSkill[] = [];
    let lastRevision = revision;
    for (const skill of data) {
      const response = await sdk.skills.update(skill.id, skill, lastRevision);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Delete a skill
   */
  async remove(
    accountId: string,
    skillId: string | number,
    token: TokenInfo | string,
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.skills.delete(Number(skillId), revision);
  }

  /**
   * Delete multiple skills
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
      const response = await sdk.skills.delete(id, lastRevision);
      lastRevision = response.revision;
    }
    return { data: undefined, revision: lastRevision };
  }

  /**
   * Get the current revision for skills
   */
  async getRevision(accountId: string, token: TokenInfo | string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }

  /**
   * Check skill dependencies (users assigned to this skill)
   */
  async checkDependencies(
    accountId: string,
    skillId: number,
    token: TokenInfo | string,
  ): Promise<ISkillDependencies> {
    // Get the skill info
    const skillResponse = await this.getById(accountId, skillId, token);
    const skill = skillResponse.data;

    // Get all users with this skill
    const usersWithSkill = await this.usersService.getUsersWithSkill(
      accountId,
      token,
      skillId,
    );

    const dependencies: ISkillDependencies = {
      skillId,
      skillName: skill.name,
      hasDependencies: usersWithSkill.length > 0,
      users: usersWithSkill.map((u) => ({
        id: u.id,
        loginName: u.loginName,
        fullName: u.fullName,
      })),
    };

    this.logger.info({
      fn: 'checkDependencies',
      message: 'Checked skill dependencies',
      accountId,
      skillId,
      skillName: skill.name,
      userCount: usersWithSkill.length,
    });

    return dependencies;
  }

  /**
   * Smart delete skill with dependency management
   * mode='check': Returns dependencies without deleting
   * mode='force': Removes dependencies (unassigns from users), then deletes
   */
  async smartDelete(
    accountId: string,
    skillId: number,
    token: TokenInfo | string,
    mode: 'check' | 'force',
  ): Promise<ISmartDeleteResponse> {
    // First, check dependencies
    const dependencies = await this.checkDependencies(accountId, skillId, token);

    // If mode is check, just return the dependencies
    if (mode === 'check') {
      return {
        success: true,
        message: dependencies.hasDependencies
          ? `Skill "${dependencies.skillName}" has ${dependencies.users.length} user(s) assigned`
          : `Skill "${dependencies.skillName}" has no dependencies and can be deleted`,
        dependencies,
      };
    }

    // Mode is 'force' - remove dependencies and delete
    let usersUpdated: string[] = [];
    let usersFailed: { userId: string; error: string }[] = [];

    // If there are user dependencies, remove the skill from all users
    if (dependencies.users.length > 0) {
      const userIds = dependencies.users.map((u) => u.id);
      const results = await this.usersService.removeSkillFromUsers(
        accountId,
        token,
        skillId,
        userIds,
      );
      usersUpdated = results.success;
      usersFailed = results.failed;

      // If any user updates failed, don't proceed with deletion
      if (usersFailed.length > 0) {
        return {
          success: false,
          message: `Failed to remove skill from ${usersFailed.length} user(s). Skill not deleted.`,
          dependencies,
          usersUpdated,
          usersFailed,
        };
      }

      this.logger.info({
        fn: 'smartDelete',
        message: 'Removed skill from all users',
        accountId,
        skillId,
        usersUpdated,
      });
    }

    // Now delete the skill
    try {
      const revision = await this.getRevision(accountId, token);
      await this.remove(accountId, skillId, token, revision);

      this.logger.info({
        fn: 'smartDelete',
        message: 'Skill deleted successfully',
        accountId,
        skillId,
        skillName: dependencies.skillName,
        usersUpdated: usersUpdated.length,
      });

      return {
        success: true,
        message: `Skill "${dependencies.skillName}" deleted successfully. ${usersUpdated.length > 0 ? `Removed from ${usersUpdated.length} user(s).` : ''}`,
        dependencies,
        usersUpdated,
        usersFailed,
      };
    } catch (error) {
      this.logger.error({
        fn: 'smartDelete',
        message: 'Failed to delete skill',
        accountId,
        skillId,
        error: error.message,
      });

      return {
        success: false,
        message: `Failed to delete skill: ${error.message}`,
        dependencies,
        usersUpdated,
        usersFailed,
      };
    }
  }
}
