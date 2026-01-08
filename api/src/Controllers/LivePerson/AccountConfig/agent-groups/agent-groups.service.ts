/**
 * Agent Groups Service
 * Handles all Agent Groups API operations for LivePerson
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
  IAgentGroup,
  IAgentGroupWithMembers,
  ICreateAgentGroupRequest,
  IUpdateAgentGroupRequest,
} from './agent-groups.interfaces';

@Injectable()
export class AgentGroupsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = LP_API_VERSIONS.AGENT_GROUPS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(AgentGroupsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(AgentGroupsService.name);
  }

  /**
   * Get all agent groups for an account
   * @param accountId - The LP account ID
   * @param token - Bearer token for authentication
   * @param options - Optional query parameters
   * @returns List of agent groups with optional member info
   */
  async getAll(
    accountId: string,
    token: string,
    options?: {
      getUsers?: boolean;
      select?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ILPResponse<IAgentGroupWithMembers[]>> {
    const path = LP_API_PATHS.AGENT_GROUPS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      select: options?.select || '$all',
      includeDeleted: options?.includeDeleted,
      source: 'ccui',
      additionalParams: options?.getUsers ? { getUsers: 'true' } : undefined,
    };

    return this.get<IAgentGroupWithMembers[]>(accountId, path, token, requestOptions);
  }

  /**
   * Get a single agent group by ID
   * @param accountId - The LP account ID
   * @param groupId - The agent group ID
   * @param token - Bearer token for authentication
   * @returns The agent group data
   */
  async getById(
    accountId: string,
    groupId: string | number,
    token: string,
  ): Promise<ILPResponse<IAgentGroup>> {
    const path = LP_API_PATHS.AGENT_GROUPS.BY_ID(accountId, String(groupId));

    const requestOptions: ILPRequestOptions = {
      select: '$all',
      source: 'ccui',
    };

    return this.get<IAgentGroup>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new agent group
   * @param accountId - The LP account ID
   * @param token - Bearer token for authentication
   * @param data - The agent group data to create
   * @param revision - Optional revision for optimistic locking
   * @returns The created agent group
   */
  async create(
    accountId: string,
    token: string,
    data: ICreateAgentGroupRequest,
    revision?: string,
  ): Promise<ILPResponse<IAgentGroup>> {
    const path = LP_API_PATHS.AGENT_GROUPS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    // Set default values
    const createData: ICreateAgentGroupRequest = {
      ...data,
      isEnabled: data.isEnabled ?? true,
    };

    return this.post<IAgentGroup>(accountId, path, createData, token, requestOptions);
  }

  /**
   * Create multiple agent groups
   * @param accountId - The LP account ID
   * @param token - Bearer token for authentication
   * @param data - Array of agent groups to create
   * @param revision - Optional revision for optimistic locking
   * @returns The created agent groups
   */
  async createMany(
    accountId: string,
    token: string,
    data: ICreateAgentGroupRequest[],
    revision?: string,
  ): Promise<ILPResponse<IAgentGroup[]>> {
    const path = LP_API_PATHS.AGENT_GROUPS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    // Set default values for each
    const createData = data.map((item) => ({
      ...item,
      isEnabled: item.isEnabled ?? true,
    }));

    return this.post<IAgentGroup[]>(accountId, path, createData, token, requestOptions);
  }

  /**
   * Update an agent group
   * @param accountId - The LP account ID
   * @param groupId - The agent group ID to update
   * @param token - Bearer token for authentication
   * @param data - The updated agent group data
   * @param revision - Revision for optimistic locking (required for updates)
   * @returns The updated agent group
   */
  async update(
    accountId: string,
    groupId: string | number,
    token: string,
    data: IUpdateAgentGroupRequest,
    revision: string,
  ): Promise<ILPResponse<IAgentGroup>> {
    const path = LP_API_PATHS.AGENT_GROUPS.BY_ID(accountId, String(groupId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IAgentGroup>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update multiple agent groups
   * @param accountId - The LP account ID
   * @param token - Bearer token for authentication
   * @param data - Array of agent groups with IDs to update
   * @param revision - Revision for optimistic locking (required for updates)
   * @returns The updated agent groups
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (IUpdateAgentGroupRequest & { id: number })[],
    revision: string,
  ): Promise<ILPResponse<IAgentGroup[]>> {
    const path = LP_API_PATHS.AGENT_GROUPS.BASE(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.put<IAgentGroup[]>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete an agent group
   * @param accountId - The LP account ID
   * @param groupId - The agent group ID to delete
   * @param token - Bearer token for authentication
   * @param revision - Revision for optimistic locking (required for deletes)
   * @returns Success response
   */
  async remove(
    accountId: string,
    groupId: string | number,
    token: string,
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.AGENT_GROUPS.BY_ID(accountId, String(groupId));

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Delete multiple agent groups
   * @param accountId - The LP account ID
   * @param token - Bearer token for authentication
   * @param ids - Array of agent group IDs to delete
   * @param revision - Revision for optimistic locking (required for deletes)
   * @returns Success response
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: number[],
    revision: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.AGENT_GROUPS.BASE(accountId);

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
   * Get the current revision for agent groups
   * Useful for obtaining revision before update/delete operations
   * @param accountId - The LP account ID
   * @param token - Bearer token for authentication
   * @returns The current revision
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token, { select: 'id' });
    return response.revision;
  }
}
