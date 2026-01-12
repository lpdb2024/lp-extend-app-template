/**
 * Prompts Service
 * Business logic for LivePerson Prompt Library API using SDK
 * Domain: promptlibrary
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Scopes } from '@lpextend/node-sdk';
import type {
  LPPrompt,
  CreateLPPromptRequest,
  UpdateLPPromptRequest,
  LPLLMProviderSubscription,
} from '@lpextend/node-sdk';
import { SDKProviderService, TokenInfo } from '../shared/sdk-provider.service';
import {
  IPrompt,
  ICreatePrompt,
  IUpdatePrompt,
  ILLMProviderSubscription,
} from './prompts.interfaces';

/**
 * Response type for SDK operations
 */
export interface ILPResponse<T> {
  data: T;
  revision?: string;
  headers?: Record<string, string>;
}

@Injectable()
export class PromptsService {
  constructor(
    private readonly sdkProvider: SDKProviderService,
    @InjectPinoLogger(PromptsService.name)
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(PromptsService.name);
  }

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.LP_PROMPTS]);
  }

  /**
   * Get all system prompts (read-only, provided by LivePerson)
   */
  async getSystemPrompts(
    accountId: string,
    token: TokenInfo | string,
    options?: { source?: string },
  ): Promise<ILPResponse<IPrompt[]>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, source: options?.source || 'ccui' },
      'Getting system prompts via SDK',
    );

    const response = await sdk.prompts.getSystemPrompts({
      source: options?.source || 'ccui',
    });

    return {
      data: response.data as unknown as IPrompt[],
      revision: response.revision,
    };
  }

  /**
   * Get all account prompts
   */
  async getAccountPrompts(
    accountId: string,
    token: TokenInfo | string,
    options?: { source?: string },
  ): Promise<ILPResponse<IPrompt[]>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, source: options?.source || 'ccui' },
      'Getting account prompts via SDK',
    );

    const response = await sdk.prompts.getAccountPrompts({
      source: options?.source || 'ccui',
    });

    return {
      data: response.data as unknown as IPrompt[],
      revision: response.revision,
    };
  }

  /**
   * Get a single account prompt by ID
   */
  async getAccountPromptById(
    accountId: string,
    promptId: string,
    token: TokenInfo | string,
  ): Promise<ILPResponse<IPrompt>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, promptId },
      'Getting account prompt by ID via SDK',
    );

    const response = await sdk.prompts.getById(promptId);

    return {
      data: response.data as unknown as IPrompt,
      revision: response.revision,
    };
  }

  /**
   * Create a new account prompt
   */
  async createAccountPrompt(
    accountId: string,
    token: TokenInfo | string,
    data: ICreatePrompt,
  ): Promise<ILPResponse<IPrompt>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, promptName: data.name },
      'Creating account prompt via SDK',
    );

    const response = await sdk.prompts.create(data as unknown as CreateLPPromptRequest);

    return {
      data: response.data as unknown as IPrompt,
      revision: response.revision,
    };
  }

  /**
   * Update an account prompt
   */
  async updateAccountPrompt(
    accountId: string,
    promptId: string,
    token: TokenInfo | string,
    data: IUpdatePrompt,
  ): Promise<ILPResponse<IPrompt>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, promptId },
      'Updating account prompt via SDK',
    );

    const response = await sdk.prompts.update(promptId, data as unknown as UpdateLPPromptRequest);

    return {
      data: response.data as unknown as IPrompt,
      revision: response.revision,
    };
  }

  /**
   * Delete an account prompt
   */
  async deleteAccountPrompt(
    accountId: string,
    promptId: string,
    token: TokenInfo | string,
  ): Promise<ILPResponse<void>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId, promptId },
      'Deleting account prompt via SDK',
    );

    const response = await sdk.prompts.delete(promptId);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  /**
   * Get LLM provider subscriptions for an account
   */
  async getLLMProviders(
    accountId: string,
    token: TokenInfo | string,
  ): Promise<ILPResponse<ILLMProviderSubscription[]>> {
    const sdk = await this.getSDK(accountId, token);

    this.logger.info(
      { accountId },
      'Getting LLM providers via SDK',
    );

    const response = await sdk.prompts.getLLMProviders();

    return {
      data: response.data as unknown as ILLMProviderSubscription[],
      revision: response.revision,
    };
  }
}
