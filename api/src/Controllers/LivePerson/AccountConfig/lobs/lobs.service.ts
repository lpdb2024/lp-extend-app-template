/**
 * LOBs Service
 * Business logic for LivePerson LOBs (Lines of Business) API
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
  ILob,
  ICreateLob,
  IUpdateLob,
} from './lobs.interfaces';

@Injectable()
export class LobsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.LOBS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(LobsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(LobsService.name);
  }

  /**
   * Get all LOBs for an account
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<ILob[]>> {
    const path = LP_API_PATHS.LOBS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      includeDeleted: options?.includeDeleted,
      source: 'ccui',
    };

    return this.get<ILob[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single LOB by ID
   */
  async getById(
    accountId: string,
    lobId: string | number,
    token: string,
  ): Promise<ILPResponse<ILob>> {
    const path = LP_API_PATHS.LOBS.BY_ID(accountId, String(lobId));

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<ILob>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new LOB
   */
  async create(
    accountId: string,
    token: string,
    data: ICreateLob,
    revision?: string,
  ): Promise<ILPResponse<ILob>> {
    const path = LP_API_PATHS.LOBS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<ILob>(accountId, path, data, token, requestOptions);
  }

  /**
   * Create multiple LOBs
   */
  async createMany(
    accountId: string,
    token: string,
    data: ICreateLob[],
    revision?: string,
  ): Promise<ILPResponse<ILob[]>> {
    const path = LP_API_PATHS.LOBS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.post<ILob[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update a LOB
   */
  async update(
    accountId: string,
    lobId: string | number,
    token: string,
    data: IUpdateLob,
    revision: string,
  ): Promise<ILPResponse<ILob>> {
    const path = LP_API_PATHS.LOBS.BY_ID(accountId, String(lobId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<ILob>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update multiple LOBs
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (IUpdateLob & { id: number })[],
    revision: string,
  ): Promise<ILPResponse<ILob[]>> {
    const path = LP_API_PATHS.LOBS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<ILob[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete a LOB
   */
  async remove(
    accountId: string,
    lobId: string | number,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.LOBS.BY_ID(accountId, String(lobId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Delete multiple LOBs
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: number[],
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.LOBS.BASE(accountId);

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
   * Get the current revision for LOBs
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }
}
