/**
 * Agent Groups Service
 * Handles all Agent Groups API operations for LivePerson using the SDK
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import {
  initializeSDK,
  LPExtendSDK,
  Scopes,
  LPExtendSDKError,
} from '@lpextend/node-sdk';
import type {
  LPAgentGroup,
  CreateAgentGroupRequest,
  UpdateAgentGroupRequest,
} from '@lpextend/node-sdk';

/**
 * Response type for SDK operations
 */
export interface ILPResponse<T> {
  data: T;
  revision?: string;
  headers?: Record<string, string>;
}

/**
 * Agent group with members info
 */
export interface IAgentGroupWithMembers extends LPAgentGroup {
  users?: Array<{
    id: string;
    loginName: string;
    fullName?: string;
  }>;
}

@Injectable()
export class AgentGroupsService {
  private shellBaseUrl: string;
  private appId: string;

  constructor(
    @InjectPinoLogger(AgentGroupsService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(AgentGroupsService.name);
    this.shellBaseUrl = this.configService.get<string>('SHELL_BASE_URL') || 'http://localhost:3001';
    this.appId = this.configService.get<string>('APP_ID') || 'lp-extend-template';
  }

  /**
   * Create SDK instance for the given account/token
   */
  private async getSDK(accountId: string, token: string): Promise<LPExtendSDK> {
    try {
      const accessToken = token.replace('Bearer ', '');
      return await initializeSDK({
        appId: this.appId,
        accountId,
        accessToken,
        shellBaseUrl: this.shellBaseUrl,
        scopes: [Scopes.AGENT_GROUPS, Scopes.USERS],
        debug: this.configService.get<string>('NODE_ENV') !== 'production',
      });
    } catch (error) {
      if (error instanceof LPExtendSDKError) {
        this.logger.error({ error: error.message, code: error.code }, 'SDK initialization failed');
      }
      throw error;
    }
  }

  /**
   * Get all agent groups for an account
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
    const sdk = await this.getSDK(accountId, token);
    const response = await sdk.agentGroups.getAll();
    this.logger.debug({ accountId, count: response.data?.length }, 'Fetched agent groups');
    return response as ILPResponse<IAgentGroupWithMembers[]>;
  }

  /**
   * Get a single agent group by ID
   */
  async getById(
    accountId: string,
    groupId: string | number,
    token: string,
  ): Promise<ILPResponse<LPAgentGroup>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.agentGroups.getById(Number(groupId));
  }

  /**
   * Create a new agent group
   */
  async create(
    accountId: string,
    token: string,
    data: CreateAgentGroupRequest,
    revision?: string,
  ): Promise<ILPResponse<LPAgentGroup>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.agentGroups.create(data);
  }

  /**
   * Create multiple agent groups
   */
  async createMany(
    accountId: string,
    token: string,
    data: CreateAgentGroupRequest[],
    revision?: string,
  ): Promise<ILPResponse<LPAgentGroup[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPAgentGroup[] = [];
    let lastRevision: string | undefined;
    for (const group of data) {
      const response = await sdk.agentGroups.create(group);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Update an agent group
   */
  async update(
    accountId: string,
    groupId: string | number,
    token: string,
    data: UpdateAgentGroupRequest,
    revision?: string,
  ): Promise<ILPResponse<LPAgentGroup>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.agentGroups.update(Number(groupId), data, revision);
  }

  /**
   * Update multiple agent groups
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (UpdateAgentGroupRequest & { id: number })[],
    revision?: string,
  ): Promise<ILPResponse<LPAgentGroup[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPAgentGroup[] = [];
    let lastRevision = revision;
    for (const group of data) {
      const response = await sdk.agentGroups.update(group.id, group, lastRevision);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Delete an agent group
   */
  async remove(
    accountId: string,
    groupId: string | number,
    token: string,
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.agentGroups.delete(Number(groupId), revision);
  }

  /**
   * Delete multiple agent groups
   */
  async removeMany(
    accountId: string,
    token: string,
    ids: number[],
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    let lastRevision = revision;
    for (const id of ids) {
      const response = await sdk.agentGroups.delete(id, lastRevision);
      lastRevision = response.revision;
    }
    return { data: undefined, revision: lastRevision };
  }

  /**
   * Get the current revision for agent groups
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }
}
