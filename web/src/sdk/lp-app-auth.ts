/**
 * LP App Auth - Unified Authentication SDK
 *
 * Supports two authentication strategies with the same API:
 *
 * 1. Shell-Delegated Auth ('shell')
 *    - App requests scoped token from shell backend
 *    - Requires user to be logged into shell
 *    - No LP app registration required
 *    - Best for: mini-apps, single-purpose tools
 *
 * 2. Independent Auth ('independent')
 *    - App manages its own LP authentication
 *    - Has own login page and OAuth flow
 *    - Can run standalone or in shell
 *    - Best for: tier-1 apps, complex applications
 *
 * Usage:
 * ```typescript
 * import { LpAppAuth } from 'src/sdk/lp-app-auth';
 *
 * const auth = new LpAppAuth({
 *   appId: 'my-app',
 *   authStrategy: 'shell', // or 'independent'
 *   shellApiUrl: 'https://shell.example.com', // for shell strategy
 *   apiBaseUrl: '/api', // for independent strategy
 * });
 *
 * await auth.init();
 *
 * if (!auth.isAuthenticated()) {
 *   await auth.login(); // Works for both strategies
 * }
 *
 * const token = auth.getAccessToken();
 * ```
 */

import { LpAuth, type LpAuthConfig, type ShellContext } from './lp-auth';
import { ShellClient, type ShellClientConfig, type TokenResponse } from './shell-client';

export type AuthStrategy = 'shell' | 'independent';

export interface LpAppAuthConfig {
  /** Unique app identifier */
  appId: string;

  /** Authentication strategy */
  authStrategy: AuthStrategy;

  // Shell strategy config
  /** Shell API base URL (required for 'shell' strategy) */
  shellApiUrl?: string;

  // Independent strategy config
  /** API base URL for auth endpoints (required for 'independent' strategy) */
  apiBaseUrl?: string;
  /** OAuth callback URL (defaults to current origin + /callback) */
  callbackUrl?: string;

  // Common config
  /** Storage key prefix (defaults to 'lp_app_auth') */
  storagePrefix?: string;
  /** Requested scopes (for shell strategy) */
  scopes?: string[];
  /** Auto-refresh token before expiry (default: true) */
  autoRefresh?: boolean;
}

export interface AppSession {
  accountId: string;
  accessToken: string;
  tokenExpiry: number;
  userId: string | null;
  isLPA: boolean;
  scopes: string[] | null;
  strategy: AuthStrategy;
}

type AuthCallback = (session: AppSession | null) => void;
type ErrorCallback = (error: Error) => void;

export class LpAppAuth {
  private config: LpAppAuthConfig;
  private lpAuth: LpAuth | null = null;
  private shellClient: ShellClient | null = null;
  private session: AppSession | null = null;
  private authCallbacks: AuthCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private initialized = false;
  private shellContext: ShellContext = { accountId: null, userId: null, shellOrigin: null, inShell: false };

  constructor(config: LpAppAuthConfig) {
    this.config = {
      ...config,
      storagePrefix: config.storagePrefix || 'lp_app_auth',
      autoRefresh: config.autoRefresh !== false,
    };

    // Validate config based on strategy
    if (config.authStrategy === 'shell' && !config.shellApiUrl) {
      console.warn('[LpAppAuth] shellApiUrl is required for shell strategy');
    }
    if (config.authStrategy === 'independent' && !config.apiBaseUrl) {
      console.warn('[LpAppAuth] apiBaseUrl is required for independent strategy');
    }
  }

  /**
   * Initialize authentication
   * Call this on app startup
   */
  async init(): Promise<boolean> {
    if (this.initialized) return this.isAuthenticated();

    // Detect shell context from URL params
    this.detectShellContext();

    // Load session from storage
    this.loadSessionFromStorage();

    // Initialize the appropriate auth provider
    if (this.config.authStrategy === 'shell') {
      await this.initShellAuth();
    } else {
      this.initIndependentAuth();
    }

    this.initialized = true;
    return this.isAuthenticated();
  }

