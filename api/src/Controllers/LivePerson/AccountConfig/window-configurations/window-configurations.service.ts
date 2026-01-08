/**
 * Window Configurations Service
 * Business logic for LivePerson Window Configurations API
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../../APIService/api-service';
import { LPDomainService } from '../../shared/lp-domain.service';
import { LPBaseService } from '../../shared/lp-base.service';
import { LP_SERVICE_DOMAINS } from '../../shared/lp-constants';
import { ILPResponse } from '../../shared/lp-common.interfaces';
import {
  IWindowConfiguration,
  IWindowConfigurationCreateRequest,
  IWindowConfigurationUpdateRequest,
  IWindowConfigurationQuery,
} from './window-configurations.interfaces';

@Injectable()
export class WindowConfigurationsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_READ;
  protected readonly writeDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = '2.0';

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(WindowConfigurationsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(WindowConfigurationsService.name);
  }

  private getBasePath(accountId: string): string {
    return `/api/account/${accountId}/configuration/engagement-window/window-confs`;
  }

  private getByIdPath(accountId: string, windowId: string): string {
    return `${this.getBasePath(accountId)}/${windowId}`;
  }

  /**
   * Get all window configurations for an account
   */
  async getWindowConfigurations(
    accountId: string,
    token: string,
    query?: IWindowConfigurationQuery,
  ): Promise<ILPResponse<IWindowConfiguration[]>> {
    const path = this.getBasePath(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId }, 'Getting all window configurations');

    return this.get<IWindowConfiguration[]>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get a window configuration by ID
   */
  async getWindowConfigurationById(
    accountId: string,
    windowId: string,
    token: string,
    query?: IWindowConfigurationQuery,
  ): Promise<ILPResponse<IWindowConfiguration>> {
    const path = this.getByIdPath(accountId, windowId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, windowId }, 'Getting window configuration by ID');

    return this.get<IWindowConfiguration>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Create a new window configuration
   */
  async createWindowConfiguration(
    accountId: string,
    token: string,
    config: IWindowConfigurationCreateRequest,
    query?: IWindowConfigurationQuery,
  ): Promise<ILPResponse<IWindowConfiguration>> {
    const path = this.getBasePath(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, configName: config.name }, 'Creating window configuration');

    return this.post<IWindowConfiguration>(accountId, path, config, token, {
      additionalParams,
      useWriteDomain: true,
    });
  }

  /**
   * Update a window configuration
   */
  async updateWindowConfiguration(
    accountId: string,
    windowId: string,
    token: string,
    config: IWindowConfigurationUpdateRequest,
    revision: string,
    query?: IWindowConfigurationQuery,
  ): Promise<ILPResponse<IWindowConfiguration>> {
    const path = this.getByIdPath(accountId, windowId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, windowId }, 'Updating window configuration');

    return this.put<IWindowConfiguration>(accountId, path, config, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Delete a window configuration
   */
  async deleteWindowConfiguration(
    accountId: string,
    windowId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = this.getByIdPath(accountId, windowId);
    const additionalParams: Record<string, string> = {
      v: this.defaultApiVersion,
    };

    this.logger.info({ accountId, windowId }, 'Deleting window configuration');

    return this.delete<void>(accountId, path, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Build query parameters
   */
  private buildQueryParams(query?: IWindowConfigurationQuery): Record<string, string> {
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
