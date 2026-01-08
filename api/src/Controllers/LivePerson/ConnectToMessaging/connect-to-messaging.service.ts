/**
 * Connect to Messaging Service
 * Business logic for LivePerson Connect to Messaging (C2M) API
 * Enables transferring IVR/voice calls to messaging conversations
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
import { ILPResponse } from '../shared/lp-common.interfaces';
import {
  ICreateConversationRequest,
  ICreateConversationResponse,
  ISendMessageRequest,
  ISendMessageResponse,
  ICloseConversationRequest,
  ICloseConversationResponse,
  ITransferConversationRequest,
  ITransferConversationResponse,
  IGetConversationResponse,
  IGetCapabilitiesResponse,
} from './connect-to-messaging.interfaces';

@Injectable()
export class ConnectToMessagingService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ASYNC_MESSAGING;
  protected readonly defaultApiVersion = LP_API_VERSIONS.CONNECT_TO_MESSAGING;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(ConnectToMessagingService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(ConnectToMessagingService.name);
  }

  /**
   * Create a new messaging conversation
   * Initiates a handoff from IVR/voice to messaging channel
   */
  async createConversation(
    accountId: string,
    token: string,
    request: ICreateConversationRequest,
  ): Promise<ILPResponse<ICreateConversationResponse>> {
    const path = LP_API_PATHS.CONNECT_TO_MESSAGING.CREATE_CONVERSATION(accountId);

    this.logger.info(
      {
        accountId,
        skillId: request.skill?.skillId,
        hasInitialMessage: !!request.initialMessage,
      },
      'Creating messaging conversation from IVR/voice',
    );

    return this.post<ICreateConversationResponse>(
      accountId,
      path,
      request,
      token,
    );
  }

  /**
   * Send a message to an existing conversation
   * Allows sending additional messages after conversation is created
   */
  async sendMessage(
    accountId: string,
    conversationId: string,
    token: string,
    request: ISendMessageRequest,
  ): Promise<ILPResponse<ISendMessageResponse>> {
    const path = LP_API_PATHS.CONNECT_TO_MESSAGING.SEND_MESSAGE(accountId, conversationId);

    this.logger.info(
      {
        accountId,
        conversationId,
        hasText: !!request.message.text,
        hasStructuredContent: !!request.message.structuredContent,
      },
      'Sending message to conversation',
    );

    return this.post<ISendMessageResponse>(
      accountId,
      path,
      request,
      token,
    );
  }

  /**
   * Close a messaging conversation
   * Ends the conversation that was created via C2M
   */
  async closeConversation(
    accountId: string,
    conversationId: string,
    token: string,
    request: ICloseConversationRequest,
  ): Promise<ILPResponse<ICloseConversationResponse>> {
    const path = LP_API_PATHS.CONNECT_TO_MESSAGING.CLOSE_CONVERSATION(accountId, conversationId);

    this.logger.info(
      {
        accountId,
        conversationId,
        closeReason: request.closeReason,
      },
      'Closing messaging conversation',
    );

    return this.post<ICloseConversationResponse>(
      accountId,
      path,
      request,
      token,
    );
  }

  /**
   * Transfer a conversation to a different skill
   * Routes the conversation to another skill/agent group
   */
  async transferConversation(
    accountId: string,
    conversationId: string,
    token: string,
    request: ITransferConversationRequest,
  ): Promise<ILPResponse<ITransferConversationResponse>> {
    const path = LP_API_PATHS.CONNECT_TO_MESSAGING.TRANSFER_CONVERSATION(accountId, conversationId);

    this.logger.info(
      {
        accountId,
        conversationId,
        targetSkillId: request.targetSkillId,
        transferReason: request.transferReason,
      },
      'Transferring conversation to skill',
    );

    return this.post<ITransferConversationResponse>(
      accountId,
      path,
      request,
      token,
    );
  }

  /**
   * Get conversation details
   * Retrieves current state and messages of a conversation
   */
  async getConversation(
    accountId: string,
    conversationId: string,
    token: string,
  ): Promise<ILPResponse<IGetConversationResponse>> {
    const path = LP_API_PATHS.CONNECT_TO_MESSAGING.GET_CONVERSATION(accountId, conversationId);

    this.logger.info(
      {
        accountId,
        conversationId,
      },
      'Getting conversation details',
    );

    return this.get<IGetConversationResponse>(
      accountId,
      path,
      token,
    );
  }

  /**
   * Get account capabilities
   * Returns available C2M features for the account
   */
  async getCapabilities(
    accountId: string,
    token: string,
  ): Promise<ILPResponse<IGetCapabilitiesResponse>> {
    const path = LP_API_PATHS.CONNECT_TO_MESSAGING.GET_CAPABILITIES(accountId);

    this.logger.info(
      { accountId },
      'Getting Connect to Messaging capabilities',
    );

    return this.get<IGetCapabilitiesResponse>(
      accountId,
      path,
      token,
    );
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Create conversation with simple text message
   * Simplified method for basic IVR-to-messaging handoff
   */
  async createConversationWithText(
    accountId: string,
    token: string,
    options: {
      skillId: number;
      messageText: string;
      consumerFirstName?: string;
      consumerLastName?: string;
      consumerPhone?: string;
      consumerEmail?: string;
      campaignId?: number;
      engagementId?: number;
    },
  ): Promise<ILPResponse<ICreateConversationResponse>> {
    const request: ICreateConversationRequest = {
      skill: {
        skillId: options.skillId,
      },
      initialMessage: {
        text: options.messageText,
      },
    };

    if (options.consumerFirstName || options.consumerLastName || options.consumerPhone || options.consumerEmail) {
      request.consumerParticipant = {
        firstName: options.consumerFirstName,
        lastName: options.consumerLastName,
        phone: options.consumerPhone,
        email: options.consumerEmail,
      };
    }

    if (options.campaignId || options.engagementId) {
      request.campaignInfo = {
        campaignId: options.campaignId,
        engagementId: options.engagementId,
      };
    }

    return this.createConversation(accountId, token, request);
  }

  /**
   * Send a simple text message
   * Convenience method for sending text to a conversation
   */
  async sendTextMessage(
    accountId: string,
    conversationId: string,
    token: string,
    messageText: string,
  ): Promise<ILPResponse<ISendMessageResponse>> {
    return this.sendMessage(accountId, conversationId, token, {
      conversationId,
      message: {
        text: messageText,
      },
    });
  }

  /**
   * Close conversation with reason
   * Simplified method to close a conversation
   */
  async closeConversationWithReason(
    accountId: string,
    conversationId: string,
    token: string,
    closeReason?: string,
  ): Promise<ILPResponse<ICloseConversationResponse>> {
    return this.closeConversation(accountId, conversationId, token, {
      conversationId,
      closeReason,
    });
  }

  /**
   * Transfer to skill
   * Simplified method to transfer conversation to a skill
   */
  async transferToSkill(
    accountId: string,
    conversationId: string,
    token: string,
    targetSkillId: number,
    transferReason?: string,
  ): Promise<ILPResponse<ITransferConversationResponse>> {
    return this.transferConversation(accountId, conversationId, token, {
      conversationId,
      targetSkillId,
      transferReason,
    });
  }
}