  /**
   * Initialize shell-delegated auth
   */
  private async initShellAuth(): Promise<void> {
    const accountId = this.getAccountId();

    if (!accountId) {
      console.warn('[LpAppAuth] No accountId available for shell auth');
      return;
    }

    const shellClientConfig: ShellClientConfig = {
      appId: this.config.appId,
      shellApiUrl: this.config.shellApiUrl!,
      accountId,
    };
    if (this.config.scopes) shellClientConfig.scopes = this.config.scopes;
    if (this.config.autoRefresh !== undefined) shellClientConfig.autoRefresh = this.config.autoRefresh;

    this.shellClient = new ShellClient(shellClientConfig);

    // Set up token refresh callback
    this.shellClient.onTokenRefresh((token, expiresAt, scopes) => {
      this.session = {
        accountId,
        accessToken: token,
        tokenExpiry: expiresAt,
        userId: null,
        isLPA: false,
        scopes,
        strategy: 'shell',
      };
      this.saveSessionToStorage();
      this.notifyAuthChange();
    });

    this.shellClient.onError((error) => {
      this.notifyError(error);
    });

    // If we have a stored session and it's still valid, use it
    if (this.session && this.session.tokenExpiry > Date.now()) {
      return;
    }

    // Try to get token from shell (user must be logged into shell)
    // This will fail silently if not authenticated to shell
    try {
      const parentToken = this.getParentTokenFromUrl();
      if (parentToken) {
        this.shellClient.setParentToken(parentToken);
        const tokenResponse = await this.shellClient.requestToken();
        this.setSessionFromShellToken(tokenResponse, accountId);
      }
    } catch {
      // Expected if not logged into shell - app will need to show login or request auth
    }
  }

  /**
   * Initialize independent auth
   */
  private initIndependentAuth(): void {
    const lpAuthConfig: LpAuthConfig = {
      appId: this.config.appId,
      apiBaseUrl: this.config.apiBaseUrl!,
    };
    if (this.config.callbackUrl) lpAuthConfig.callbackUrl = this.config.callbackUrl;
    if (this.config.storagePrefix) lpAuthConfig.storagePrefix = this.config.storagePrefix;
    if (this.config.autoRefresh !== undefined) lpAuthConfig.autoRefresh = this.config.autoRefresh;

    this.lpAuth = new LpAuth(lpAuthConfig);

    // Set up callbacks
    this.lpAuth.onAuthChange((lpSession) => {
      if (lpSession) {
        this.session = {
          accountId: lpSession.accountId,
          accessToken: lpSession.accessToken,
          tokenExpiry: lpSession.tokenExpiry,
          userId: lpSession.lpUserId || null,
          isLPA: lpSession.isLPA || false,
          scopes: null,
          strategy: 'independent',
        };
      } else {
        this.session = null;
      }
      this.notifyAuthChange();
    });

    this.lpAuth.onError((error) => {
      this.notifyError(error);
    });

    this.lpAuth.init();

    // Sync session from LpAuth
    const lpSession = this.lpAuth.getSession();
    if (lpSession) {
      this.session = {
        accountId: lpSession.accountId,
        accessToken: lpSession.accessToken,
        tokenExpiry: lpSession.tokenExpiry,
        userId: lpSession.lpUserId || null,
        isLPA: lpSession.isLPA || false,
        scopes: null,
        strategy: 'independent',
      };
    }
  }

  /**
   * Detect shell context from URL params
   */
  private detectShellContext(): void {
    const urlParams = new URLSearchParams(window.location.search);

    const accountId = urlParams.get('accountId') || urlParams.get('siteId');
    const shellOrigin = urlParams.get('shellOrigin');
    const inIframe = window.parent !== window;

    this.shellContext = {
      accountId: accountId || null,
      userId: null,
      shellOrigin: shellOrigin || null,
      inShell: inIframe || !!shellOrigin || urlParams.get('shell') === 'true',
    };

    // Store accountId if provided
    if (accountId) {
      localStorage.setItem(`${this.config.storagePrefix}_account`, accountId);
    }
  }

