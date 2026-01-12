/**
 * Auth Service
 *
 * Provides authentication utilities using @lpextend/client-sdk.
 * This is a thin wrapper around the SDK for legacy compatibility.
 */
import { getAppAuthInstance, getAuthHeaders as sdkGetAuthHeaders } from '@lpextend/client-sdk';
import { useUserStore } from 'src/stores/store-user';

class AuthService {
  /**
   * Check if running in shell mode (inside LP Extend iframe)
   */
  isShellMode(): boolean {
    return getAppAuthInstance().isInShell();
  }

  /**
   * Get authentication token for API calls
   */
  getToken(): string | null {
    return getAppAuthInstance().getAccessToken();
  }

  /**
   * Get auth headers for API calls
   */
  getAuthHeaders(): Record<string, string> {
    return sdkGetAuthHeaders();
  }

  /**
   * Get current user from store
   */
  getUser() {
    return useUserStore().user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return getAppAuthInstance().isAuthenticated();
  }

  /**
   * Get current account ID
   */
  getAccountId(): string | null {
    return getAppAuthInstance().getAccountId();
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return getAppAuthInstance().getUserId();
  }

  /**
   * Check if user is LPA
   */
  isLPA(): boolean {
    return getAppAuthInstance().isLPA();
  }
}

export default new AuthService();
