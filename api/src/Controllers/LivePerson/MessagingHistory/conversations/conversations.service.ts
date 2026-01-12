/**
 * Messaging Interactions (History) Service
 * Business logic for LivePerson Messaging History API using SDK
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Scopes } from '@lpextend/node-sdk';
import type {
  MessagingHistoryQuery,
  MessagingHistoryResponse,
  MessagingConversation,
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
export class ConversationsService {
  constructor(
    private readonly sdkProvider: SDKProviderService,
    @InjectPinoLogger(ConversationsService.name)
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ConversationsService.name);
  }

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.MESSAGING_HISTORY]);
  }

  /**
   * Search conversations with filters
   * This is the main method for querying conversation history
   */
  async searchConversations(
    accountId: string,
    token: TokenInfo | string,
    params: MessagingHistoryQuery,
  ): Promise<ILPResponse<MessagingHistoryResponse>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, startFrom: params.start?.from, startTo: params.start?.to },
      'Searching conversations',
    );

    const response = await sdk.messaging.history.query(params);
    return { data: response.data };
  }

  /**
   * Get conversation(s) by ID
   * Retrieve specific conversations by their IDs
   */
  async getConversationById(
    accountId: string,
    token: TokenInfo | string,
    conversationId: string,
  ): Promise<ILPResponse<MessagingConversation>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, conversationId },
      'Getting conversation by ID',
    );

    const response = await sdk.messaging.history.getConversation(conversationId);
    return { data: response.data };
  }

  /**
   * Get multiple conversations by IDs (batch)
   */
  async getConversationsByIds(
    accountId: string,
    token: TokenInfo | string,
    conversationIds: string[],
  ): Promise<ILPResponse<MessagingConversation[]>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, count: conversationIds.length },
      'Getting conversations by IDs',
    );

    const response = await sdk.messaging.history.getConversations(conversationIds);
    return { data: response.data };
  }

  /**
   * Get conversations by consumer ID
   */
  async getConversationsByConsumer(
    accountId: string,
    token: TokenInfo | string,
    consumerId: string,
    options?: {
      status?: ('OPEN' | 'CLOSE')[];
      limit?: number;
    },
  ): Promise<ILPResponse<MessagingHistoryResponse>> {
    const sdk = await this.getSDK(accountId, token);
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const params: MessagingHistoryQuery = {
      start: { from: thirtyDaysAgo, to: now },
      status: options?.status,
      limit: options?.limit || 100,
      // Note: Consumer filtering may need to be done at API level or post-processing
    };

    this.logger.info(
      { accountId, consumerId },
      'Getting conversations by consumer',
    );

    const response = await sdk.messaging.history.query(params);
    return { data: response.data };
  }

  /**
   * Export conversations matching criteria
   */
  async exportConversations(
    accountId: string,
    token: TokenInfo | string,
    params: MessagingHistoryQuery,
  ): Promise<ILPResponse<MessagingHistoryResponse>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, startFrom: params.start?.from, startTo: params.start?.to },
      'Exporting conversations',
    );

    const response = await sdk.messaging.history.export(params);
    return { data: response.data };
  }

  /**
   * Get all open conversations for an account
   * Convenience method for common use case
   */
  async getOpenConversations(
    accountId: string,
    token: TokenInfo | string,
    options?: {
      skillIds?: number[];
      agentIds?: string[];
      limit?: number;
    },
  ): Promise<ILPResponse<MessagingHistoryResponse>> {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const params: MessagingHistoryQuery = {
      start: { from: thirtyDaysAgo, to: now },
      status: ['OPEN'],
      skillIds: options?.skillIds,
      agentIds: options?.agentIds,
      limit: options?.limit || 100,
    };

    return this.searchConversations(accountId, token, params);
  }

  /**
   * Get recent closed conversations
   * Convenience method for common use case
   */
  async getRecentClosedConversations(
    accountId: string,
    token: TokenInfo | string,
    options?: {
      daysBack?: number;
      skillIds?: number[];
      agentIds?: string[];
      limit?: number;
    },
  ): Promise<ILPResponse<MessagingHistoryResponse>> {
    const now = Date.now();
    const daysBack = options?.daysBack || 7;
    const startTime = now - daysBack * 24 * 60 * 60 * 1000;

    const params: MessagingHistoryQuery = {
      start: { from: startTime, to: now },
      status: ['CLOSE'],
      skillIds: options?.skillIds,
      agentIds: options?.agentIds,
      limit: options?.limit || 100,
    };

    return this.searchConversations(accountId, token, params);
  }

  /**
   * Get conversation with full transcript
   * Convenience method to get a single conversation with all message records
   */
  async getConversationWithTranscript(
    accountId: string,
    token: TokenInfo | string,
    conversationId: string,
  ): Promise<ILPResponse<MessagingConversation>> {
    return this.getConversationById(accountId, token, conversationId);
  }

  /**
   * Search conversations by keyword
   * Convenience method to search for specific text in conversations
   */
  async searchByKeyword(
    accountId: string,
    token: TokenInfo | string,
    keyword: string,
    options?: {
      startTime?: number;
      endTime?: number;
      status?: ('OPEN' | 'CLOSE')[];
      limit?: number;
    },
  ): Promise<ILPResponse<MessagingHistoryResponse>> {
    const now = Date.now();
    const defaultStartTime = now - 7 * 24 * 60 * 60 * 1000;

    const params: MessagingHistoryQuery = {
      start: {
        from: options?.startTime || defaultStartTime,
        to: options?.endTime || now,
      },
      keyword,
      status: options?.status,
      limit: options?.limit || 50,
    };

    return this.searchConversations(accountId, token, params);
  }
}
