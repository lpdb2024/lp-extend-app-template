/**
 * Shell Auth Service
 *
 * Provides unified authentication that works both:
 * - In shell mode (iframe): Uses token from parent shell
 * - Standalone mode: Uses local Firebase/LP SSO auth
 *
 * The app always ends up with a token - the source is abstracted away.
 * Route guards work the same regardless of mode.
 */

import { ref, computed, readonly } from 'vue';

export type AuthMode = 'shell' | 'standalone' | 'detecting';

export interface ShellContext {
  appId: string;
  accountId: string;
  shellApiUrl: string;
  shellOrigin: string;
}

export interface ShellTokenResponse {
  token: string;
  expiresAt: number;
  scopes: string[];
}

// Singleton state
const authMode = ref<AuthMode>('detecting');
const shellContext = ref<ShellContext | null>(null);
const shellToken = ref<string | null>(null);
const shellTokenExpiry = ref<number>(0);
const shellTokenScopes = ref<string[]>([]);
const isConnected = ref(false);
const error = ref<string | null>(null);

let messageHandler: ((event: MessageEvent) => void) | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

// Promise that resolves when initial auth is ready
let initialAuthResolve: (() => void) | null = null;
let initialAuthPromise: Promise<void> | null = null;

/**
 * Detect if running inside LP Extend shell
 */
function detectShellMode(): { inShell: boolean; context: ShellContext | null } {
  try {
    // Check if in iframe
    const inIframe = window.parent !== window;
    if (!inIframe) {
      return { inShell: false, context: null };
    }

    // Check for shell query params
    const params = new URLSearchParams(window.location.search);
    const shell = params.get('shell');
    const appId = params.get('appId');
    const accountId = params.get('accountId');
    // Parent shell now uses 'shellOrigin' param, but keep 'shellApiUrl' for backward compatibility
    const shellOriginParam = params.get('shellOrigin') || params.get('shellApiUrl');

    if (shell === 'true' && appId) {
      // shellOrigin should be the parent shell's origin for PostMessage communication
      // Priority: explicit param > document.referrer > cannot determine (log warning)
      let shellOrigin: string;

      if (shellOriginParam) {
        shellOrigin = shellOriginParam;
        console.log('[ShellAuth] Using shellOrigin from URL param:', shellOrigin);
      } else if (document.referrer) {
        try {
          shellOrigin = new URL(document.referrer).origin;
          console.log('[ShellAuth] Using shellOrigin from referrer:', shellOrigin);
        } catch {
          shellOrigin = '*'; // Allow any origin as fallback
          console.warn('[ShellAuth] Could not parse referrer, using wildcard origin');
        }
      } else {
        // Last resort: try to infer from common development patterns
        // Parent shell is usually on port 3000, child on 9000
        shellOrigin = window.location.protocol + '//' + window.location.hostname + ':3000';
        console.warn('[ShellAuth] No shellOrigin param or referrer, guessing parent origin:', shellOrigin);
      }

      return {
        inShell: true,
        context: {
          appId,
          accountId: accountId || '',
          shellApiUrl: shellOrigin, // Keep for backward compatibility
          shellOrigin: shellOrigin,
        },
      };
    }

    return { inShell: false, context: null };
  } catch (e) {
    console.warn('[ShellAuth] Error detecting shell mode:', e);
    return { inShell: false, context: null };
  }
}

/**
 * Handle messages from parent shell
 */
