/**
 * Unified Auth Composable
 *
 * Provides a single interface for authentication that works with:
 * - Shell mode (token from parent LP Extend shell via LpAppAuth)
 * - Standalone mode (token from local Firebase/LP SSO)
 *
 * The auth strategy is determined by VITE_AUTH_STRATEGY environment variable:
 * - 'shell': Uses shell-delegated tokens (mini-apps)
 * - 'independent': Uses own LP auth (tier-1 apps)
 *
 * Components use this composable and don't need to care about the auth source.
 */

import { ref, computed, readonly, onMounted } from 'vue';
import { useFirebaseAuthStore } from 'src/stores/store-firebase-auth';
import {
  LpAppAuth,
  type LpAppAuthConfig,
  type AppSession,
  type AuthStrategy,
} from 'src/sdk';

// Singleton LpAppAuth instance
let appAuth: LpAppAuth | null = null;
let initPromise: Promise<boolean> | null = null;

// Reactive state
const isInitialized = ref(false);
const sdkSession = ref<AppSession | null>(null);
const authError = ref<string | null>(null);

/**
 * Get or create the LpAppAuth singleton instance
 */
function getAppAuth(): LpAppAuth {
  if (!appAuth) {
    const config: LpAppAuthConfig = {
      appId: import.meta.env.VITE_APP_ID || 'lp-app-template',
      authStrategy: (import.meta.env.VITE_AUTH_STRATEGY as AuthStrategy) || 'independent',
      shellApiUrl: import.meta.env.VITE_SHELL_API_URL,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
      callbackUrl: import.meta.env.VITE_CALLBACK_URL || `${window.location.origin}/callback`,
    };

    appAuth = new LpAppAuth(config);

    // Set up auth change listener
    appAuth.onAuthChange((session) => {
      sdkSession.value = session;
    });

    // Set up error listener
    appAuth.onError((error) => {
      authError.value = error.message;
      console.error('[useAuth] Auth error:', error);
    });
  }
  return appAuth;
}

/**
 * Initialize the auth system
 */
async function initAuth(): Promise<boolean> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const auth = getAppAuth();
      const result = await auth.init();
      isInitialized.value = true;
      return result;
    } catch (error) {
      console.error('[useAuth] Init failed:', error);
      isInitialized.value = true; // Mark as initialized even on error
      return false;
    }
  })();

  return initPromise;
}

/**
 * Unified Auth Composable
 *
 * Usage:
 * ```typescript
 * const { isAuthenticated, getToken, login, logout } = useAuth();
 *
 * if (!isAuthenticated.value) {
 *   await login('12345678');
 * }
 *
 * const headers = getAuthHeaders();
 * ```
 */
