/**
 * Connector Service
 * Handles all Connector API operations for LivePerson
 *
 * The Connector API enables brands to configure and manage third-party messaging connectors
 * for channels like SMS (Twilio), WhatsApp, Facebook Messenger, Instagram, Twitter, etc.
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../APIService/api-service';
import { LPDomainService } from '../shared/lp-domain.service';
import { LPBaseService } from '../shared/lp-base.service';
import {
  LP_SERVICE_DOMAINS,
  LP_API_VERSIONS,
  LP_API_PATHS,
} from '../shared/lp-constants';
import { ILPResponse, ILPRequestOptions } from '../shared/lp-common.interfaces';
import {
  IConnector,
  ICreateConnectorRequest,
  IUpdateConnectorRequest,
} from './connector.interfaces';

@Injectable()
export class ConnectorService extends LPBaseService {
  // Connector API uses the Account Config Write domain
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  // Connector API version
  protected readonly defaultApiVersion = LP_API_VERSIONS.CONNECTORS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(ConnectorService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(ConnectorService.name);
  }

  /**
   * Get all connectors for an account
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<IConnector[]>> {
    const path = LP_API_PATHS.CONNECTORS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      includeDeleted: options?.includeDeleted,
      source: 'ccui',
      additionalParams: {
        acr_values: 'ALL',
      },
    };

    return this.get<IConnector[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single connector by ID
   */
  async getById(
    accountId: string,
    connectorId: string,
    token: string,
  ): Promise<ILPResponse<IConnector>> {
    const path = LP_API_PATHS.CONNECTORS.BY_ID(accountId, connectorId);

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<IConnector>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new connector
   */
  async create(
    accountId: string,
    token: string,
    data: ICreateConnectorRequest,
    revision?: string,
  ): Promise<ILPResponse<IConnector>> {
    const path = LP_API_PATHS.CONNECTORS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    const createData = {
      ...data,
      enabled: data.enabled ?? true,
    };

    return this.post<IConnector>(accountId, path, createData, token, requestOptions);
  }

  /**
   * Create multiple connectors
   */
  async createMany(
    accountId: string,
    token: string,
    data: ICreateConnectorRequest[],
    revision?: string,
  ): Promise<ILPResponse<IConnector[]>> {
    const path = LP_API_PATHS.CONNECTORS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    const createData = data.map((connector) => ({
      ...connector,
      enabled: connector.enabled ?? true,
    }));

    return this.post<IConnector[]>(accountId, path, createData, token, requestOptions);
  }

  /**
   * Update a connector
   */
  async update(
    accountId: string,
    connectorId: string,
    token: string,
    data: IUpdateConnectorRequest,
    revision: string,
  ): Promise<ILPResponse<IConnector>> {
    const path = LP_API_PATHS.CONNECTORS.BY_ID(accountId, connectorId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IConnector>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update multiple connectors
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (IUpdateConnectorRequest & { id: string | number })[],
    revision: string,
  ): Promise<ILPResponse<IConnector[]>> {
    const path = LP_API_PATHS.CONNECTORS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IConnector[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete a connector
   */
  async remove(
    accountId: string,
    connectorId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.CONNECTORS.BY_ID(accountId, connectorId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Delete multiple connectors
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: (string | number)[],
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.CONNECTORS.BASE(accountId);

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
   * Enable a connector
   */
  async enable(
    accountId: string,
    connectorId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<IConnector>> {
    return this.update(
      accountId,
      connectorId,
      token,
      { enabled: true },
      revision,
    );
  }

  /**
   * Disable a connector
   */
  async disable(
    accountId: string,
    connectorId: string,
    token: string,
    revision: string,
  ): Promise<ILPResponse<IConnector>> {
    return this.update(
      accountId,
      connectorId,
      token,
      { enabled: false },
      revision,
    );
  }

  /**
   * Get the current revision for connectors
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }
}
