/**
 * LP Extend Shell Client SDK
 *
 * Drop-in module for child apps to authenticate with the parent shell.
 * Uses direct API calls to the shell backend instead of PostMessage.
 *
 * Usage in child apps:
 * ```typescript
 * import { ShellClient } from 'src/sdk/shell-client';
 *
 * const client = new ShellClient({
 *   appId: 'my-app-id',
 *   shellApiUrl: 'https://shell.example.com',
 * });
 *
 * // Request auth token (requires user to be logged in to shell)
 * const { token, expiresAt, scopes } = await client.requestToken();
 *
 * // Use token for API calls
 * fetch('/api/data', {
 *   headers: { 'X-Shell-Token': token }
 * });
 *
 * // Auto-refresh token before expiry
 * client.onTokenRefresh((token) => {
 *   updateStoredToken(token);
 * });
 * ```
 */

export interface ShellClientConfig {
  /** Unique app identifier (from app registration) */
  appId: string;
  /** Shell API base URL */
  shellApiUrl: string;
  /** LP Account ID (required for token generation) */
  accountId: string;
  /** Specific scopes to request (defaults to app's registered permissions) */
  scopes?: string[];
  /** Auto-refresh token before expiry (default: true) */
  autoRefresh?: boolean;
  /** Refresh buffer in ms before token expires (default: 2 minutes) */
  refreshBuffer?: number;
}

export interface TokenResponse {
  token: string;
  expiresAt: number;
  scopes: string[];
}

export interface TokenVerifyResponse {
  valid: boolean;
  userId?: string;
  appId?: string;
  accountId?: string;
  scopes?: string[];
  error?: string;
}

type TokenCallback = (token: string, expiresAt: number, scopes: string[]) => void;
type ErrorCallback = (error: Error) => void;

export class ShellClient {
  private config: Required<ShellClientConfig>;
  private currentToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private tokenScopes: string[] = [];
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private tokenCallbacks: TokenCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private parentToken: string | null = null;

  constructor(config: ShellClientConfig) {
    this.config = {
      ...config,
      scopes: config.scopes || [],
      autoRefresh: config.autoRefresh !== false,
      refreshBuffer: config.refreshBuffer || 2 * 60 * 1000, // 2 minutes
    };
  }

  /**
   * Set the parent shell's auth token (LP access token)
   * This is required to authenticate with the shell backend
   */
  setParentToken(token: string): void {
    this.parentToken = token;
  }

  /**
   * Request an auth token from the shell
   */
  async requestToken(scopes?: string[]): Promise<TokenResponse> {
    const { appId, shellApiUrl, accountId } = this.config;
    const requestScopes = scopes || this.config.scopes;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add parent token if available
      if (this.parentToken) {
        headers['Authorization'] = `Bearer ${this.parentToken}`;
      }

      const response = await fetch(
        `${shellApiUrl}/api/v1/shell/token/${accountId}/generate`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            appId,
            scopes: requestScopes.length > 0 ? requestScopes : undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data: TokenResponse = await response.json();

      // Store token
      this.currentToken = data.token;
      this.tokenExpiresAt = data.expiresAt;
      this.tokenScopes = data.scopes;

      // Schedule auto-refresh
      if (this.config.autoRefresh) {
        this.scheduleRefresh(data.expiresAt);
      }

      // Notify callbacks
      this.tokenCallbacks.forEach((cb) => cb(data.token, data.expiresAt, data.scopes));

      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.errorCallbacks.forEach((cb) => cb(err));
      throw err;
    }
  }

  /**
   * Verify an existing token
   */
  async verifyToken(token?: string, requiredScope?: string): Promise<TokenVerifyResponse> {
    const { shellApiUrl } = this.config;
    const tokenToVerify = token || this.currentToken;

    if (!tokenToVerify) {
      return { valid: false, error: 'No token provided' };
    }

    try {
      const response = await fetch(`${shellApiUrl}/api/v1/shell/token/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenToVerify,
          requiredScope,
        }),
      });

      return await response.json();
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  }

  /**
   * Get current token (or null if expired/not available)
   */
  getToken(): string | null {
    if (!this.currentToken) return null;
    if (Date.now() > this.tokenExpiresAt) {
      this.currentToken = null;
      return null;
    }
    return this.currentToken;
  }

  /**
   * Get token expiration time
   */
  getTokenExpiry(): number {
    return this.tokenExpiresAt;
  }

  /**
   * Get granted scopes
   */
  getScopes(): string[] {
    return [...this.tokenScopes];
  }

  /**
   * Check if a scope is granted
   */
  hasScope(scope: string): boolean {
    if (this.tokenScopes.includes('*')) return true;
    if (this.tokenScopes.includes(scope)) return true;

    // Check prefix match
    const scopeParts = scope.split(':');
    return this.tokenScopes.some((s) => {
      const parts = s.split(':');
      return parts[0] === scopeParts[0] && parts[1] === '*';
    });
  }

  /**
   * Check if authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Register callback for token updates
   */
  onTokenRefresh(callback: TokenCallback): () => void {
    this.tokenCallbacks.push(callback);
    return () => {
      const idx = this.tokenCallbacks.indexOf(callback);
      if (idx !== -1) this.tokenCallbacks.splice(idx, 1);
    };
  }

  /**
   * Register callback for errors
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      const idx = this.errorCallbacks.indexOf(callback);
      if (idx !== -1) this.errorCallbacks.splice(idx, 1);
    };
  }

  /**
   * Schedule token refresh before expiry
   */
  private scheduleRefresh(expiresAt: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const refreshIn = Math.max(0, expiresAt - Date.now() - this.config.refreshBuffer);

    this.refreshTimer = setTimeout(() => {
      console.log('[ShellClient] Auto-refreshing token...');
      this.requestToken().catch((err) => {
        console.error('[ShellClient] Auto-refresh failed:', err);
      });
    }, refreshIn);
  }

  /**
   * Create an axios/fetch interceptor for automatic token injection
   */
  createFetchInterceptor(): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
    const originalFetch = window.fetch;

    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const token = this.getToken();

      if (token) {
        const headers = new Headers(init?.headers);
        headers.set('X-Shell-Token', token);
        init = { ...init, headers };
      }

      return originalFetch(input, init);
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.tokenCallbacks = [];
    this.errorCallbacks = [];
    this.currentToken = null;
  }
}

/**
 * Vue 3 composable for using the shell client
 */
export function useShellClient(config: ShellClientConfig) {
  const client = new ShellClient(config);

  return {
    client,
    requestToken: (scopes?: string[]) => client.requestToken(scopes),
    verifyToken: (token?: string, scope?: string) => client.verifyToken(token, scope),
    getToken: () => client.getToken(),
    hasScope: (scope: string) => client.hasScope(scope),
    isAuthenticated: () => client.isAuthenticated(),
    onTokenRefresh: (cb: TokenCallback) => client.onTokenRefresh(cb),
    onError: (cb: ErrorCallback) => client.onError(cb),
    setParentToken: (token: string) => client.setParentToken(token),
    destroy: () => client.destroy(),
  };
}

/**
 * Helper to create a shell client from environment variables
 */
export function createShellClientFromEnv(): ShellClient | null {
  const appId = import.meta.env.VITE_APP_ID;
  const shellApiUrl = import.meta.env.VITE_SHELL_API_URL;
  const accountId = import.meta.env.VITE_SHELL_ACCOUNT_ID;

  if (!appId || !shellApiUrl || !accountId) {
    console.warn('[ShellClient] Missing environment variables for shell client');
    return null;
  }

  return new ShellClient({
    appId,
    shellApiUrl,
    accountId,
  });
}
