/**
 * App Installations Service
 * Handles all App Install API operations for LivePerson
 *
 * The App Install API allows brands to manage installed applications (OAuth clients)
 * for integrations with LivePerson.
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
  IAppInstallation,
  ICreateAppInstallationRequest,
  IUpdateAppInstallationRequest,
} from './app-installations.interfaces';
import { TokenInfo } from '../../shared/sdk-provider.service';

@Injectable()
export class AppInstallationsService extends LPBaseService {
  // App Install API uses the Account Config Write domain
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  // App Install API version
  protected readonly defaultApiVersion = LP_API_VERSIONS.APP_INSTALL;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(AppInstallationsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(AppInstallationsService.name);
  }

  /**
   * Get all installed applications for an account
   */
  async getAll(
    accountId: string,
    token: TokenInfo | string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<IAppInstallation[]>> {
    const path = LP_API_PATHS.APP_INSTALLATIONS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      includeDeleted: options?.includeDeleted,
      source: 'ccui',
    };

    return this.get<IAppInstallation[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single installed application by ID
   */
  async getById(
    accountId: string,
    appId: string,
    token: TokenInfo | string,
  ): Promise<ILPResponse<IAppInstallation>> {
    const path = LP_API_PATHS.APP_INSTALLATIONS.BY_ID(accountId, appId);

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<IAppInstallation>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new app installation
   */
  async create(
    accountId: string,
    token: TokenInfo | string,
    data: ICreateAppInstallationRequest,
    revision?: string,
  ): Promise<ILPResponse<IAppInstallation>> {
    const path = LP_API_PATHS.APP_INSTALLATIONS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    const createData = {
      ...data,
      enabled: data.enabled ?? true,
    };

    return this.post<IAppInstallation>(accountId, path, createData, token, requestOptions);
  }

  /**
   * Update an app installation
   */
  async update(
    accountId: string,
    appId: string,
    token: TokenInfo | string,
    data: IUpdateAppInstallationRequest,
    revision: string,
  ): Promise<ILPResponse<IAppInstallation>> {
    const path = LP_API_PATHS.APP_INSTALLATIONS.BY_ID(accountId, appId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IAppInstallation>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete an app installation
   */
  async remove(
    accountId: string,
    appId: string,
    token: TokenInfo | string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.APP_INSTALLATIONS.BY_ID(accountId, appId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Enable an app installation
   */
  async enable(
    accountId: string,
    appId: string,
    token: TokenInfo | string,
    revision: string,
  ): Promise<ILPResponse<IAppInstallation>> {
    return this.update(
      accountId,
      appId,
      token,
      { enabled: true },
      revision,
    );
  }

  /**
   * Disable an app installation
   */
  async disable(
    accountId: string,
    appId: string,
    token: TokenInfo | string,
    revision: string,
  ): Promise<ILPResponse<IAppInstallation>> {
    return this.update(
      accountId,
      appId,
      token,
      { enabled: false },
      revision,
    );
  }

  /**
   * Get the current revision for app installations
   */
  async getRevision(accountId: string, token: TokenInfo | string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }
}
