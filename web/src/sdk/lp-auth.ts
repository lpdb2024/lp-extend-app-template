/**
 * LP Auth SDK
 *
 * Lightweight authentication SDK for child apps to authenticate with LivePerson.
 * Works both inside the LP Extend shell and as a standalone application.
 *
 * Features:
 * - Auto-detects shell context (pre-fills accountId)
 * - Handles LP SSO OAuth flow
 * - Direct login support
 * - Token management with auto-refresh
 * - Works standalone or embedded
 *
 * Usage:
 * ```typescript
 * import { LpAuth } from 'src/sdk/lp-auth';
 *
 * const auth = new LpAuth({
 *   appId: 'my-app',
 *   apiBaseUrl: '/api', // Your backend that proxies to LP
 * });
 *
 * // Check for accountId from shell (URL param)
 * auth.initFromContext();
 *
 * // Authenticate
 * if (!auth.isAuthenticated()) {
 *   await auth.loginWithSSO('12345678'); // or use accountId from context
 * }
 *
 * // Use token
 * const token = auth.getAccessToken();
 * ```
 */

export interface LpAuthConfig {
  /** Unique app identifier */
  appId: string;
  /** API base URL for auth endpoints */
  apiBaseUrl: string;
  /** OAuth callback URL (defaults to current origin + /callback) */
  callbackUrl?: string;
  /** Storage key prefix (defaults to 'lp_auth') */
  storagePrefix?: string;
  /** Token refresh buffer in ms (default: 5 minutes) */
  refreshBuffer?: number;
  /** Auto-refresh token before expiry (default: true) */
  autoRefresh?: boolean;
}

export interface LpSession {
  accountId: string;
  accessToken: string;
  tokenExpiry: number;
  lpUserId?: string;
  isLPA?: boolean;
  idToken?: string;
}

export interface LpAuthResponse {
  accessToken: string;
  idToken?: string;
  expiresIn: number;
  expiry?: number;
  decoded?: {
    sub?: string;
    isLPA?: boolean;
  };
}

export interface LpDomain {
  service: string;
  account: string;
  baseURI: string;
}

type AuthCallback = (session: LpSession | null) => void;
type ErrorCallback = (error: Error) => void;

/**
 * Shell context - information passed from parent shell
 */
export interface ShellContext {
  accountId: string | null;
  userId: string | null;
  shellOrigin: string | null;
  inShell: boolean;
}

export class LpAuth {
  private config: Required<LpAuthConfig>;
  private session: LpSession | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private authCallbacks: AuthCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private shellContext: ShellContext = { accountId: null, userId: null, shellOrigin: null, inShell: false };
  private initialized = false;

  constructor(config: LpAuthConfig) {
    this.config = {
      ...config,
      callbackUrl: config.callbackUrl || `${window.location.origin}/callback`,
      storagePrefix: config.storagePrefix || 'lp_auth',
      refreshBuffer: config.refreshBuffer || 5 * 60 * 1000, // 5 minutes
      autoRefresh: config.autoRefresh !== false,
    };
  }

  /**
   * Initialize from context (URL params, localStorage, shell message)
   * Call this on app startup
   */
  init(): boolean {
    if (this.initialized) return this.isAuthenticated();

    // 1. Detect shell context
    this.detectShellContext();

    // 2. Load session from storage
    this.loadSessionFromStorage();

    // 3. If we have a session, check if it's expired locally
    // We skip backend validation on init to avoid blocking and 401 errors
    // Backend validation happens naturally on API calls
    if (this.session) {
      if (this.session.tokenExpiry <= Date.now()) {
        // Token expired locally - clear it
        this.clearSession();
      } else if (this.config.autoRefresh) {
        // Schedule auto-refresh for valid token
        this.scheduleRefresh();
      }
    }

    this.initialized = true;
    return this.isAuthenticated();
  }

  /**
   * Detect if running inside LP Extend shell
   * Checks URL params and window.parent
   */
  private detectShellContext(): void {
    const urlParams = new URLSearchParams(window.location.search);

    // Check for shell-provided params
    const accountId = urlParams.get('accountId') || urlParams.get('siteId');
    const shellOrigin = urlParams.get('shellOrigin');

    // Check if in iframe
    const inIframe = window.parent !== window;

    this.shellContext = {
      accountId: accountId || null,
      userId: null,
      shellOrigin: shellOrigin || null,
      inShell: inIframe || !!shellOrigin,
    };

    // Store accountId if provided
    if (accountId) {
      localStorage.setItem(`${this.config.storagePrefix}_account`, accountId);
    }
  }

  /**
   * Get shell context info
   */
  getShellContext(): ShellContext {
    return { ...this.shellContext };
  }

