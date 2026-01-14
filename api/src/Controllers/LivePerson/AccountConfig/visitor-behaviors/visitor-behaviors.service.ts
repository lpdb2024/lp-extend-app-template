/**
 * Visitor Behaviors Service
 * Business logic for LivePerson Visitor Behaviors API
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
  IVisitorBehavior,
  IVisitorBehaviorCreateRequest,
  IVisitorBehaviorUpdateRequest,
  IVisitorBehaviorQuery,
} from './visitor-behaviors.interfaces';
import { TokenInfo } from '../../shared/sdk-provider.service';

@Injectable()
export class VisitorBehaviorsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_READ;
  protected readonly writeDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.VISITOR_BEHAVIORS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(VisitorBehaviorsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(VisitorBehaviorsService.name);
  }

  private getBasePath(accountId: string): string {
    return `/api/account/${accountId}/configuration/le-targeting/visitor-behaviors`;
  }

  private getByIdPath(accountId: string, behaviorId: string): string {
    return `${this.getBasePath(accountId)}/${behaviorId}`;
  }

  /**
   * Get all visitor behaviors for an account
   */
  async getVisitorBehaviors(
    accountId: string,
    token: TokenInfo | string,
    query?: IVisitorBehaviorQuery,
  ): Promise<ILPResponse<IVisitorBehavior[]>> {
    const path = this.getBasePath(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId }, 'Getting all visitor behaviors');

    return this.get<IVisitorBehavior[]>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get a visitor behavior by ID
   */
  async getVisitorBehaviorById(
    accountId: string,
    behaviorId: string,
    token: TokenInfo | string,
    query?: IVisitorBehaviorQuery,
  ): Promise<ILPResponse<IVisitorBehavior>> {
    const path = this.getByIdPath(accountId, behaviorId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, behaviorId }, 'Getting visitor behavior by ID');

    return this.get<IVisitorBehavior>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Create a new visitor behavior
   */
  async createVisitorBehavior(
    accountId: string,
    token: TokenInfo | string,
    behavior: IVisitorBehaviorCreateRequest,
    query?: IVisitorBehaviorQuery,
  ): Promise<ILPResponse<IVisitorBehavior>> {
    const path = this.getBasePath(accountId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, behaviorName: behavior.name }, 'Creating visitor behavior');

    return this.post<IVisitorBehavior>(accountId, path, behavior, token, {
      additionalParams,
      useWriteDomain: true,
    });
  }

  /**
   * Update a visitor behavior
   */
  async updateVisitorBehavior(
    accountId: string,
    behaviorId: string,
    token: TokenInfo | string,
    behavior: IVisitorBehaviorUpdateRequest,
    revision: string,
    query?: IVisitorBehaviorQuery,
  ): Promise<ILPResponse<IVisitorBehavior>> {
    const path = this.getByIdPath(accountId, behaviorId);
    const additionalParams = this.buildQueryParams(query);

    this.logger.info({ accountId, behaviorId }, 'Updating visitor behavior');

    return this.put<IVisitorBehavior>(accountId, path, behavior, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Delete a visitor behavior
   */
  async deleteVisitorBehavior(
    accountId: string,
    behaviorId: string,
    token: TokenInfo | string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = this.getByIdPath(accountId, behaviorId);
    const additionalParams: Record<string, string> = {
      v: this.defaultApiVersion,
    };

    this.logger.info({ accountId, behaviorId }, 'Deleting visitor behavior');

    return this.delete<void>(accountId, path, token, {
      additionalParams,
      revision,
      useWriteDomain: true,
    });
  }

  /**
   * Build query parameters
   */
  private buildQueryParams(query?: IVisitorBehaviorQuery): Record<string, string> {
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
