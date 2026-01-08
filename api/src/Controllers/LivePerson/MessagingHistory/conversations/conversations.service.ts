/**
 * Messaging Interactions (History) Service
 * Business logic for LivePerson Messaging History API
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
  IConversationSearchRequest,
  IConversationSearchResponse,
  IConversationResponse,
  IGetConversationByIdRequest,
  IGetConversationsByConsumerRequest,
  IConversationSearchQuery,
} from './conversations.interfaces';

@Injectable()
export class ConversationsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.MSG_HIST;
  protected readonly defaultApiVersion = LP_API_VERSIONS.MSG_HIST_CONVERSATIONS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(ConversationsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(ConversationsService.name);
  }

  /**
   * Search conversations with filters
   * This is the main method for querying conversation history
   */
  async searchConversations(
    accountId: string,
    token: string,
    body: IConversationSearchRequest,
    query?: IConversationSearchQuery,
  ): Promise<ILPResponse<IConversationSearchResponse>> {
    const path = LP_API_PATHS.MSG_HIST.CONVERSATIONS(accountId);

    const additionalParams: Record<string, string> = {};
    if (query?.offset !== undefined) {
      additionalParams.offset = String(query.offset);
    }
    additionalParams.limit = query?.limit !== undefined ? String(query.limit) : '100';
    if (query?.sort) {
      additionalParams.sort = query.sort;
    }
    if (query?.v !== undefined) {
      additionalParams.v = String(query.v);
    }
    if (query?.source) {
      additionalParams.source = query.source;
    }
    if (query?.rollover !== undefined) {
      additionalParams.rollover = String(query.rollover);
    }

    const requestOptions: ILPRequestOptions = {
      additionalParams: Object.keys(additionalParams).length > 0 ? additionalParams : undefined,
    };

    this.logger.info(
      { accountId, startFrom: body.start?.from, startTo: body.start?.to },
      'Searching conversations',
    );

    return this.post<IConversationSearchResponse>(accountId, path, body, token, requestOptions);
  }

  /**
   * Get conversation(s) by ID
   * Retrieve specific conversations by their IDs
   */
  async getConversationById(
    accountId: string,
    token: string,
    body: IGetConversationByIdRequest,
    source?: string,
  ): Promise<ILPResponse<IConversationResponse>> {
    const path = LP_API_PATHS.MSG_HIST.CONVERSATION_BY_ID(accountId);

    const additionalParams: Record<string, string> = {};
    if (source) {
      additionalParams.source = source;
    }

    const requestOptions: ILPRequestOptions = {
      additionalParams: Object.keys(additionalParams).length > 0 ? additionalParams : undefined,
    };

    const conversationCount = body.conversationIds?.length || (body.conversationId ? 1 : 0);
    this.logger.info(
      { accountId, conversationCount },
      'Getting conversation(s) by ID',
    );

    return this.post<IConversationResponse>(accountId, path, body, token, requestOptions);
  }

  /**
   * Get conversations by consumer ID
   * Retrieve all conversations for a specific consumer
   */
  async getConversationsByConsumer(
    accountId: string,
    token: string,
    body: IGetConversationsByConsumerRequest,
    query?: {
      offset?: number;
      limit?: number;
      source?: string;
    },
  ): Promise<ILPResponse<IConversationSearchResponse>> {
    const path = LP_API_PATHS.MSG_HIST.CONVERSATIONS_BY_CONSUMER(accountId);

    const additionalParams: Record<string, string> = {};
    if (query?.offset !== undefined) {
      additionalParams.offset = String(query.offset);
    }
    if (query?.limit !== undefined) {
      additionalParams.limit = String(query.limit);
    }
    if (query?.source) {
      additionalParams.source = query.source;
    }

    const requestOptions: ILPRequestOptions = {
      additionalParams: Object.keys(additionalParams).length > 0 ? additionalParams : undefined,
    };

    this.logger.info(
      { accountId, consumerId: body.consumer },
      'Getting conversations by consumer ID',
    );

    return this.post<IConversationSearchResponse>(accountId, path, body, token, requestOptions);
  }

  /**
   * Get all open conversations for an account
   * Convenience method for common use case
   */
  async getOpenConversations(
    accountId: string,
    token: string,
    options?: {
      skillIds?: number[];
      agentIds?: string[];
      contentToRetrieve?: string[];
      limit?: number;
    },
  ): Promise<ILPResponse<IConversationSearchResponse>> {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const body: IConversationSearchRequest = {
      start: {
        from: thirtyDaysAgo,
        to: now,
      },
      status: ['OPEN' as any],
      ...(options?.skillIds && { skillIds: options.skillIds }),
      ...(options?.agentIds && { agentIds: options.agentIds }),
      ...(options?.contentToRetrieve && { contentToRetrieve: options.contentToRetrieve as any }),
    };

    return this.searchConversations(accountId, token, body, {
      limit: options?.limit || 100,
    });
  }

  /**
   * Get recent closed conversations
   * Convenience method for common use case
   */
  async getRecentClosedConversations(
    accountId: string,
    token: string,
    options?: {
      daysBack?: number;
      skillIds?: number[];
      agentIds?: string[];
      contentToRetrieve?: string[];
      limit?: number;
    },
  ): Promise<ILPResponse<IConversationSearchResponse>> {
    const now = Date.now();
    const daysBack = options?.daysBack || 7;
    const startTime = now - daysBack * 24 * 60 * 60 * 1000;

    const body: IConversationSearchRequest = {
      start: {
        from: startTime,
        to: now,
      },
      status: ['CLOSE' as any],
      ...(options?.skillIds && { skillIds: options.skillIds }),
      ...(options?.agentIds && { agentIds: options.agentIds }),
      ...(options?.contentToRetrieve && { contentToRetrieve: options.contentToRetrieve as any }),
    };

    return this.searchConversations(accountId, token, body, {
      limit: options?.limit || 100,
      sort: 'end:desc',
    });
  }

  /**
   * Get conversation with full transcript
   * Convenience method to get a single conversation with all message records
   */
  async getConversationWithTranscript(
    accountId: string,
    token: string,
    conversationId: string,
  ): Promise<ILPResponse<IConversationResponse>> {
    const body: IGetConversationByIdRequest = {
      conversationId,
      contentToRetrieve: [
        'messageRecords',
        'agentParticipants',
        'consumerParticipants',
        'transfers',
        'interactions',
        'sdes',
        'intents',
        'summary',
      ],
    };

    return this.getConversationById(accountId, token, body);
  }

  /**
   * Search conversations by keyword
   * Convenience method to search for specific text in conversations
   */
  async searchByKeyword(
    accountId: string,
    token: string,
    keyword: string,
    options?: {
      startTime: number;
      endTime?: number;
      status?: ('OPEN' | 'CLOSE')[];
      limit?: number;
    },
  ): Promise<ILPResponse<IConversationSearchResponse>> {
    const body: IConversationSearchRequest = {
      start: {
        from: options?.startTime || Date.now() - 7 * 24 * 60 * 60 * 1000,
        to: options?.endTime || Date.now(),
      },
      keyword,
      ...(options?.status && { status: options.status as any }),
      contentToRetrieve: ['messageRecords', 'agentParticipants', 'consumerParticipants'],
    };

    return this.searchConversations(accountId, token, body, {
      limit: options?.limit || 50,
    });
  }
}