function handleShellMessage(event: MessageEvent) {
  if (!shellContext.value) return;
  if (event.origin !== shellContext.value.shellOrigin) return;

  const { type, payload, appId: messageAppId } = event.data || {};

  // Ignore messages for other apps
  if (messageAppId && messageAppId !== shellContext.value.appId) return;

  switch (type) {
    case 'AUTH_TOKEN': {
      const { token, expiresAt, scopes } = payload as ShellTokenResponse;
      shellToken.value = token;
      shellTokenExpiry.value = expiresAt;
      shellTokenScopes.value = scopes || [];
      error.value = null;
      scheduleTokenRefresh(expiresAt);
      console.log('[ShellAuth] Received token from shell');
      break;
    }

    case 'AUTH_REVOKED': {
      const reason = (payload as { reason?: string })?.reason || 'Unknown';
      shellToken.value = null;
      shellTokenExpiry.value = 0;
      shellTokenScopes.value = [];
      error.value = `Auth revoked: ${reason}`;
      clearRefreshTimer();
      console.log('[ShellAuth] Auth revoked:', reason);
      break;
    }
  }
}

/**
 * Send message to parent shell
 */
function sendToShell(message: Record<string, unknown>) {
  if (!shellContext.value) return;
  if (window.parent !== window) {
    window.parent.postMessage(message, shellContext.value.shellOrigin);
  }
}

/**
 * Request auth token from shell via PostMessage
 */
async function requestTokenViaPostMessage(scopes?: string[]): Promise<ShellTokenResponse> {
  const context = shellContext.value;
  if (!context) {
    throw new Error('Not in shell mode');
  }

  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();

    const timeout = setTimeout(() => {
      window.removeEventListener('message', handler);
      reject(new Error('Auth request timeout'));
    }, 10000);

    const handler = (event: MessageEvent) => {
      if (event.origin !== context.shellOrigin) return;
      if (event.data?.requestId !== requestId) return;

      clearTimeout(timeout);
      window.removeEventListener('message', handler);

      if (event.data.type === 'AUTH_TOKEN') {
        const payload = event.data.payload as ShellTokenResponse;
        shellToken.value = payload.token;
        shellTokenExpiry.value = payload.expiresAt;
        shellTokenScopes.value = payload.scopes || [];
        scheduleTokenRefresh(payload.expiresAt);
        resolve(payload);
      } else if (event.data.type === 'AUTH_REVOKED') {
        reject(new Error((event.data.payload as { error?: string })?.error || 'Auth denied'));
      }
    };

    window.addEventListener('message', handler);

    sendToShell({
      type: 'AUTH_REQUEST',
      appId: context.appId,
      requestId,
      payload: { scopes },
    });
  });
}

/**
 * Request auth token from shell via direct API call
 */
