/**
 * Conversation Orchestrator Service
 * Business logic for LivePerson Conversation Orchestrator API
 * Domain: coreAIIntent (KB Rules, Bot Rules, Agent Preferences)
 */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AxiosRequestConfig } from 'axios';
import { APIService } from '../../APIService/api-service';
import { HelperService } from '../../HelperService/helper-service.service';
import {
  IKBRule,
  IBotRule,
  IAgentPreferences,
  IKBRulesResponse,
  IBotRulesResponse,
  ICreateKBRule,
  IUpdateKBRule,
  ICreateBotRule,
  IUpdateBotRule,
} from './conversation-orchestrator.interfaces';

interface ICOResponse<T> {
  data: T;
  revision?: string;
}

@Injectable()
export class ConversationOrchestratorService {
  private readonly serviceDomain = 'coreAIIntent';

  constructor(
    private readonly apiService: APIService,
    private readonly helperService: HelperService,
    @InjectPinoLogger(ConversationOrchestratorService.name)
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ConversationOrchestratorService.name);
  }

  /**
   * Get the base URL for Conversation Orchestrator API calls
   */
  private async getBaseUrl(accountId: string): Promise<string> {
    const domain = await this.helperService.getDomain(accountId, this.serviceDomain);
    if (!domain) {
      throw new InternalServerErrorException(
        `Domain not found for service ${this.serviceDomain} in account ${accountId}`,
      );
    }
    return `https://${domain}`;
  }

  /**
   * Create authorization header from token
   */
  private getAuthHeader(token: string): Record<string, string> {
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    return { Authorization: `Bearer ${cleanToken}` };
  }

  /**
   * Get common headers required by CO API (account-id, user-id)
   */
  private getCommonHeaders(accountId: string, userId?: string): Record<string, string> {
    return {
      'account-id': accountId,
      'user-id': userId || accountId,
    };
  }

  /**
   * Make a GET request
   */
  private async get<T>(
    accountId: string,
    path: string,
    token: string,
    userId?: string,
    extraHeaders?: Record<string, string>,
  ): Promise<ICOResponse<T>> {
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}${path}`;

    this.logger.debug({ accountId, url }, 'CO API GET request');

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(token),
        ...this.getCommonHeaders(accountId, userId),
        Accept: 'application/json',
        ...extraHeaders,
      },
    };

    try {
      const response = await this.apiService.get<T>(url, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'get',
        message: 'CO API GET request failed',
        accountId,
        path,
        url,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  private async post<T>(
    accountId: string,
    path: string,
    body: any,
    token: string,
    userId?: string,
    extraHeaders?: Record<string, string>,
  ): Promise<ICOResponse<T>> {
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(token),
        ...this.getCommonHeaders(accountId, userId),
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...extraHeaders,
      },
    };

    try {
      const response = await this.apiService.post<T>(url, body, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'post',
        message: 'CO API POST request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  private async put<T>(
    accountId: string,
    path: string,
    body: any,
    token: string,
    userId?: string,
    extraHeaders?: Record<string, string>,
  ): Promise<ICOResponse<T>> {
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(token),
        ...this.getCommonHeaders(accountId, userId),
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...extraHeaders,
      },
    };

    try {
      const response = await this.apiService.put<T>(url, body, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'put',
        message: 'CO API PUT request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  private async delete<T>(
    accountId: string,
    path: string,
    token: string,
    userId?: string,
    extraHeaders?: Record<string, string>,
  ): Promise<ICOResponse<T>> {
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(token),
        ...this.getCommonHeaders(accountId, userId),
        Accept: 'application/json',
        ...extraHeaders,
      },
    };

    try {
      const response = await this.apiService.delete<T>(url, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'delete',
        message: 'CO API DELETE request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  // ============================================
  // KB Rules (Knowledge Base Recommendations)
  // ============================================

  /**
   * Get all KB recommendation rules
   */
  async getKBRules(
    accountId: string,
    token: string,
    options?: { page?: number; size?: number },
    userId?: string,
  ): Promise<ICOResponse<IKBRulesResponse>> {
    const page = options?.page || 1;
    const size = options?.size || 100;
    const path = `/v3/rules/${accountId}/knowledgebase?page=${page}&size=${size}`;

    return this.get<IKBRulesResponse>(accountId, path, token, userId);
  }

  /**
   * Get a single KB rule by ID
   */
  async getKBRuleById(
    accountId: string,
    ruleId: string,
    token: string,
    userId?: string,
  ): Promise<ICOResponse<IKBRule>> {
    const path = `/v3/rules/${accountId}/knowledgebase/${ruleId}`;

    return this.get<IKBRule>(accountId, path, token, userId);
  }

  /**
   * Create a new KB rule
   */
  async createKBRule(
    accountId: string,
    token: string,
    data: ICreateKBRule,
    userId?: string,
  ): Promise<ICOResponse<IKBRule>> {
    const path = `/v3/rules/${accountId}/knowledgebase`;

    const payload = {
      ...data,
      type: 'knowledgebase',
      brandId: accountId,
    };

    return this.post<IKBRule>(accountId, path, payload, token, userId);
  }

  /**
   * Update a KB rule
   */
  async updateKBRule(
    accountId: string,
    ruleId: string,
    token: string,
    data: IUpdateKBRule,
    userId?: string,
  ): Promise<ICOResponse<IKBRule>> {
    const path = `/v3/rules/${accountId}/knowledgebase/${ruleId}`;

    const payload = {
      ...data,
      id: ruleId,
      type: 'knowledgebase',
      brandId: accountId,
    };

    return this.put<IKBRule>(accountId, path, payload, token, userId);
  }

  /**
   * Delete a KB rule
   */
  async deleteKBRule(
    accountId: string,
    ruleId: string,
    token: string,
    userId?: string,
  ): Promise<ICOResponse<void>> {
    const path = `/v3/rules/${accountId}/knowledgebase/${ruleId}`;

    return this.delete<void>(accountId, path, token, userId);
  }

  // ============================================
  // Bot Rules (Bot Recommendations)
  // ============================================

  /**
   * Get all Bot recommendation rules
   */
  async getBotRules(
    accountId: string,
    token: string,
    options?: {
      page?: number;
      size?: number;
      filterConfidenceScoreMin?: number;
      filterConfidenceScoreMax?: number;
    },
    userId?: string,
  ): Promise<ICOResponse<IBotRulesResponse>> {
    const page = options?.page || 1;
    const size = options?.size || 100;
    let path = `/v3/rules/${accountId}/bot?page=${page}&size=${size}`;

    if (options?.filterConfidenceScoreMin !== undefined) {
      path += `&filterConfidenceScoreMin=${options.filterConfidenceScoreMin}`;
    }
    if (options?.filterConfidenceScoreMax !== undefined) {
      path += `&filterConfidenceScoreMax=${options.filterConfidenceScoreMax}`;
    }

    return this.get<IBotRulesResponse>(accountId, path, token, userId);
  }

  /**
   * Get a single Bot rule by ID
   */
  async getBotRuleById(
    accountId: string,
    ruleId: string,
    token: string,
    userId?: string,
  ): Promise<ICOResponse<IBotRule>> {
    const path = `/v3/rules/${accountId}/bot/${ruleId}`;

    return this.get<IBotRule>(accountId, path, token, userId);
  }

  /**
   * Create a new Bot rule
   */
  async createBotRule(
    accountId: string,
    token: string,
    data: ICreateBotRule,
    userId?: string,
  ): Promise<ICOResponse<IBotRule>> {
    const path = `/v3/rules/${accountId}/bot`;

    const payload = {
      ...data,
      type: 'bot',
      brandId: accountId,
    };

    return this.post<IBotRule>(accountId, path, payload, token, userId);
  }

  /**
   * Update a Bot rule
   */
  async updateBotRule(
    accountId: string,
    ruleId: string,
    token: string,
    data: IUpdateBotRule,
    userId?: string,
  ): Promise<ICOResponse<IBotRule>> {
    const path = `/v3/rules/${accountId}/bot/${ruleId}`;

    const payload = {
      ...data,
      id: ruleId,
      type: 'bot',
      brandId: accountId,
    };

    return this.put<IBotRule>(accountId, path, payload, token, userId);
  }

  /**
   * Delete a Bot rule
   */
  async deleteBotRule(
    accountId: string,
    ruleId: string,
    token: string,
    userId?: string,
  ): Promise<ICOResponse<void>> {
    const path = `/v3/rules/${accountId}/bot/${ruleId}`;

    return this.delete<void>(accountId, path, token, userId);
  }

  // ============================================
  // Agent Preferences
  // ============================================

  /**
   * Get agent preferences for Conversation Assist
   */
  async getAgentPreferences(
    accountId: string,
    token: string,
    userId?: string,
  ): Promise<ICOResponse<IAgentPreferences>> {
    const path = `/v2/account/${accountId}/agent-preferences?v=3.0`;

    return this.get<IAgentPreferences>(accountId, path, token, userId);
  }

  /**
   * Update agent preferences
   */
  async updateAgentPreferences(
    accountId: string,
    token: string,
    data: Partial<IAgentPreferences>,
    userId?: string,
  ): Promise<ICOResponse<IAgentPreferences>> {
    const path = `/v2/account/${accountId}/agent-preferences?v=3.0`;

    return this.put<IAgentPreferences>(accountId, path, data, token, userId);
  }
}
