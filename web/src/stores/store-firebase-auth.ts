/**
 * Firebase Authentication Store
 * Handles user authentication via Firebase
 */

import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import type { User, UserCredential } from 'firebase/auth'
import { auth } from 'src/boot/firebase'
import { useUserStore } from './store-user'
import { api } from 'src/boot/axios'

/** Firebase credential - returned from auth methods */
type FirebaseCredential = UserCredential | null

/**
 * Serializable Firebase user info
 * We don't store the actual Firebase User object because it contains
 * cross-origin references (from Google auth popup) that Vue reactivity can't handle
 */
export interface SerializableFirebaseUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  isAnonymous: boolean
  providerId: string | null
}

/**
 * Extract serializable data from Firebase User object
 */
function serializeUser(user: User | null): SerializableFirebaseUser | null {
  if (!user) return null
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    isAnonymous: user.isAnonymous,
    providerId: user.providerId,
  }
}

/** App user profile from Firestore (via backend) */
export interface AppUserProfile {
  id: string
  email: string
  displayName: string
  accountId: string
  defaultAccountId?: string
  linkedAccountIds?: string[]
  roles: string[]
  permissions: string[]
  photoUrl?: string
  isLPA: boolean
  termsAgreed: boolean
  installedApps: string[]
  appPermissions: string[]
}

/** LP Connection - saved LP account connection details */
export interface LPConnection {
  accountId: string
  accountName?: string
  loginName?: string
  encryptedPassword?: string  // Optional saved credentials
  lastAccess?: number
  isLPA?: boolean
}

/** Active LP Session */
export interface LPSession {
  accountId: string
  accessToken: string
  tokenExpiry: number
  lpUserId?: string  // null for LPA users
  isLPA: boolean
  cbToken?: string
  cbOrg?: string
}

export interface FirebaseAuthState {
  user: SerializableFirebaseUser | null
  appUser: AppUserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  idToken: string | null
  // LP-specific state
  lpSession: LPSession | null
  lpConnections: Record<string, LPConnection>  // keyed by accountId
  activeLpAccountId: string | null
  // Auto-login tracking (prevents repeated attempts)
  autoLoginAttempted: boolean
  autoLoginInProgress: boolean
}

