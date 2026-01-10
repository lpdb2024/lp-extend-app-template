/**
 * Proactive Messaging Service
 * Business logic for LivePerson Proactive Messaging API
 * Domain: proactive (computed from region)
 *
 * FUTURE WORK: Credential Handling
 * ================================
 * Currently, proactive credentials (client_id, client_secret) are retrieved from
 * the app's credential storage via UsersService.getCredentials(). This requires
 * users to manually configure credentials in App Settings.
 *
 * Planned change: Move to a login-based flow where:
 * 1. User authenticates via LP SSO/Sentinel
 * 2. Proactive credentials are included in the auth token data
 * 3. Credentials are passed to SDK methods directly from auth context
 *
 * This will eliminate the need for separate credential storage and simplify
 * the proactive API integration.
 */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AxiosRequestConfig } from 'axios';
import { APIService } from '../../APIService/api-service';
import { HelperService } from '../../HelperService/helper-service.service';
import { UsersService } from '../../users/users.service';
import {
  IPMCampaign,
  IPMCampaignListResponse,
  IPMCreateCampaignRequest,
  IPMUpdateCampaignRequest,
  IPMCampaignQuery,
  IPMHandoff,
  IPMHandoffListResponse,
  IPMCreateHandoffRequest,
  IPMUpdateHandoffRequest,
  IPMSendTestMessageRequest,
  IPMTestMessageResponse,
  PMCampaignStatus,
} from './proactive-messaging.interfaces';

interface IPMResponse<T> {
  data: T;
  revision?: string;
}

/** Cache key prefix for proactive AppJWT tokens */
const PROACTIVE_CACHE_PREFIX = 'proactive';

@Injectable()
export class ProactiveMessagingService {
  private readonly serviceDomain = 'proactive';
  private readonly handoffServiceDomain = 'proactive'; // 'outboundConfiguration';

