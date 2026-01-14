/**
 * LP Extend Auth Service (v2)
 *
 * Authenticates with the LP Extend Shell using API key authentication.
 * This replaces the old shared-secret ExtendJWT approach.
 *
 * Flow:
 * 1. Child app receives ExtendJWT from shell (via postMessage)
 * 2. Child app backend calls shell's /api/v1/apps/verify endpoint
 * 3. Shell validates API key and returns decrypted auth data
 *
 * Configuration:
 * - LPEXTEND_API_KEY: Your app's API key from registration
 * - LPEXTEND_SHELL_URL: Shell base URL (e.g., https://lp-extend.example.com)
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

/**
 * Response from shell's /api/v1/apps/verify endpoint
 */
export interface ShellVerifyResponse {
  verified: boolean;
  user: {
    lpUserId: string;
    lpAccountId: string;
    isLPA: boolean;
  };
  allowedApis: string[];
  expiresAt: number;
  lpAccessToken?: string;
  cbToken?: string;
  cbOrg?: string;
}

/**
 * Auth context for the current request
 */
export interface LpExtendAuthContext {
  lpUserId: string;
  lpAccountId: string;
  isLPA: boolean;
  lpAccessToken?: string;
  cbToken?: string;
  cbOrg?: string;
  allowedApis: string[];
  expiresAt: number;
}

@Injectable()
export class LpExtendAuthService {
  private readonly apiKey: string;
  private readonly shellUrl: string;
  private readonly enabled: boolean;

  constructor(
    @InjectPinoLogger(LpExtendAuthService.name)
    private readonly logger: PinoLogger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('LPEXTEND_API_KEY');
    // Support both env var names for shell URL
    this.shellUrl = this.configService.get<string>('LPEXTEND_SHELL_URL')
      || this.configService.get<string>('SHELL_BASE_URL')
      || 'http://localhost:3000';

    if (!this.apiKey) {
      this.logger.warn(
        'LPEXTEND_API_KEY not configured - API key auth disabled. ' +
        'Get your API key from the LP Extend Shell app registration.',
      );
      this.enabled = false;
    } else {
      this.enabled = true;
      this.logger.info(
        { shellUrl: this.shellUrl, apiKeyPrefix: this.apiKey.substring(0, 12) + '...' },
        'LP Extend Auth Service initialized',
      );
    }
  }

  /**
   * Check if API key authentication is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Verify an ExtendJWT token by calling the shell's verify endpoint
   *
   * @param extendToken - The ExtendJWT received from the shell
   * @returns Auth context with user info and LP access token
   */
  async verifyToken(extendToken: string): Promise<LpExtendAuthContext> {
    const fn = 'verifyToken';
    const debug = process.env.LP_EXTEND_DEBUG === 'true';

    if (debug) {
      this.logger.info({
        fn,
        step: 1,
        message: 'VERIFY TOKEN START',
        enabled: this.enabled,
        shellUrl: this.shellUrl,
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey?.substring(0, 15) + '...',
        tokenLength: extendToken?.length || 0,
        tokenPreview: extendToken?.substring(0, 50) + '...',
      }, '🔐 [DEBUG] Token verification starting');
    }

    if (!this.enabled) {
      this.logger.error({ fn }, 'API key auth not configured');
      throw new UnauthorizedException(
        'LP Extend API key not configured. Set LPEXTEND_API_KEY in your environment.',
      );
    }

    if (!extendToken) {
      this.logger.error({ fn }, '❌ No ExtendJWT token provided');
      throw new UnauthorizedException('ExtendJWT token is required');
    }

    try {
      const url = `${this.shellUrl}/api/v1/apps/verify`;

      if (debug) {
        this.logger.info({
          fn,
          step: 2,
          message: 'CALLING SHELL VERIFY',
          url,
          headers: {
            'X-LPExtend-API-Key': this.apiKey?.substring(0, 15) + '...',
            'Content-Type': 'application/json',
          },
        }, '🌐 [DEBUG] Calling shell verify endpoint');
      }

      const { data } = await firstValueFrom(
        this.httpService
          .post<ShellVerifyResponse>(
            url,
            { token: extendToken },
            {
              headers: {
                'X-LPExtend-API-Key': this.apiKey,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              const status = error.response?.status;
              const message = (error.response?.data as any)?.message || error.message;

              this.logger.error({
                fn,
                status,
                message,
                url,
                responseData: error.response?.data,
              }, '❌ Shell verify endpoint returned error');

              if (status === 401) {
                throw new UnauthorizedException(message || 'Invalid API key or token');
              }
              throw error;
            }),
          ),
      );

      if (debug) {
        this.logger.info({
          fn,
          step: 3,
          message: 'SHELL RESPONSE RECEIVED',
          verified: data.verified,
          userId: data.user?.lpUserId,
          accountId: data.user?.lpAccountId,
          isLPA: data.user?.isLPA,
          hasLpAccessToken: !!data.lpAccessToken,
          hasCbToken: !!data.cbToken,
          allowedApis: data.allowedApis,
        }, '📦 [DEBUG] Shell response');
      }

      if (!data.verified) {
        this.logger.error({ fn, data }, '❌ Token verification returned verified=false');
        throw new UnauthorizedException('Token verification failed');
      }

      this.logger.info(
        {
          fn,
          userId: data.user.lpUserId,
          accountId: data.user.lpAccountId,
          allowedApis: data.allowedApis?.length || 0,
        },
        '✅ Token verified successfully',
      );

      return {
        lpUserId: data.user.lpUserId,
        lpAccountId: data.user.lpAccountId,
        isLPA: data.user.isLPA,
        lpAccessToken: data.lpAccessToken,
        cbToken: data.cbToken,
        cbOrg: data.cbOrg,
        allowedApis: data.allowedApis,
        expiresAt: data.expiresAt,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        { fn, error: error.message, stack: error.stack },
        '❌ Token verification failed unexpectedly',
      );
      throw new UnauthorizedException('Failed to verify token with shell');
    }
  }

  /**
   * Get the shell base URL
   */
  getShellUrl(): string {
    return this.shellUrl;
  }

  /**
   * Check if the app has access to a specific LP API
   *
   * @param authContext - The auth context from verifyToken
   * @param apiName - The API to check (e.g., 'skills', 'users')
   */
  hasApiAccess(authContext: LpExtendAuthContext, apiName: string): boolean {
    return authContext.allowedApis.includes(apiName);
  }
}
