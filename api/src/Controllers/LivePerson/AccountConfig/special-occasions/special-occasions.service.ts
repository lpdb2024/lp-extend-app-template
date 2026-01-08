/**
 * Special Occasions Service
 * Business logic for LivePerson Special Occasions API
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
  ISpecialOccasion,
  ICreateSpecialOccasion,
  IUpdateSpecialOccasion,
} from './special-occasions.interfaces';

@Injectable()
export class SpecialOccasionsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.SPECIAL_OCCASIONS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(SpecialOccasionsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(SpecialOccasionsService.name);
  }

  /**
   * Get all special occasions for an account
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<ISpecialOccasion[]>> {
    const path = LP_API_PATHS.SPECIAL_OCCASIONS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      includeDeleted: options?.includeDeleted,
      source: 'ccui',
    };

    return this.get<ISpecialOccasion[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single special occasion by ID
   */
  async getById(
    accountId: string,
    occasionId: string | number,
    token: string,
  ): Promise<ILPResponse<ISpecialOccasion>> {
    const path = LP_API_PATHS.SPECIAL_OCCASIONS.BY_ID(accountId, String(occasionId));

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<ISpecialOccasion>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new special occasion
   */
  async create(
    accountId: string,
    token: string,
    data: ICreateSpecialOccasion,
    revision?: string,
  ): Promise<ILPResponse<ISpecialOccasion>> {
    const path = LP_API_PATHS.SPECIAL_OCCASIONS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<ISpecialOccasion>(accountId, path, data, token, requestOptions);
  }

  /**
   * Create multiple special occasions
   */
  async createMany(
    accountId: string,
    token: string,
    data: ICreateSpecialOccasion[],
    revision?: string,
  ): Promise<ILPResponse<ISpecialOccasion[]>> {
    const path = LP_API_PATHS.SPECIAL_OCCASIONS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<ISpecialOccasion[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update a special occasion
   */
  async update(
    accountId: string,
    occasionId: string | number,
    token: string,
    data: IUpdateSpecialOccasion,
    revision: string,
  ): Promise<ILPResponse<ISpecialOccasion>> {
    const path = LP_API_PATHS.SPECIAL_OCCASIONS.BY_ID(accountId, String(occasionId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<ISpecialOccasion>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update multiple special occasions
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (IUpdateSpecialOccasion & { id: number })[],
    revision: string,
  ): Promise<ILPResponse<ISpecialOccasion[]>> {
    const path = LP_API_PATHS.SPECIAL_OCCASIONS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<ISpecialOccasion[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete a special occasion
   */
  async remove(
    accountId: string,
    occasionId: string | number,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.SPECIAL_OCCASIONS.BY_ID(accountId, String(occasionId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Delete multiple special occasions
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: number[],
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.SPECIAL_OCCASIONS.BASE(accountId);

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
   * Get the current revision for special occasions
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }
}