  constructor(
    private readonly apiService: APIService,
    private readonly helperService: HelperService,
    private readonly usersService: UsersService,
    @InjectPinoLogger(ProactiveMessagingService.name)
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ProactiveMessagingService.name);
  }

  // ============================================
  // Authentication
  // ============================================

  /**
   * Get AppJWT for Proactive Messaging API calls
   *
   * FUTURE WORK: This method currently retrieves credentials from app storage.
   * Will be refactored to receive credentials from auth context (login flow).
   * See file header for details on planned credential handling changes.
   *
   * Current Flow:
   * 1. Check if AppJWT is cached (handled by HelperService)
   * 2. Fetch proactive credentials from app credential storage
   * 3. Decrypt credentials
   * 4. Exchange for AppJWT via sentinel
   * 5. Cache and return token
   *
   * @param accountId - LP account ID
   * @returns AppJWT access token
   */
  async getProactiveAppJwt(accountId: string): Promise<string> {
    const fn = 'getProactiveAppJwt';

    try {
      // FUTURE WORK: Replace credential retrieval from storage with auth context
      // Credentials will be passed in from login flow instead of fetched here
      const credentials = await this.usersService.getCredentials(accountId);

      console.info('Proactive credentials:', credentials)

      if (!credentials?.proactive) {
        throw new InternalServerErrorException(
          `Proactive credentials not configured for account ${accountId}. Please configure client_id and client_secret in App Settings.`,
        );
      }

      const { client_id, client_secret } = credentials.proactive;

      if (!client_id || !client_secret) {
        throw new InternalServerErrorException(
          `Proactive credentials incomplete for account ${accountId}. Both client_id and client_secret are required.`,
        );
      }

      // Use alt helper to get AppJWT (credentials in body, grant_type in URL)
      const appJwt = await this.helperService.getAppJwtAlt(
        accountId,
        client_id,
        client_secret,
        PROACTIVE_CACHE_PREFIX,
      );

      if (!appJwt) {
        throw new InternalServerErrorException(
          `Failed to obtain AppJWT for proactive messaging in account ${accountId}`,
        );
      }

      return appJwt;
    } catch (error) {
      this.logger.error({
        fn,
        message: 'Failed to get proactive AppJWT',
        accountId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Exchange OAuth code for PM session token
   * This calls the PM auth/token endpoint to get the session JWT
   * that's required for handoff API calls
   *
   * @param accountId - LP account ID
   * @param code - OAuth authorization code from Sentinel redirect
   * @returns PM session token (JWT)
   */
  async getPMSessionToken(accountId: string, code: string): Promise<string> {
    const fn = 'getPMSessionToken';
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}/api/auth/token?appName=PRMSG`;

    this.logger.info({ fn, accountId }, 'Exchanging OAuth code for PM session token');

    try {
      const response = await this.apiService.post<{ token: string; loginName: string; userFullName: string }>(
        url,
        { code, accountId },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      const pmToken = response.data.token;
      this.logger.info({ fn, accountId, loginName: response.data.loginName }, 'PM session token obtained');

      return pmToken;
    } catch (error) {
      this.logger.error({
        fn,
        message: 'Failed to get PM session token',
        accountId,
        error: error?.response?.data || error.message,
      });
      throw new InternalServerErrorException(
        `Failed to get PM session token for account ${accountId}: ${error?.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Clear cached proactive AppJWT
   * Call this when credentials are updated
   */
  clearProactiveAppJwtCache(accountId: string): void {
    this.helperService.clearAppJwtCache(accountId, PROACTIVE_CACHE_PREFIX);
  }

  /**
   * Get the base URL for Proactive Messaging API calls
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
   * Get the base URL for Handoff API calls (uses outboundConfiguration domain)
   */
  private async getHandoffBaseUrl(accountId: string): Promise<string> {
    const domain = await this.helperService.getDomain(accountId, this.handoffServiceDomain);
    if (!domain) {
      throw new InternalServerErrorException(
        `Domain not found for service ${this.handoffServiceDomain} in account ${accountId}`,
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
   * Build cookie string for proactive API requests
   */
  private getCookieHeader(accountId: string, token: string): string {
    const encodedToken = `Bearer ${token}`;
    return `accountId=${accountId}; token=${encodeURIComponent(encodedToken)}`;
  }

  /**
   * Make a GET request using proactive AppJWT
   */
  private async get<T>(
    accountId: string,
    path: string,
    additionalParams?: Record<string, string>,
  ): Promise<IPMResponse<T>> {
    // Get proactive-specific AppJWT (auto-cached)
    const appJwt = await this.getProactiveAppJwt(accountId);
    const baseUrl = await this.getBaseUrl(accountId);

    // Build query string
    const params: string[] = [];
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        params.push(`${key}=${encodeURIComponent(value)}`);
      });
    }
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    const url = `${baseUrl}${path}${queryString}`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(appJwt),
        Accept: 'application/json',
        // Cookie: this.getCookieHeader(accountId, appJwt),
      },
    };

    this.logger.info({ accountId, url, config }, 'PM API GET request');

    try {
      const response = await this.apiService.get<T>(url, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'get',
        message: 'PM API GET request failed',
        accountId,
        path,
        url,
        error: error?.response?.data || error.message,
      });
      console.error('error', error)
      throw error;
    }
  }

  /**
   * Make a POST request using proactive AppJWT
   */
  private async post<T>(
    accountId: string,
    path: string,
    body: any,
  ): Promise<IPMResponse<T>> {
    // Get proactive-specific AppJWT (auto-cached)
    const appJwt = await this.getProactiveAppJwt(accountId);
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}${path}?v=2.0`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(appJwt),
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: this.getCookieHeader(accountId, appJwt),
      },
    };

    try {
      const response = await this.apiService.post<T>(url, body, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'post',
        message: 'PM API POST request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Make a PUT request using proactive AppJWT
   */
  private async put<T>(
    accountId: string,
    path: string,
    body: any,
  ): Promise<IPMResponse<T>> {
    // Get proactive-specific AppJWT (auto-cached)
    const appJwt = await this.getProactiveAppJwt(accountId);
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}${path}?v=2.0`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(appJwt),
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: this.getCookieHeader(accountId, appJwt),
      },
    };

    try {
      const response = await this.apiService.put<T>(url, body, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'put',
        message: 'PM API PUT request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Make a DELETE request using proactive AppJWT
   */
  private async delete<T>(
    accountId: string,
    path: string,
  ): Promise<IPMResponse<T>> {
    // Get proactive-specific AppJWT (auto-cached)
    const appJwt = await this.getProactiveAppJwt(accountId);
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}${path}?v=2.0`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(appJwt),
        Accept: 'application/json',
        Cookie: this.getCookieHeader(accountId, appJwt),
      },
    };

    try {
      const response = await this.apiService.delete<T>(url, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'delete',
        message: 'PM API DELETE request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  // ============================================
  // Handoff-specific HTTP methods (use LP user token)
  // ============================================

  /**
   * Make a GET request to handoff API using LP user token
   */
  private async handoffGet<T>(
    accountId: string,
    path: string,
    lpToken: string,
    additionalParams?: Record<string, string>,
  ): Promise<IPMResponse<T>> {
    const baseUrl = await this.getHandoffBaseUrl(accountId);

    const params: string[] = [];
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        params.push(`${key}=${encodeURIComponent(value)}`);
      });
    }
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    const url = `${baseUrl}${path}${queryString}`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(lpToken),
        Accept: 'application/json',
      },
    };

    this.logger.info({ accountId, url }, 'Handoff API GET request');

    try {
      const response = await this.apiService.get<T>(url, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'handoffGet',
        message: 'Handoff API GET request failed',
        accountId,
        path,
        url,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Make a POST request to handoff API using LP user token
   */
  private async handoffPost<T>(
    accountId: string,
    path: string,
    body: any,
    lpToken: string,
  ): Promise<IPMResponse<T>> {
    const baseUrl = await this.getHandoffBaseUrl(accountId);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(lpToken),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    try {
      const response = await this.apiService.post<T>(url, body, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'handoffPost',
        message: 'Handoff API POST request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Make a PUT request to handoff API using LP user token
   */
  private async handoffPut<T>(
    accountId: string,
    path: string,
    body: any,
    lpToken: string,
  ): Promise<IPMResponse<T>> {
    const baseUrl = await this.getHandoffBaseUrl(accountId);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(lpToken),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    try {
      const response = await this.apiService.put<T>(url, body, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'handoffPut',
        message: 'Handoff API PUT request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Make a DELETE request to handoff API using LP user token
   */
  private async handoffDelete<T>(
    accountId: string,
    path: string,
    lpToken: string,
  ): Promise<IPMResponse<T>> {
    const baseUrl = await this.getHandoffBaseUrl(accountId);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(lpToken),
        Accept: 'application/json',
      },
    };

    try {
      const response = await this.apiService.delete<T>(url, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'handoffDelete',
        message: 'Handoff API DELETE request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  // ============================================
  // Campaign Management
  // ============================================

  /**
   * Create a new proactive campaign
   */
  async createCampaign(
    accountId: string,
    campaignData: IPMCreateCampaignRequest,
  ): Promise<IPMResponse<IPMCampaign>> {
    const path = `/api/v2/account/${accountId}/campaign`;

    this.logger.info(
      { accountId, campaignName: campaignData.name },
      'Creating proactive campaign',
    );

    return this.post<IPMCampaign>(accountId, path, campaignData);
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(
    accountId: string,
    campaignId: string,
  ): Promise<IPMResponse<IPMCampaign>> {
    const path = `/api/v2/account/${accountId}/campaign/${campaignId}`;

    this.logger.info({ accountId, campaignId, path }, 'Getting campaign');

    return this.get<IPMCampaign>(accountId, path);
  }

  /**
   * Get all campaigns with optional filtering
   */
  async getCampaigns(
    accountId: string,
    query?: IPMCampaignQuery,
  ): Promise<IPMResponse<IPMCampaignListResponse>> {
    const path = `/api/v2/account/${accountId}/campaign`;

    const additionalParams: Record<string, string> = {};
    if (query?.status) additionalParams.status = query.status;
    if (query?.offset !== undefined) additionalParams.offset = String(query.offset);
    if (query?.limit !== undefined) additionalParams.limit = String(query.limit);
    if (query?.sortBy) additionalParams.sortBy = query.sortBy;
    if (query?.sortOrder) additionalParams.sortOrder = query.sortOrder;

    this.logger.info({ accountId, query }, 'Getting campaigns');

    return this.get<IPMCampaignListResponse>(accountId, path, additionalParams);
  }

  /**
   * Update an existing campaign
   */
  async updateCampaign(
    accountId: string,
    campaignId: string,
    updateData: IPMUpdateCampaignRequest,
  ): Promise<IPMResponse<IPMCampaign>> {
    const path = `/api/v2/account/${accountId}/campaign/${campaignId}`;

    this.logger.info(
      { accountId, campaignId, updates: Object.keys(updateData) },
      'Updating campaign',
    );

    return this.put<IPMCampaign>(accountId, path, updateData);
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(
    accountId: string,
    campaignId: string,
  ): Promise<IPMResponse<void>> {
    const path = `/api/v2/account/${accountId}/campaign/${campaignId}`;

    this.logger.info({ accountId, campaignId }, 'Deleting campaign');

    return this.delete<void>(accountId, path);
  }

  /**
   * Activate a campaign (change status to ACTIVE)
   */
  async activateCampaign(
    accountId: string,
    campaignId: string,
  ): Promise<IPMResponse<IPMCampaign>> {
    const path = `/api/v2/account/${accountId}/campaign/${campaignId}/activate`;

    this.logger.info({ accountId, campaignId }, 'Activating campaign');

    return this.post<IPMCampaign>(accountId, path, {});
  }

  /**
   * Pause a campaign (change status to PAUSED)
   */
  async pauseCampaign(
    accountId: string,
    campaignId: string,
  ): Promise<IPMResponse<IPMCampaign>> {
    const path = `/api/v2/account/${accountId}/campaign/${campaignId}/pause`;

    this.logger.info({ accountId, campaignId }, 'Pausing campaign');

    return this.post<IPMCampaign>(accountId, path, {});
  }

  /**
   * Cancel a campaign (change status to CANCELLED)
   */
  async cancelCampaign(
    accountId: string,
    campaignId: string,
  ): Promise<IPMResponse<IPMCampaign>> {
    const path = `/api/v2/account/${accountId}/campaign/${campaignId}/cancel`;

    this.logger.info({ accountId, campaignId }, 'Cancelling campaign');

    return this.post<IPMCampaign>(accountId, path, {});
  }

  // ============================================
  // Handoff Configuration Management
  // ============================================

  /**
   * Create a new handoff configuration
   * @param lpToken - LP user OAuth token from Authorization header
   */
  async createHandoff(
    accountId: string,
    handoffData: IPMCreateHandoffRequest,
    lpToken: string,
  ): Promise<IPMResponse<IPMHandoff>> {
    const path = `/api/account/${accountId}/handoffs`;

    this.logger.info(
      { accountId, handoffName: handoffData.name },
      'Creating handoff configuration',
    );

    return this.handoffPost<IPMHandoff>(accountId, path, handoffData, lpToken);
  }

  /**
   * Get handoff configuration by ID
   * @param lpToken - LP user OAuth token from Authorization header
   */
  async getHandoff(
    accountId: string,
    handoffId: string,
    lpToken: string,
  ): Promise<IPMResponse<IPMHandoff>> {
    const path = `/api/account/${accountId}/handoffs/${handoffId}`;

    this.logger.info({ accountId, handoffId }, 'Getting handoff configuration');

    return this.handoffGet<IPMHandoff>(accountId, path, lpToken);
  }

  /**
   * Get all handoff configurations
   * @param lpToken - LP user OAuth token from Authorization header
   */
  async getHandoffs(
    accountId: string,
    lpToken: string,
  ): Promise<IPMResponse<IPMHandoffListResponse>> {
    const path = `/api/account/${accountId}/handoffs`;

    // add offset=0 and limit 100 to get all handoffs
    const additionalParams: Record<string, string> = { offset: '0', limit: '100', 'v': '1' };

    this.logger.info({ accountId }, 'Getting all handoff configurations');

    return this.handoffGet<IPMHandoffListResponse>(accountId, path, lpToken, additionalParams);
  }

  /**
   * Update a handoff configuration
   * @param lpToken - LP user OAuth token from Authorization header
   */
  async updateHandoff(
    accountId: string,
    handoffId: string,
    updateData: IPMUpdateHandoffRequest,
    lpToken: string,
  ): Promise<IPMResponse<IPMHandoff>> {
    const path = `/api/account/${accountId}/handoffs/${handoffId}`;

    this.logger.info(
      { accountId, handoffId, updates: Object.keys(updateData) },
      'Updating handoff configuration',
    );

    return this.handoffPut<IPMHandoff>(accountId, path, updateData, lpToken);
  }

  /**
   * Delete a handoff configuration
   * @param lpToken - LP user OAuth token from Authorization header
   */
  async deleteHandoff(
    accountId: string,
    handoffId: string,
    lpToken: string,
  ): Promise<IPMResponse<void>> {
    const path = `/api/account/${accountId}/handoffs/${handoffId}`;

    this.logger.info({ accountId, handoffId }, 'Deleting handoff configuration');

    return this.handoffDelete<void>(accountId, path, lpToken);
  }

  // ============================================
  // Testing & Validation
  // ============================================

  /**
   * Send a test message
   */
  async sendTestMessage(
    accountId: string,
    testData: IPMSendTestMessageRequest,
  ): Promise<IPMResponse<IPMTestMessageResponse>> {
    const path = `/api/v2/account/${accountId}/test-message`;

    this.logger.info(
      { accountId, channel: testData.channel, consumer: testData.consumer },
      'Sending test message',
    );

    return this.post<IPMTestMessageResponse>(accountId, path, testData);
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get active campaigns
   */
  async getActiveCampaigns(
    accountId: string,
  ): Promise<IPMResponse<IPMCampaignListResponse>> {
    return this.getCampaigns(accountId, { status: PMCampaignStatus.ACTIVE });
  }

  /**
   * Get scheduled campaigns
   */
  async getScheduledCampaigns(
    accountId: string,
  ): Promise<IPMResponse<IPMCampaignListResponse>> {
    return this.getCampaigns(accountId, { status: PMCampaignStatus.SCHEDULED });
  }

  /**
   * Get draft campaigns
   */
  async getDraftCampaigns(
    accountId: string,
  ): Promise<IPMResponse<IPMCampaignListResponse>> {
    return this.getCampaigns(accountId, { status: PMCampaignStatus.DRAFT });
  }
}
