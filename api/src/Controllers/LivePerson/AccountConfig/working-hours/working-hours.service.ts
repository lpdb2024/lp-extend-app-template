/**
 * Working Hours Service
 * Business logic for LivePerson Working Hours (Workdays) API
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
  IWorkingHours,
  ICreateWorkingHours,
  IUpdateWorkingHours,
} from './working-hours.interfaces';

@Injectable()
export class WorkingHoursService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.WORKING_HOURS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(WorkingHoursService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(WorkingHoursService.name);
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
  ): Promise<ILPResponse<IWorkingHours[]>> {
    const path = LP_API_PATHS.WORKING_HOURS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      includeDeleted: options?.includeDeleted,
      source: 'ccui',
    };

    return this.get<IWorkingHours[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single working hours by ID
   */
  async getById(
    accountId: string,
    workingHoursId: string | number,
    token: string,
  ): Promise<ILPResponse<IWorkingHours>> {
    const path = LP_API_PATHS.WORKING_HOURS.BY_ID(accountId, String(workingHoursId));

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<IWorkingHours>(accountId, path, token, requestOptions);
  }

  /**
   * Create new working hours
   */
  async create(
    accountId: string,
    token: string,
    data: ICreateWorkingHours,
    revision?: string,
  ): Promise<ILPResponse<IWorkingHours>> {
    const path = LP_API_PATHS.WORKING_HOURS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<IWorkingHours>(accountId, path, data, token, requestOptions);
  }

  /**
   * Create multiple working hours
   */
  async createMany(
    accountId: string,
    token: string,
    data: ICreateWorkingHours[],
    revision?: string,
  ): Promise<ILPResponse<IWorkingHours[]>> {
    const path = LP_API_PATHS.WORKING_HOURS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<IWorkingHours[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update working hours
   */
  async update(
    accountId: string,
    workingHoursId: string | number,
    token: string,
    data: IUpdateWorkingHours,
    revision: string,
  ): Promise<ILPResponse<IWorkingHours>> {
    const path = LP_API_PATHS.WORKING_HOURS.BY_ID(accountId, String(workingHoursId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IWorkingHours>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update multiple working hours
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (IUpdateWorkingHours & { id: number })[],
    revision: string,
  ): Promise<ILPResponse<IWorkingHours[]>> {
    const path = LP_API_PATHS.WORKING_HOURS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IWorkingHours[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete working hours
   */
  async remove(
    accountId: string,
    workingHoursId: string | number,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.WORKING_HOURS.BY_ID(accountId, String(workingHoursId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Delete multiple working hours
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: number[],
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.WORKING_HOURS.BASE(accountId);

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
   * Get the current revision for working hours
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }
}
