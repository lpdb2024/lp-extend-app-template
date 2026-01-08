/**
 * Prompts Service
 * Business logic for LivePerson Prompt Library API
 * Domain: promptlibrary
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
  IPrompt,
  ICreatePrompt,
  IUpdatePrompt,
  ILLMProviderSubscription,
  IPromptsResponse,
  ILLMProvidersResponse,
} from './prompts.interfaces';

@Injectable()
export class PromptsService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.PROMPT_LIBRARY;
  protected readonly defaultApiVersion = LP_API_VERSIONS.PROMPTS;

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(PromptsService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(PromptsService.name);
  }

  /**
   * Get all system prompts (read-only, provided by LivePerson)
   */
  async getSystemPrompts(
    accountId: string,
    token: string,
    options?: { source?: string },
  ): Promise<ILPResponse<IPrompt[]>> {
    const path = LP_API_PATHS.PROMPTS.SYSTEM();

    const requestOptions: ILPRequestOptions = {
      source: options?.source || 'ccui',
    };

    // Make the request and extract prompts from response structure
    const response = await this.get<IPromptsResponse>(accountId, path, token, requestOptions);

    // The LP API returns { success, statusCode, successResult: { prompts: [...] } }
    // We need to extract just the prompts array
    const prompts = response.data?.successResult?.prompts || [];

    return {
      data: prompts,
      revision: response.revision,
    };
  }

  /**
   * Get all account prompts
   */
  async getAccountPrompts(
    accountId: string,
    token: string,
    options?: { source?: string },
  ): Promise<ILPResponse<IPrompt[]>> {
    const path = LP_API_PATHS.PROMPTS.ACCOUNT(accountId);

    const requestOptions: ILPRequestOptions = {
      source: options?.source || 'ccui',
    };

    const response = await this.get<IPromptsResponse>(accountId, path, token, requestOptions);

    const prompts = response.data?.successResult?.prompts || [];

    return {
      data: prompts,
      revision: response.revision,
    };
  }

  /**
   * Get a single account prompt by ID
   */
  async getAccountPromptById(
    accountId: string,
    promptId: string,
    token: string,
  ): Promise<ILPResponse<IPrompt>> {
    const path = LP_API_PATHS.PROMPTS.ACCOUNT_BY_ID(accountId, promptId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
    };

    return this.get<IPrompt>(accountId, path, token, requestOptions);
  }

  /**
   * Create a new account prompt
   */
  async createAccountPrompt(
    accountId: string,
    token: string,
    data: ICreatePrompt,
  ): Promise<ILPResponse<IPrompt>> {
    const path = LP_API_PATHS.PROMPTS.ACCOUNT(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
    };

    return this.post<IPrompt>(accountId, path, data, token, requestOptions);
  }

  /**
   * Update an account prompt
   */
  async updateAccountPrompt(
    accountId: string,
    promptId: string,
    token: string,
    data: IUpdatePrompt,
  ): Promise<ILPResponse<IPrompt>> {
    const path = LP_API_PATHS.PROMPTS.ACCOUNT_BY_ID(accountId, promptId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
    };

    return this.put<IPrompt>(accountId, path, data, token, requestOptions);
  }

  /**
   * Delete an account prompt
   */
  async deleteAccountPrompt(
    accountId: string,
    promptId: string,
    token: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.PROMPTS.ACCOUNT_BY_ID(accountId, promptId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
    };

    return this.delete<void>(accountId, path, token, requestOptions);
  }

  /**
   * Get LLM provider subscriptions for an account
   */
  async getLLMProviders(
    accountId: string,
    token: string,
  ): Promise<ILPResponse<ILLMProviderSubscription[]>> {
    const path = LP_API_PATHS.PROMPTS.LLM_PROVIDERS(accountId);

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
    };

    const response = await this.get<ILLMProvidersResponse>(accountId, path, token, requestOptions);

    const providers = response.data?.successResult?.provider_subscriptions || [];

    return {
      data: providers,
      revision: response.revision,
    };
  }
}
