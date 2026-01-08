/**
 * Account Properties Service
 * Handles Account Settings Properties API operations for LivePerson
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
  IAccountProperty,
  ICreateAccountProperty,
  IUpdateAccountProperty,
} from './account-properties.interfaces';

@Injectable()
export class AccountPropertiesService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.ACCOUNT_SETTINGS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(AccountPropertiesService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(AccountPropertiesService.name);
  }

  /**
   * Get all account properties
   */
  async getAll(
    accountId: string,
    token: string,
  ): Promise<ILPResponse<IAccountProperty[]>> {
    const path = LP_API_PATHS.ACCOUNT_PROPERTIES.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
    };

    return this.get<IAccountProperty[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single property by ID
   */
  async getById(
    accountId: string,
    propertyId: string,
    token: string,
  ): Promise<ILPResponse<IAccountProperty>> {
    const path = LP_API_PATHS.ACCOUNT_PROPERTIES.BY_ID(accountId, propertyId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
    };

    return this.get<IAccountProperty>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new property
   */
  async create(
    accountId: string,
    token: string,
    data: ICreateAccountProperty,
    revision?: string,
  ): Promise<ILPResponse<IAccountProperty>> {
    const path = LP_API_PATHS.ACCOUNT_PROPERTIES.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<IAccountProperty>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update a property
   */
  async update(
    accountId: string,
    propertyId: string,
    token: string,
    data: IUpdateAccountProperty,
    revision: string,
  ): Promise<ILPResponse<IAccountProperty>> {
    const path = LP_API_PATHS.ACCOUNT_PROPERTIES.BY_ID(accountId, propertyId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IAccountProperty>(accountId, path, data, token, requestOptions);
  }

  /**
   * Get the current revision for account properties
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }
}