export function useAuth() {
  const firebaseAuth = useFirebaseAuthStore();
  const auth = getAppAuth();

  // Initialize on first use
  onMounted(async () => {
    await initAuth();
  });

  /**
   * Current auth strategy
   */
  const authStrategy = computed<AuthStrategy>(() => {
    return auth.getStrategy();
  });

  /**
   * Whether running in shell mode (iframe context)
   */
  const isInShellMode = computed(() => {
    return auth.isInShell();
  });

  /**
   * Whether running in standalone mode
   */
  const isStandaloneMode = computed(() => {
    return !auth.isInShell();
  });

  /**
   * Whether the user is authenticated (from SDK or Firebase fallback)
   */
  const isAuthenticated = computed(() => {
    // First check SDK auth
    if (auth.isAuthenticated()) {
      return true;
    }
    // For independent strategy, also check Firebase auth as fallback
    if (authStrategy.value === 'independent') {
      return firebaseAuth.isAuthenticated;
    }
    return false;
  });

  /**
   * Get the current auth token
   */
  const getToken = (): string | null => {
    // First try SDK token
    const sdkToken = auth.getAccessToken();
    if (sdkToken) return sdkToken;

    // For independent strategy, fallback to Firebase/LP session
    if (authStrategy.value === 'independent') {
      if (firebaseAuth.lpSession && !firebaseAuth.isLpTokenExpired) {
        return firebaseAuth.lpSession.accessToken;
      }
      return firebaseAuth.idToken;
    }

    return null;
  };

  /**
   * Get auth headers for API calls
   */
  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken();
    if (!token) return {};

    // Shell strategy uses X-Shell-Token header
    if (authStrategy.value === 'shell') {
      return {
        'X-Shell-Token': token,
        Authorization: `Bearer ${token}`,
      };
    }

    // Independent strategy uses standard Authorization header
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  /**
   * Check if user has a specific permission/scope
   */
  const hasPermission = (scope: string): boolean => {
    // Check SDK scopes first
    if (auth.hasScope(scope)) {
      return true;
    }

    // For independent strategy, check Firebase user permissions
    if (authStrategy.value === 'independent') {
      const permissions = firebaseAuth.appUser?.permissions || [];
      if (permissions.includes('*')) return true;
      if (permissions.includes(scope)) return true;

      // Check prefix match
      const scopeParts = scope.split(':');
      return permissions.some((p) => {
        const parts = p.split(':');
        return parts[0] === scopeParts[0] && parts[1] === '*';
      });
    }

    return false;
  };

  /**
   * Current user display name
   */
  const displayName = computed(() => {
    if (authStrategy.value === 'shell') {
      return auth.getShellContext()?.accountId || 'Shell User';
    }
    return firebaseAuth.userDisplayName;
  });

  /**
   * Current user email
   */
  const userEmail = computed(() => {
    if (authStrategy.value === 'shell') {
      return null; // Shell doesn't provide user email
    }
    return firebaseAuth.userEmail;
  });

  /**
   * Current account ID
   */
  const accountId = computed(() => {
    return auth.getAccountId() || firebaseAuth.currentLpAccountId;
  });

  /**
   * Current user ID
   */
  const userId = computed(() => {
    return auth.getUserId() || firebaseAuth.lpSession?.lpUserId || null;
  });

  /**
   * Whether user is LPA (LivePerson Admin)
   */
  const isLPA = computed(() => {
    return auth.isLPA() || firebaseAuth.appUser?.isLPA || false;
  });

  /**
   * Current session from SDK
   */
  const session = computed(() => {
    return sdkSession.value;
  });

  /**
   * Last auth error
   */
  const error = computed(() => {
    return authError.value;
  });

  /**
   * Login - works for both strategies
   */
  const login = async (accountIdParam?: string): Promise<void> => {
    authError.value = null;
    await auth.login(accountIdParam);
  };

  /**
   * Login with credentials (independent strategy only)
   */
  const loginWithCredentials = async (
    accountIdParam: string,
    username: string,
    password: string
  ): Promise<AppSession> => {
    authError.value = null;
    return auth.loginWithCredentials(accountIdParam, username, password);
  };

  /**
   * Handle OAuth callback
   */
  const handleCallback = async (): Promise<AppSession> => {
    authError.value = null;
    return auth.handleCallback();
  };

  /**
   * Logout
   */
  const logout = async (revokeToken = true): Promise<void> => {
    await auth.logout(revokeToken);
    // Also logout from Firebase if in independent mode
    if (authStrategy.value === 'independent') {
      await firebaseAuth.logout();
    }
  };

  /**
   * Get LP domains for direct API calls
   */
  const getDomains = async (accountIdParam?: string): Promise<Record<string, string>> => {
    return auth.getDomains(accountIdParam);
  };

  /**
   * Create fetch wrapper with auto-injected auth headers
   */
  const createAuthFetch = (): typeof fetch => {
    return auth.createAuthFetch();
  };

  /**
   * Clear any auth error
   */
  const clearError = () => {
    authError.value = null;
  };

  return {
    // State
    isInitialized: readonly(isInitialized),
    isAuthenticated,
    isInShellMode,
    isStandaloneMode,
    authStrategy,
    displayName,
    userEmail,
    accountId,
    userId,
    isLPA,
    session,
    error,

    // Methods
    initAuth,
    getToken,
    getAuthHeaders,
    hasPermission,
    login,
    loginWithCredentials,
    handleCallback,
    logout,
    getDomains,
    createAuthFetch,
    clearError,

    // Raw access to stores/SDK if needed
    firebaseAuth,
    appAuth: auth,
  };
}

/**
 * Get the raw LpAppAuth instance
 * Useful for advanced use cases or direct SDK access
 */
export function getAppAuthInstance(): LpAppAuth {
  return getAppAuth();
}

/**
 * Check if auth is initialized
 */
export function isAuthInitialized(): boolean {
  return isInitialized.value;
}