  /**
   * Get parent token from URL (for shell strategy in new tab)
   */
  private getParentTokenFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('shellToken') || null;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    if (!this.session) return false;
    return this.session.tokenExpiry > Date.now();
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    if (!this.isAuthenticated()) return null;
    return this.session!.accessToken;
  }

  /**
   * Get current session
   */
  getSession(): AppSession | null {
    if (!this.isAuthenticated()) return null;
    return { ...this.session! };
  }

  /**
   * Get account ID
   */
  getAccountId(): string | null {
    return (
      this.session?.accountId ||
      this.shellContext.accountId ||
      localStorage.getItem(`${this.config.storagePrefix}_account`)
    );
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    return this.session?.userId || null;
  }

  /**
   * Check if user is LPA
   */
  isLPA(): boolean {
    return this.session?.isLPA || false;
  }

  /**
   * Get shell context
   */
  getShellContext(): ShellContext {
    return { ...this.shellContext };
  }

  /**
   * Check if running in shell context
   */
  isInShell(): boolean {
    return this.shellContext.inShell;
  }

  /**
   * Get current auth strategy
   */
  getStrategy(): AuthStrategy {
    return this.config.authStrategy;
  }

  /**
   * Check if has a specific scope (shell strategy only)
   */
  hasScope(scope: string): boolean {
    if (!this.session?.scopes) return true; // Independent auth doesn't use scopes
    if (this.session.scopes.includes('*')) return true;
    return this.session.scopes.includes(scope);
  }

  /**
   * Login - works for both strategies
   *
   * Shell strategy: Requests token from shell (requires shell auth)
   * Independent strategy: Redirects to LP SSO
   */
  async login(accountId?: string): Promise<void> {
    const acctId = accountId || this.getAccountId() || undefined;

    if (this.config.authStrategy === 'shell') {
      await this.loginWithShell(acctId);
    } else {
      await this.loginWithSSO(acctId);
    }
  }

  /**
   * Shell login - request token from shell
   */
  private async loginWithShell(accountId?: string): Promise<void> {
    if (!this.shellClient) {
      // Need to create shell client
      const acctId = accountId || this.getAccountId();
      if (!acctId) {
        throw new Error('Account ID required for shell auth');
      }

      const shellClientConfig: ShellClientConfig = {
        appId: this.config.appId,
        shellApiUrl: this.config.shellApiUrl!,
        accountId: acctId,
      };
      if (this.config.scopes) shellClientConfig.scopes = this.config.scopes;
      if (this.config.autoRefresh !== undefined) shellClientConfig.autoRefresh = this.config.autoRefresh;

      this.shellClient = new ShellClient(shellClientConfig);
    }

    // If in shell iframe, try to get token via postMessage to parent
    if (this.shellContext.inShell && this.shellContext.shellOrigin) {
      await this.requestTokenFromShellParent();
      return;
    }

    // If not in shell, redirect to shell login
    // The shell will authenticate and redirect back with a token
    const shellLoginUrl = new URL('/login', this.config.shellApiUrl);
    shellLoginUrl.searchParams.set('returnApp', this.config.appId);
    shellLoginUrl.searchParams.set('returnUrl', window.location.href);
    if (accountId) {
      shellLoginUrl.searchParams.set('accountId', accountId);
    }

    window.location.href = shellLoginUrl.toString();
  }

  /**
   * Request token from shell parent via postMessage
   */
  private async requestTokenFromShellParent(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error('Shell token request timed out'));
      }, 10000);

      const handler = (event: MessageEvent) => {
        if (event.origin !== this.shellContext.shellOrigin) return;

        if (event.data.type === 'SHELL_TOKEN_RESPONSE') {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);

          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            const { token, expiresAt, scopes } = event.data;
            this.setSessionFromShellToken(
              { token, expiresAt, scopes },
              this.getAccountId()!
            );
            resolve();
          }
        }
      };

      window.addEventListener('message', handler);

      // Request token from shell
      window.parent.postMessage(
        {
          type: 'SHELL_TOKEN_REQUEST',
          appId: this.config.appId,
          scopes: this.config.scopes,
        },
        this.shellContext.shellOrigin!
      );
    });
  }

  /**
   * Independent login - redirect to LP SSO
   */
  private async loginWithSSO(accountId?: string): Promise<void> {
    if (!this.lpAuth) {
      throw new Error('LpAuth not initialized');
    }
    await this.lpAuth.loginWithSSO(accountId);
  }

  /**
   * Direct login with credentials (independent strategy only)
   */
  async loginWithCredentials(
    accountId: string,
    username: string,
    password: string
  ): Promise<AppSession> {
    if (this.config.authStrategy === 'shell') {
      throw new Error('Direct login not supported with shell auth strategy');
    }

    if (!this.lpAuth) {
      throw new Error('LpAuth not initialized');
    }

    const lpSession = await this.lpAuth.loginWithCredentials(accountId, username, password);

    this.session = {
      accountId: lpSession.accountId,
      accessToken: lpSession.accessToken,
      tokenExpiry: lpSession.tokenExpiry,
      userId: lpSession.lpUserId || null,
      isLPA: lpSession.isLPA || false,
      scopes: null,
      strategy: 'independent',
    };

    return this.session;
  }

  /**
   * Handle OAuth callback (independent strategy only)
   */
  async handleCallback(): Promise<AppSession> {
    if (this.config.authStrategy === 'shell') {
      // For shell strategy, handle token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('shellToken');
      const expiresAt = parseInt(urlParams.get('expiresAt') || '0', 10);
      const scopes = urlParams.get('scopes')?.split(',') || [];
      const accountId = urlParams.get('accountId') || this.getAccountId();

      if (!token || !accountId) {
        throw new Error('Missing shell token or account ID in callback');
      }

      this.setSessionFromShellToken({ token, expiresAt, scopes }, accountId);
      return this.session!;
    }

    if (!this.lpAuth) {
      throw new Error('LpAuth not initialized');
    }

    const lpSession = await this.lpAuth.handleCallback();

    this.session = {
      accountId: lpSession.accountId,
      accessToken: lpSession.accessToken,
      tokenExpiry: lpSession.tokenExpiry,
      userId: lpSession.lpUserId || null,
      isLPA: lpSession.isLPA || false,
      scopes: null,
      strategy: 'independent',
    };

    return this.session;
  }

  /**
   * Logout
   */
  async logout(revokeToken = true): Promise<void> {
    if (this.config.authStrategy === 'independent' && this.lpAuth) {
      await this.lpAuth.logout(revokeToken);
    }

    this.session = null;
    localStorage.removeItem(`${this.config.storagePrefix}_session`);
    this.notifyAuthChange();

    // For shell strategy, notify shell of logout
    if (this.config.authStrategy === 'shell' && this.shellContext.inShell) {
      window.parent.postMessage(
        { type: 'APP_LOGOUT', appId: this.config.appId },
        this.shellContext.shellOrigin || '*'
      );
    }
  }

  /**
   * Register auth state change callback
   */
  onAuthChange(callback: AuthCallback): () => void {
    this.authCallbacks.push(callback);
    callback(this.isAuthenticated() ? this.session : null);
    return () => {
      const idx = this.authCallbacks.indexOf(callback);
      if (idx !== -1) this.authCallbacks.splice(idx, 1);
    };
  }

  /**
   * Register error callback
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      const idx = this.errorCallbacks.indexOf(callback);
      if (idx !== -1) this.errorCallbacks.splice(idx, 1);
    };
  }

  /**
   * Create fetch wrapper with auto-injected auth header
   */
  createAuthFetch(): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const token = this.getAccessToken();

      if (token) {
        const headers = new Headers(init?.headers);
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        // For shell strategy, also add the shell token header
        if (this.config.authStrategy === 'shell') {
          headers.set('X-Shell-Token', token);
        }
        init = { ...init, headers, credentials: 'include' as RequestCredentials };
      }

      const response = await fetch(input, init);

      // Handle 401 - session expired
      if (response.status === 401) {
        this.session = null;
        localStorage.removeItem(`${this.config.storagePrefix}_session`);
        this.notifyAuthChange();
      }

      return response;
    };
  }

  /**
   * Get LP domains (for direct LP API calls)
   */
  async getDomains(accountId?: string): Promise<Record<string, string>> {
    if (this.config.authStrategy === 'independent' && this.lpAuth) {
      return this.lpAuth.getDomains(accountId);
    }

    // For shell strategy, call shell API
    const acctId = accountId || this.getAccountId();
    if (!acctId) throw new Error('Account ID required');

    const response = await fetch(
      `${this.config.shellApiUrl}/api/v1/idp/${acctId}/domains`
    );

    if (!response.ok) {
      throw new Error('Failed to get LP domains');
    }

    const data = await response.json();
    const services: Record<string, string> = {};

    if (Array.isArray(data.baseURIs)) {
      for (const uri of data.baseURIs) {
        services[uri.service] = uri.baseURI;
      }
    }

    return services;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.lpAuth) {
      this.lpAuth.destroy();
    }
    if (this.shellClient) {
      this.shellClient.destroy();
    }
    this.authCallbacks = [];
    this.errorCallbacks = [];
  }

  // Private helpers

  private setSessionFromShellToken(tokenResponse: TokenResponse, accountId: string): void {
    this.session = {
      accountId,
      accessToken: tokenResponse.token,
      tokenExpiry: tokenResponse.expiresAt,
      userId: null,
      isLPA: false,
      scopes: tokenResponse.scopes,
      strategy: 'shell',
    };
    this.saveSessionToStorage();
    this.notifyAuthChange();
  }

  private saveSessionToStorage(): void {
    if (this.session) {
      localStorage.setItem(
        `${this.config.storagePrefix}_session`,
        JSON.stringify(this.session)
      );
    }
  }

  private loadSessionFromStorage(): void {
    try {
      const stored = localStorage.getItem(`${this.config.storagePrefix}_session`);
      if (stored) {
        const session = JSON.parse(stored) as AppSession;
        if (session.tokenExpiry > Date.now()) {
          this.session = session;
        } else {
          localStorage.removeItem(`${this.config.storagePrefix}_session`);
        }
      }
    } catch {
      localStorage.removeItem(`${this.config.storagePrefix}_session`);
    }
  }

  private notifyAuthChange(): void {
    const session = this.isAuthenticated() ? this.session : null;
    this.authCallbacks.forEach((cb) => {
      try {
        cb(session);
      } catch (e) {
        console.error('[LpAppAuth] Auth callback error:', e);
      }
    });
  }

  private notifyError(error: Error): void {
    this.errorCallbacks.forEach((cb) => {
      try {
        cb(error);
      } catch (e) {
        console.error('[LpAppAuth] Error callback error:', e);
      }
    });
  }
}