  /**
   * Get the current or last-used account ID
   */
  getAccountId(): string | null {
    return (
      this.session?.accountId ||
      this.shellContext.accountId ||
      localStorage.getItem(`${this.config.storagePrefix}_account`)
    );
  }

  /**
   * Check if authenticated with valid session
   */
  isAuthenticated(): boolean {
    if (!this.session) return false;
    return this.session.tokenExpiry > Date.now();
  }

  /**
   * Get current access token (or null if expired)
   */
  getAccessToken(): string | null {
    if (!this.isAuthenticated()) return null;
    return this.session!.accessToken;
  }

  /**
   * Get current session
   */
  getSession(): LpSession | null {
    if (!this.isAuthenticated()) return null;
    return { ...this.session! };
  }

  /**
   * Get LP user ID
   */
  getUserId(): string | null {
    return this.session?.lpUserId || null;
  }

  /**
   * Check if current user is LPA
   */
  isLPA(): boolean {
    return this.session?.isLPA || false;
  }

  /**
   * Initiate SSO login flow
   * Redirects to LP SSO, returns to callback URL
   */
  async loginWithSSO(accountId?: string): Promise<void> {
    const acctId = accountId || this.getAccountId();

    if (!acctId) {
      throw new Error('Account ID is required for SSO login');
    }

    try {
      // Get SSO login URL from backend
      const response = await fetch(
        `${this.config.apiBaseUrl}/v1/idp/${acctId}/login-url?` +
          new URLSearchParams({
            redirect: this.config.callbackUrl,
            appId: this.config.appId,
          }).toString()
      );

      if (!response.ok) {
        throw new Error(`Failed to get SSO URL: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error('No SSO URL returned');
      }

      // Store pending auth state
      localStorage.setItem(`${this.config.storagePrefix}_pending`, acctId);

      // Redirect to SSO
      window.location.href = data.url;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.notifyError(err);
      throw err;
    }
  }

  /**
   * Handle OAuth callback
   * Call this on your callback page
   */
  async handleCallback(): Promise<LpSession> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state'); // Account ID
    const errorCode = urlParams.get('err_code');

    if (errorCode) {
      const error = new Error(`SSO Error: ${errorCode}`);
      this.notifyError(error);
      throw error;
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    const accountId = state || localStorage.getItem(`${this.config.storagePrefix}_pending`);
    if (!accountId) {
      throw new Error('No account ID found for callback');
    }

    try {
      // Exchange code for token
      const response = await fetch(`${this.config.apiBaseUrl}/v1/idp/${accountId}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          code,
          redirect: this.config.callbackUrl,
          appname: this.config.appId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const authResponse: LpAuthResponse = await response.json();

      // Create session with required fields
      const session: LpSession = {
        accountId,
        accessToken: authResponse.accessToken,
        tokenExpiry: authResponse.expiry || Date.now() + authResponse.expiresIn * 1000,
      };

      // Add optional fields only if they have values
      if (authResponse.decoded?.sub) {
        session.lpUserId = authResponse.decoded.sub;
      }
      if (authResponse.decoded?.isLPA !== undefined) {
        session.isLPA = authResponse.decoded.isLPA;
      }
      if (authResponse.idToken) {
        session.idToken = authResponse.idToken;
      }

      // Save and notify
      this.setSession(session);

      // Clean up pending state
      localStorage.removeItem(`${this.config.storagePrefix}_pending`);

      return session;
    } catch (error) {
      localStorage.removeItem(`${this.config.storagePrefix}_pending`);
      const err = error instanceof Error ? error : new Error(String(error));
      this.notifyError(err);
      throw err;
    }
  }

  /**
   * Direct login with username/password
   */
  async loginWithCredentials(
    accountId: string,
    username: string,
    password: string
  ): Promise<LpSession> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/v1/idp/${accountId}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.statusText}`);
      }

      const authResponse: LpAuthResponse = await response.json();

      // Create session with required fields
      const session: LpSession = {
        accountId,
        accessToken: authResponse.accessToken,
        tokenExpiry: authResponse.expiry || Date.now() + authResponse.expiresIn * 1000,
      };

      // Add optional fields only if they have values
      if (authResponse.decoded?.sub) {
        session.lpUserId = authResponse.decoded.sub;
      }
      if (authResponse.decoded?.isLPA !== undefined) {
        session.isLPA = authResponse.decoded.isLPA;
      }
      if (authResponse.idToken) {
        session.idToken = authResponse.idToken;
      }

      this.setSession(session);
      return session;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.notifyError(err);
      throw err;
    }
  }

  /**
   * Logout - clear session and optionally revoke token
   */
  async logout(revokeToken = true): Promise<void> {
    const accountId = this.session?.accountId;

    if (revokeToken && accountId && this.session?.accessToken) {
      try {
        await fetch(`${this.config.apiBaseUrl}/v1/idp/${accountId}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.session.accessToken}`,
          },
          credentials: 'include',
        });
      } catch {
        // Ignore logout errors
      }
    }

    this.clearSession();
  }

  /**
   * Validate current session with backend
   */
  async validateSession(): Promise<boolean> {
    if (!this.session) return false;

    // Quick local expiry check
    if (this.session.tokenExpiry <= Date.now()) {
      return false;
    }

    // Optionally validate with backend
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/v2/auth/verify`, {
        headers: {
          Authorization: `Bearer ${this.session.accessToken}`,
        },
        credentials: 'include',
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Register auth state change callback
   */
  onAuthChange(callback: AuthCallback): () => void {
    this.authCallbacks.push(callback);
    // Immediately call with current state
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
   * Create fetch wrapper that auto-injects auth header
   */
  createAuthFetch(): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const token = this.getAccessToken();

      if (token) {
        const headers = new Headers(init?.headers);
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        init = { ...init, headers, credentials: 'include' as RequestCredentials };
      }

      const response = await fetch(input, init);

      // Handle 401 - session expired
      if (response.status === 401) {
        this.clearSession();
      }

      return response;
    };
  }

