/**
 * FaaS Service
 * Business logic for LivePerson Functions (FaaS) API
 * Domain: faasUI
 */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AxiosRequestConfig } from 'axios';
import { APIService } from '../../APIService/api-service';
import { HelperService } from '../../HelperService/helper-service.service';
import {
  ILambda,
  IFaaSSchedule,
  IFaaSProxySetting,
  ICreateLambda,
  IUpdateLambda,
  ICreateSchedule,
  IUpdateSchedule,
  ICreateProxySetting,
} from './faas.interfaces';

interface IFaaSResponse<T> {
  data: T;
  revision?: string;
}

@Injectable()
export class FaaSService {
  private readonly serviceDomain = 'faasUI';

  constructor(
    private readonly apiService: APIService,
    private readonly helperService: HelperService,
    @InjectPinoLogger(FaaSService.name)
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(FaaSService.name);
  }

  /**
   * Get the base URL for FaaS API calls
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
   * Make a GET request
   */
  private async get<T>(
    accountId: string,
    path: string,
    token: string,
  ): Promise<IFaaSResponse<T>> {
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}${path}`;

    this.logger.info({ accountId, url }, 'FaaS API GET request');

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(token),
        Accept: 'application/json',
      },
    };

    console.info('confg:', config);

    try {
      const response = await this.apiService.get<T>(url, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'get',
        message: 'FaaS API GET request failed',
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
  ): Promise<IFaaSResponse<T>> {
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(token),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    try {
      const response = await this.apiService.post<T>(url, body, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'post',
        message: 'FaaS API POST request failed',
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
  ): Promise<IFaaSResponse<T>> {
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(token),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    try {
      const response = await this.apiService.put<T>(url, body, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'put',
        message: 'FaaS API PUT request failed',
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
  ): Promise<IFaaSResponse<T>> {
    const baseUrl = await this.getBaseUrl(accountId);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(token),
        Accept: 'application/json',
      },
    };

    try {
      const response = await this.apiService.delete<T>(url, config);
      return { data: response.data };
    } catch (error) {
      this.logger.error({
        fn: 'delete',
        message: 'FaaS API DELETE request failed',
        accountId,
        path,
        error: error?.response?.data || error.message,
      });
      throw error;
    }
  }

  // ============================================
  // Lambdas
  // ============================================

  /**
   * Get all lambda functions
   */
  async getLambdas(
    accountId: string,
    token: string,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<ILambda[]>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/lambdas?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }


    console.info('path:', path, 'token:', token);

    return this.get<ILambda[]>(accountId, path, token);
  }

  /**
   * Get a single lambda by UUID
   */
  async getLambdaById(
    accountId: string,
    lambdaUUID: string,
    token: string,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<ILambda>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/lambdas/${lambdaUUID}?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.get<ILambda>(accountId, path, token);
  }

  /**
   * Create a new lambda function
   */
  async createLambda(
    accountId: string,
    token: string,
    data: ICreateLambda,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<ILambda>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/lambdas?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.post<ILambda>(accountId, path, data, token);
  }

  /**
   * Update a lambda function
   */
  async updateLambda(
    accountId: string,
    lambdaUUID: string,
    token: string,
    data: IUpdateLambda,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<ILambda>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/lambdas/${lambdaUUID}?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.put<ILambda>(accountId, path, data, token);
  }

  /**
   * Delete a lambda function
   */
  async deleteLambda(
    accountId: string,
    lambdaUUID: string,
    token: string,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<void>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/lambdas/${lambdaUUID}?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.delete<void>(accountId, path, token);
  }

  // ============================================
  // Schedules
  // ============================================

  /**
   * Get all schedules
   */
  async getSchedules(
    accountId: string,
    token: string,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<IFaaSSchedule[]>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/schedules?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.get<IFaaSSchedule[]>(accountId, path, token);
  }

  /**
   * Get a single schedule by UUID
   */
  async getScheduleById(
    accountId: string,
    scheduleUUID: string,
    token: string,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<IFaaSSchedule>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/schedules/${scheduleUUID}?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.get<IFaaSSchedule>(accountId, path, token);
  }

  /**
   * Create a new schedule
   */
  async createSchedule(
    accountId: string,
    token: string,
    data: ICreateSchedule,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<IFaaSSchedule>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/schedules?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.post<IFaaSSchedule>(accountId, path, data, token);
  }

  /**
   * Update a schedule
   */
  async updateSchedule(
    accountId: string,
    scheduleUUID: string,
    token: string,
    data: IUpdateSchedule,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<IFaaSSchedule>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/schedules/${scheduleUUID}?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.put<IFaaSSchedule>(accountId, path, data, token);
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(
    accountId: string,
    scheduleUUID: string,
    token: string,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<void>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/schedules/${scheduleUUID}?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.delete<void>(accountId, path, token);
  }

  // ============================================
  // Proxy Settings (Whitelisted Domains)
  // ============================================

  /**
   * Get all proxy settings (whitelisted domains)
   */
  async getProxySettings(
    accountId: string,
    token: string,
    options?: { userId?: string; v?: string; includeDefault?: boolean },
  ): Promise<IFaaSResponse<IFaaSProxySetting[]>> {
    const v = options?.v || '1';
    const includeDefault = options?.includeDefault !== false;
    let path = `/api/account/${accountId}/proxy-settings?v=${v}&includeDefault=${includeDefault}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.get<IFaaSProxySetting[]>(accountId, path, token);
  }

  /**
   * Create a new proxy setting (whitelist a domain)
   */
  async createProxySetting(
    accountId: string,
    token: string,
    data: ICreateProxySetting,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<IFaaSProxySetting>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/proxy-settings?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.post<IFaaSProxySetting>(accountId, path, data, token);
  }

  /**
   * Delete a proxy setting
   */
  async deleteProxySetting(
    accountId: string,
    settingId: number,
    token: string,
    options?: { userId?: string; v?: string },
  ): Promise<IFaaSResponse<void>> {
    const v = options?.v || '1';
    let path = `/api/account/${accountId}/proxy-settings/${settingId}?v=${v}`;

    if (options?.userId) {
      path += `&userId=${options.userId}`;
    }

    return this.delete<void>(accountId, path, token);
  }
}
