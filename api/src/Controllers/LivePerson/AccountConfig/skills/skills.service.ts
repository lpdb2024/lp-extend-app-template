/**
 * Skills Service
 * Handles all Skills API operations for LivePerson
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
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
  ISkill,
  ICreateSkillRequest,
  IUpdateSkillRequest,
} from './skills.interfaces';
import { UsersService } from '../users/users.service';

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
export class SkillsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.SKILLS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(SkillsService.name)
    logger: PinoLogger,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(SkillsService.name);
  }

  /**
   * Get all skills for an account
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<ISkill[]>> {
    const path = LP_API_PATHS.SKILLS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      includeDeleted: options?.includeDeleted,
      source: 'ccui',
    };

    return this.get<ISkill[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single skill by ID
   */
  async getById(
    accountId: string,
    skillId: string | number,
    token: string,
  ): Promise<ILPResponse<ISkill>> {
    const path = LP_API_PATHS.SKILLS.BY_ID(accountId, String(skillId));

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<ISkill>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new skill
   */
  async create(
    accountId: string,
    token: string,
    data: ICreateSkillRequest,
    revision?: string,
  ): Promise<ILPResponse<ISkill>> {
    const path = LP_API_PATHS.SKILLS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<ISkill>(accountId, path, data, token, requestOptions);
  }

  /**
   * Create multiple skills
   */
  async createMany(
    accountId: string,
    token: string,
    data: ICreateSkillRequest[],
    revision?: string,
  ): Promise<ILPResponse<ISkill[]>> {
    const path = LP_API_PATHS.SKILLS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<ISkill[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update a skill
   */
  async update(
    accountId: string,
    skillId: string | number,
    token: string,
    data: IUpdateSkillRequest,
    revision: string,
  ): Promise<ILPResponse<ISkill>> {
    const path = LP_API_PATHS.SKILLS.BY_ID(accountId, String(skillId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<ISkill>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update multiple skills
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (IUpdateSkillRequest & { id: number })[],
    revision: string,
  ): Promise<ILPResponse<ISkill[]>> {
    const path = LP_API_PATHS.SKILLS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<ISkill[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete a skill
   */
  async remove(
    accountId: string,
    skillId: string | number,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.SKILLS.BY_ID(accountId, String(skillId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Delete multiple skills
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: number[],
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.SKILLS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
      additionalParams: {
        ids: ids.join(','),
      },
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Get the current revision for skills
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }

  /**
   * Check skill dependencies (users assigned to this skill)
   */
  async checkDependencies(
    accountId: string,
    skillId: number,
    token: string,
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
    token: string,
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
      if (!revision) {
        return {
          success: false,
          message: 'Could not get revision for skill deletion',
          dependencies,
          usersUpdated,
          usersFailed,
        };
      }

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
