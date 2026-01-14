/**
 * Widgets Service
 * Business logic for LivePerson Widgets API (UI Personalization)
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
  IWidget,
  ICreateWidget,
  IUpdateWidget,
} from './widgets.interfaces';
import { TokenInfo } from '../../shared/sdk-provider.service';

@Injectable()
export class WidgetsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_READ;
  protected readonly defaultApiVersion = LP_API_VERSIONS.WIDGETS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(WidgetsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(WidgetsService.name);
  }

  /**
   * Get all widgets for an account
   */
  async getAll(
    accountId: string,
    token: TokenInfo | string,
    options?: {
      select?: string;
      return?: 'active' | 'all';
    },
  ): Promise<ILPResponse<IWidget[]>> {
    const path = LP_API_PATHS.WIDGETS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      source: 'ccui',
      additionalParams: options?.return ? { return: options.return } : undefined,
    };

    return this.get<IWidget[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single widget by ID
   */
  async getById(
    accountId: string,
    widgetId: string | number,
    token: TokenInfo | string,
  ): Promise<ILPResponse<IWidget>> {
    const path = LP_API_PATHS.WIDGETS.BY_ID(accountId, String(widgetId));

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<IWidget>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new widget
   */
  async create(
    accountId: string,
    token: TokenInfo | string,
    data: ICreateWidget,
    revision?: string,
  ): Promise<ILPResponse<IWidget>> {
    const path = LP_API_PATHS.WIDGETS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<IWidget>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update a widget
   */
  async update(
    accountId: string,
    widgetId: string | number,
    token: TokenInfo | string,
    data: IUpdateWidget,
    revision: string,
  ): Promise<ILPResponse<IWidget>> {
    const path = LP_API_PATHS.WIDGETS.BY_ID(accountId, String(widgetId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IWidget>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete a widget
   */
  async remove(
    accountId: string,
    widgetId: string | number,
    token: TokenInfo | string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.WIDGETS.BY_ID(accountId, String(widgetId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Get the current revision for widgets
   */
  async getRevision(accountId: string, token: TokenInfo | string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }
}