export const useFirebaseAuthStore = defineStore('firebaseAuth', {
  state: (): FirebaseAuthState => ({
    user: null,
    appUser: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    idToken: null,
    // LP state
    lpSession: null,
    lpConnections: {},
    activeLpAccountId: null,
    // Auto-login tracking
    autoLoginAttempted: false,
    autoLoginInProgress: false,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
    userEmail: (state) => state.user?.email || null,
    userDisplayName: (state) => state.user?.displayName || state.user?.email || 'User',
    /** Default LP account ID for routing */
    defaultAccountId: (state) => state.appUser?.defaultAccountId || state.appUser?.accountId || null,
    /** List of linked LP account IDs */
    linkedAccounts: (state) => state.appUser?.linkedAccountIds || [],
    /** Whether user has a default LP account set */
    hasDefaultAccount: (state) => !!state.appUser?.defaultAccountId || !!state.appUser?.accountId,
    /** Whether user has an active LP session */
    hasActiveLpSession: (state) => {
      if (!state.lpSession) {
        console.log('[LP Session] No lpSession in state')
        return false
      }
      const isValid = state.lpSession.tokenExpiry > Date.now()
      console.log('[LP Session] Check:', {
        tokenExpiry: state.lpSession.tokenExpiry,
        now: Date.now(),
        expiresIn: Math.round((state.lpSession.tokenExpiry - Date.now()) / 1000) + 's',
        isValid,
      })
      return isValid
    },
    /** Current active LP account ID */
    currentLpAccountId: (state) => state.activeLpAccountId || state.appUser?.defaultAccountId || null,
    /** Get LP access token for current session */
    lpAccessToken: (state) => state.lpSession?.accessToken || null,
    /** Whether current LP session is LPA */
    isLpaSession: (state) => state.lpSession?.isLPA || false,
    /** Get all saved LP connections */
    savedLpConnections: (state) => Object.values(state.lpConnections),
    /** Check if LP token is expired */
    isLpTokenExpired: (state) => {
      if (!state.lpSession) return true
      return state.lpSession.tokenExpiry <= Date.now()
    },
  },

  actions: {
    /**
     * Initialize auth state listener
     * Call this on app startup
     */
    initAuthListener() {
      return new Promise<SerializableFirebaseUser | null>((resolve) => {
        onAuthStateChanged(auth, (user) => {
          // Store serialized user to avoid cross-origin reactivity issues
          this.user = serializeUser(user)
          this.isAuthenticated = !!user
          this.isLoading = false

          if (user) {
            // Get the ID token for backend authentication
            void user.getIdToken().then((token) => {
              this.idToken = token

              // Sync LP session with user store if we have a valid persisted session
              if (this.lpSession && this.lpSession.tokenExpiry > Date.now()) {
                const userStore = useUserStore()
                // Restore LP session data to user store
                if (this.lpSession.accountId && userStore.accountId !== this.lpSession.accountId) {
                  userStore.setaccountId(this.lpSession.accountId)
                }
                if (this.lpSession.accessToken && userStore.accessToken !== this.lpSession.accessToken) {
                  userStore.$patch({ accessToken: this.lpSession.accessToken })
                }
              }
            })
          }

          resolve(this.user)
        })
      })
    },

    /**
     * Sign in with email and password
     */
    async signInWithEmail(email: string, password: string): Promise<FirebaseCredential> {
      this.isLoading = true
      this.error = null

      try {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        this.user = serializeUser(credential.user)
        this.isAuthenticated = true
        this.idToken = await credential.user.getIdToken()
        return credential
      } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string }
        this.error = this.getErrorMessage(firebaseError.code || 'unknown')
        console.error('Sign in error:', error)
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Sign in with Google
     */
    async signInWithGoogle(): Promise<FirebaseCredential> {
      this.isLoading = true
      this.error = null

      try {
        const provider = new GoogleAuthProvider()
        provider.addScope('email')
        provider.addScope('profile')

        const credential = await signInWithPopup(auth, provider)
        this.user = serializeUser(credential.user)
        this.isAuthenticated = true
        this.idToken = await credential.user.getIdToken()
        return credential
      } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string }
        this.error = this.getErrorMessage(firebaseError.code || 'unknown')
        console.error('Google sign in error:', error)
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Create a new account with email and password
     */
    async createAccount(email: string, password: string): Promise<FirebaseCredential> {
      this.isLoading = true
      this.error = null

      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password)
        this.user = serializeUser(credential.user)
        this.isAuthenticated = true
        this.idToken = await credential.user.getIdToken()
        return credential
      } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string }
        this.error = this.getErrorMessage(firebaseError.code || 'unknown')
        console.error('Create account error:', error)
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Send password reset email
     */
    async resetPassword(email: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        await sendPasswordResetEmail(auth, email)
        return true
      } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string }
        this.error = this.getErrorMessage(firebaseError.code || 'unknown')
        console.error('Password reset error:', error)
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Sign out the current user
     */
    async logout(): Promise<void> {
      try {
        await signOut(auth)
        this.user = null
        this.appUser = null
        this.isAuthenticated = false
        this.idToken = null
        this.error = null
        // Reset auto-login state so next login can attempt auto LP login
        this.autoLoginAttempted = false
        this.autoLoginInProgress = false
        // Clear LP session
        this.lpSession = null

        // Clear the user store as well
        useUserStore().$reset()
      } catch (error) {
        console.error('Logout error:', error)
      }
    },

    /**
     * Get fresh ID token (refreshes if expired)
     */
    async getIdToken(forceRefresh = false): Promise<string | null> {
      // Use auth.currentUser since we store serialized user, not the actual Firebase User object
      const currentUser = auth.currentUser
      if (!currentUser) return null

      try {
        const token = await currentUser.getIdToken(forceRefresh)
        this.idToken = token
        return token
      } catch (error) {
        console.error('Error getting ID token:', error)
        return null
      }
    },

    /**
     * Fetch app user profile from backend
     * Called after Firebase auth to get LP account info
     */
    async fetchAppUserProfile(): Promise<AppUserProfile | null> {
      if (!this.idToken) {
        return null
      }

      try {
        const response = await api.get<AppUserProfile>('/api/v2/auth/me', {
          headers: {
            Authorization: `Bearer ${this.idToken}`,
          },
        })
        this.appUser = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching app user profile:', error)
        // User doesn't exist in Firestore yet - that's OK for new Firebase users
        this.appUser = null
        return null
      }
    },

    /**
     * Set the user's default LP account
     */
    async setDefaultAccount(accountId: string): Promise<boolean> {
      if (!this.idToken) {
        this.error = 'Please sign in first'
        return false
      }

      try {
        await api.put('/api/v2/auth/me/default-account',
          { accountId },
          {
            headers: {
              Authorization: `Bearer ${this.idToken}`,
            },
          }
        )
        // Update local state
        if (this.appUser) {
          this.appUser.defaultAccountId = accountId
        }
        return true
      } catch (error) {
        console.error('Error setting default account:', error)
        this.error = 'Failed to set default account'
        return false
      }
    },

    /**
     * Link a new LP account to the user
     */
    async linkLpAccount(accountId: string): Promise<boolean> {
      if (!this.idToken) {
        this.error = 'Please sign in first'
        return false
      }

      try {
        const response = await api.post<{ success: boolean; linkedAccountIds: string[] }>(
          '/api/v2/auth/me/link-account',
          { accountId },
          {
            headers: {
              Authorization: `Bearer ${this.idToken}`,
            },
          }
        )
        // Update local state
        if (this.appUser) {
          this.appUser.linkedAccountIds = response.data.linkedAccountIds
        }
        // Re-fetch full profile to ensure consistency
        await this.fetchAppUserProfile()
        return true
      } catch (error) {
        console.error('Error linking LP account:', error)
        this.error = 'Failed to link LP account'
        return false
      }
    },

    /**
     * Connect Firebase auth to LP account
     * After Firebase login, authenticate with LP using account ID
     */
    async connectLPAccount(accountId: string): Promise<boolean> {
      if (!this.isAuthenticated || !this.idToken) {
        this.error = 'Please sign in first'
        return false
      }

      try {
        const userStore = useUserStore()
        userStore.setaccountId(accountId)

        // Get LP domains first
        await userStore.getlpDomains(accountId)

        // Link the account if not already linked
        await this.linkLpAccount(accountId)

        return true
      } catch (error) {
        console.error('Error connecting LP account:', error)
        this.error = 'Failed to connect LP account'
        return false
      }
    },

    /**
     * Set active LP session from LP SSO callback
     * Called after successful LP authentication
     */
    setLpSession(session: LPSession): void {
      this.lpSession = session
      this.activeLpAccountId = session.accountId

      // Update connection info
      this.lpConnections[session.accountId] = {
        ...this.lpConnections[session.accountId],
        accountId: session.accountId,
        lastAccess: Date.now(),
        isLPA: session.isLPA,
      }
    },

    /**
     * Clear the current LP session
     */
    clearLpSession(): void {
      this.lpSession = null
      // Don't clear activeLpAccountId - user may want to re-auth to same account
    },

    /**
     * Save LP connection details (for quick re-login)
     */
    saveLpConnection(connection: LPConnection): void {
      this.lpConnections[connection.accountId] = {
        ...this.lpConnections[connection.accountId],
        ...connection,
        lastAccess: Date.now(),
      }
    },

    /**
     * Remove a saved LP connection
     */
    removeLpConnection(accountId: string): void {
      delete this.lpConnections[accountId]
      if (this.activeLpAccountId === accountId) {
        this.activeLpAccountId = null
        this.lpSession = null
      }
    },

    /**
     * Switch to a different LP account
     * Clears current session, user will need to re-authenticate
     */
    switchLpAccount(accountId: string): void {
      this.clearLpSession()
      this.activeLpAccountId = accountId

      // Sync with user store
      const userStore = useUserStore()
      userStore.setaccountId(accountId)
    },

    /**
     * Attempt automatic LP SSO login for the default account
     * Tries popup-based SSO (silent iframe auth is not supported by LP)
     * Only attempts once per session to avoid annoying users
     */
    async attemptAutoLpLogin(accountId?: string): Promise<boolean> {
      const targetAccountId = accountId || this.defaultAccountId

      // Guard conditions
      if (!targetAccountId) {
        console.info('[AutoLogin] No account ID available')
        return false
      }
      if (this.autoLoginAttempted) {
        console.info('[AutoLogin] Already attempted this session')
        return false
      }
      if (this.autoLoginInProgress) {
        console.info('[AutoLogin] Already in progress')
        return false
      }
      if (this.hasActiveLpSession && !this.isLpTokenExpired) {
        console.info('[AutoLogin] Already have valid LP session')
        return true
      }

      this.autoLoginInProgress = true
      console.info('[AutoLogin] Starting popup SSO for account:', targetAccountId)

      try {
        const userStore = useUserStore()

        // Get LP domains first
        await userStore.getlpDomains(targetAccountId)

        // Get the sentinel URL for SSO
        const ssoUrl = await userStore.getSentinelUrl(targetAccountId)

        if (!ssoUrl) {
          console.error('[AutoLogin] Failed to get SSO URL')
          this.autoLoginAttempted = true
          return false
        }

        // Open popup for SSO
        const result = await this.openSsoPopup(ssoUrl, targetAccountId)

        this.autoLoginAttempted = true
        return result
      } catch (error) {
        console.error('[AutoLogin] Error:', error)
        this.autoLoginAttempted = true
        return false
      } finally {
        this.autoLoginInProgress = false
      }
    },

    /**
     * Open SSO popup window and wait for callback
     * Returns true if login was successful
     */
    async openSsoPopup(ssoUrl: string, accountId: string): Promise<boolean> {
      return new Promise((resolve) => {
        // Calculate popup position (center of screen)
        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        // Store account ID for callback handling
        // Use localStorage since sessionStorage is not shared and may be lost after SSO redirect
        localStorage.setItem('pendingLpAccountId', accountId)
        localStorage.setItem('lpSsoPopup', 'true')

        // Open popup
        const popup = window.open(
          ssoUrl,
          'lpSsoPopup',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        )

        if (!popup) {
          console.error('[SsoPopup] Popup was blocked')
          localStorage.removeItem('pendingLpAccountId')
          localStorage.removeItem('lpSsoPopup')
          resolve(false)
          return
        }

        // Listen for message from callback page
        const messageHandler = (event: MessageEvent) => {
          // Verify origin
          if (event.origin !== window.location.origin) return

          if (event.data?.type === 'LP_SSO_SUCCESS') {
            console.info('[SsoPopup] SSO success received')
            window.removeEventListener('message', messageHandler)
            clearInterval(pollTimer)
            popup.close()
            // Rehydrate LP session from localStorage (popup updated it)
            this.rehydrateLpSession()
            resolve(true)
          } else if (event.data?.type === 'LP_SSO_FAILURE') {
            console.info('[SsoPopup] SSO failure received')
            window.removeEventListener('message', messageHandler)
            clearInterval(pollTimer)
            popup.close()
            resolve(false)
          }
        }

        window.addEventListener('message', messageHandler)

        // Poll to check if popup was closed manually
        const pollTimer = setInterval(() => {
          if (popup.closed) {
            console.info('[SsoPopup] Popup was closed')
            window.removeEventListener('message', messageHandler)
            clearInterval(pollTimer)
            localStorage.removeItem('pendingLpAccountId')
            localStorage.removeItem('lpSsoPopup')
            // Rehydrate LP session from localStorage and check if valid
            const success = this.rehydrateLpSession()
            resolve(success)
          }
        }, 500)

        // Timeout after 5 minutes
        setTimeout(() => {
          if (!popup.closed) {
            console.info('[SsoPopup] Timeout - closing popup')
            window.removeEventListener('message', messageHandler)
            clearInterval(pollTimer)
            popup.close()
            localStorage.removeItem('pendingLpAccountId')
            localStorage.removeItem('lpSsoPopup')
            resolve(false)
          }
        }, 5 * 60 * 1000)
      })
    },

    /**
     * Re-hydrate LP session from localStorage
     * Called after popup SSO to sync state from popup's store updates
     */
    rehydrateLpSession(): boolean {
      const stored = localStorage.getItem('firebaseAuth')
      if (!stored) return false

      try {
        const parsed = JSON.parse(stored) as { lpSession?: LPSession; activeLpAccountId?: string }
        const session = parsed.lpSession
        if (session && session.tokenExpiry > Date.now()) {
          console.info('[SsoPopup] Rehydrating LP session from localStorage')
          this.lpSession = session
          this.activeLpAccountId = parsed.activeLpAccountId || session.accountId

          // Sync with user store
          const userStore = useUserStore()
          if (session.accountId) {
            userStore.setaccountId(session.accountId)
          }
          if (session.accessToken) {
            userStore.$patch({ accessToken: session.accessToken })
          }
          return true
        }
      } catch (e) {
        console.error('[SsoPopup] Error rehydrating LP session:', e)
      }
      return false
    },

    /**
     * Reset auto-login state (call on logout or when user explicitly logs in)
     */
    resetAutoLoginState(): void {
      this.autoLoginAttempted = false
      this.autoLoginInProgress = false
    },

    /**
     * Get the authorization header value for API calls
     * Returns Firebase token or LP token depending on what's available
     */
    getAuthHeader(): string | null {
      // Prefer LP token if we have an active LP session
      if (this.lpSession && !this.isLpTokenExpired) {
        return `Bearer ${this.lpSession.accessToken}`
      }
      // Fall back to Firebase token
      if (this.idToken) {
        return `Bearer ${this.idToken}`
      }
      return null
    },

    /**
     * Check if we can make LP-specific API calls
     * Requires active LP session with valid token
     */
    canMakeLpApiCalls(): boolean {
      return this.hasActiveLpSession && !this.isLpTokenExpired
    },

    /**
     * Get user-friendly error message
     */
    getErrorMessage(errorCode: string): string {
      const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password is too weak',
        'auth/popup-closed-by-user': 'Sign in was cancelled',
        'auth/popup-blocked': 'Pop-up was blocked. Please allow pop-ups for this site',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later',
        'auth/invalid-credential': 'Invalid credentials. Please try again',
      }
      return errorMessages[errorCode] || 'An error occurred. Please try again'
    },

    /**
     * Clear any error state
     */
    clearError() {
      this.error = null
    },
  },

  persist: {
    storage: localStorage,
    pick: ['idToken', 'lpConnections', 'activeLpAccountId', 'lpSession'],
    afterHydrate: (ctx) => {
      // After hydration from localStorage, sync LP session with user store
      const state = ctx.store.$state as FirebaseAuthState
      console.log('[LP Session] afterHydrate:', {
        hasLpSession: !!state.lpSession,
        lpSession: state.lpSession,
        tokenExpiry: state.lpSession?.tokenExpiry,
        now: Date.now(),
        isValid: state.lpSession ? state.lpSession.tokenExpiry > Date.now() : false,
      })
      if (state.lpSession && state.lpSession.tokenExpiry > Date.now()) {
        // LP session is still valid - sync to user store
        // Use dynamic import to avoid circular dependency issues
        void import('./store-user').then(({ useUserStore }) => {
          const userStore = useUserStore()
          if (state.lpSession) {
            if (state.lpSession.accountId && userStore.accountId !== state.lpSession.accountId) {
              userStore.setaccountId(state.lpSession.accountId)
            }
            if (state.lpSession.accessToken && userStore.accessToken !== state.lpSession.accessToken) {
              userStore.$patch({ accessToken: state.lpSession.accessToken })
            }
          }
        })
      }
    },
  },
})