async function _requestTokenViaApi(scopes?: string[]): Promise<ShellTokenResponse> {
  if (!shellContext.value) {
    throw new Error('Not in shell mode');
  }

  const { appId, accountId, shellApiUrl } = shellContext.value;

  const response = await fetch(`${shellApiUrl}/api/v1/shell/token/${accountId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId, scopes }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }

  const data: ShellTokenResponse = await response.json();

  shellToken.value = data.token;
  shellTokenExpiry.value = data.expiresAt;
  shellTokenScopes.value = data.scopes || [];
  scheduleTokenRefresh(data.expiresAt);

  return data;
}

/**
 * Schedule token refresh before expiry
 */
function scheduleTokenRefresh(expiresAt: number) {
  clearRefreshTimer();

  // Refresh 2 minutes before expiry
  const refreshIn = Math.max(0, expiresAt - Date.now() - 2 * 60 * 1000);

  refreshTimer = setTimeout(() => {
    console.log('[ShellAuth] Auto-refreshing token...');
    requestTokenViaPostMessage().catch((err) => {
      console.error('[ShellAuth] Token refresh failed:', err);
    });
  }, refreshIn);
}

/**
 * Clear refresh timer
 */
function clearRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

/**
 * Initialize the shell auth service
 * Call this early in app initialization
 * Returns a promise that resolves when initial auth is ready
 */
export function initShellAuth(): Promise<void> {
  if (initialized) {
    return initialAuthPromise || Promise.resolve();
  }
  initialized = true;

  const detection = detectShellMode();

  if (detection.inShell && detection.context) {
    authMode.value = 'shell';
    shellContext.value = detection.context;

    // Create promise for initial auth
    initialAuthPromise = new Promise<void>((resolve) => {
      initialAuthResolve = resolve;
    });

    // Set up message listener
    messageHandler = handleShellMessage;
    window.addEventListener('message', messageHandler);

    // Notify shell that app is ready
    sendToShell({
      type: 'APP_READY',
      appId: detection.context.appId,
    });

    isConnected.value = true;

    // Request initial token
    requestTokenViaPostMessage()
      .then(() => {
        console.log('[ShellAuth] Initial token received');
        if (initialAuthResolve) {
          initialAuthResolve();
          initialAuthResolve = null;
        }
      })
      .catch((err) => {
        console.warn('[ShellAuth] Initial token request failed:', err);
        // Still resolve to not block the app, but auth will fail
        if (initialAuthResolve) {
          initialAuthResolve();
          initialAuthResolve = null;
        }
      });

    console.log('[ShellAuth] Initialized in SHELL mode', detection.context);
    return initialAuthPromise;
  } else {
    authMode.value = 'standalone';
    console.log('[ShellAuth] Initialized in STANDALONE mode');
    return Promise.resolve();
  }
}

/**
 * Cleanup shell auth (call on app unmount)
 */
export function cleanupShellAuth(): void {
  if (messageHandler) {
    window.removeEventListener('message', messageHandler);
    messageHandler = null;
  }
  clearRefreshTimer();
  isConnected.value = false;
}

/**
 * Get current shell token (if in shell mode and valid)
 */
export function getShellToken(): string | null {
  if (authMode.value !== 'shell') return null;
  if (!shellToken.value) return null;
  if (Date.now() > shellTokenExpiry.value) return null;
  return shellToken.value;
}

/**
 * Check if shell token has a specific scope
 */
export function hasShellScope(scope: string): boolean {
  if (shellTokenScopes.value.includes('*')) return true;
  if (shellTokenScopes.value.includes(scope)) return true;

  // Check prefix match (e.g., 'skills:*' matches 'skills:read')
  const scopeParts = scope.split(':');
  return shellTokenScopes.value.some((s) => {
    const parts = s.split(':');
    return parts[0] === scopeParts[0] && parts[1] === '*';
  });
}

/**
 * Request a fresh token from shell
 */
export async function requestShellToken(scopes?: string[]): Promise<ShellTokenResponse> {
  if (authMode.value !== 'shell') {
    throw new Error('Not in shell mode');
  }
  return requestTokenViaPostMessage(scopes);
}

/**
 * Report error to shell
 */
export function reportErrorToShell(err: Error | string): void {
  if (authMode.value !== 'shell' || !shellContext.value) return;

  sendToShell({
    type: 'APP_ERROR',
    appId: shellContext.value.appId,
    payload: {
      message: typeof err === 'string' ? err : err.message,
      stack: typeof err === 'string' ? undefined : err.stack,
    },
  });
}

// Exported reactive state (readonly)
export const shellAuthState = {
  mode: readonly(authMode),
  context: readonly(shellContext),
  token: readonly(shellToken),
  tokenExpiry: readonly(shellTokenExpiry),
  scopes: readonly(shellTokenScopes),
  isConnected: readonly(isConnected),
  error: readonly(error),
};

// Computed helpers
export const isInShellMode = computed(() => authMode.value === 'shell');
export const isStandaloneMode = computed(() => authMode.value === 'standalone');
export const isShellAuthenticated = computed(() => {
  if (authMode.value !== 'shell') return false;
  return !!shellToken.value && Date.now() < shellTokenExpiry.value;
});

/**
 * Wait for shell auth to be ready
 * In shell mode, waits for initial token. In standalone mode, resolves immediately.
 */
export async function waitForShellAuth(): Promise<void> {
  if (authMode.value === 'standalone') {
    return;
  }
  if (initialAuthPromise) {
    return initialAuthPromise;
  }
  // If not initialized yet, init and wait
  return initShellAuth();
}
