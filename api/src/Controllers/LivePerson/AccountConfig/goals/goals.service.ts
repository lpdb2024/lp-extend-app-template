/**
 * Goals Service
 * Business logic for LivePerson Goals API
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
import { ILPResponse } from '../../shared/lp-common.interfaces';
import {
  IGoal,
  IGoalCreateRequest,
  IGoalUpdateRequest,
  IGoalQuery,
} from './goals.interfaces';

@Injectable()
export class GoalsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_READ;
  protected readonly writeDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.GOALS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(GoalsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(GoalsService.name);
  }

  /**
   * Get all goals for an account
   */
  async getGoals(
    accountId: string,
    token: string,
    query?: IGoalQuery,
  ): Promise<ILPResponse<IGoal[]>> {
    const path = LP_API_PATHS.GOALS.BASE(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId }, 'Getting all goals');

    return this.get<IGoal[]>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get a goal by ID
   */
  async getGoalById(
    accountId: string,
    goalId: string,
    token: string,
    query?: IGoalQuery,
  ): Promise<ILPResponse<IGoal>> {
    const path = LP_API_PATHS.GOALS.BY_ID(accountId, goalId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, goalId }, 'Getting goal by ID');

    return this.get<IGoal>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Create a new goal
   */
  async createGoal(
    accountId: string,
    token: string,
    goal: IGoalCreateRequest,
    query?: IGoalQuery,
  ): Promise<ILPResponse<IGoal>> {
    const path = LP_API_PATHS.GOALS.BASE(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, goalName: goal.name }, 'Creating goal');

    return this.post<IGoal>(accountId, path, goal, token, {
      additionalParams,
      useWriteDomain: true,
    });
  }

  /**
   * Update a goal
   */
  async updateGoal(
    accountId: string,
    goalId: string,
    token: string,
    goal: IGoalUpdateRequest,
    revision: string,
    query?: IGoalQuery,
  ): Promise<ILPResponse<IGoal>> {
    const path = LP_API_PATHS.GOALS.BY_ID(accountId, goalId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, goalId }, 'Updating goal');

    return this.put<IGoal>(accountId, path, goal, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Delete a goal
   */
  async deleteGoal(
    accountId: string,
    goalId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.GOALS.BY_ID(accountId, goalId);
    const additionalParams: Record<string, string> = {
      v: this.defaultApiVersion,
    };

    this.logger.info({ accountId, goalId }, 'Deleting goal');

    return this.delete<void>(accountId, path, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Build query parameters
   */
  private buildQueryParams(query?: IGoalQuery): Record<string, string> {
    const params: Record<string, string> = {
      v: query?.v || this.defaultApiVersion,
    };

    if (query?.fields) {
      params.fields = Array.isArray(query.fields)
        ? query.fields.join(',')
        : query.fields;
    }

    if (query?.field_set) {
      params.field_set = query.field_set;
    }

    if (query?.select) {
      params.select = query.select;
    }

    if (query?.include_deleted) {
      params.include_deleted = 'true';
    }

    return params;
  }
}
