/**
 * Messaging REST Service
 * Business logic for LivePerson Messaging REST API (Connector API)
 *
 * Core messaging operations including:
 * - Creating and managing conversations
 * - Sending messages (text, rich content, typing indicators)
 * - Updating conversation state
 * - Retrieving conversation details
 * - Consumer profile management
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../APIService/api-service';
import { LPDomainService } from '../shared/lp-domain.service';
import { LPBaseService } from '../shared/lp-base.service';
import {
  LP_SERVICE_DOMAINS,
  LP_API_PATHS,
} from '../shared/lp-constants';
import { ILPResponse } from '../shared/lp-common.interfaces';
import {
  ICreateConversationRequest,
  ICreateConversationResponse,
  IGetConversationResponse,
  ISendMessageRequest,
  ISendMessageResponse,
  IMessagingResponse,
  ICloseConversationRequest,
  IUpdateConversationFieldRequest,
  ISubscribeMessagingEventsRequest,
  IUnsubscribeMessagingEventsRequest,
  IGetConsumerProfileRequest,
  IConsumerProfileResponse,
  IContentEvent,
  IRichContentEvent,
  IChatStateEvent,
  IAcceptStatusEvent,
  MessageEventType,
  ConversationState,
  IGetConversationsQuery,
  IGetConversationQuery,
  ChatState,
  AcceptStatus,
} from './messaging-rest.interfaces';

@Injectable()
export class MessagingRestService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ASYNC_MESSAGING;
  protected readonly defaultApiVersion = '2';

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(MessagingRestService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(MessagingRestService.name);
  }

  // ============================================
  // Conversation Management
  // ============================================

  /**
   * Create a new conversation
   * Opens a new conversation with optional consumer info and routing
   */
  async createConversation(
    accountId: string,
    token: string,
    body: {
      brandId?: string;
      skillId?: string;
      campaignInfo?: {
        campaignId?: number;
        engagementId?: number;
      };
      conversationContext?: any;
      consumerInfo?: any;
      authenticatedSdes?: any[];
      unAuthenticatedSdes?: any[];
    },
  ): Promise<ILPResponse<ICreateConversationResponse>> {
    const path = LP_API_PATHS.MSG_REST.CREATE_CONVERSATION(accountId);

    // Build request body according to API format
    const requestBody: any = {
      kind: 'req',
      id: this.generateRequestId(),
      type: 'cm.ConsumerRequestConversation',
      body: {
        brandId: body.brandId || accountId,
      },
    };

    if (body.skillId) {
      requestBody.body.skillId = body.skillId;
    }

    if (body.campaignInfo) {
      requestBody.body.campaignInfo = body.campaignInfo;
    }

    if (body.conversationContext) {
      requestBody.body.conversationContext = body.conversationContext;
    }

    // Add consumer profile data if provided
    if (body.authenticatedSdes || body.unAuthenticatedSdes) {
      const profileRequest = {
        kind: 'req',
        id: this.generateRequestId(),
        type: 'userprofile.SetUserProfile',
        body: {
          authenticatedData: body.authenticatedSdes ? { lp_sdes: body.authenticatedSdes } : undefined,
          unAuthenticatedData: body.unAuthenticatedSdes ? { lp_sdes: body.unAuthenticatedSdes } : undefined,
        },
      };
    }

    this.logger.info(
      { accountId, skillId: body.skillId },
      'Creating new conversation',
    );

    const response = await this.post<ICreateConversationResponse>(
      accountId,
      path,
      requestBody,
      token,
      {},
    );

    return response;
  }

  /**
   * Get conversation by ID
   * Retrieves full conversation details including dialogs and participants
   */
  async getConversation(
    accountId: string,
    conversationId: string,
    token: string,
    query?: IGetConversationQuery,
  ): Promise<ILPResponse<IGetConversationResponse>> {
    const path = LP_API_PATHS.MSG_REST.CONVERSATION_BY_ID(accountId, conversationId);

    const additionalParams: Record<string, string> = {};
    if (query?.v) {
      additionalParams.v = String(query.v);
    }

    this.logger.info(
      { accountId, conversationId },
      'Getting conversation details',
    );

    return this.get<IGetConversationResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get all conversations for account
   * Returns list of conversations with optional filtering
   */
  async getConversations(
    accountId: string,
    token: string,
    query?: IGetConversationsQuery,
  ): Promise<ILPResponse<{ conversations: IGetConversationResponse[] }>> {
    const path = LP_API_PATHS.MSG_REST.CONVERSATIONS(accountId);

    const additionalParams: Record<string, string> = {};
    if (query?.v) additionalParams.v = String(query.v);
    if (query?.status) additionalParams.status = query.status.join(',');
    if (query?.sort) additionalParams.sort = query.sort;
    if (query?.offset) additionalParams.offset = String(query.offset);
    if (query?.limit) additionalParams.limit = String(query.limit);

    this.logger.info(
      { accountId, filters: query },
      'Getting conversations list',
    );

    return this.get<{ conversations: IGetConversationResponse[] }>(
      accountId,
      path,
      token,
      { additionalParams },
    );
  }

  /**
   * Close conversation
   * Marks conversation as closed
   */
  async closeConversation(
    accountId: string,
    conversationId: string,
    token: string,
  ): Promise<ILPResponse<IMessagingResponse>> {
    const path = LP_API_PATHS.MSG_REST.CONVERSATION_BY_ID(accountId, conversationId);

    const requestBody: ICloseConversationRequest = {
      kind: 'req',
      id: this.generateRequestId(),
      type: 'cm.UpdateConversationField',
      body: {
        conversationId,
        conversationField: [
          {
            field: 'ConversationStateField',
            conversationState: ConversationState.CLOSE,
          },
        ],
      },
    };

    this.logger.info(
      { accountId, conversationId },
      'Closing conversation',
    );

    return this.post<IMessagingResponse>(
      accountId,
      path,
      requestBody,
      token,
      {},
    );
  }

  /**
   * Update conversation field
   * Updates specific fields in a conversation
   */
  async updateConversationField(
    accountId: string,
    conversationId: string,
    token: string,
    field: string,
    value: any,
  ): Promise<ILPResponse<IMessagingResponse>> {
    const path = LP_API_PATHS.MSG_REST.CONVERSATION_BY_ID(accountId, conversationId);

    const requestBody: IUpdateConversationFieldRequest = {
      kind: 'req',
      id: this.generateRequestId(),
      type: 'cm.UpdateConversationField',
      body: {
        conversationId,
        conversationField: [
          {
            field,
            ...value,
          },
        ],
      },
    };

    this.logger.info(
      { accountId, conversationId, field },
      'Updating conversation field',
    );

    return this.post<IMessagingResponse>(
      accountId,
      path,
      requestBody,
      token,
      {},
    );
  }

  // ============================================
  // Message Operations
  // ============================================

  /**
   * Send text message
   * Sends a plain text or HTML message to a conversation
   */
  async sendTextMessage(
    accountId: string,
    conversationId: string,
    token: string,
    dialogId: string,
    message: string,
    contentType: string = 'text/plain',
  ): Promise<ILPResponse<ISendMessageResponse>> {
    const path = LP_API_PATHS.MSG_REST.SEND_MESSAGE(accountId, conversationId);

    const event: IContentEvent = {
      type: MessageEventType.CONTENT_EVENT,
      message,
      contentType: contentType as any,
    };

    const requestBody: ISendMessageRequest = {
      kind: 'req',
      id: this.generateRequestId(),
      type: 'ms.PublishEvent',
      body: {
        dialogId,
        event,
      },
    };

    this.logger.info(
      { accountId, conversationId, dialogId, messageLength: message.length },
      'Sending text message',
    );

    return this.post<ISendMessageResponse>(
      accountId,
      path,
      requestBody,
      token,
      {},
    );
  }

  /**
   * Send structured content message
   * Sends rich content (cards, buttons, etc.) to a conversation
   */
  async sendStructuredContent(
    accountId: string,
    conversationId: string,
    token: string,
    dialogId: string,
    content: any,
  ): Promise<ILPResponse<ISendMessageResponse>> {
    const path = LP_API_PATHS.MSG_REST.SEND_MESSAGE(accountId, conversationId);

    const event: IRichContentEvent = {
      type: MessageEventType.RICH_CONTENT_EVENT,
      content,
    };

    const requestBody: ISendMessageRequest = {
      kind: 'req',
      id: this.generateRequestId(),
      type: 'ms.PublishEvent',
      body: {
        dialogId,
        event,
      },
    };

    this.logger.info(
      { accountId, conversationId, dialogId },
      'Sending structured content',
    );

    return this.post<ISendMessageResponse>(
      accountId,
      path,
      requestBody,
      token,
      {},
    );
  }

  /**
   * Send chat state (typing indicator)
   * Updates the chat state (COMPOSING, ACTIVE, PAUSE, etc.)
   */
  async sendChatState(
    accountId: string,
    conversationId: string,
    token: string,
    dialogId: string,
    chatState: ChatState,
  ): Promise<ILPResponse<ISendMessageResponse>> {
    const path = LP_API_PATHS.MSG_REST.SEND_MESSAGE(accountId, conversationId);

    const event: IChatStateEvent = {
      type: MessageEventType.CHAT_STATE_EVENT,
      chatState,
    };

    const requestBody: ISendMessageRequest = {
      kind: 'req',
      id: this.generateRequestId(),
      type: 'ms.PublishEvent',
      body: {
        dialogId,
        event,
      },
    };

    this.logger.info(
      { accountId, conversationId, dialogId, chatState },
      'Sending chat state',
    );

    return this.post<ISendMessageResponse>(
      accountId,
      path,
      requestBody,
      token,
      {},
    );
  }

  /**
   * Send accept status (read receipt)
   * Acknowledges messages by sequence number
   */
  async sendAcceptStatus(
    accountId: string,
    conversationId: string,
    token: string,
    dialogId: string,
    status: AcceptStatus,
    sequenceList: number[],
  ): Promise<ILPResponse<ISendMessageResponse>> {
    const path = LP_API_PATHS.MSG_REST.SEND_MESSAGE(accountId, conversationId);

    const event: IAcceptStatusEvent = {
      type: MessageEventType.ACCEPT_STATUS_EVENT,
      status,
      sequenceList,
    };

    const requestBody: ISendMessageRequest = {
      kind: 'req',
      id: this.generateRequestId(),
      type: 'ms.PublishEvent',
      body: {
        dialogId,
        event,
      },
    };

    this.logger.info(
      { accountId, conversationId, dialogId, status, sequences: sequenceList.length },
      'Sending accept status',
    );

    return this.post<ISendMessageResponse>(
      accountId,
      path,
      requestBody,
      token,
      {},
    );
  }

  // ============================================
  // Consumer Profile Operations
  // ============================================

  /**
   * Get consumer profile
   * Retrieves consumer profile data (SDEs)
   */
  async getConsumerProfile(
    accountId: string,
    consumerId: string,
    token: string,
  ): Promise<ILPResponse<IConsumerProfileResponse>> {
    const path = LP_API_PATHS.MSG_REST.CONSUMER_PROFILE(accountId, consumerId);

    this.logger.info(
      { accountId, consumerId },
      'Getting consumer profile',
    );

    return this.get<IConsumerProfileResponse>(accountId, path, token, {});
  }

  /**
   * Update consumer profile
   * Updates consumer profile data (SDEs)
   */
  async updateConsumerProfile(
    accountId: string,
    consumerId: string,
    token: string,
    authenticatedData?: any,
    unAuthenticatedData?: any,
  ): Promise<ILPResponse<IMessagingResponse>> {
    const path = LP_API_PATHS.MSG_REST.CONSUMER_PROFILE(accountId, consumerId);

    const requestBody: IGetConsumerProfileRequest = {
      kind: 'req',
      id: this.generateRequestId(),
      type: 'userprofile.GetUserProfile',
      body: {
        consumerId,
      },
    };

    this.logger.info(
      { accountId, consumerId },
      'Updating consumer profile',
    );

    return this.post<IMessagingResponse>(
      accountId,
      path,
      requestBody,
      token,
      {},
    );
  }

  // ============================================
  // Conversation Routing
  // ============================================

  /**
   * Transfer conversation to skill
   * Moves conversation to a different skill
   */
  async transferConversation(
    accountId: string,
    conversationId: string,
    token: string,
    skillId: string,
  ): Promise<ILPResponse<IMessagingResponse>> {
    return this.updateConversationField(
      accountId,
      conversationId,
      token,
      'ParticipantsChange',
      {
        role: 'ASSIGNED_AGENT',
        userId: `-${skillId}`,
      },
    );
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Send typing indicator (composing)
   * Quick method to show typing indicator
   */
  async sendTypingIndicator(
    accountId: string,
    conversationId: string,
    token: string,
    dialogId: string,
  ): Promise<ILPResponse<ISendMessageResponse>> {
    return this.sendChatState(
      accountId,
      conversationId,
      token,
      dialogId,
      ChatState.COMPOSING,
    );
  }

  /**
   * Stop typing indicator (active)
   * Quick method to stop typing indicator
   */
  async stopTypingIndicator(
    accountId: string,
    conversationId: string,
    token: string,
    dialogId: string,
  ): Promise<ILPResponse<ISendMessageResponse>> {
    return this.sendChatState(
      accountId,
      conversationId,
      token,
      dialogId,
      ChatState.ACTIVE,
    );
  }

  /**
   * Mark messages as read
   * Quick method to send read receipt for multiple messages
   */
  async markAsRead(
    accountId: string,
    conversationId: string,
    token: string,
    dialogId: string,
    sequenceList: number[],
  ): Promise<ILPResponse<ISendMessageResponse>> {
    return this.sendAcceptStatus(
      accountId,
      conversationId,
      token,
      dialogId,
      AcceptStatus.READ,
      sequenceList,
    );
  }

  /**
   * Get open conversations
   * Retrieves only open conversations
   */
  async getOpenConversations(
    accountId: string,
    token: string,
    limit: number = 50,
  ): Promise<ILPResponse<{ conversations: IGetConversationResponse[] }>> {
    return this.getConversations(accountId, token, {
      v: 2,
      status: [ConversationState.OPEN],
      limit,
    });
  }

  /**
   * Get closed conversations
   * Retrieves only closed conversations
   */
  async getClosedConversations(
    accountId: string,
    token: string,
    limit: number = 50,
  ): Promise<ILPResponse<{ conversations: IGetConversationResponse[] }>> {
    return this.getConversations(accountId, token, {
      v: 2,
      status: [ConversationState.CLOSE],
      limit,
    });
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Generate unique request ID for API calls
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
