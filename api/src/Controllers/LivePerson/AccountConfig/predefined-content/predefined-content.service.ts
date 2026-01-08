/**
 * Predefined Content Service
 * Business logic for LivePerson Predefined Content API
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
  IPredefinedContent,
  ICreatePredefinedContent,
  IUpdatePredefinedContent,
} from './predefined-content.interfaces';

@Injectable()
export class PredefinedContentService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.PREDEFINED_CONTENT;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(PredefinedContentService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(PredefinedContentService.name);
  }

  /**
   * Get all predefined content for an account
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
      skillIds?: string;
      categoryIds?: string;
      enabled?: boolean;
    },
  ): Promise<ILPResponse<IPredefinedContent[]>> {
    const path = LP_API_PATHS.PREDEFINED_CONTENT.BASE(accountId);

    const additionalParams: Record<string, string> = {};
    if (options?.skillIds) {
      additionalParams.skill_ids = options.skillIds;
    }
    if (options?.categoryIds) {
      additionalParams.category_ids = options.categoryIds;
    }
    if (options?.enabled !== undefined) {
      additionalParams.enabled = String(options.enabled);
    }

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      includeDeleted: options?.includeDeleted,
      source: 'ccui',
      additionalParams: Object.keys(additionalParams).length > 0 ? additionalParams : undefined,
    };

    return this.get<IPredefinedContent[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single predefined content by ID
   */
  async getById(
    accountId: string,
    contentId: string | number,
    token: string,
  ): Promise<ILPResponse<IPredefinedContent>> {
    const path = LP_API_PATHS.PREDEFINED_CONTENT.BY_ID(accountId, String(contentId));

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<IPredefinedContent>(accountId, path, token, requestOptions);
  }

  /**
   * Create new predefined content
   */
  async create(
    accountId: string,
    token: string,
    data: ICreatePredefinedContent,
    revision?: string,
  ): Promise<ILPResponse<IPredefinedContent>> {
    const path = LP_API_PATHS.PREDEFINED_CONTENT.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<IPredefinedContent>(accountId, path, data, token, requestOptions);
  }

  /**
   * Create multiple predefined content items
   */
  async createMany(
    accountId: string,
    token: string,
    data: ICreatePredefinedContent[],
    revision?: string,
  ): Promise<ILPResponse<IPredefinedContent[]>> {
    const path = LP_API_PATHS.PREDEFINED_CONTENT.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<IPredefinedContent[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update predefined content
   */
  async update(
    accountId: string,
    contentId: string | number,
    token: string,
    data: IUpdatePredefinedContent,
    revision: string,
  ): Promise<ILPResponse<IPredefinedContent>> {
    const path = LP_API_PATHS.PREDEFINED_CONTENT.BY_ID(accountId, String(contentId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IPredefinedContent>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update multiple predefined content items
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (IUpdatePredefinedContent & { id: number })[],
    revision: string,
  ): Promise<ILPResponse<IPredefinedContent[]>> {
    const path = LP_API_PATHS.PREDEFINED_CONTENT.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IPredefinedContent[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete predefined content
   */
  async remove(
    accountId: string,
    contentId: string | number,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.PREDEFINED_CONTENT.BY_ID(accountId, String(contentId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Delete multiple predefined content items
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: number[],
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.PREDEFINED_CONTENT.BASE(accountId);

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
   * Get the current revision for predefined content
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }
}
