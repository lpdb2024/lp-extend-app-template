/**
 * Automatic Messages Service
 * Handles all Automatic Messages API operations for LivePerson using the SDK
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import {
  initializeSDK,
  LPExtendSDK,
  Scopes,
  LPExtendSDKError,
} from '@lpextend/client-sdk';
import type {
  LPAutomaticMessage,
  CreateAutomaticMessageRequest,
  UpdateAutomaticMessageRequest,
} from '@lpextend/client-sdk';

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
  private shellBaseUrl: string;
  private appId: string;

  constructor(
    @InjectPinoLogger(AutomaticMessagesService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(AutomaticMessagesService.name);
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
        scopes: [Scopes.AUTOMATIC_MESSAGES],
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
