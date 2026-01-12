/**
 * Session Store
 *
 * Simple localStorage-based session management.
 * Replaces Firebase auth with local storage for user preferences and session state.
 *
 * LP authentication is handled by @lpextend/client-sdk.
 * This store only manages local app session state and user preferences.
 */

import { defineStore } from 'pinia';
import { getAppAuthInstance } from '@lpextend/client-sdk';

/** User preferences stored locally */
export interface UserPreferences {
  displayName: string | null;
  email: string | null;
  photoUrl: string | null;
  defaultAccountId: string | null;
  linkedAccountIds: string[];
  theme: 'light' | 'dark' | 'system';
}

/** LP Connection - saved LP account connection details */
export interface LPConnection {
  accountId: string;
  accountName?: string;
  loginName?: string;
  lastAccess?: number;
  isLPA?: boolean;
}

export interface SessionState {
  // User preferences (stored locally)
  preferences: UserPreferences;
  // Saved LP connections for quick access
  lpConnections: Record<string, LPConnection>;
  // Active LP account ID
  activeLpAccountId: string | null;
  // Loading state
  isLoading: boolean;
  // Error state
  error: string | null;
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    preferences: {
      displayName: null,
      email: null,
      photoUrl: null,
      defaultAccountId: null,
      linkedAccountIds: [],
      theme: 'system',
    },
    lpConnections: {},
    activeLpAccountId: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    /** User display name */
    userDisplayName: (state) => state.preferences.displayName || state.preferences.email || 'User',

    /** User email */
    userEmail: (state) => state.preferences.email,

    /** Default LP account ID */
    defaultAccountId: (state) => state.preferences.defaultAccountId,

    /** List of linked LP account IDs */
    linkedAccounts: (state) => state.preferences.linkedAccountIds,

    /** Whether user has a default LP account set */
    hasDefaultAccount: (state) => !!state.preferences.defaultAccountId,

    /** Current active LP account ID */
    currentLpAccountId: (state) => state.activeLpAccountId || state.preferences.defaultAccountId,

    /** Get all saved LP connections */
    savedLpConnections: (state) => Object.values(state.lpConnections),

    /** Check if authenticated via SDK */
    isAuthenticated: () => {
      const auth = getAppAuthInstance();
      return auth.isAuthenticated();
    },

    /** Check if running in shell mode */
    isInShellMode: () => {
      const auth = getAppAuthInstance();
      return auth.isInShell();
    },

    /** Get LP access token from SDK */
    lpAccessToken: () => {
      const auth = getAppAuthInstance();
      return auth.getAccessToken();
    },

    /** Check if current LP session is LPA */
    isLpaSession: () => {
      const auth = getAppAuthInstance();
      return auth.isLPA();
    },

    /** Check if LP token is valid */
    hasActiveLpSession: () => {
      const auth = getAppAuthInstance();
      return auth.isAuthenticated();
    },
  },

  actions: {
    /**
     * Initialize session from SDK
     * Call this on app startup after SDK init
     */
    initFromSdk(): void {
      const auth = getAppAuthInstance();

      // Get account ID from SDK
      const accountId = auth.getAccountId();
      if (accountId) {
        this.activeLpAccountId = accountId;

        // Update connection info
        this.lpConnections[accountId] = {
          ...this.lpConnections[accountId],
          accountId,
          lastAccess: Date.now(),
          isLPA: auth.isLPA(),
        };
      }

      // Get user info from SDK session
      const userId = auth.getUserId();
      if (userId && !this.preferences.displayName) {
        this.preferences.displayName = userId;
      }
    },

    /**
     * Set user preferences
     */
    setPreferences(prefs: Partial<UserPreferences>): void {
      this.preferences = { ...this.preferences, ...prefs };
    },

    /**
     * Set display name
     */
    setDisplayName(name: string): void {
      this.preferences.displayName = name;
    },

    /**
     * Set email
     */
    setEmail(email: string): void {
      this.preferences.email = email;
    },

    /**
     * Set theme preference
     */
    setTheme(theme: 'light' | 'dark' | 'system'): void {
      this.preferences.theme = theme;
    },

    /**
     * Set the user's default LP account
     */
    setDefaultAccount(accountId: string): void {
      this.preferences.defaultAccountId = accountId;

      // Add to linked accounts if not already there
      if (!this.preferences.linkedAccountIds.includes(accountId)) {
        this.preferences.linkedAccountIds.push(accountId);
      }
    },

    /**
     * Link a new LP account
     */
    linkLpAccount(accountId: string): void {
      if (!this.preferences.linkedAccountIds.includes(accountId)) {
        this.preferences.linkedAccountIds.push(accountId);
      }
    },

    /**
     * Unlink an LP account
     */
    unlinkLpAccount(accountId: string): void {
      const idx = this.preferences.linkedAccountIds.indexOf(accountId);
      if (idx !== -1) {
        this.preferences.linkedAccountIds.splice(idx, 1);
      }

      // Clear default if it was the unlinked account
      if (this.preferences.defaultAccountId === accountId) {
        this.preferences.defaultAccountId = null;
      }

      // Remove from connections
      delete this.lpConnections[accountId];
    },

    /**
     * Save LP connection details
     */
    saveLpConnection(connection: LPConnection): void {
      this.lpConnections[connection.accountId] = {
        ...this.lpConnections[connection.accountId],
        ...connection,
        lastAccess: Date.now(),
      };
    },

    /**
     * Remove a saved LP connection
     */
    removeLpConnection(accountId: string): void {
      delete this.lpConnections[accountId];
      if (this.activeLpAccountId === accountId) {
        this.activeLpAccountId = null;
      }
    },

    /**
     * Switch to a different LP account
     */
    switchLpAccount(accountId: string): void {
      this.activeLpAccountId = accountId;
    },

    /**
     * Get auth headers for API calls
     */
    getAuthHeaders(): Record<string, string> {
      const auth = getAppAuthInstance();
      const token = auth.getAccessToken();

      if (!token) return {};

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      // Shell strategy also uses X-Shell-Token header
      if (auth.getStrategy() === 'shell') {
        headers['X-Shell-Token'] = token;
      }

      return headers;
    },

    /**
     * Logout - clears local session
     */
    async logout(): Promise<void> {
      const auth = getAppAuthInstance();
      await auth.logout();

      // Clear local state
      this.activeLpAccountId = null;
      this.error = null;
    },

    /**
     * Clear any error state
     */
    clearError(): void {
      this.error = null;
    },
  },

  persist: {
    storage: localStorage,
    pick: ['preferences', 'lpConnections', 'activeLpAccountId'],
  },
});
