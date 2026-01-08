/**
 * Profiles Service
 * Business logic for LivePerson Profiles API
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
  IProfile,
  ICreateProfile,
  IUpdateProfile,
} from './profiles.interfaces';

@Injectable()
export class ProfilesService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.PROFILES;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(ProfilesService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(ProfilesService.name);
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
  ): Promise<ILPResponse<IProfile[]>> {
    const path = LP_API_PATHS.PROFILES.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      includeDeleted: options?.includeDeleted,
      source: 'ccui',
    };

    return this.get<IProfile[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single profile by ID
   */
  async getById(
    accountId: string,
    profileId: string | number,
    token: string,
  ): Promise<ILPResponse<IProfile>> {
    const path = LP_API_PATHS.PROFILES.BY_ID(accountId, String(profileId));

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<IProfile>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new profile
   */
  async create(
    accountId: string,
    token: string,
    data: ICreateProfile,
    revision?: string,
  ): Promise<ILPResponse<IProfile>> {
    const path = LP_API_PATHS.PROFILES.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<IProfile>(accountId, path, data, token, requestOptions);
  }

  /**
   * Create multiple profiles
   */
  async createMany(
    accountId: string,
    token: string,
    data: ICreateProfile[],
    revision?: string,
  ): Promise<ILPResponse<IProfile[]>> {
    const path = LP_API_PATHS.PROFILES.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<IProfile[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update a profile
   */
  async update(
    accountId: string,
    profileId: string | number,
    token: string,
    data: IUpdateProfile,
    revision: string,
  ): Promise<ILPResponse<IProfile>> {
    const path = LP_API_PATHS.PROFILES.BY_ID(accountId, String(profileId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IProfile>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update multiple profiles
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (IUpdateProfile & { id: number })[],
    revision: string,
  ): Promise<ILPResponse<IProfile[]>> {
    const path = LP_API_PATHS.PROFILES.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IProfile[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete a profile
   */
  async remove(
    accountId: string,
    profileId: string | number,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.PROFILES.BY_ID(accountId, String(profileId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Delete multiple profiles
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: number[],
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.PROFILES.BASE(accountId);

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
   * Get the current revision for profiles
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }
}
