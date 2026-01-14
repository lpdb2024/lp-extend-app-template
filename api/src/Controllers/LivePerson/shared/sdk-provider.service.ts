/**
 * SDK Provider Service
 *
 * Centralized SDK instance management for LivePerson API operations.
 * Caches SDK instances per account/token to avoid redundant initialization.
 *
 * Usage:
 * ```typescript
 * @Injectable()
 * export class SkillsService {
 *   constructor(private readonly sdkProvider: SDKProviderService) {}
 *
 *   async getSkills(accountId: string, token: TokenInfo) {
 *     const sdk = await this.sdkProvider.getSDK(accountId, token, [Scopes.SKILLS]);
 *     return sdk.skills.getAll();
 *   }
 * }
 * ```
 */

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import {
  initializeSDK,
  LPExtendSDK,
  Scopes,
  LPExtendSDKError,
} from '@lpextend/node-sdk';

/** Type for Scopes values */
type ScopeValue = typeof Scopes[keyof typeof Scopes];

/**
 * Token info from controller/middleware
 */
export interface TokenInfo {
  accessToken: string;
  extendToken?: string;
}

/**
 * Cached SDK entry with expiry tracking
 */
interface CachedSDK {
  sdk: LPExtendSDK;
  createdAt: number;
  accountId: string;
  tokenHash: string;
}

/**
 * Default cache TTL: 5 minutes
 * SDK instances are cached to avoid repeated initialization overhead
 */
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Max cache size to prevent memory leaks
 */
const MAX_CACHE_SIZE = 100;

@Injectable()
export class SDKProviderService implements OnModuleDestroy {
  private readonly cache = new Map<string, CachedSDK>();
  private readonly shellBaseUrl: string;
  private readonly appId: string;
  private readonly apiKey: string | undefined;
  private readonly cacheTtlMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectPinoLogger(SDKProviderService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(SDKProviderService.name);
    // Support both SHELL_BASE_URL and LPEXTEND_SHELL_URL for compatibility
    this.shellBaseUrl = this.configService.get<string>('SHELL_BASE_URL')
      || this.configService.get<string>('LPEXTEND_SHELL_URL')
      || 'http://localhost:3000';
    this.appId = this.configService.get<string>('APP_ID') || 'lp-extend-template';
    this.apiKey = this.configService.get<string>('LPEXTEND_API_KEY');
    this.cacheTtlMs = this.configService.get<number>('SDK_CACHE_TTL_MS') || DEFAULT_CACHE_TTL_MS;

    this.logger.info({
      shellBaseUrl: this.shellBaseUrl,
      appId: this.appId,
      hasApiKey: !!this.apiKey,
    }, 'SDKProviderService initialized');

    // Start periodic cleanup
    this.startCleanupInterval();
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }

  /**
   * Get or create SDK instance for the given account/token combination.
   * Instances are cached and reused within the TTL period.
   *
   * @param accountId - LP Account ID
   * @param token - Token info (accessToken or extendToken)
   * @param scopes - Required scopes for this SDK instance
   * @returns Initialized SDK instance
   */
  async getSDK(
    accountId: string,
    token: TokenInfo | string,
    scopes: ScopeValue[] = [],
  ): Promise<LPExtendSDK> {
    // Normalize token input
    const tokenInfo: TokenInfo = typeof token === 'string'
      ? { accessToken: token.replace('Bearer ', '') }
      : token;

    // Create cache key from account + token hash
    const cacheKey = this.createCacheKey(accountId, tokenInfo);

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValid(cached)) {
      this.logger.debug({
        fn: 'getSDK',
        accountId,
        cached: true,
      }, 'Returning cached SDK instance');
      return cached.sdk;
    }

    // Initialize new SDK
    this.logger.debug({
      fn: 'getSDK',
      accountId,
      hasExtendToken: !!tokenInfo.extendToken,
      hasAccessToken: !!tokenInfo.accessToken,
      scopes,
    }, 'Initializing new SDK instance');