  /**
   * Get LP domains for an account (useful for direct LP API calls)
   */
  async getDomains(accountId?: string): Promise<Record<string, string>> {
    const acctId = accountId || this.getAccountId();
    if (!acctId) throw new Error('Account ID required');

    const response = await fetch(`${this.config.apiBaseUrl}/v1/idp/${acctId}/domains`);
    if (!response.ok) {
      throw new Error('Failed to get LP domains');
    }

    const data = await response.json();
    const services: Record<string, string> = {};

    if (Array.isArray(data.baseURIs)) {
      for (const uri of data.baseURIs as LpDomain[]) {
        services[uri.service] = uri.baseURI;
      }
    }

    return services;
  }

  /**
   * Cleanup - call on app unmount
   */
  destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.authCallbacks = [];
    this.errorCallbacks = [];
  }

  // Private methods

  private setSession(session: LpSession): void {
    this.session = session;
    this.saveSessionToStorage();
    this.notifyAuthChange();

    if (this.config.autoRefresh) {
      this.scheduleRefresh();
    }
  }

  private clearSession(): void {
    this.session = null;
    localStorage.removeItem(`${this.config.storagePrefix}_session`);

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.notifyAuthChange();
  }

  private saveSessionToStorage(): void {
    if (this.session) {
      localStorage.setItem(`${this.config.storagePrefix}_session`, JSON.stringify(this.session));
    }
  }

  private loadSessionFromStorage(): void {
    try {
      const stored = localStorage.getItem(`${this.config.storagePrefix}_session`);
      if (stored) {
        const session = JSON.parse(stored) as LpSession;
        // Only load if not expired
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

  private scheduleRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.session) return;

    const refreshIn = Math.max(0, this.session.tokenExpiry - Date.now() - this.config.refreshBuffer);

    this.refreshTimer = setTimeout(() => {
      // Token is about to expire - clear session and notify
      // Child apps should handle re-authentication
      console.log('[LpAuth] Token expiring soon');
      this.clearSession();
    }, refreshIn);
  }

  private notifyAuthChange(): void {
    const session = this.isAuthenticated() ? this.session : null;
    this.authCallbacks.forEach((cb) => {
      try {
        cb(session);
      } catch (e) {
        console.error('[LpAuth] Auth callback error:', e);
      }
    });
  }

  private notifyError(error: Error): void {
    this.errorCallbacks.forEach((cb) => {
      try {
        cb(error);
      } catch (e) {
        console.error('[LpAuth] Error callback error:', e);
      }
    });
  }
}

/**
 * Create LpAuth instance from environment variables
 */
export function createLpAuthFromEnv(): LpAuth | null {
  const appId = import.meta.env.VITE_APP_ID;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

  if (!appId) {
    console.warn('[LpAuth] VITE_APP_ID not set');
    return null;
  }

  return new LpAuth({ appId, apiBaseUrl });
}

/**
 * Vue 3 composable for LpAuth
 */
export function useLpAuth(config: LpAuthConfig) {
  const auth = new LpAuth(config);

  return {
    auth,
    init: () => auth.init(),
    isAuthenticated: () => auth.isAuthenticated(),
    getAccessToken: () => auth.getAccessToken(),
    getSession: () => auth.getSession(),
    getAccountId: () => auth.getAccountId(),
    getUserId: () => auth.getUserId(),
    isLPA: () => auth.isLPA(),
    loginWithSSO: (accountId?: string) => auth.loginWithSSO(accountId),
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
