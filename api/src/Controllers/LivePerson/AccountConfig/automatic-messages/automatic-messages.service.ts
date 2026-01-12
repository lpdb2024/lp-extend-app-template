/**
 * Automatic Messages Service
 * Handles all Automatic Messages API operations for LivePerson using the SDK
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Scopes } from '@lpextend/node-sdk';
import type {
  LPAutomaticMessage,
  CreateAutomaticMessageRequest,
  UpdateAutomaticMessageRequest,
} from '@lpextend/node-sdk';
import { SDKProviderService, TokenInfo } from '../../shared/sdk-provider.service';

/**
 * Response type for SDK operations
 */
export interface ILPResponse<T> {
  data: T;
  revision?: string;
  headers?: Record<string, string>;
}

@Injectable()
export class AutomaticMessagesService {
  constructor(
    @InjectPinoLogger(AutomaticMessagesService.name)
    private readonly logger: PinoLogger,
    private readonly sdkProvider: SDKProviderService,
  ) {
    this.logger.setContext(AutomaticMessagesService.name);
  }

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.AUTOMATIC_MESSAGES]);
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
  ): Promise<ILPResponse<LPAutomaticMessage[]>> {
    const sdk = await this.getSDK(accountId, token);
    const response = await sdk.automaticMessages.getAll();
    this.logger.debug({ accountId, count: response.data?.length }, 'Fetched automatic messages');
    return response;
  }

  /**
   * Get a single automatic message by ID
   */
  async getById(
    accountId: string,
    messageId: string | number,
    token: string,
  ): Promise<ILPResponse<LPAutomaticMessage>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.automaticMessages.getById(Number(messageId));
  }

  /**
   * Create a new automatic message
   */
  async create(
    accountId: string,
    token: string,
    data: CreateAutomaticMessageRequest,
    revision?: string,
  ): Promise<ILPResponse<LPAutomaticMessage>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.automaticMessages.create(data);
  }

  /**
   * Create multiple automatic messages
   */
  async createMany(
    accountId: string,
    token: string,
    data: CreateAutomaticMessageRequest[],
    revision?: string,
  ): Promise<ILPResponse<LPAutomaticMessage[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPAutomaticMessage[] = [];
    let lastRevision: string | undefined;
    for (const message of data) {
      const response = await sdk.automaticMessages.create(message);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Update an automatic message
   */
  async update(
    accountId: string,
    messageId: string | number,
    token: string,
    data: UpdateAutomaticMessageRequest,
    revision?: string,
  ): Promise<ILPResponse<LPAutomaticMessage>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.automaticMessages.update(Number(messageId), data, revision);
  }

  /**
   * Update multiple automatic messages
   */
  async updateMany(
    accountId: string,
    token: string,
    data: (UpdateAutomaticMessageRequest & { id: number })[],
    revision?: string,
  ): Promise<ILPResponse<LPAutomaticMessage[]>> {
    const sdk = await this.getSDK(accountId, token);
    const results: LPAutomaticMessage[] = [];
    let lastRevision = revision;
    for (const message of data) {
      const response = await sdk.automaticMessages.update(message.id, message, lastRevision);
      results.push(response.data);
      lastRevision = response.revision;
    }
    return { data: results, revision: lastRevision };
  }

  /**
   * Delete an automatic message
   */
  async remove(
    accountId: string,
    messageId: string | number,
    token: string,
    revision?: string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);
    return sdk.automaticMessages.delete(Number(messageId), revision);
  }

  /**
   * Delete multiple automatic messages
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
      const response = await sdk.automaticMessages.delete(id, lastRevision);
      lastRevision = response.revision;
    }
    return { data: undefined, revision: lastRevision };
  }

  /**
   * Get the current revision for automatic messages
   */
  async getRevision(accountId: string, token: string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }
}