    try {
      // Build SDK config based on available credentials
      // v2 auth (recommended): apiKey + extendToken
      // Legacy: extendToken only, or direct accessToken
      const isDebug = this.configService.get<string>('NODE_ENV') !== 'production';

      let sdkConfig: any;
      if (tokenInfo.extendToken && this.apiKey) {
        // v2 API Key authentication (RECOMMENDED)
        sdkConfig = {
          appId: this.appId,
          accountId,
          apiKey: this.apiKey,
          extendToken: tokenInfo.extendToken,
          shellBaseUrl: this.shellBaseUrl,
          scopes,
          debug: isDebug,
        };
        this.logger.debug({ fn: 'getSDK', authMode: 'apiKey+extendToken' }, 'Using v2 API key auth');
      } else if (tokenInfo.extendToken) {
        // Legacy extendToken-only flow
        sdkConfig = {
          appId: this.appId,
          accountId,
          extendToken: tokenInfo.extendToken,
          shellBaseUrl: this.shellBaseUrl,
          scopes,
          debug: isDebug,
        };
        this.logger.debug({ fn: 'getSDK', authMode: 'extendToken' }, 'Using legacy extendToken auth');
      } else {
        // Direct access token (standalone mode)
        sdkConfig = {
          appId: this.appId,
          accountId,
          accessToken: tokenInfo.accessToken.replace('Bearer ', ''),
          shellBaseUrl: this.shellBaseUrl,
          scopes,
          debug: isDebug,
        };
        this.logger.debug({ fn: 'getSDK', authMode: 'accessToken' }, 'Using direct accessToken');
      }

      const sdk = await initializeSDK(sdkConfig);

      // Cache the instance
      this.cacheSDK(cacheKey, sdk, accountId, tokenInfo);

      return sdk;
    } catch (error) {
      if (error instanceof LPExtendSDKError) {
        this.logger.error({
          error: error.message,
          code: error.code,
          accountId,
        }, 'SDK initialization failed');
      }
      throw error;
    }
  }

  /**
   * Invalidate cached SDK for an account/token
   * Call this when token is refreshed or on logout
   */
  invalidate(accountId: string, token?: TokenInfo | string): void {
    if (token) {
      const tokenInfo: TokenInfo = typeof token === 'string'
        ? { accessToken: token.replace('Bearer ', '') }
        : token;
      const cacheKey = this.createCacheKey(accountId, tokenInfo);
      this.cache.delete(cacheKey);
      this.logger.debug({ accountId, cacheKey }, 'Invalidated specific SDK cache entry');
    } else {
      // Invalidate all entries for this account
      let count = 0;
      for (const [key, entry] of this.cache.entries()) {
        if (entry.accountId === accountId) {
          this.cache.delete(key);
          count++;
        }
      }
      this.logger.debug({ accountId, count }, 'Invalidated all SDK cache entries for account');
    }
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.info({ clearedEntries: size }, 'SDK cache cleared');
  }

  /**
   * Get cache stats for monitoring
   */
  getCacheStats(): { size: number; maxSize: number; ttlMs: number } {
    return {
      size: this.cache.size,
      maxSize: MAX_CACHE_SIZE,
      ttlMs: this.cacheTtlMs,
    };
  }

  /**
   * Create a cache key from account and token
   */
  private createCacheKey(accountId: string, token: TokenInfo): string {
    // Use a simple hash of the token for the cache key
    // We use the first/last chars to avoid storing full tokens
    const tokenStr = token.extendToken || token.accessToken;
    const tokenHash = `${tokenStr.slice(0, 8)}...${tokenStr.slice(-8)}`;
    return `${accountId}:${tokenHash}`;
  }

  /**
   * Check if cached entry is still valid
   */
  private isValid(cached: CachedSDK): boolean {
    const age = Date.now() - cached.createdAt;
    return age < this.cacheTtlMs;
  }

  /**
   * Cache an SDK instance
   */
  private cacheSDK(
    cacheKey: string,
    sdk: LPExtendSDK,
    accountId: string,
    token: TokenInfo,
  ): void {
    // Enforce max cache size (LRU-style: remove oldest entries)
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.logger.debug({ removedKey: oldestKey }, 'Removed oldest cache entry (max size reached)');
      }
    }

    const tokenStr = token.extendToken || token.accessToken;
    this.cache.set(cacheKey, {
      sdk,
      createdAt: Date.now(),
      accountId,
      tokenHash: `${tokenStr.slice(0, 8)}...${tokenStr.slice(-8)}`,
    });
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60 * 1000);
  }

  /**
   * Remove expired entries from cache
   */
  private cleanupExpired(): void {
    let removed = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.createdAt >= this.cacheTtlMs) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.debug({ removed }, 'Cleaned up expired SDK cache entries');
    }
  }
}
