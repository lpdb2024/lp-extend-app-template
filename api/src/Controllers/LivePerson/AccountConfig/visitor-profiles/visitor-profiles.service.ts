/**
 * Visitor Profiles Service
 * Business logic for LivePerson Visitor Profiles (Audiences) API
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
  IVisitorProfile,
  IVisitorProfileCreateRequest,
  IVisitorProfileUpdateRequest,
  IVisitorProfileQuery,
} from './visitor-profiles.interfaces';

@Injectable()
export class VisitorProfilesService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_READ;
  protected readonly writeDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.VISITOR_PROFILES;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(VisitorProfilesService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(VisitorProfilesService.name);
  }

  /**
   * Get all visitor profiles for an account
   */
  async getVisitorProfiles(
    accountId: string,
    token: string,
    query?: IVisitorProfileQuery,
  ): Promise<ILPResponse<IVisitorProfile[]>> {
    const path = LP_API_PATHS.VISITOR_PROFILES.BASE(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId }, 'Getting all visitor profiles');

    return this.get<IVisitorProfile[]>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get a visitor profile by ID
   */
  async getVisitorProfileById(
    accountId: string,
    profileId: string,
    token: string,
    query?: IVisitorProfileQuery,
  ): Promise<ILPResponse<IVisitorProfile>> {
    const path = LP_API_PATHS.VISITOR_PROFILES.BY_ID(accountId, profileId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, profileId }, 'Getting visitor profile by ID');

    return this.get<IVisitorProfile>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Create a new visitor profile
   */
  async createVisitorProfile(
    accountId: string,
    token: string,
    profile: IVisitorProfileCreateRequest,
    query?: IVisitorProfileQuery,
  ): Promise<ILPResponse<IVisitorProfile>> {
    const path = LP_API_PATHS.VISITOR_PROFILES.BASE(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, profileName: profile.name }, 'Creating visitor profile');

    return this.post<IVisitorProfile>(accountId, path, profile, token, {
      additionalParams,
      useWriteDomain: true,
    });
  }

  /**
   * Update a visitor profile
   */
  async updateVisitorProfile(
    accountId: string,
    profileId: string,
    token: string,
    profile: IVisitorProfileUpdateRequest,
    revision: string,
    query?: IVisitorProfileQuery,
  ): Promise<ILPResponse<IVisitorProfile>> {
    const path = LP_API_PATHS.VISITOR_PROFILES.BY_ID(accountId, profileId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, profileId }, 'Updating visitor profile');

    return this.put<IVisitorProfile>(accountId, path, profile, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Delete a visitor profile
   */
  async deleteVisitorProfile(
    accountId: string,
    profileId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.VISITOR_PROFILES.BY_ID(accountId, profileId);
    const additionalParams: Record<string, string> = {
      v: this.defaultApiVersion,
    };

    this.logger.info({ accountId, profileId }, 'Deleting visitor profile');

    return this.delete<void>(accountId, path, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Build query parameters
   */
  private buildQueryParams(query?: IVisitorProfileQuery): Record<string, string> {
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
