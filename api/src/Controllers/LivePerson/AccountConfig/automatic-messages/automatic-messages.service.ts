/**
 * Automatic Messages Service
 * Business logic for LivePerson Automatic Messages API
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
  IAutomaticMessage,
  ICreateAutomaticMessage,
  IUpdateAutomaticMessage,
  IDefaultAutomaticMessage,
} from './automatic-messages.interfaces';

@Injectable()
export class AutomaticMessagesService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.AUTOMATIC_MESSAGES;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(AutomaticMessagesService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(AutomaticMessagesService.name);
  }

  /**
   * Get all automatic messages for an account
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
      skillId?: number;
      messageEventId?: string;
    },
  ): Promise<ILPResponse<IAutomaticMessage[]>> {
    const path = LP_API_PATHS.AUTOMATIC_MESSAGES.BASE(accountId);

    const additionalParams: Record<string, string> = {};
    if (options?.skillId !== undefined) {
      additionalParams.skill_id = String(options.skillId);
    }
    if (options?.messageEventId) {
      additionalParams.message_event_id = options.messageEventId;
    }

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      includeDeleted: options?.includeDeleted,
      source: 'ccui',
      additionalParams: Object.keys(additionalParams).length > 0 ? additionalParams : undefined,
    };

    return this.get<IAutomaticMessage[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single automatic message by ID
   */
  async getById(
    accountId: string,
    messageId: string | number,
    token: string,
  ): Promise<ILPResponse<IAutomaticMessage>> {
    const path = LP_API_PATHS.AUTOMATIC_MESSAGES.BY_ID(accountId, String(messageId));

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<IAutomaticMessage>(accountId, path, token, requestOptions);
  }

  /**
   * Get default automatic messages (system defaults)
   */
  async getDefaults(
    accountId: string,
    token: string,
  ): Promise<ILPResponse<IDefaultAutomaticMessage[]>> {
    const path = LP_API_PATHS.AUTOMATIC_MESSAGES.DEFAULTS(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
    };

    return this.get<IDefaultAutomaticMessage[]>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new automatic message
   */
  async create(
    accountId: string,
    token: string,
    data: ICreateAutomaticMessage,
    revision?: string,
  ): Promise<ILPResponse<IAutomaticMessage>> {
    const path = LP_API_PATHS.AUTOMATIC_MESSAGES.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<IAutomaticMessage>(accountId, path, data, token, requestOptions);
  }

  /**
   * Create multiple automatic messages
   */
  async createMany(
    accountId: string,
    token: string,
    data: ICreateAutomaticMessage[],
    revision?: string,
  ): Promise<ILPResponse<IAutomaticMessage[]>> {
    const path = LP_API_PATHS.AUTOMATIC_MESSAGES.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<IAutomaticMessage[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update an automatic message
   */
  async update(
    accountId: string,
    messageId: string | number,
    token: string,
    data: IUpdateAutomaticMessage,
    revision: string,
  ): Promise<ILPResponse<IAutomaticMessage>> {
    const path = LP_API_PATHS.AUTOMATIC_MESSAGES.BY_ID(accountId, String(messageId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IAutomaticMessage>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update multiple automatic messages
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (IUpdateAutomaticMessage & { id: number })[],
    revision: string,
  ): Promise<ILPResponse<IAutomaticMessage[]>> {
    const path = LP_API_PATHS.AUTOMATIC_MESSAGES.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IAutomaticMessage[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete an automatic message
   */
  async remove(
    accountId: string,
    messageId: string | number,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.AUTOMATIC_MESSAGES.BY_ID(accountId, String(messageId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Delete multiple automatic messages
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: number[],
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.AUTOMATIC_MESSAGES.BASE(accountId);

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
   * Get the current revision for automatic messages
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }
}
