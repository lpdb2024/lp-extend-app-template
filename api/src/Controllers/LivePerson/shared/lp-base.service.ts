/**
 * LivePerson Base Service
 * Abstract base class for all LP API services
 * Provides common functionality for domain resolution, auth headers, and HTTP methods
 */

import { InternalServerErrorException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { APIService } from '../../APIService/api-service';
import { LPDomainService } from './lp-domain.service';
import { LP_SERVICE_DOMAINS, LP_HEADERS } from './lp-constants';
import { ILPRequestOptions, ILPResponse } from './lp-common.interfaces';

/**
 * Token info type for authentication
 * Can be either a simple string token or an object with accessToken and optional extendToken
 */
export type TokenInfo = { accessToken: string; extendToken?: string } | string;

/**
 * Extract access token from TokenInfo
 */
export function extractAccessToken(token: TokenInfo): string {
  if (typeof token === 'string') {
    return token;
  }
  return token.accessToken;
}

/**
 * Abstract base service for LivePerson API integrations
 * All domain-specific services should extend this class
 */
export abstract class LPBaseService {
  /**
   * The LP service domain this service uses
   * Must be implemented by child classes
   */
  protected abstract readonly serviceDomain: LP_SERVICE_DOMAINS;

  /**
   * Default API version for this service
   * Can be overridden per-request
   */
  protected abstract readonly defaultApiVersion: string;

  constructor(
    protected readonly apiService: APIService,
    protected readonly domainService: LPDomainService,
    protected readonly logger: PinoLogger,
  ) {}

  /**
   * Get the base URL for API calls
   */
  protected async getBaseUrl(accountId: string): Promise<string> {
    const domain = await this.domainService.getDomain(accountId, this.serviceDomain);
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
  protected getAuthHeader(token: TokenInfo): Record<string, string> {
    const accessToken = extractAccessToken(token);
    const cleanToken = accessToken.replace(/^Bearer\s+/i, '');
    return { Authorization: `Bearer ${cleanToken}` };
  }

  /**
   * Build query string from options
   */
  protected buildQueryString(options?: ILPRequestOptions): string {
    const params: string[] = [];

    // Only add version if not already in additionalParams
    if (!options?.additionalParams?.v) {
      const version = options?.version || this.defaultApiVersion;
      params.push(`v=${version}`);
    }

    if (options?.select) {
      params.push(`select=${options.select}`);
    }

    if (options?.includeDeleted) {
      params.push('include_deleted=true');
    }

    if (options?.source) {
      params.push(`source=${options.source}`);
    }

    if (options?.additionalParams) {
      Object.entries(options.additionalParams).forEach(([key, value]) => {
        params.push(`${key}=${encodeURIComponent(value)}`);
      });
    }

    return params.length > 0 ? `?${params.join('&')}` : '';
  }

  /**
   * Extract revision from response headers
   */
  protected extractRevision(headers: Record<string, any>): string | undefined {
    return headers[LP_HEADERS.AC_REVISION] || headers[LP_HEADERS.ETAG];
  }

  /**
   * Make a GET request to LP API
   */
  protected async get<T>(
    accountId: string,
    path: string,
    token: TokenInfo,
    options?: ILPRequestOptions,
  ): Promise<ILPResponse<T>> {
    let fullUrl = '';
    try {
      const baseUrl = await this.getBaseUrl(accountId);
      const queryString = this.buildQueryString(options);
      fullUrl = `${baseUrl}${path}${queryString}`;

      this.logger.debug(
        { accountId, baseUrl, path, queryString: queryString.slice(0, 200), fullUrl },
        'LP API GET request URL',
      );

      const config: AxiosRequestConfig = {
        headers: {
          ...this.getAuthHeader(token),
          Accept: LP_HEADERS.ACCEPT_JSON,
        },
      };

      if (options?.revision) {
        config.headers[LP_HEADERS.IF_MATCH] = options.revision;
      }

      console.log('LPBaseService GET URL:', fullUrl);
      const response: AxiosResponse<T> = await this.apiService.get<T>(fullUrl, config);

      this.logger.debug(
        {
          accountId,
          path,
          status: response.status,
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data as object) : [],
        },
        'LP API GET response received',
      );

      return {
        data: response.data,
        revision: this.extractRevision(response.headers),
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      this.logger.error({
        fn: 'get',
        message: 'LP API GET request failed',
        accountId,
        path,
        fullUrl,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        error: error?.response?.data || error.message,
        headers: error?.response?.headers,
      });
      throw error;
    }
  }

  /**
   * Make a POST request to LP API
   */
  protected async post<T>(
    accountId: string,
    path: string,
    body: any,
    token: TokenInfo,
    options?: ILPRequestOptions,
  ): Promise<ILPResponse<T>> {
    try {
      const baseUrl = await this.getBaseUrl(accountId);
      const queryString = this.buildQueryString(options);
      const url = `${baseUrl}${path}${queryString}`;

      const config: AxiosRequestConfig = {
        headers: {
          ...this.getAuthHeader(token),
          'Content-Type': LP_HEADERS.CONTENT_TYPE_JSON,
          Accept: LP_HEADERS.ACCEPT_JSON,
        },
      };

      if (options?.revision) {
        config.headers[LP_HEADERS.IF_MATCH] = options.revision;
      }

      const response: AxiosResponse<T> = await this.apiService.post<T>(url, body, config);

      return {
        data: response.data,
        revision: this.extractRevision(response.headers),
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      this.logger.error({
        fn: 'post',
        message: 'LP API POST request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Make a PUT request to LP API
   */
  protected async put<T>(
    accountId: string,
    path: string,
    body: any,
    token: TokenInfo,
    options?: ILPRequestOptions,
  ): Promise<ILPResponse<T>> {
    try {
      const baseUrl = await this.getBaseUrl(accountId);
      const queryString = this.buildQueryString(options);
      const url = `${baseUrl}${path}${queryString}`;

      // Log the request body being sent to LP
      this.logger.info({
        fn: 'put',
        message: 'LP API PUT request - PAYLOAD',
        accountId,
        path,
        url,
        bodyKeys: body ? Object.keys(body) : [],
        body: JSON.stringify(body, null, 2),
      });

      const config: AxiosRequestConfig = {
        headers: {
          ...this.getAuthHeader(token),
          'Content-Type': LP_HEADERS.CONTENT_TYPE_JSON,
          Accept: LP_HEADERS.ACCEPT_JSON,
        },
      };

      if (options?.revision) {
        config.headers[LP_HEADERS.IF_MATCH] = options.revision;
      }

      const response: AxiosResponse<T> = await this.apiService.put<T>(url, body, config);

      return {
        data: response.data,
        revision: this.extractRevision(response.headers),
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      this.logger.error({
        fn: 'put',
        message: 'LP API PUT request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Make a DELETE request to LP API
   */
  protected async delete<T>(
    accountId: string,
    path: string,
    token: TokenInfo,
    options?: ILPRequestOptions,
  ): Promise<ILPResponse<T>> {
    try {
      const baseUrl = await this.getBaseUrl(accountId);
      const queryString = this.buildQueryString(options);
      const url = `${baseUrl}${path}${queryString}`;

      const config: AxiosRequestConfig = {
        headers: {
          ...this.getAuthHeader(token),
          Accept: LP_HEADERS.ACCEPT_JSON,
        },
      };

      if (options?.revision) {
        config.headers[LP_HEADERS.IF_MATCH] = options.revision;
      }

      const response: AxiosResponse<T> = await this.apiService.delete<T>(url, config);

      return {
        data: response.data,
        revision: this.extractRevision(response.headers),
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      this.logger.error({
        fn: 'delete',
        message: 'LP API DELETE request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Make a PATCH request to LP API
   */
  protected async patch<T>(
    accountId: string,
    path: string,
    body: any,
    token: TokenInfo,
    options?: ILPRequestOptions,
  ): Promise<ILPResponse<T>> {
    try {
      const baseUrl = await this.getBaseUrl(accountId);
      const queryString = this.buildQueryString(options);
      const url = `${baseUrl}${path}${queryString}`;

      const config: AxiosRequestConfig = {
        headers: {
          ...this.getAuthHeader(token),
          'Content-Type': LP_HEADERS.CONTENT_TYPE_JSON,
          Accept: LP_HEADERS.ACCEPT_JSON,
        },
      };

      if (options?.revision) {
        config.headers[LP_HEADERS.IF_MATCH] = options.revision;
      }

      const response: AxiosResponse<T> = await this.apiService.patch<T>(url, body, config);

      return {
        data: response.data,
        revision: this.extractRevision(response.headers),
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      this.logger.error({
        fn: 'patch',
        message: 'LP API PATCH request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }
}
