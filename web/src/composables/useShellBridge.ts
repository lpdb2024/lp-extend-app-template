/**
 * Shell Bridge Composable
 *
 * Provides communication with LP Platform Shell when running as a child app.
 * When not running in shell (standalone mode), falls back to local auth.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface ShellBridgeConfig {
  appId: string;
  shellOrigin?: string;
}

export interface AuthTokenPayload {
  token: string;
  expiresAt: number;
}

export interface ShellSessionParams {
  shellToken?: string;
  accountId?: string;
  shellOrigin?: string;
}

// Detect if running in shell iframe
function isRunningInShell(): boolean {
  try {
    // Check if in iframe
    if (window.parent === window) return false;

    // Check for shell query param or shell token in URL
    const params = new URLSearchParams(window.location.search);
    return params.get('shell') === 'true' || params.has('shellToken');
  } catch {
    return false;
  }
}

// Get shell origin from query params or environment
function getShellOrigin(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('shellOrigin') || import.meta.env.VITE_SHELL_ORIGIN || 'http://localhost:3000';
}

// Get shell session params from URL (passed by shell when loading child app)
function getShellSessionParams(): ShellSessionParams {
  const params = new URLSearchParams(window.location.search);
  const result: ShellSessionParams = {};

  const shellToken = params.get('shellToken');
  if (shellToken) result.shellToken = shellToken;

  const accountId = params.get('accountId');
  if (accountId) result.accountId = accountId;

  const shellOrigin = params.get('shellOrigin');
  if (shellOrigin) result.shellOrigin = shellOrigin;

  return result;
}

export function useShellBridge(config: ShellBridgeConfig) {
  const { appId } = config;
  const shellOrigin = config.shellOrigin || getShellOrigin();
  const sessionParams = getShellSessionParams();

  const inShellMode = ref(isRunningInShell());
  const shellToken = ref<string | null>(sessionParams.shellToken || null);
  const accountId = ref<string | null>(sessionParams.accountId || null);
  const tokenExpiresAt = ref<number>(0);
  const isConnected = ref(false);
  const error = ref<string | null>(null);

  let refreshTimer: ReturnType<typeof setTimeout> | null = null;
  let messageHandler: ((event: MessageEvent) => void) | null = null;

  const isAuthenticated = computed(() => {
    if (!inShellMode.value) {
      // In standalone mode, use regular auth
      return true;
    }
    return !!shellToken.value && Date.now() < tokenExpiresAt.value;
  });

  /**
   * Handle incoming messages from shell
   */
  function handleMessage(event: MessageEvent) {
    if (event.origin !== shellOrigin) return;

    const { type, payload, appId: messageAppId } = event.data;

    // Ignore messages for other apps
    if (messageAppId && messageAppId !== appId) return;

    switch (type) {
      case 'AUTH_TOKEN': {
        const { token, expiresAt } = payload as AuthTokenPayload;
        shellToken.value = token;
        tokenExpiresAt.value = expiresAt;
        error.value = null;
        scheduleTokenRefresh(expiresAt);
        console.log('[ShellBridge] Received auth token');
        break;
      }

      case 'AUTH_REVOKED': {
        const reason = (payload as { reason?: string })?.reason || 'Unknown';
        shellToken.value = null;
        tokenExpiresAt.value = 0;
        error.value = `Auth revoked: ${reason}`;

        if (refreshTimer) {
          clearTimeout(refreshTimer);
          refreshTimer = null;
        }

        console.log('[ShellBridge] Auth revoked:', reason);
        break;
      }
    }
  }

  /**
   * Send message to shell
   */
  function sendToShell(message: Record<string, unknown>) {
    if (window.parent !== window) {
      window.parent.postMessage(message, shellOrigin);
    }
  }

  /**
   * Request auth token from shell
   */
  async function requestAuth(scopes?: string[]): Promise<AuthTokenPayload> {
    if (!inShellMode.value) {
      throw new Error('Not running in shell mode');
    }

    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();

      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error('Auth request timeout'));
      }, 10000);

      const handler = (event: MessageEvent) => {
        if (event.origin !== shellOrigin) return;
        if (event.data.requestId !== requestId) return;

        clearTimeout(timeout);
        window.removeEventListener('message', handler);

        if (event.data.type === 'AUTH_TOKEN') {
          const payload = event.data.payload as AuthTokenPayload;
          shellToken.value = payload.token;
          tokenExpiresAt.value = payload.expiresAt;
          scheduleTokenRefresh(payload.expiresAt);
          resolve(payload);
        } else if (event.data.type === 'AUTH_REVOKED') {
          reject(new Error((event.data.payload as { error?: string })?.error || 'Auth denied'));
        }
      };

      window.addEventListener('message', handler);

      sendToShell({
        type: 'AUTH_REQUEST',
        appId,
        requestId,
        payload: { scopes },
      });
    });
  }

  /**
   * Schedule token refresh before expiry
   */
  function scheduleTokenRefresh(expiresAt: number) {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // Refresh 2 minutes before expiry
    const refreshIn = Math.max(0, expiresAt - Date.now() - 2 * 60 * 1000);

    refreshTimer = setTimeout(() => {
      console.log('[ShellBridge] Refreshing token...');
      requestAuth().catch((err) => {
        console.error('[ShellBridge] Token refresh failed:', err);
      });
    }, refreshIn);
  }

  /**
   * Get auth headers for API calls
   */
  function getAuthHeaders(): Record<string, string> {
    if (inShellMode.value && shellToken.value) {
      return {
        'X-Shell-Token': shellToken.value,
      };
    }
    return {};
  }

  /**
   * Report error to shell
   */
  function reportError(err: Error | string) {
    if (!inShellMode.value) return;

    sendToShell({
      type: 'APP_ERROR',
      appId,
      payload: {
        message: typeof err === 'string' ? err : err.message,
        stack: typeof err === 'string' ? undefined : err.stack,
      },
    });
  }

  /**
   * Initialize bridge
   */
  function init() {
    if (!inShellMode.value) {
      console.log('[ShellBridge] Running in standalone mode');
      return;
    }

    console.log('[ShellBridge] Initializing shell bridge');

    messageHandler = handleMessage;
    window.addEventListener('message', messageHandler);

    // Notify shell that app is ready
    sendToShell({
      type: 'APP_READY',
      appId,
    });

    isConnected.value = true;

    // If shell token was provided via URL, we're already authenticated
    if (shellToken.value) {
      console.log('[ShellBridge] Using shell token from URL params');
      // Set a reasonable expiry (15 minutes from now, matching shell token TTL)
      tokenExpiresAt.value = Date.now() + 15 * 60 * 1000;
      scheduleTokenRefresh(tokenExpiresAt.value);
      return;
    }

    // Request initial auth via postMessage
    requestAuth().catch((err) => {
      console.error('[ShellBridge] Initial auth request failed:', err);
      error.value = err.message;
    });
  }

  /**
   * Cleanup
   */
  function cleanup() {
    if (messageHandler) {
      window.removeEventListener('message', messageHandler);
      messageHandler = null;
    }
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
    isConnected.value = false;
  }

  onMounted(init);
  onUnmounted(cleanup);

  return {
    // State
    inShellMode,
    isAuthenticated,
    isConnected,
    shellToken,
    accountId,
    tokenExpiresAt,
    error,

    // Methods
    requestAuth,
    getAuthHeaders,
    reportError,

    // Utility
    sendToShell,
    getShellSessionParams: () => sessionParams,
  };
}