/**
 * Create LpAppAuth from environment variables
 */
export function createLpAppAuthFromEnv(): LpAppAuth | null {
  const appId = import.meta.env.VITE_APP_ID;
  const authStrategy = (import.meta.env.VITE_AUTH_STRATEGY as AuthStrategy) || 'independent';
  const shellApiUrl = import.meta.env.VITE_SHELL_API_URL;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

  if (!appId) {
    console.warn('[LpAppAuth] VITE_APP_ID not set');
    return null;
  }

  return new LpAppAuth({
    appId,
    authStrategy,
    shellApiUrl,
    apiBaseUrl,
  });
}

/**
 * Vue 3 composable for LpAppAuth
 */
export function useLpAppAuth(config: LpAppAuthConfig) {
  const auth = new LpAppAuth(config);

  return {
    auth,
    init: () => auth.init(),
    isAuthenticated: () => auth.isAuthenticated(),
    getAccessToken: () => auth.getAccessToken(),
    getSession: () => auth.getSession(),
    getAccountId: () => auth.getAccountId(),
    getUserId: () => auth.getUserId(),
    isLPA: () => auth.isLPA(),
    isInShell: () => auth.isInShell(),
    getStrategy: () => auth.getStrategy(),
    hasScope: (scope: string) => auth.hasScope(scope),
    login: (accountId?: string) => auth.login(accountId),
    loginWithCredentials: (accountId: string, username: string, password: string) =>
      auth.loginWithCredentials(accountId, username, password),
    handleCallback: () => auth.handleCallback(),
    logout: (revokeToken?: boolean) => auth.logout(revokeToken),
    onAuthChange: (cb: AuthCallback) => auth.onAuthChange(cb),
    onError: (cb: ErrorCallback) => auth.onError(cb),
    getShellContext: () => auth.getShellContext(),
    getDomains: (accountId?: string) => auth.getDomains(accountId),
    createAuthFetch: () => auth.createAuthFetch(),
    destroy: () => auth.destroy(),
  };
}
