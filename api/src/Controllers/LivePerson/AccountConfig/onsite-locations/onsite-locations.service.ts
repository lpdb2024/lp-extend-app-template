/**
 * Onsite Locations Service
 * Business logic for LivePerson Onsite Locations API
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../../APIService/api-service';
import { LPDomainService } from '../../shared/lp-domain.service';
import { LPBaseService } from '../../shared/lp-base.service';
import {
  LP_SERVICE_DOMAINS,
  LP_API_VERSIONS,
} from '../../shared/lp-constants';
import { ILPResponse } from '../../shared/lp-common.interfaces';
import {
  IOnsiteLocation,
  IOnsiteLocationCreateRequest,
  IOnsiteLocationUpdateRequest,
  IOnsiteLocationQuery,
} from './onsite-locations.interfaces';
import { TokenInfo } from '../../shared/sdk-provider.service';

@Injectable()
export class OnsiteLocationsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_READ;
  protected readonly writeDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.ONSITE_LOCATIONS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(OnsiteLocationsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(OnsiteLocationsService.name);
  }

  private getBasePath(accountId: string): string {
    return `/api/account/${accountId}/configuration/le-targeting/onsite-locations`;
  }

  private getByIdPath(accountId: string, locationId: string): string {
    return `${this.getBasePath(accountId)}/${locationId}`;
  }

  /**
   * Get all onsite locations for an account
   */
  async getOnsiteLocations(
    accountId: string,
    token: TokenInfo | string,
    query?: IOnsiteLocationQuery,
  ): Promise<ILPResponse<IOnsiteLocation[]>> {
    const path = this.getBasePath(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId }, 'Getting all onsite locations');

    return this.get<IOnsiteLocation[]>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get an onsite location by ID
   */
  async getOnsiteLocationById(
    accountId: string,
    locationId: string,
    token: TokenInfo | string,
    query?: IOnsiteLocationQuery,
  ): Promise<ILPResponse<IOnsiteLocation>> {
    const path = this.getByIdPath(accountId, locationId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, locationId }, 'Getting onsite location by ID');

    return this.get<IOnsiteLocation>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Create a new onsite location
   */
  async createOnsiteLocation(
    accountId: string,
    token: TokenInfo | string,
    location: IOnsiteLocationCreateRequest,
    query?: IOnsiteLocationQuery,
  ): Promise<ILPResponse<IOnsiteLocation>> {
    const path = this.getBasePath(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, locationName: location.name }, 'Creating onsite location');

    return this.post<IOnsiteLocation>(accountId, path, location, token, {
      additionalParams,
      useWriteDomain: true,
    });
  }

  /**
   * Update an onsite location
   */
  async updateOnsiteLocation(
    accountId: string,
    locationId: string,
    token: TokenInfo | string,
    location: IOnsiteLocationUpdateRequest,
    revision: string,
    query?: IOnsiteLocationQuery,
  ): Promise<ILPResponse<IOnsiteLocation>> {
    const path = this.getByIdPath(accountId, locationId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, locationId }, 'Updating onsite location');

    return this.put<IOnsiteLocation>(accountId, path, location, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Delete an onsite location
   */
  async deleteOnsiteLocation(
    accountId: string,
    locationId: string,
    token: TokenInfo | string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = this.getByIdPath(accountId, locationId);
    const additionalParams: Record<string, string> = {
      v: this.defaultApiVersion,
    };

    this.logger.info({ accountId, locationId }, 'Deleting onsite location');

    return this.delete<void>(accountId, path, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Build query parameters
   */
  private buildQueryParams(query?: IOnsiteLocationQuery): Record<string, string> {
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
